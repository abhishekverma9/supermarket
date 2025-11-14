"""
Agentic RAG Backend with Groq API
FastAPI server that handles routing, retrieval (Vector DB), SQL (PostgreSQL),
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
import psycopg2 # MODIFIED: Added for PostgreSQL connection

# FIXED: Add dotenv to load the .env file
from dotenv import load_dotenv
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
# Databases: Vector (Chroma) + SQL (PostgreSQL)
# ------------------------------------------------------------------------------

def init_vector_db():
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

# MODIFIED: This function now connects to your external PostgreSQL DB
def init_sql_db():
    """Initializes the connection to the external PostgreSQL database."""
    
    # Load credentials from .env file
    DB_HOST = os.environ.get("DB_HOST")
    DB_USER = os.environ.get("DB_USER")
    DB_PASSWORD = os.environ.get("DB_PASSWORD")
    DB_NAME = os.environ.get("DB_NAME")
    DB_PORT = os.environ.get("DB_PORT")

    if not all([DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT]):
        raise ValueError("One or more database .env variables are missing (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT).")

    try:
        # MODIFIED: Connect to PostgreSQL using psycopg2
        print(f"Attempting to connect to PostgreSQL at {DB_HOST}:{DB_PORT}...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        
        
        # Health check
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
        
        print(f"✅ Successfully connected to PostgreSQL database '{DB_NAME}' at {DB_HOST}.")
        return conn
        
    except Exception as e:
        print(f"❌ Failed to connect to PostgreSQL database: {e}")
        # Propagate the error to stop the app if DB connection fails
        raise e

vector_retriever = init_vector_db()
sql_conn = init_sql_db()

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


def get_sql_llm():
    # Use a more powerful model for SQL generation.
    # 'qwen/qwen3-32b' is noted for strong agent capabilities.
    return get_llm(temperature=0.0, model="qwen/qwen3-32b")
# ------------------------------------------------------------------------------
# Core Agent Functions
# ------------------------------------------------------------------------------

async def route_query(query: str) -> Dict[str, Any]:
    """
    MODIFIED: This prompt is now clearer and more distinct.
    
    IMPORTANT: You should update the examples in 'sql_query' to match
    your actual database (e.g., "products", "orders", "customers" instead of "users").
    """
    llm = get_llm(temperature=0.0, format_json=True, model="llama-3.1-8b-instant")
    
    system_prompt = """You are an expert query router. Your job is to classify the user's query into one of three categories based on its *intent*.

Here are the categories:

1. "vector_search":
   - **Use for:** General knowledge, definitions, explanations, or conceptual questions.
   - **Keywords:** "What is...", "Explain...", "How does...", "Define...", "Compare...", "What is RAG?", "Tell me about agentic systems."
   - **Do NOT use for:** Questions about specific data *in our database* (like users, products, or orders).

2. "sql_query":
   - **Use for:** Questions that require fetching specific data from our company database.
   - **Keywords:** "How many...", "List all...", "Who is...", "Show me...", "What is the price of...", "Find user...", "Get order details..."
   - **Examples (Update these!):** "How many users are in Engineering?", "List all products in the 'Electronics' category", "What is the email for Bob Smith?", "Show me the order for user 123."

3. "general_chat":
   - **Use for:** Greetings, follow-ups, or conversational small talk.
   - **Examples:** "Hello", "Hi", "How are you?", "Thank you", "That's great."

You must return ONLY a JSON object with "tool" (one of "vector_search", "sql_query", or "general_chat") and "reasoning" (a brief justification).
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
        
        # IMPORTANT: Update these keywords to match your data
        if any(k in q for k in ["user", "employee", "department", "product", "order", "price", "how many", "list", "show", "who is", "email", "customer"]):
            return {"tool": "sql_query", "reasoning": "Fallback: DB keywords detected"}
        if any(k in q for k in ["what", "explain", "how does", "define", "rag", "agent", "concept"]):
            return {"tool": "vector_search", "reasoning": "Fallback: Knowledge keywords detected"}
        return {"tool": "general_chat", "reasoning": "Fallback: Default to chat"}

async def vector_search(query: str) -> str:
    """Performs RAG with a relevance check."""
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
        
    return "\n\n---\n\n".join(x.page_content for x in kept)

async def sql_query(query: str) -> str:
    """Generates and executes a SQL query against the PostgreSQL database."""
    llm = get_sql_llm() # This correctly calls the qwen/qwen3-32b model
    
    # MODIFIED: Changed "SQLite" to "PostgreSQL"
    # IMPORTANT: You MUST update the schema below to match your database!
    prompt = f"""You are a PostgreSQL SQL expert.
Given the table schema(s):
---
(Example Schema:
Table: products(product_id SERIAL PRIMARY KEY, name VARCHAR(255), price DECIMAL(10, 2), category VARCHAR(100))
Table: customers(customer_id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255))
Table: orders(order_id SERIAL PRIMARY KEY, customer_id INTEGER, order_date DATE)
)
---
IMPORTANT: Replace the example schema above with your actual database schema before providing this to the LLM. 
For now, you must infer the schema from the user's query.

And a user question:
Question: {query}

Generate a single, executable PostgreSQL SQL query to answer the question.
Return ONLY the SQL statement, and do not wrap it in markdown.
"""
    # NOTE: The above prompt is a placeholder. 
    # For best results, you should fetch your schema and inject it here.
    # See "Step 3" in the explanation.

    resp = llm.invoke([HumanMessage(content=prompt)])
    raw = resp.content.strip()
    
    sql = extract_first_fence(raw, "sql") or extract_first_fence(raw) or raw
    sql = sql.replace("```", "").replace("sql", "").strip()

    try:
        # MODIFIED: Use psycopg2 cursor with 'with' block for safety
        with sql_conn.cursor() as cur:
            cur.execute(sql)
            
            # Check if the query was a SELECT or returned data
            if cur.description is None:
                # This was likely an INSERT, UPDATE, DELETE, etc.
                sql_conn.commit()
                return f"SQL Query:\n```{sql}\n```\n\nResults:\nQuery executed successfully (no data returned)."

            rows = cur.fetchall()
            
            if not rows:
                return f"SQL Query:\n```{sql}\n```\n\nResults:\nNo results found."
                
            cols = [d[0] for d in cur.description]
            # MODIFIED: Added default=str to handle dates/decimals
            formatted = [dict(zip(cols, r)) for r in rows]
            
            return f"SQL Query:\n```{sql}\n```\n\nResults:\n```json\n{json.dumps(formatted, indent=2, default=str)}\n```"
            
    except Exception as e:
        sql_conn.rollback() # MODIFIED: Rollback transaction on error
        return f"SQL Error: {e}\nGenerated SQL: {sql}"

async def generate_answer(query: str, context: str, tool: str) -> str:
    """Generates the final answer based on context."""
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
    return {
        "message": "Agentic RAG API with Groq API", 
        "deepseek_api_available": DEEPSEEK_API_AVAILABLE, 
        "models": {
            "router_chat_rag": "llama-3.1-8b-instant", 
            "sql_generation": "qwen/qwen3-32b"
        },
    }

@app.get("/health")
async def health():
    try:
        # Check LLM connection
        _ = get_llm()
        
        # Check DB connection
        with sql_conn.cursor() as cur:
            cur.execute("SELECT 1;")
            
        return {"status": "healthy", "groq_api": "connected", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/chat", response_model=ChatResponse)
async def chat(req: QueryRequest):
    messages: List[ChatMessage] = []
    try:
        messages.append(ChatMessage(
            type="thought",
            content="🤔 Analyzing query and choosing the right tool...",
            timestamp=datetime.now().isoformat()
        ))

        routed = await route_query(req.query)
        tool = routed.get("tool", "general_chat")

        messages.append(ChatMessage(
            type="thought",
            content=f"📍 Decision: {tool.upper()} (Reason: {routed.get('reasoning', 'N/A')})",
            timestamp=datetime.now().isoformat()
        ))

        if tool == "vector_search":
            context = await vector_search(req.query)
        elif tool == "sql_query":
            context = await sql_query(req.query)
        else:
            context = "" # No context needed for general_chat

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

        final = await generate_answer(req.query, context, tool)
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
    print("🚀 Starting Agentic RAG Server with Groq API")
    print("="*60)
    print("Models:")
    print("  - Router/Chat: llama-3.1-8b-instant")
    print("  - SQL Generation: qwen/qwen3-32b")
    print("\nRequirements:")
    print("  1. Go to [https://console.groq.com/](https://console.groq.com/) to get an API key.")
    print("  2. Ensure `.env` file has `GROQ_API_KEY`.")
    print("  3. Ensure `.env` file has your DB credentials.")
    print("  4. Install Python dependencies:")
    print("     `pip install -r requirements.txt` (and `pip install psycopg2-binary`)")
    print("\nServer will be live at: http://localhost:8000")
    print("Check health at: http://localhost:8000/health")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)