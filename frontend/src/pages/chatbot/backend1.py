"""
Agentic RAG Backend with Groq API
FastAPI server that handles routing, retrieval (Vector DB), SQL (SQLite),
and final answer generation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import sqlite3
from datetime import datetime
import os

# FIXED: Add dotenv to load the .env file
from dotenv import load_dotenv
_script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_script_dir, ".env"))
load_dotenv()
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# LangChain integrations
# ------------------------------------------------------------------------------

try:
    # We use ChatOpenAI as Groq's API is OpenAI-compatible
    from langchain_openai import ChatOpenAI
    from langchain_community.embeddings import HuggingFaceEmbeddings
    DEEPSEEK_API_AVAILABLE = True # This variable name is fine
except ImportError:
    DEEPSEEK_API_AVAILABLE = False
    print("Warning: Install with: pip install langchain-openai")

from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, SystemMessage

# ------------------------------------------------------------------------------
# FastAPI Setup
# ------------------------------------------------------------------------------

app = FastAPI(title="Agentic RAG API with Groq")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local dev; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Pydantic Schemas
# ------------------------------------------------------------------------------

class QueryRequest(BaseModel):
    query: str
    auth_token: Optional[str] = None

class ChatMessage(BaseModel):
    type: str  # "user", "agent", "thought"
    content: str
    timestamp: Optional[str] = None

class ChatResponse(BaseModel):
    messages: List[ChatMessage]
    final_answer: str

# ------------------------------------------------------------------------------
# Helper: Extract fenced code (sql ... )
# ------------------------------------------------------------------------------

def extract_first_fence(text: str, lang_hint: Optional[str] = None) -> Optional[str]:
    """Handles extracting SQL from markdown code blocks."""
    fence = "`" * 3
    in_fence = False
    buf = []
    for line in text.splitlines():
        s = line.strip()
        if not in_fence:
            if s.startswith(fence):
                if lang_hint is None:
                    in_fence = True
                    continue
                if s == fence or s.startswith(f"{fence}{lang_hint}"):
                    in_fence = True
                    continue
        else:
            if s == fence:
                return "\n".join(buf).strip()
            buf.append(line)
    # Return buffer if fence not closed, or None if empty
    return "\n".join(buf).strip() if buf else None

# ------------------------------------------------------------------------------
# Databases: Vector (Chroma) + SQL (SQLite) + Graph RAG (offline)
# ------------------------------------------------------------------------------

KNOWLEDGE_DOC_TEXTS = [
    """RAG (Retrieval-Augmented Generation) combines retrieval with generation.
It retrieves relevant documents and uses them as context for accurate responses.""",
    """Agentic systems use autonomous agents to plan, reason, and use tools.
LangGraph supports agentic workflows with state and conditional routing.""",
    """Vector databases (ChromaDB, FAISS, Pinecone) store embeddings for
semantic search and fast similarity queries.""",
    """LLMs like DeepSeek's family (including chat and coder models) can be used
for reasoning, coding, and chat via their API.""",
    """Text-to-SQL translates natural language questions into SQL queries for relational databases.""",
    """CRAG (Corrective RAG) validates retrieved context with an evaluator and retries if needed.""",
    """Graph RAG builds a knowledge graph of entities and relationships, then traverses the graph
to retrieve connected context for multi-hop questions.""",
]


def init_vector_db():
    docs = [Document(page_content=t) for t in KNOWLEDGE_DOC_TEXTS]
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)
    
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
    )
    script_dir = os.path.dirname(__file__)
    db_dir = os.path.join(script_dir, "chroma_db")
    
    store = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        collection_name="agentic_rag_groq", # Changed collection name
        persist_directory=db_dir
    )
    return store.as_retriever(search_kwargs={"k": 3})

def init_sql_db():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, "agentic_rag.db")
    conn = sqlite3.connect(db_path, check_same_thread=False)
    cur = conn.cursor()
    
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if cur.fetchone() is None:
        print("Creating and populating 'users' table...")
        cur.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                department TEXT,
                join_date TEXT,
                email TEXT
            )
        """)
        rows = [
            (1, "Alice Johnson", "Engineering", "2023-01-15", "alice@company.com"),
            (2, "Bob Smith", "Marketing", "2022-03-10", "bob@company.com"),
            (3, "Charlie Brown", "Engineering", "2023-05-20", "charlie@company.com"),
            (4, "David Lee", "Sales", "2021-11-01", "david@company.com"),
            (5, "Eve Martinez", "Marketing", "2023-09-30", "eve@company.com"),
            (6, "Frank Wilson", "Engineering", "2022-07-12", "frank@company.com"),
        ]
        cur.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?)", rows)
        conn.commit()
    else:
        print("'users' table already exists.")
        
    return conn

vector_retriever = init_vector_db()
sql_conn = init_sql_db()

# ------------------------------------------------------------------------------
# LLM Setup (Groq API) — primary path; database is fallback when API fails
# ------------------------------------------------------------------------------

_api_status_cache: Dict[str, Any] = {"ok": None, "error": None}


def has_groq_api_key() -> bool:
    return bool(os.environ.get("GROQ_API_KEY", "").strip())


def get_llm(temperature: float = 0.0, format_json: bool = False, model: str = "llama-3.1-8b-instant"):
    if not DEEPSEEK_API_AVAILABLE:
        raise ValueError("langchain-openai not installed.")
        
    api_key = os.environ.get("GROQ_API_KEY") 
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set. Please add it to your .env file.")

    model_kwargs = {}
    if format_json:
        model_kwargs["response_format"] = {"type": "json_object"}

    return ChatOpenAI(
        model=model,
        temperature=temperature,
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1", 
        **model_kwargs
    )


def get_sql_llm():
    return get_llm(temperature=0.0, model="qwen/qwen3-32b")


def check_groq_api(force: bool = False) -> bool:
    """Return True when Groq API key is set and a live call succeeds."""
    if not has_groq_api_key() or not DEEPSEEK_API_AVAILABLE:
        _api_status_cache["ok"] = False
        _api_status_cache["error"] = "GROQ_API_KEY missing or langchain-openai not installed"
        return False

    if not force and _api_status_cache["ok"] is not None:
        return bool(_api_status_cache["ok"])

    try:
        llm = get_llm(temperature=0.0, model="llama-3.1-8b-instant")
        llm.invoke([HumanMessage(content="Reply with OK only.")])
        _api_status_cache["ok"] = True
        _api_status_cache["error"] = None
        return True
    except Exception as e:
        _api_status_cache["ok"] = False
        _api_status_cache["error"] = str(e)
        return False


def invalidate_api_cache():
    _api_status_cache["ok"] = None
    _api_status_cache["error"] = None
# ------------------------------------------------------------------------------
# Database fallback (when Groq API is unavailable or fails)
# ------------------------------------------------------------------------------

def fallback_route_query(query: str, live_configured: bool = False) -> Dict[str, Any]:
    q = query.lower()
    if live_configured:
        if any(k in q for k in ["product", "price", "stock", "category", "fruit", "bread", "milk", "rice", "buy", "catalog"]):
            return {"tool": "vector_search", "reasoning": "Offline: live catalog keywords"}
        if any(k in q for k in ["order", "delivery", "shipped", "pending", "team", "employee"]):
            return {"tool": "sql_query", "reasoning": "Offline: live structured-data keywords"}
    if any(k in q for k in ["user", "employee", "department", "how many", "list", "show", "who is", "email"]):
        return {"tool": "sql_query", "reasoning": "Offline: matched database/employee keywords"}
    if any(k in q for k in ["what", "explain", "how does", "define", "rag", "agent", "vector", "langgraph", "crag"]):
        return {"tool": "vector_search", "reasoning": "Offline: matched knowledge-base keywords"}
    return {"tool": "general_chat", "reasoning": "Offline: no tool-specific keywords"}


def _local_graph_knowledge_search(query: str) -> Optional[str]:
    from graph_rag import offline_knowledge_graph_search

    ctx, err = offline_knowledge_graph_search(query, KNOWLEDGE_DOC_TEXTS, max_chunks=5)
    if ctx:
        return ctx
    if err:
        print(f"Knowledge Graph RAG: {err}")
    return None


def _local_graph_catalog_search(query: str) -> Optional[str]:
    data_path = os.path.join(_script_dir, "data.txt")
    if not os.path.exists(data_path):
        return None
    from graph_rag import offline_catalog_graph_search

    ctx, err = offline_catalog_graph_search(query, data_path, max_chunks=5)
    if ctx:
        return ctx
    if err:
        print(f"Catalog Graph RAG: {err}")
    return None


def fallback_vector_search(query: str) -> str:
    q = query.lower()
    if any(k in q for k in ["product", "price", "stock", "category", "fruit", "bread", "milk", "buy"]):
        catalog = _local_graph_catalog_search(query)
        if catalog:
            return catalog

    graph_ctx = _local_graph_knowledge_search(query)
    if graph_ctx:
        return graph_ctx

    docs = vector_retriever.get_relevant_documents(query)
    if not docs:
        return "No relevant documents found in the local Chroma knowledge base."
    return "[Chroma vector fallback]\n\n" + "\n\n---\n\n".join(d.page_content for d in docs)


def _format_sql_results(sql: str, rows: list, cols: list) -> str:
    if not rows:
        return f"SQL Query:\n```{sql}\n```\n\nResults:\nNo results found."
    formatted = [dict(zip(cols, r)) for r in rows]
    return f"SQL Query:\n```{sql}\n```\n\nResults:\n```json\n{json.dumps(formatted, indent=2)}\n```"


def fallback_sql_query(query: str) -> str:
    from graph_rag import offline_users_graph_search

    graph_ctx, graph_err = offline_users_graph_search(query, sql_conn, max_chunks=8)
    if graph_ctx:
        return graph_ctx
    if graph_err:
        print(f"Users Graph RAG: {graph_err}")

    q = query.lower()
    cur = sql_conn.cursor()
    sql = ""
    try:
        departments = ["engineering", "marketing", "sales"]
        dept = next((d.title() for d in departments if d in q), None)

        if dept and any(k in q for k in ["how many", "count", "number of"]):
            sql = f"SELECT COUNT(*) AS count FROM users WHERE department = '{dept}'"
        elif dept:
            sql = f"SELECT * FROM users WHERE department = '{dept}'"
        elif any(k in q for k in ["list", "all users", "all employees", "show users", "show employees"]):
            sql = "SELECT * FROM users"
        elif "who is" in q:
            name_part = query.lower().split("who is", 1)[-1].strip().strip("?")
            sql = f"SELECT * FROM users WHERE LOWER(name) LIKE '%{name_part}%'"
        else:
            sql = "SELECT id, name, department, email FROM users LIMIT 10"

        cur.execute(sql)
        rows = cur.fetchall()
        cols = [d[0] for d in cur.description] if cur.description else []
        return _format_sql_results(sql, rows, cols)
    except Exception as e:
        return f"Local SQL fallback error: {e}\nAttempted SQL: {sql}"


def fallback_generate_answer(query: str, context: str, tool: str) -> str:
    q = query.lower()
    if tool == "general_chat":
        if any(g in q for g in ["hi", "hello", "hey", "good morning", "good afternoon"]):
            return (
                "Hello! The Groq API is unavailable, so I'm answering from local data only. "
                "Ask about RAG/agents (knowledge base) or users/departments (SQLite)."
            )
        return (
            "I'm running in database-only mode because the Groq API is not available. "
            "Try questions about RAG, vector databases, or employees in the users table."
        )
    if not context.strip():
        return "I could not find matching data in the local knowledge base or SQLite database."
    return (
        "Here is what I found using local databases (Groq API unavailable):\n\n"
        f"{context}\n\n"
        "_Enable GROQ_API_KEY for AI-generated summaries and smarter routing._"
    )


# ------------------------------------------------------------------------------
# Core Agent Functions (API-first)
# ------------------------------------------------------------------------------

async def route_query(query: str, live_configured: bool = False) -> Dict[str, Any]:
    llm = get_llm(temperature=0.0, format_json=True, model="llama-3.1-8b-instant")

    live_rules = ""
    if live_configured:
        live_rules = """
When the live supermarket API is available:
- "vector_search": product catalog questions (price, stock, category, recommendations).
- "sql_query": orders, deliveries, team/employee lists, or tabular store data from the live API.
"""

    system_prompt = f"""You are a query router. Classify the user's query into one of the following categories:
1) "vector_search": For questions about concepts, definitions, explanations (e.g., "What is RAG?"), OR product/catalog search when live API is on.
2) "sql_query": For structured data — users/departments in the demo SQLite table, OR orders/team/live catalog filters when live API is on.
3) "general_chat": For greetings, small talk, or any other query.
{live_rules}
You must return ONLY a JSON object with "tool" and "reasoning" keys.
"""
    
    try:
        res = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Query: {query}"),
        ])
        
        return json.loads(res.content)
        
    except Exception as e:
        print(f"Router JSON parsing error: {e}. Falling back to keywords.")
        # Fallback logic if JSON fails
        q = query.lower()
        if any(k in q for k in ["user", "employee", "department", "how many", "list", "show", "who is", "email"]):
            return {"tool": "sql_query", "reasoning": "Fallback: DB keywords detected"}
        if any(k in q for k in ["what", "explain", "how does", "define", "rag", "agent"]):
            return {"tool": "vector_search", "reasoning": "Fallback: Knowledge keywords detected"}
        return {"tool": "general_chat", "reasoning": "Fallback: Default to chat"}

async def vector_search(query: str, auth_token: Optional[str] = None) -> str:
    """Live Graph/vector API first, then offline Graph RAG, then Chroma + Groq relevance."""
    from live_data import is_supermarket_api_configured, live_vector_search

    if is_supermarket_api_configured():
        live_context, live_err = await live_vector_search(query, auth_token, k=5)
        if live_context:
            return live_context
        if live_err:
            print(f"Live retrieval: {live_err}")

    q = query.lower()
    if any(k in q for k in ["product", "price", "stock", "category", "fruit", "bread", "milk", "buy", "catalog"]):
        catalog = _local_graph_catalog_search(query)
        if catalog:
            return catalog

    graph_ctx = _local_graph_knowledge_search(query)
    if graph_ctx:
        return graph_ctx

    docs = vector_retriever.get_relevant_documents(query)
    if not docs:
        return "No relevant documents found."

    llm = get_llm(temperature=0.0, model="llama-3.1-8b-instant")
    kept = []
    for d in docs:
        check_prompt = f"""Is the following document relevant to the user's query?
Answer with only a single word: RELEVANT or IRRELEVANT.

Query: {query}
Document: {d.page_content}

Answer:"""
        ans = llm.invoke([HumanMessage(content=check_prompt)]).content.strip().upper()
        if "RELEVANT" in ans and "IRRELEVANT" not in ans:
            kept.append(d)

    if not kept:
        return "No relevant results found after validation."

    return "[Local knowledge base]\n\n" + "\n\n---\n\n".join(x.page_content for x in kept)


async def sql_query(query: str, auth_token: Optional[str] = None) -> str:
    """Live REST structured query first, then SQLite + Groq text-to-SQL."""
    from live_data import is_supermarket_api_configured, live_structured_query

    if is_supermarket_api_configured():
        live_context, live_err = await live_structured_query(query, auth_token)
        if live_context:
            return live_context
        if live_err:
            print(f"Live structured query: {live_err}")

    llm = get_sql_llm()
    
    prompt = f"""You are a SQLite SQL expert.
Given the table schema:
Table: users(id INTEGER, name TEXT, department TEXT, join_date TEXT, email TEXT)

And a user question:
Question: {query}

Generate a single, executable SQLite SQL query to answer the question.
Return ONLY the SQL statement, and do not wrap it in markdown.
"""
    resp = llm.invoke([HumanMessage(content=prompt)])
    raw = resp.content.strip()
    
    sql = extract_first_fence(raw, "sql") or extract_first_fence(raw) or raw
    sql = sql.replace("```", "").replace("sql", "").strip()

    try:
        cur = sql_conn.cursor()
        cur.execute(sql)
        rows = cur.fetchall()
        
        if not rows:
            return f"SQL Query:\n```{sql}\n```\n\nResults:\nNo results found."
            
        cols = [d[0] for d in cur.description]
        formatted = [dict(zip(cols, r)) for r in rows]
        
        return f"SQL Query:\n```{sql}\n```\n\nResults:\n```json\n{json.dumps(formatted, indent=2)}\n```"
    except Exception as e:
        return f"SQL Error: {e}\nGenerated SQL: {sql}\n(Fallback: local SQLite demo users table)"

async def generate_answer(query: str, context: str, tool: str) -> str:
    """Generates the final answer based on context."""
    # FIXED: Use the default Groq model
    llm = get_llm(temperature=0.7, model="llama-3.1-8b-instant") 
    
    if tool == "general_chat":
        prompt = f"You are a helpful assistant. Respond naturally to the user.\n\nUser: {query}\nAssistant:"
    else:
        prompt = f"""You are a helpful assistant. Answer the user's question based *only* on the provided context.
If the context is not sufficient, say so.

Context:
---
{context}
---

Question: {query}

Answer:"""
    
    return llm.invoke([HumanMessage(content=prompt)]).content

# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------

@app.get("/")
async def root():
    api_ok = check_groq_api()
    return {
        "message": "Agentic RAG API with Groq API",
        "mode": "api" if api_ok else "database_fallback",
        "deepseek_api_available": DEEPSEEK_API_AVAILABLE,
        "models": {
            "router_chat_rag": "llama-3.1-8b-instant",
            "sql_generation": "qwen/qwen3-32b",
        },
    }

@app.get("/health")
async def health():
    from live_data import check_live_api, is_supermarket_api_configured
    from graph_rag import get_graph_health

    api_ok = check_groq_api(force=True)
    live_status = await check_live_api()
    data_mode = "live_api" if live_status.get("reachable") else (
        "local_fallback" if not is_supermarket_api_configured() else "live_api_unavailable"
    )
    return {
        "status": "healthy" if api_ok or (vector_retriever and sql_conn) or live_status.get("reachable") else "unhealthy",
        "llm_mode": "api" if api_ok else "database_fallback",
        "data_mode": data_mode,
        "groq_api": "connected" if api_ok else "unavailable",
        "groq_api_error": _api_status_cache.get("error"),
        "live_supermarket_api": live_status,
        "graph_rag": get_graph_health(),
        "retrieval_stack": ["live_graph_rag", "live_vector", "offline_graph_rag", "chroma_sqlite"],
        "local_vector_db": vector_retriever is not None,
        "local_sql_db": sql_conn is not None,
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(req: QueryRequest):
    from live_data import is_supermarket_api_configured

    messages: List[ChatMessage] = []
    use_api = check_groq_api()
    live_on = is_supermarket_api_configured()
    try:
        mode_label = "Groq API" if use_api else "local database fallback"
        messages.append(ChatMessage(
            type="thought",
            content=f"🤔 Analyzing query ({mode_label})...",
            timestamp=datetime.now().isoformat()
        ))
        if live_on:
            messages.append(ChatMessage(
                type="thought",
                content="🌐 Live supermarket API enabled — fetching fresh data when needed",
                timestamp=datetime.now().isoformat(),
            ))

        if use_api:
            try:
                routed = await route_query(req.query, live_configured=live_on)
            except Exception as e:
                invalidate_api_cache()
                use_api = False
                routed = fallback_route_query(req.query, live_configured=live_on)
                messages.append(ChatMessage(
                    type="thought",
                    content=f"⚠ Groq API failed ({e}). Switching to database fallback.",
                    timestamp=datetime.now().isoformat()
                ))
        else:
            routed = fallback_route_query(req.query, live_configured=live_on)

        tool = routed.get("tool", "general_chat")

        messages.append(ChatMessage(
            type="thought",
            content=f"📍 Decision: {tool.upper()} (Reason: {routed.get('reasoning', 'N/A')})",
            timestamp=datetime.now().isoformat()
        ))

        context = ""
        if tool == "vector_search":
            if use_api:
                try:
                    context = await vector_search(req.query, req.auth_token)
                except Exception as e:
                    invalidate_api_cache()
                    use_api = False
                    context = fallback_vector_search(req.query)
                    messages.append(ChatMessage(
                        type="thought",
                        content=f"⚠ Vector search failed ({e}). Using local ChromaDB.",
                        timestamp=datetime.now().isoformat()
                    ))
            else:
                from live_data import live_vector_search
                if live_on:
                    live_ctx, _ = await live_vector_search(req.query, req.auth_token)
                    context = live_ctx or fallback_vector_search(req.query)
                else:
                    context = fallback_vector_search(req.query)
        elif tool == "sql_query":
            if use_api:
                try:
                    context = await sql_query(req.query, req.auth_token)
                except Exception as e:
                    invalidate_api_cache()
                    use_api = False
                    context = fallback_sql_query(req.query)
                    messages.append(ChatMessage(
                        type="thought",
                        content=f"⚠ Structured query failed ({e}). Using SQLite heuristics.",
                        timestamp=datetime.now().isoformat()
                    ))
            else:
                from live_data import live_structured_query
                if live_on:
                    live_ctx, _ = await live_structured_query(req.query, req.auth_token)
                    context = live_ctx or fallback_sql_query(req.query)
                else:
                    context = fallback_sql_query(req.query)
        else:
            context = ""

        if context:
            messages.append(ChatMessage(
                type="thought",
                content=f"Tool Output:\n{context}",
                timestamp=datetime.now().isoformat()
            ))

        messages.append(ChatMessage(
            type="thought",
            content="✨ Generating final answer...",
            timestamp=datetime.now().isoformat()
        ))

        if use_api:
            try:
                final = await generate_answer(req.query, context, tool)
            except Exception as e:
                invalidate_api_cache()
                final = fallback_generate_answer(req.query, context, tool)
                messages.append(ChatMessage(
                    type="thought",
                    content=f"⚠ Answer generation API failed ({e}). Returning local data summary.",
                    timestamp=datetime.now().isoformat()
                ))
        else:
            final = fallback_generate_answer(req.query, context, tool)

        return ChatResponse(messages=messages, final_answer=final)

    except Exception as e:
        error_message = f"❌ Error: {str(e)}"
        print(error_message)

        messages.append(ChatMessage(
            type="thought",
            content=error_message,
            timestamp=datetime.now().isoformat()
        ))
        return ChatResponse(messages=messages, final_answer=f"An error occurred: {str(e)}")

# ------------------------------------------------------------------------------
# Run Server
# ------------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Starting Agentic RAG Server with Groq API")
    print("="*60)
    print("Models:")
    print("  - Router/Chat: llama-3.1-8b-instant")
    print("  - SQL Generation: qwen/qwen3-32b")
    print("\nRequirements:")
    print("  1. Go to [https://console.groq.com/](https://console.groq.com/) to get an API key.")
    print("  2. Create a `.env` file and set `GROQ_API_KEY='your-key'`")
    print("  3. Optional live DB: set `SUPERMARKET_API_URL=http://localhost:3000`")
    print("     and `SUPERMARKET_API_TOKEN` or pass auth_token from the frontend")
    print("  4. Install Python dependencies:")
    print("     `pip install -r requirements.txt`")
    print("\nServer will be live at: http://localhost:8000")
    print("Check health at: http://localhost:8000/health")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)