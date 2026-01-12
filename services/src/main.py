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
    conversation_id: Optional[str] = None
    message_id: Optional[str] = None


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
    result = rag_chain.invoke({
        "question": req.message,
        "conversation_id": req.conversation_id,
        "message_id": req.message_id
    })
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
    """Endpoint para contar documentos únicos y chunks totales"""
    try:
        collection = vector_store._collection
        
        # Obtener total de chunks
        total_chunks = collection.count()
        
        # Obtener documentos únicos
        results = collection.get(include=["metadatas"])
        unique_docs = set()
        
        if results and results.get("metadatas"):
            for metadata in results["metadatas"]:
                source = metadata.get("source", "unknown")
                filename = source.split("\\")[-1].split("/")[-1]
                unique_docs.add(filename)
        
        doc_count = len(unique_docs)
        
        logger.info(f"[COUNT] Documentos únicos: {doc_count}, Chunks totales: {total_chunks}")
        return {"documents": doc_count, "chunks": total_chunks, "status": "ok"}
    except Exception as e:
        logger.error(f"[COUNT] Error contando documentos: {e}", exc_info=True)
        return {"documents": 0, "chunks": 0, "status": "error", "error": str(e)}


@app.get("/documents")
def get_documents():
    """Listar todos los documentos únicos con su metadata"""
    try:
        collection = vector_store._collection
        
        # Obtener todos los documentos
        results = collection.get(include=["metadatas"])
        
        if not results or not results.get("metadatas"):
            logger.info("[DOCUMENTS] No hay documentos en la BD")
            return {"documents": [], "status": "ok"}
        
        # Agrupar por source (archivo) para obtener documentos únicos
        docs_dict = {}
        for i, metadata in enumerate(results["metadatas"]):
            source = metadata.get("source", "unknown")
            filename = source.split("\\")[-1].split("/")[-1]
            
            # Si no existe el documento, agregarlo
            if filename not in docs_dict:
                # Obtener extensión y tamaño estimado
                extension = filename.split(".")[-1].upper() if "." in filename else "UNKNOWN"
                
                docs_dict[filename] = {
                    "id": filename,  # Usar filename como ID único
                    "name": filename,
                    "format": extension,
                    "size": 0,  # ChromaDB no guarda el tamaño del archivo
                    "uploadedAt": metadata.get("created_at", ""),
                    "status": "Indexed",
                    "chunks": 0
                }
            
            # Incrementar contador de chunks
            docs_dict[filename]["chunks"] += 1
        
        documents = list(docs_dict.values())
        logger.info(f"[DOCUMENTS] Encontrados {len(documents)} documentos únicos")
        
        return {"documents": documents, "status": "ok"}
    except Exception as e:
        logger.error(f"[DOCUMENTS] Error obteniendo documentos: {e}", exc_info=True)
        return {"documents": [], "status": "error", "error": str(e)}


@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    """Eliminar un documento y todos sus chunks del vector store"""
    try:
        logger.info(f"[DELETE] Eliminando documento: {document_id}")
        collection = vector_store._collection
        
        # Obtener todos los IDs de chunks que pertenecen a este documento
        results = collection.get(include=["metadatas"])
        
        if not results or not results.get("metadatas"):
            logger.warning(f"[DELETE] No hay documentos en la BD")
            return {"status": "error", "message": "No documents found"}
        
        # Encontrar IDs de chunks que pertenecen a este documento
        chunk_ids_to_delete = []
        for i, metadata in enumerate(results["metadatas"]):
            source = metadata.get("source", "")
            filename = source.split("\\")[-1].split("/")[-1]
            
            if filename == document_id:
                chunk_ids_to_delete.append(results["ids"][i])
        
        if not chunk_ids_to_delete:
            logger.warning(f"[DELETE] Documento no encontrado: {document_id}")
            return {"status": "error", "message": f"Document {document_id} not found"}
        
        # Eliminar chunks
        logger.info(f"[DELETE] Eliminando {len(chunk_ids_to_delete)} chunks")
        collection.delete(ids=chunk_ids_to_delete)
        
        # Persistir cambios
        vector_store.persist()
        logger.info(f"[DELETE] ✅ Documento {document_id} eliminado exitosamente")
        
        return {"status": "success", "message": f"Document {document_id} deleted", "chunks_deleted": len(chunk_ids_to_delete)}
    except Exception as e:
        logger.error(f"[DELETE] Error eliminando documento: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


@app.get("/documents/{document_id}/chunks")
def get_document_chunks(document_id: str):
    """Obtener todos los chunks de un documento específico"""
    try:
        logger.info(f"[CHUNKS] Obteniendo chunks para documento: {document_id}")
        collection = vector_store._collection
        
        # Obtener todos los documentos con contenido y metadata
        results = collection.get(include=["metadatas", "documents"])
        
        if not results or not results.get("metadatas"):
            logger.warning(f"[CHUNKS] No hay documentos en la BD")
            return {"chunks": [], "status": "ok"}
        
        # Filtrar chunks que pertenecen a este documento
        chunks = []
        for i, metadata in enumerate(results["metadatas"]):
            source = metadata.get("source", "")
            filename = source.split("\\")[-1].split("/")[-1]
            
            if filename == document_id:
                chunks.append({
                    "id": results["ids"][i],
                    "content": results["documents"][i],
                    "metadata": {
                        "source": filename,
                        "page": metadata.get("page", None),
                    }
                })
        
        logger.info(f"[CHUNKS] Encontrados {len(chunks)} chunks para {document_id}")
        return {"chunks": chunks, "total": len(chunks), "status": "ok"}
    except Exception as e:
        logger.error(f"[CHUNKS] Error obteniendo chunks: {e}", exc_info=True)
        return {"chunks": [], "status": "error", "error": str(e)}
