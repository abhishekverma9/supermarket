"""
Standard RAG Backend with Groq API
FastAPI server that handles simple retrieval (Vector DB) and final answer generation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

# Load environment variables
from dotenv import load_dotenv
_script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_script_dir, ".env"))
load_dotenv()

# ------------------------------------------------------------------------------
# LangChain Integrations
# ------------------------------------------------------------------------------

try:
    from langchain_openai import ChatOpenAI
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma
    from langchain_community.document_loaders import TextLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_core.messages import HumanMessage, SystemMessage
    DEEPSEEK_API_AVAILABLE = True
except ImportError:
    DEEPSEEK_API_AVAILABLE = False
    print("Warning: Install dependencies with: pip install langchain-openai langchain-community langchain-chroma sentence-transformers")

# ------------------------------------------------------------------------------
# FastAPI Setup
# ------------------------------------------------------------------------------

app = FastAPI(title="Standard RAG API with Groq")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
# Database: Vector (Chroma) - Loads data.txt
# ------------------------------------------------------------------------------

def init_vector_db():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    DATA_FILE = os.path.join(script_dir, "data.txt")
    
    if os.path.exists(DATA_FILE):
        print(f"Loading documents from '{DATA_FILE}'...")
        loader = TextLoader(DATA_FILE, encoding="utf-8")
        docs = loader.load()
    else:
        print(f"Warning: '{DATA_FILE}' not found. Creating dummy data.")
        from langchain_core.documents import Document
        docs = [Document(page_content="No data.txt found. Please add data.txt to the backend folder.")]

    # Chunking
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)
    
    # Embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
    )
    
    # Fix file path syntax
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_dir = os.path.join(script_dir, "chroma_db_standard")
    
    # Store
    store = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        collection_name="standard_rag_groq", 
        persist_directory=db_dir
    )
    
    # Return retriever (k=5 for broader context)
    return store.as_retriever(search_kwargs={"k": 5})

# Initialize Global Retriever
vector_retriever = init_vector_db()

_api_status_cache = {"ok": None, "error": None}

# ------------------------------------------------------------------------------
# LLM Setup (Groq API) — primary; Chroma/data.txt fallback when API fails
# ------------------------------------------------------------------------------

def has_groq_api_key() -> bool:
    return bool(os.environ.get("GROQ_API_KEY", "").strip())


def get_llm(temperature: float = 0.0):
    if not DEEPSEEK_API_AVAILABLE:
        raise ValueError("LangChain dependencies not installed.")
        
    api_key = os.environ.get("GROQ_API_KEY") 
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set.")

    return ChatOpenAI(
        model="llama-3.1-8b-instant",
        temperature=temperature,
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )


def check_groq_api(force: bool = False) -> bool:
    if not has_groq_api_key() or not DEEPSEEK_API_AVAILABLE:
        _api_status_cache["ok"] = False
        _api_status_cache["error"] = "GROQ_API_KEY missing or langchain-openai not installed"
        return False
    if not force and _api_status_cache["ok"] is not None:
        return bool(_api_status_cache["ok"])
    try:
        llm = get_llm(temperature=0.0)
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
# Core Functions
# ------------------------------------------------------------------------------

async def simple_rag_search(query: str, auth_token: Optional[str] = None) -> tuple[str, str]:
    """
    Live API vector search first (MySQL via Node REST), then local Chroma/data.txt.
    Returns (context, source) where source is live_api | local.
    """
    from live_data import is_supermarket_api_configured, live_vector_search

    if is_supermarket_api_configured():
        live_context, live_err = await live_vector_search(query, auth_token, k=5)
        if live_context:
            return live_context, "live_api"
        if live_err:
            print(f"Live vector search fallback: {live_err}")

    if not vector_retriever:
        return "Database not initialized.", "local"

    docs = await vector_retriever.ainvoke(query)
    if not docs:
        return "No relevant documents found.", "local"

    context_text = "\n\n---\n\n".join([d.page_content for d in docs])
    return context_text, "local"

def fallback_generate_answer(query: str, context: str) -> str:
    if not context.strip():
        return (
            "I couldn't find matching products in the local catalog (data.txt / ChromaDB). "
            "Set GROQ_API_KEY for AI-powered answers."
        )
    preview = context if len(context) <= 2000 else context[:2000] + "\n\n...(truncated)"
    return (
        "Here are the closest matches from the local product catalog "
        "(Groq API unavailable):\n\n"
        f"{preview}\n\n"
        "_Add a valid GROQ_API_KEY for natural-language summaries._"
    )


async def generate_answer(query: str, context: str) -> str:
    """Generates the final answer using the retrieved context."""
    llm = get_llm(temperature=0.5)
    
    prompt = f"""You are a helpful Supermarket Assistant.
Answer the user's question based ONLY on the context provided below.

Context (Product Data):
---
{context}
---

User Question: {query}

Guidelines:
1. If the user asks for a product, mention its Price and Stock if available.
2. If the answer is not in the context, politely say you couldn't find that information.
3. Keep the tone friendly and helpful.

Answer:"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content

# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------

@app.get("/")
async def root():
    api_ok = check_groq_api()
    return {
        "message": "Standard RAG API is running",
        "model": "llama-3.1-8b-instant",
        "mode": "api" if api_ok else "database_fallback",
    }


@app.get("/health")
async def health():
    from live_data import check_live_api, is_supermarket_api_configured

    api_ok = check_groq_api(force=True)
    live_status = await check_live_api()
    data_mode = "live_api" if live_status.get("reachable") else (
        "local_fallback" if not is_supermarket_api_configured() else "live_api_unavailable"
    )
    return {
        "status": "healthy" if api_ok or vector_retriever or live_status.get("reachable") else "unhealthy",
        "llm_mode": "api" if api_ok else "database_fallback",
        "data_mode": data_mode,
        "groq_api": "connected" if api_ok else "unavailable",
        "groq_api_error": _api_status_cache.get("error"),
        "live_supermarket_api": live_status,
        "local_vector_db": vector_retriever is not None,
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(req: QueryRequest):
    messages: List[ChatMessage] = []
    use_api = check_groq_api()
    from live_data import is_supermarket_api_configured

    mode_label = "Groq API + catalog" if use_api else "local catalog only"
    try:
        messages.append(ChatMessage(
            type="thought",
            content=f"🔍 Searching product catalog ({mode_label})...",
            timestamp=datetime.now().isoformat()
        ))

        context, data_source = await simple_rag_search(req.query, req.auth_token)
        if data_source == "live_api":
            messages.append(ChatMessage(
                type="thought",
                content="🌐 Using live supermarket database (REST API + vector search)",
                timestamp=datetime.now().isoformat(),
            ))
        elif is_supermarket_api_configured():
            messages.append(ChatMessage(
                type="thought",
                content="📁 Live API unavailable — using local data.txt / ChromaDB",
                timestamp=datetime.now().isoformat(),
            ))

        preview = (context[:200] + '...') if len(context) > 200 else context
        messages.append(ChatMessage(
            type="thought",
            content=f"📄 Data Found:\n{preview}",
            timestamp=datetime.now().isoformat()
        ))
        
        messages.append(ChatMessage(
            type="thought",
            content="✨ Generating final answer...",
            timestamp=datetime.now().isoformat()
        ))
        
        if use_api:
            try:
                final = await generate_answer(req.query, context)
            except Exception as e:
                invalidate_api_cache()
                final = fallback_generate_answer(req.query, context)
                messages.append(ChatMessage(
                    type="thought",
                    content=f"⚠ Groq API failed ({e}). Returning catalog matches only.",
                    timestamp=datetime.now().isoformat()
                ))
        else:
            final = fallback_generate_answer(req.query, context)
        
        return ChatResponse(messages=messages, final_answer=final)

    except Exception as e:
        error_message = f"❌ Error: {str(e)}"
        print(error_message)
        
        messages.append(ChatMessage(
            type="thought",
            content=error_message,
            timestamp=datetime.now().isoformat()
        ))
        return ChatResponse(messages=messages, final_answer="Sorry, I encountered an error processing your request.")

# ------------------------------------------------------------------------------
# Run Server
# ------------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Starting Standard RAG Server (No SQL)")
    print("="*60)
    print("Optional: SUPERMARKET_API_URL + token for live MySQL product data")
    print("Server will be live at: http://localhost:8000")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)