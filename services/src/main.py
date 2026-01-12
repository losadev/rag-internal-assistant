from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .rag_system import initialize_rag_system

app = FastAPI(title="AI Service")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_chain, _ = initialize_rag_system()


class ChatRequest(BaseModel):
    message: str


class Source(BaseModel):
    document: str
    snippet: str
    page: Optional[int] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    result = rag_chain.invoke(req.message)
    return result
