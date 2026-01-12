from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .rag_system import initialize_rag_system,add_documents_to_rag
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Service")
logger.info("🚀 Iniciando AI Service")

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
logger.info(f"✓ Directorio de uploads: {UPLOAD_DIR}")


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
    logger.info(f"[CHAT] Mensaje recibido: {req.message}")
    result = rag_chain.invoke(req.message)
    logger.info(f"[CHAT] Respuesta generada con {len(result.get('sources', []))} fuentes")
    return result


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Subir archivo PDF, TXT o Markdown al sistema RAG"""
    try:
        logger.info(f"[UPLOAD] Archivo recibido: {file.filename}")
        # Guardar archivo temporalmente
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"[UPLOAD] Archivo guardado temporalmente en: {file_path}")
        
        # Cargar documento al RAG
        add_documents_to_rag(file_path, vector_store)
        
        logger.info(f"[UPLOAD] ✅ Respuesta exitosa para: {file.filename}")
        return {"status": "success", "message": f"Archivo {file.filename} cargado correctamente"}
    except Exception as e:
        logger.error(f"[UPLOAD] ❌ Error: {str(e)}", exc_info=True)
        return {"status": "error", "message": str(e)}


@app.get("/documents/count")
def get_documents_count():
    """Endpoint para debugging - contar documentos en la BD vectorial"""
    try:
        collection = vector_store._collection
        doc_count = collection.count()
        logger.info(f"[DEBUG] Documentos en BD: {doc_count}")
        return {"documents": doc_count, "status": "ok"}
    except Exception as e:
        logger.error(f"[DEBUG] Error contando documentos: {e}", exc_info=True)
        return {"documents": 0, "status": "error", "error": str(e)}
