"""
Fetch live supermarket data from the Node.js REST API.
When SUPERMARKET_API_URL is not set, callers fall back to local Chroma/SQLite/data.txt.
"""

from __future__ import annotations

import json
import os
import time
from typing import Any, Dict, List, Optional, Tuple

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False

try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma
    from langchain_core.documents import Document
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False

CACHE_TTL_SECONDS = int(os.environ.get("LIVE_DATA_CACHE_TTL", "120"))

_products_cache: Dict[str, Any] = {"rows": None, "fetched_at": 0.0, "error": None}
_live_retriever_cache: Dict[str, Any] = {"key": None, "retriever": None, "fetched_at": 0.0}


def is_supermarket_api_configured() -> bool:
    return bool(os.environ.get("SUPERMARKET_API_URL", "").strip())


def get_supermarket_base_url() -> str:
    return os.environ.get("SUPERMARKET_API_URL", "http://localhost:3000").rstrip("/")


def resolve_auth_token(request_token: Optional[str] = None) -> Optional[str]:
    token = (request_token or "").strip() or os.environ.get("SUPERMARKET_API_TOKEN", "").strip()
    return token or None


def _cache_key(token: Optional[str]) -> str:
    return token or "__env_token__" if os.environ.get("SUPERMARKET_API_TOKEN") else "__anonymous__"


async def api_get(path: str, token: Optional[str] = None, timeout: float = 15.0) -> Dict[str, Any]:
    if not HTTPX_AVAILABLE:
        raise RuntimeError("httpx is not installed. Run: pip install httpx")

    headers: Dict[str, str] = {}
    if token:
        headers["token"] = token

    url = f"{get_supermarket_base_url()}{path}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()


async def fetch_live_products(token: Optional[str] = None, force: bool = False) -> List[Dict[str, Any]]:
    """Load products from GET /api/product/products."""
    if not is_supermarket_api_configured():
        return []

    now = time.time()
    if (
        not force
        and _products_cache["rows"] is not None
        and (now - _products_cache["fetched_at"]) < CACHE_TTL_SECONDS
    ):
        return _products_cache["rows"]

    auth = resolve_auth_token(token)
    if not auth:
        _products_cache["error"] = "SUPERMARKET_API_TOKEN or request auth_token required"
        return []

    data = await api_get("/api/product/products", auth)
    if not data.get("success"):
        raise RuntimeError(data.get("message", "Failed to fetch products from live API"))

    products = data.get("products") or []
    _products_cache["rows"] = products
    _products_cache["fetched_at"] = now
    _products_cache["error"] = None
    return products


def product_to_document(product: Dict[str, Any]) -> Document:
    content = (
        f"Topic: Product - {product.get('name', 'Unknown')}\n"
        f"ProductID: {product.get('product_id')}\n"
        f"Category: {product.get('category', 'N/A')}\n"
        f"Price: ₹{product.get('final_price', product.get('price', 'N/A'))}\n"
        f"Base Price: ₹{product.get('price', 'N/A')}\n"
        f"Stock: {product.get('stock_quantity', 'N/A')}\n"
        f"Discount: {product.get('discount_value') or 0}%\n"
        f"Expiry: {product.get('exp_date', 'N/A')}\n"
        f"Description:\n{product.get('description', '')}"
    )
    return Document(page_content=content, metadata={"product_id": product.get("product_id")})


async def _get_live_retriever(token: Optional[str] = None, k: int = 5):
    if not EMBEDDINGS_AVAILABLE:
        raise RuntimeError("langchain-community embeddings not available")

    auth = resolve_auth_token(token)
    key = _cache_key(auth)
    now = time.time()
    if (
        _live_retriever_cache["retriever"] is not None
        and _live_retriever_cache["key"] == key
        and (now - _live_retriever_cache["fetched_at"]) < CACHE_TTL_SECONDS
    ):
        return _live_retriever_cache["retriever"]

    products = await fetch_live_products(auth, force=True)
    if not products:
        return None

    docs = [product_to_document(p) for p in products]
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
    )
    store = Chroma.from_documents(documents=docs, embedding=embeddings, collection_name="live_supermarket")
    retriever = store.as_retriever(search_kwargs={"k": k})

    _live_retriever_cache["key"] = key
    _live_retriever_cache["retriever"] = retriever
    _live_retriever_cache["fetched_at"] = now
    return retriever


async def live_vector_search(
    query: str,
    token: Optional[str] = None,
    k: int = 5,
) -> Tuple[Optional[str], Optional[str]]:
    """
    Vector search over live products from the supermarket API.
    Returns (context_text, error_message).
    """
    if not is_supermarket_api_configured():
        return None, None

    auth = resolve_auth_token(token)
    if not auth:
        return None, "Live API configured but no auth token (set SUPERMARKET_API_TOKEN or pass auth_token)"

    try:
        retriever = await _get_live_retriever(auth, k=k)
        if retriever is None:
            return None, "Live API returned no products"

        docs = retriever.get_relevant_documents(query)
        if not docs:
            return None, "No matching products in live database"

        header = f"[Live database via {get_supermarket_base_url()} — {len(docs)} match(es)]\n\n"
        body = "\n\n---\n\n".join(d.page_content for d in docs)
        return header + body, None
    except Exception as e:
        return None, str(e)


async def _try_fetch_orders(token: Optional[str]) -> Optional[List[Dict[str, Any]]]:
    auth = resolve_auth_token(token)
    if not auth:
        return None

    for path in ("/api/order/orders", "/api/employee/orders"):
        try:
            data = await api_get(path, auth)
            if data.get("success") and data.get("orders"):
                return data["orders"]
        except Exception:
            continue
    return None


def _filter_products_by_query(products: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
    q = query.lower()
    tokens = [t for t in q.replace("?", "").split() if len(t) > 2]
    if not tokens:
        return products[:15]

    scored: List[Tuple[int, Dict[str, Any]]] = []
    for p in products:
        blob = " ".join(
            str(p.get(field, ""))
            for field in ("name", "description", "category", "price", "stock_quantity")
        ).lower()
        score = sum(1 for t in tokens if t in blob)
        if score:
            scored.append((score, p))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored[:15]] if scored else products[:10]


async def live_structured_query(
    query: str,
    token: Optional[str] = None,
) -> Tuple[Optional[str], Optional[str]]:
    """
    Structured live DB access via REST (products, orders, team).
    Returns (context_text, error_message).
    """
    if not is_supermarket_api_configured():
        return None, None

    auth = resolve_auth_token(token)
    if not auth:
        return None, "Live API configured but no auth token"

    q = query.lower()
    try:
        if any(k in q for k in ["order", "delivery", "shipped", "pending", "cancelled", "confirmed"]):
            orders = await _try_fetch_orders(auth)
            if orders is None:
                return None, "Could not fetch orders (check token role: consumer or employee)"
            return (
                f"[Live orders from {get_supermarket_base_url()}]\n```json\n"
                + json.dumps(orders[:20], indent=2, default=str)
                + "\n```",
                None,
            )

        if any(k in q for k in ["employee", "team", "staff", "colleague"]):
            data = await api_get("/api/employee/team-member", auth)
            if data.get("success"):
                payload = data.get("team") or data.get("employees") or data
                return (
                    f"[Live team data]\n```json\n"
                    + json.dumps(payload, indent=2, default=str)
                    + "\n```",
                    None,
                )
            return None, data.get("message", "Team endpoint denied or empty")

        products = await fetch_live_products(auth)
        if not products:
            return None, "Live API returned no products"

        filtered = _filter_products_by_query(products, query)
        return (
            f"[Live product catalog — {len(filtered)} row(s)]\n```json\n"
            + json.dumps(filtered, indent=2, default=str)
            + "\n```",
            None,
        )
    except Exception as e:
        return None, str(e)


async def check_live_api(token: Optional[str] = None) -> Dict[str, Any]:
    if not is_supermarket_api_configured():
        return {"configured": False, "reachable": False, "error": "SUPERMARKET_API_URL not set"}

    auth = resolve_auth_token(token)
    if not auth:
        return {
            "configured": True,
            "reachable": False,
            "error": "Missing SUPERMARKET_API_TOKEN or auth_token",
        }

    try:
        products = await fetch_live_products(auth, force=True)
        return {
            "configured": True,
            "reachable": True,
            "product_count": len(products),
            "base_url": get_supermarket_base_url(),
        }
    except Exception as e:
        return {"configured": True, "reachable": False, "error": str(e)}
