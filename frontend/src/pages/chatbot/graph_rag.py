"""
Graph RAG: entity-relationship graph + multi-hop retrieval.
Used as level-2 offline retrieval and for live catalog enrichment.
"""

from __future__ import annotations

import hashlib
import json
import os
import pickle
import re
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple

try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False

try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
GRAPH_STORE_DIR = os.path.join(SCRIPT_DIR, "graph_store")

# In-memory graph instances
_graph_cache: Dict[str, Tuple["KnowledgeGraphRAG", float]] = {}
_LIVE_GRAPH_TTL = int(os.environ.get("LIVE_GRAPH_CACHE_TTL", "120"))


@dataclass
class GraphChunk:
    chunk_id: str
    text: str
    metadata: Dict[str, Any] = field(default_factory=dict)


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def _entity_id(entity_type: str, name: str) -> str:
    return f"{entity_type}:{_norm(name)}"


def _tokenize_query(query: str) -> List[str]:
    stop = {
        "what", "which", "where", "when", "how", "the", "a", "an", "is", "are",
        "do", "does", "can", "you", "me", "my", "about", "for", "with", "and", "or",
    }
    tokens = re.findall(r"[a-z0-9]+", query.lower())
    return [t for t in tokens if len(t) > 2 and t not in stop]


class KnowledgeGraphRAG:
    """Lightweight Graph RAG store backed by NetworkX."""

    def __init__(self, graph_id: str):
        self.graph_id = graph_id
        self.graph: Any = nx.Graph() if NETWORKX_AVAILABLE else None
        self.chunks: Dict[str, GraphChunk] = {}
        self._embedding_model = None
        self._chunk_embeddings: Dict[str, Any] = {}

    def _ensure_graph(self):
        if not NETWORKX_AVAILABLE:
            raise RuntimeError("networkx is not installed. Run: pip install networkx")

    def _get_embeddings(self):
        if not EMBEDDINGS_AVAILABLE:
            return None
        if self._embedding_model is None:
            from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
            self._embedding_model = FastEmbedEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )
        return self._embedding_model

    def add_chunk(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        self._ensure_graph()
        meta = metadata or {}
        chunk_id = hashlib.md5(f"{self.graph_id}:{text[:200]}".encode()).hexdigest()[:16]
        self.chunks[chunk_id] = GraphChunk(chunk_id=chunk_id, text=text, metadata=meta)

        self.graph.add_node(chunk_id, node_type="chunk")
        entities = extract_entities_from_text(text, meta)
        for ent in entities:
            eid = _entity_id(ent["type"], ent["name"])
            if not self.graph.has_node(eid):
                self.graph.add_node(
                    eid,
                    node_type=ent["type"],
                    label=ent["name"],
                )
            rel = ent.get("relation", "mentions")
            self.graph.add_edge(chunk_id, eid, relation=rel)

        for a, b, rel in extract_pairwise_relations(entities):
            aid, bid = _entity_id(a["type"], a["name"]), _entity_id(b["type"], b["name"])
            if self.graph.has_node(aid) and self.graph.has_node(bid):
                self.graph.add_edge(aid, bid, relation=rel)

        return chunk_id

    def build_from_documents(self, documents: List[Tuple[str, Dict[str, Any]]]) -> int:
        for text, meta in documents:
            self.add_chunk(text, meta)
        return len(self.chunks)

    def retrieve(
        self,
        query: str,
        max_chunks: int = 5,
        max_hops: int = 2,
        use_embeddings: bool = True,
    ) -> Tuple[List[str], List[str]]:
        """
        Graph RAG retrieval: seed entities -> expand subgraph -> rank chunks.
        Returns (chunk_texts, traversal_path_labels).
        """
        self._ensure_graph()
        if not self.chunks:
            return [], []

        tokens = _tokenize_query(query)
        seed_nodes = self._find_seed_nodes(query, tokens)
        paths: List[str] = []

        chunk_scores: Dict[str, float] = {}

        for seed in seed_nodes:
            paths.append(self.graph.nodes[seed].get("label", seed))
            try:
                lengths = nx.single_source_shortest_path_length(self.graph, seed, cutoff=max_hops)
            except nx.NetworkXError:
                continue
            for node, dist in lengths.items():
                if node in self.chunks:
                    chunk_scores[node] = chunk_scores.get(node, 0.0) + (max_hops + 1 - dist) * 2.0

        for cid, chunk in self.chunks.items():
            blob = _norm(chunk.text)
            overlap = sum(1 for t in tokens if t in blob)
            if overlap:
                chunk_scores[cid] = chunk_scores.get(cid, 0.0) + overlap * 1.5

        if use_embeddings and EMBEDDINGS_AVAILABLE and chunk_scores:
            chunk_scores = self._rerank_with_embeddings(query, chunk_scores)

        ranked = sorted(chunk_scores.items(), key=lambda x: x[1], reverse=True)[:max_chunks]
        texts = [self.chunks[cid].text for cid, _ in ranked if cid in self.chunks]
        return texts, paths[:8]

    def _find_seed_nodes(self, query: str, tokens: List[str]) -> List[str]:
        seeds: List[str] = []
        qn = _norm(query)

        for node, data in self.graph.nodes(data=True):
            if data.get("node_type") == "chunk":
                continue
            label = _norm(data.get("label", ""))
            if not label:
                continue
            if label in qn or any(t in label for t in tokens):
                seeds.append(node)

        if not seeds:
            for node, data in self.graph.nodes(data=True):
                if data.get("node_type") != "chunk":
                    label = _norm(data.get("label", ""))
                    if any(t in label for t in tokens):
                        seeds.append(node)

        return seeds[:12]

    def _rerank_with_embeddings(self, query: str, chunk_scores: Dict[str, float]) -> Dict[str, float]:
        try:
            emb = self._get_embeddings()
            if emb is None:
                return chunk_scores
            q_vec = emb.embed_query(query)
            candidates = list(chunk_scores.keys())
            texts = [self.chunks[c].text for c in candidates]
            d_vecs = emb.embed_documents(texts)
            import math

            def cosine(a, b):
                dot = sum(x * y for x, y in zip(a, b))
                na = math.sqrt(sum(x * x for x in a)) or 1e-9
                nb = math.sqrt(sum(x * x for x in b)) or 1e-9
                return dot / (na * nb)

            blended = {}
            for cid, d_vec in zip(candidates, d_vecs):
                sim = cosine(q_vec, d_vec)
                blended[cid] = chunk_scores[cid] + sim * 5.0
            return blended
        except Exception:
            return chunk_scores

    def stats(self) -> Dict[str, int]:
        if not NETWORKX_AVAILABLE or self.graph is None:
            return {"chunks": 0, "nodes": 0, "edges": 0}
        entity_nodes = sum(
            1 for _, d in self.graph.nodes(data=True) if d.get("node_type") != "chunk"
        )
        return {
            "chunks": len(self.chunks),
            "nodes": self.graph.number_of_nodes(),
            "edges": self.graph.number_of_edges(),
            "entities": entity_nodes,
        }

    def save(self):
        os.makedirs(GRAPH_STORE_DIR, exist_ok=True)
        path = os.path.join(GRAPH_STORE_DIR, f"{self.graph_id}.pkl")
        with open(path, "wb") as f:
            pickle.dump(
                {"graph_id": self.graph_id, "graph": self.graph, "chunks": self.chunks},
                f,
            )

    @classmethod
    def load(cls, graph_id: str) -> Optional["KnowledgeGraphRAG"]:
        path = os.path.join(GRAPH_STORE_DIR, f"{graph_id}.pkl")
        if not os.path.exists(path):
            return None
        try:
            with open(path, "rb") as f:
                data = pickle.load(f)
            kg = cls(graph_id)
            kg.graph = data["graph"]
            kg.chunks = data["chunks"]
            return kg
        except Exception:
            return None


def extract_entities_from_text(text: str, metadata: Dict[str, Any]) -> List[Dict[str, str]]:
    entities: List[Dict[str, str]] = []

    product_match = re.search(r"Topic:\s*Product\s*-\s*(.+)", text, re.I)
    if product_match:
        name = product_match.group(1).strip()
        entities.append({"type": "product", "name": name, "relation": "describes"})

    for key, etype in (
        (r"Category:\s*(.+)", "category"),
        (r"ProductID:\s*(\d+)", "product_id"),
        (r"department:\s*(.+)", "department"),
        (r"Department:\s*(.+)", "department"),
    ):
        m = re.search(key, text, re.I)
        if m:
            val = m.group(1).strip()
            entities.append({"type": etype, "name": val, "relation": "has_attribute"})

    name_m = re.search(r"name:\s*(.+)", text, re.I)
    if name_m and not product_match:
        entities.append({"type": "person", "name": name_m.group(1).strip(), "relation": "mentions"})

    email_m = re.search(r"email:\s*(\S+@\S+)", text, re.I)
    if email_m:
        entities.append({"type": "email", "name": email_m.group(1), "relation": "has_email"})

    if metadata.get("product_id"):
        entities.append({
            "type": "product_id",
            "name": str(metadata["product_id"]),
            "relation": "identifies",
        })

    if not entities:
        concepts = re.findall(
            r"\b(RAG|CRAG|LangGraph|ChromaDB|FAISS|LLM|agentic|vector database|SQLite)\b",
            text,
            re.I,
        )
        for c in set(concepts):
            entities.append({"type": "concept", "name": c, "relation": "mentions"})

    title = re.match(r"^([A-Z][^.!\n]{8,80})", text.strip())
    if title and not product_match:
        entities.append({"type": "topic", "name": title.group(1).strip()[:80], "relation": "mentions"})

    return entities


def extract_pairwise_relations(entities: List[Dict[str, str]]) -> List[Tuple[Dict, Dict, str]]:
    pairs: List[Tuple[Dict, Dict, str]] = []
    products = [e for e in entities if e["type"] == "product"]
    categories = [e for e in entities if e["type"] == "category"]
    departments = [e for e in entities if e["type"] == "department"]
    persons = [e for e in entities if e["type"] == "person"]

    for p in products:
        for c in categories:
            pairs.append((p, c, "in_category"))
    for person in persons:
        for d in departments:
            pairs.append((person, d, "works_in"))
    return pairs


def _get_or_build_graph(graph_id: str, builder) -> KnowledgeGraphRAG:
    now = time.time()
    cached = _graph_cache.get(graph_id)
    if cached and (now - cached[1]) < _LIVE_GRAPH_TTL and graph_id.startswith("live_"):
        return cached[0]

    if not graph_id.startswith("live_"):
        loaded = KnowledgeGraphRAG.load(graph_id)
        if loaded and loaded.chunks:
            _graph_cache[graph_id] = (loaded, now)
            return loaded

    kg = builder()
    if graph_id.startswith("live_"):
        _graph_cache[graph_id] = (kg, now)
    else:
        kg.save()
        _graph_cache[graph_id] = (kg, now)
    return kg


def build_catalog_graph_from_text_file(data_path: str) -> KnowledgeGraphRAG:
    kg = KnowledgeGraphRAG("offline_catalog")
    if not os.path.exists(data_path):
        return kg

    with open(data_path, "r", encoding="utf-8") as f:
        raw = f.read()
    blocks = [b.strip() for b in raw.split("---") if b.strip()]
    docs = [(b, {}) for b in blocks]
    kg.build_from_documents(docs)
    return kg


def build_knowledge_graph_from_docs(doc_texts: List[str]) -> KnowledgeGraphRAG:
    kg = KnowledgeGraphRAG("offline_knowledge")
    kg.build_from_documents([(t, {}) for t in doc_texts])
    return kg


def build_catalog_graph_from_products(products: List[Dict[str, Any]]) -> KnowledgeGraphRAG:
    from live_data import product_to_document

    kg = KnowledgeGraphRAG("live_catalog")
    docs = [
        (product_to_document(p).page_content, {"product_id": p.get("product_id")})
        for p in products
    ]
    kg.build_from_documents(docs)
    return kg


def build_users_graph_from_sqlite(conn) -> KnowledgeGraphRAG:
    kg = KnowledgeGraphRAG("offline_users")
    cur = conn.cursor()
    cur.execute("SELECT id, name, department, join_date, email FROM users")
    rows = cur.fetchall()
    for row in rows:
        text = (
            f"User record:\n"
            f"Name: {row[1]}\n"
            f"Department: {row[2]}\n"
            f"Join date: {row[3]}\n"
            f"Email: {row[4]}\n"
            f"ID: {row[0]}"
        )
        kg.add_chunk(text, {"user_id": row[0]})
    return kg


def graph_rag_retrieve(
    graph_id: str,
    query: str,
    builder,
    max_chunks: int = 5,
    header: str = "[Graph RAG]",
) -> Tuple[Optional[str], Optional[str]]:
    if not NETWORKX_AVAILABLE:
        return None, "networkx not installed"

    try:
        kg = _get_or_build_graph(graph_id, builder)
        if not kg.chunks:
            return None, f"Graph {graph_id} is empty"

        texts, paths = kg.retrieve(query, max_chunks=max_chunks)
        if not texts:
            return None, "No graph traversal matches"

        path_str = ", ".join(paths) if paths else "direct chunk match"
        body = "\n\n---\n\n".join(texts)
        stats = kg.stats()
        prefix = (
            f"{header} graph={graph_id} | "
            f"entities={stats.get('entities', 0)} | path: {path_str}\n\n"
        )
        return prefix + body, None
    except Exception as e:
        return None, str(e)


def offline_catalog_graph_search(query: str, data_path: str, max_chunks: int = 5):
    return graph_rag_retrieve(
        "offline_catalog",
        query,
        lambda: build_catalog_graph_from_text_file(data_path),
        max_chunks=max_chunks,
        header="[Offline Graph RAG — product catalog]",
    )


def offline_knowledge_graph_search(query: str, doc_texts: List[str], max_chunks: int = 5):
    return graph_rag_retrieve(
        "offline_knowledge",
        query,
        lambda: build_knowledge_graph_from_docs(doc_texts),
        max_chunks=max_chunks,
        header="[Offline Graph RAG — knowledge base]",
    )


def offline_users_graph_search(query: str, sqlite_conn, max_chunks: int = 5):
    return graph_rag_retrieve(
        "offline_users",
        query,
        lambda: build_users_graph_from_sqlite(sqlite_conn),
        max_chunks=max_chunks,
        header="[Offline Graph RAG — users]",
    )


async def live_catalog_graph_search(
    query: str,
    token: Optional[str] = None,
    max_chunks: int = 5,
) -> Tuple[Optional[str], Optional[str]]:
    from live_data import (
        fetch_live_products,
        is_supermarket_api_configured,
        resolve_auth_token,
        get_supermarket_base_url,
    )

    if not is_supermarket_api_configured():
        return None, None

    auth = resolve_auth_token(token)
    if not auth:
        return None, "Live graph RAG: auth token required"

    try:
        products = await fetch_live_products(auth)
        if not products:
            return None, "Live API returned no products"

        def builder():
            return build_catalog_graph_from_products(products)

        return graph_rag_retrieve(
            "live_catalog",
            query,
            builder,
            max_chunks=max_chunks,
            header=f"[Live Graph RAG — {get_supermarket_base_url()}]",
        )
    except Exception as e:
        return None, str(e)


def get_graph_health() -> Dict[str, Any]:
    info: Dict[str, Any] = {"networkx": NETWORKX_AVAILABLE, "graphs": {}}
    for gid in ("offline_catalog", "offline_knowledge", "offline_users", "live_catalog"):
        loaded = KnowledgeGraphRAG.load(gid)
        info["graphs"][gid] = loaded.stats() if loaded else {"persisted": False}
    return info
