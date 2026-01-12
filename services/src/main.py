from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .rag_system import initialize_rag_system,add_documents_to_rag
import os

app = FastAPI(title="AI Service")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_chain, vector_store = initialize_rag_system()

# Crear carpeta para archivos temporales
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Subir archivo PDF, TXT o Markdown al sistema RAG"""
    try:
        # Guardar archivo temporalmente
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Cargar documento al RAG
        add_documents_to_rag(file_path, vector_store)
        
        return {"status": "success", "message": f"Archivo {file.filename} cargado correctamente"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
