"""
Standard RAG Backend with Groq API
FastAPI server that handles retrieval (Vector DB) and final answer generation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import os

# Add dotenv to load the .env file
from dotenv import load_dotenv
load_dotenv()
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# LangChain integrations
# ------------------------------------------------------------------------------

try:
    from langchain_openai import ChatOpenAI
    from langchain_community.embeddings import HuggingFaceEmbeddings
    DEEPSEEK_API_AVAILABLE = True # This variable name is fine
except ImportError:
    DEEPSEEK_API_AVAILABLE = False
    print("Warning: Install with: pip install langchain-openai")

from langchain_community.vectorstores import Chroma
# NEW: Import TextLoader to read from a .txt file
from langchain_community.document_loaders import TextLoader 
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, SystemMessage

# ------------------------------------------------------------------------------
# FastAPI Setup
# ------------------------------------------------------------------------------

app = FastAPI(title="Standard RAG API with Groq")

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

class ChatMessage(BaseModel):
    type: str  # "user", "agent", "thought"
    content: str
    timestamp: Optional[str] = None

class ChatResponse(BaseModel):
    messages: List[ChatMessage]
    final_answer: str

# ------------------------------------------------------------------------------
# Database: Vector (Chroma)
# ------------------------------------------------------------------------------

def init_vector_db():
    
    # --- MODIFIED: Load from data.txt ---
    DATA_FILE = "data.txt" # Put your data in this file
    
    if os.path.exists(DATA_FILE):
        print(f"Loading documents from '{DATA_FILE}'...")
        loader = TextLoader(DATA_FILE)
        docs = loader.load()
    else:
        print(f"Warning: '{DATA_FILE}' not found.")
        print("Using default hard-coded documents as a fallback.")
        docs = [
            Document(page_content="""RAG (Retrieval-Augmented Generation) combines retrieval with generation.
It retrieves relevant documents and uses them as context for accurate responses."""),
            Document(page_content="""Agentic systems use autonomous agents to plan, reason, and use tools.
LangGraph supports agentic workflows with state and conditional routing."""),
            Document(page_content="""Vector databases (ChromaDB, FAISS, Pinecone) store embeddings for
semantic search and fast similarity queries."""),
            Document(page_content="""LLMs like DeepSeek's family (including chat and coder models) can be used
for reasoning, coding, and chat via their API."""),
            Document(page_content="""Text-to-SQL translates natural language questions into SQL queries for relational databases."""),
            Document(page_content="""CRAG (Corrective RAG) validates retrieved context with an evaluator and retries if needed."""),
        ]
    # --- END OF MODIFICATION ---
        
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
        collection_name="standard_rag_groq", # Changed collection name
        persist_directory=db_dir
    )
    return store.as_retriever(search_kwargs={"k": 3})

vector_retriever = init_vector_db()

# REMOVED: init_sql_db() and sql_conn

# ------------------------------------------------------------------------------
# LLM Setup (Groq API)
# ------------------------------------------------------------------------------

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

# REMOVED: get_sql_llm()

# ------------------------------------------------------------------------------
# Core RAG Functions
# ------------------------------------------------------------------------------

# REMOVED: route_query()

async def vector_search(query: str) -> str:
    """Performs RAG with a relevance check."""
    docs = await vector_retriever.ainvoke(query)
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
        
    return "\n\n---\n\n".join(x.page_content for x in kept)

# REMOVED: sql_query()

async def generate_answer(query: str, context: str) -> str:
    """Generates the final answer based on context."""
    llm = get_llm(temperature=0.7, model="llama-3.1-8b-instant") 
    
    # MODIFIED: Removed the "general_chat" logic. All queries now use RAG.
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
    return {
        "message": "Standard RAG API with Groq API", # MODIFIED
        "deepseek_api_available": DEEPSEEK_API_AVAILABLE,
        "models": {
            "chat_rag": "llama-3.1-8b-instant",
            # REMOVED sql_generation model
        },
    }

@app.get("/health")
async def health():
    try:
        _ = get_llm()
        return {"status": "healthy", "groq_api": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/chat", response_model=ChatResponse)
async def chat(req: QueryRequest):
    messages: List[ChatMessage] = []
    try:
        # 1. Start "thought" process
        messages.append(ChatMessage(
            type="thought",
            content="🤔 Retrieving relevant context...",
            timestamp=datetime.now().isoformat()
        ))

        # 2. REMOVED Router: Go directly to vector search
        context = await vector_search(req.query)

        # 3. Add context as a thought
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
        
        # 4. Generate final answer
        final = await generate_answer(req.query, context)
        return ChatResponse(messages=messages, final_answer=final)

    except Exception as e:
        error_message = f"❌ Error: {str(e)}"
        print(error_message) # Log to server console
        
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
    print("🚀 Starting Standard RAG Server with Groq API")
    print("="*60)
    print("Models:")
    print("  - Chat/RAG: llama-3.1-8b-instant")
    print("\nRequirements:")
    print("  1. Go to [https://console.groq.com/](https://console.groq.com/) to get an API key.")
    print("  2. Create a `.env` file and set `GROQ_API_KEY='your-key'`")
    print("  3. Create a `data.txt` file in this directory with your data.")
    print("  4. Install Python dependencies:")
    print("     `pip install -r requirements.txt`")
    print("\nServer will be live at: http://localhost:8000")
    print("Check health at: http://localhost:8000/health")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)