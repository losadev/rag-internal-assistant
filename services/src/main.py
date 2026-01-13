from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .rag_system import initialize_rag_system, add_documents_to_rag
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

# Lazy initialization
rag_chain = None
vector_store = None

def get_rag_system():
    global rag_chain, vector_store
    if rag_chain is None or vector_store is None:
        rag_chain, vector_store = initialize_rag_system()
    return rag_chain, vector_store

# Health check endpoint
@app.get("/health")
def health():
    return {"status": "ok"}

# Crear carpeta para archivos temporales
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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
    rag, _ = get_rag_system()
    result = rag.invoke({
        "question": req.message,
        "conversation_id": req.conversation_id,
        "message_id": req.message_id
    })
    return result


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Subir archivo PDF, TXT o Markdown al sistema RAG"""
    try:
        _, vs = get_rag_system()
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        add_documents_to_rag(file_path, vs)
        return {"status": "success", "message": f"Archivo {file.filename} cargado correctamente"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/documents/count")
def get_documents_count():
    """Endpoint para contar documentos únicos y chunks totales"""
    try:
        _, vs = get_rag_system()
        collection = vs._collection
        
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
        return {"documents": doc_count, "chunks": total_chunks, "status": "ok"}
    except Exception as e:
        return {"documents": 0, "chunks": 0, "status": "error", "error": str(e)}


@app.get("/documents")
def get_documents():
    """Listar todos los documentos únicos con su metadata"""
    try:
        _, vs = get_rag_system()
        collection = vs._collection
        
        # Obtener todos los documentos
        results = collection.get(include=["metadatas"])
        
        if not results or not results.get("metadatas"):
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
        return {"documents": documents, "status": "ok"}
    except Exception as e:
        return {"documents": [], "status": "error", "error": str(e)}


@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    """Eliminar un documento y todos sus chunks del vector store"""
    try:
        _, vs = get_rag_system()
        collection = vs._collection
        
        # Obtener todos los IDs de chunks que pertenecen a este documento
        results = collection.get(include=["metadatas"])
        
        if not results or not results.get("metadatas"):
            return {"status": "error", "message": "No documents found"}
        
        # Encontrar IDs de chunks que pertenecen a este documento
        chunk_ids_to_delete = []
        for i, metadata in enumerate(results["metadatas"]):
            source = metadata.get("source", "")
            filename = source.split("\\")[-1].split("/")[-1]
            
            if filename == document_id:
                chunk_ids_to_delete.append(results["ids"][i])
        
        if not chunk_ids_to_delete:
            return {"status": "error", "message": f"Document {document_id} not found"}
        
        # Eliminar chunks
        collection.delete(ids=chunk_ids_to_delete)
        
        # Persistir cambios
        vs.persist()
        
        return {"status": "success", "message": f"Document {document_id} deleted", "chunks_deleted": len(chunk_ids_to_delete)}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/documents/{document_id}/chunks")
def get_document_chunks(document_id: str):
    """Obtener todos los chunks de un documento específico"""
    try:
        _, vs = get_rag_system()
        collection = vs._collection
        
        # Obtener todos los documentos con contenido y metadata
        results = collection.get(include=["metadatas", "documents"])
        
        if not results or not results.get("metadatas"):
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
        
        return {"chunks": chunks, "total": len(chunks), "status": "ok"}
    except Exception as e:
        return {"chunks": [], "status": "error", "error": str(e)}
