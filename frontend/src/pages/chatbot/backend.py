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
    DATA_FILE = "data.txt"
    
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

# ------------------------------------------------------------------------------
# LLM Setup (Groq API)
# ------------------------------------------------------------------------------

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

# ------------------------------------------------------------------------------
# Core Functions
# ------------------------------------------------------------------------------

async def simple_rag_search(query: str) -> str:
    """
    Simple RAG: Just retrieves the top k documents. 
    No complex relevance checking loop (faster and more robust for data lists).
    """
    if not vector_retriever:
        return "Database not initialized."

    docs = await vector_retriever.ainvoke(query)
    
    if not docs:
        return "No relevant documents found."
    
    # Format the retrieved docs into a string
    context_text = "\n\n---\n\n".join([d.page_content for d in docs])
    return context_text

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
    return {
        "message": "Standard RAG API is running",
        "model": "llama-3.1-8b-instant"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(req: QueryRequest):
    messages: List[ChatMessage] = []
    try:
        # 1. Log Thought: Start
        messages.append(ChatMessage(
            type="thought",
            content="🔍 Searching 'data.txt' for relevant products...",
            timestamp=datetime.now().isoformat()
        ))

        # 2. Perform Simple RAG Search
        context = await simple_rag_search(req.query)

        # 3. Log Thought: Context Found
        # (Truncate context in the log so it doesn't flood the UI)
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
        
        # 4. Generate Answer
        final = await generate_answer(req.query, context)
        
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
    print("Server will be live at: http://localhost:8000")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)