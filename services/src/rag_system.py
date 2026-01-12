from .config import EMBEDDING_MODEL, GENERATION_MODEL, PERSIST_DIR, SEARCH_K
from .prompts import RAG_PROMPT

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def initialize_rag_system():
    logger.info(f"Inicializando RAG system con PERSIST_DIR: {PERSIST_DIR}")
    
    # Verificar si la carpeta existe
    if os.path.exists(PERSIST_DIR):
        logger.info(f"✓ Directorio {PERSIST_DIR} existe")
    else:
        logger.warning(f"⚠️ Directorio {PERSIST_DIR} no existe, se creará al guardar documentos")
    
    try:
        # Vector DB (docs -> embeddings)
        vector_store = Chroma(
            embedding_function=OpenAIEmbeddings(model=EMBEDDING_MODEL),
            persist_directory=PERSIST_DIR,
        )
        
        # Contar documentos existentes
        try:
            collection = vector_store._collection
            doc_count = collection.count()
            logger.info(f"✓ Vector store cargado. Documentos en BD: {doc_count}")
            if doc_count == 0:
                logger.warning(f"⚠️ Vector store está vacío. Necesitas subir documentos primero")
        except Exception as e:
            logger.warning(f"No se pudo contar documentos: {e}")
    except Exception as e:
        logger.error(f"❌ Error al inicializar Chroma: {e}")
        logger.info(f"🔄 Intentando limpiar y recrear base de datos...")
        import shutil
        if os.path.exists(PERSIST_DIR):
            shutil.rmtree(PERSIST_DIR)
            logger.info(f"✓ Base de datos limpiada")
        
        # Recrear
        vector_store = Chroma(
            embedding_function=OpenAIEmbeddings(model=EMBEDDING_MODEL),
            persist_directory=PERSIST_DIR,
        )
        logger.info(f"✓ Base de datos recreada")

    # LLM (solo para generar respuesta final)
    llm_generation = ChatOpenAI(model=GENERATION_MODEL, temperature=0)
    logger.info(f"✓ LLM cargado: {GENERATION_MODEL}")

    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": SEARCH_K},
    )

    prompt = PromptTemplate.from_template(RAG_PROMPT)

    # Formatea documentos para pasarlos al prompt
    def format_docs(docs):
        parts = []
        for i, doc in enumerate(docs):
            source = (doc.metadata or {}).get("source", "unknown")
            source = source.split("\\")[-1].split("/")[-1]  # limpia path
            page = (doc.metadata or {}).get("page", None)

            header = f"FRAGMENTO {i+1} (Fuente: {source}"
            if page is not None:
                header += f", Página: {page}"
            header += ")\n"

            parts.append(header + doc.page_content.strip())

        return "\n\n---\n\n".join(parts)

    # Convierte los docs recuperados en sources[] para la UI
    def docs_to_sources(docs):
        sources = []
        for doc in docs[:3]:  # max 3 fuentes
            md = doc.metadata or {}
            source = md.get("source", "unknown")
            source = source.split("\\")[-1].split("/")[-1]
            page = md.get("page", None)

            sources.append({
                "document": source,
                "snippet": doc.page_content.strip()[:300],
                "page": page if isinstance(page, int) else None
            })
        return sources

    # retrieve -> (si vacío) -> LLM
    def answer_question(question: str):
        logger.info(f"[QUERY] Pregunta: {question}")
        docs = retriever.invoke(question)
        logger.info(f"[RETRIEVER] Documentos encontrados: {len(docs)}")

        # si no hay evidencia, no inventamos
        if not docs:
            logger.warning("⚠️ No se encontraron documentos relevantes")
            return {
                "answer": "No lo sé basándome en los documentos proporcionados.",
                "sources": []
            }

        logger.info(f"✓ Usando {len(docs)} documento(s) como contexto")
        for i, doc in enumerate(docs):
            logger.debug(f"  Doc {i+1}: {doc.metadata} - {doc.page_content[:100]}...")

        context = format_docs(docs)
        sources = docs_to_sources(docs)
        logger.info(f"✓ Generando respuesta con LLM...")

        try:
            # LLM genera usando context + question
            response = llm_generation.invoke(
                prompt.format(context=context, question=question)
            )

            logger.info(f"✓ Respuesta generada")
            return {
                "answer": response.content,
                "sources": sources
            }
        except Exception as e:
            logger.error(f"❌ Error generando respuesta: {e}", exc_info=True)
            return {
                "answer": "Error al generar respuesta. Por favor, intenta de nuevo.",
                "sources": sources
            }

    rag_chain = RunnableLambda(answer_question)

    return rag_chain, vector_store


def add_documents_to_rag(file_path: str, vector_store):
    """Carga un documento (PDF, TXT, Markdown) al vector store del RAG"""
    try:
        logger.info(f"[UPLOAD] Iniciando carga de archivo: {file_path}")
        docs = []
        
        # Detectar tipo de archivo y cargar
        if file_path.lower().endswith('.pdf'):
            logger.info(f"[UPLOAD] Tipo: PDF")
            loader = PyPDFLoader(file_path)
            docs = loader.load()
        elif file_path.lower().endswith(('.txt', '.md')):
            logger.info(f"[UPLOAD] Tipo: TXT/MD")
            loader = TextLoader(file_path)
            docs = loader.load()
        else:
            raise ValueError("Solo se soportan PDF, TXT y Markdown")
        
        logger.info(f"[UPLOAD] ✓ Documentos cargados: {len(docs)}")
        
        if not docs:
            raise ValueError("No se pudieron cargar documentos del archivo")
        
        # Dividir documentos en chunks
        logger.info(f"[UPLOAD] Dividiendo en chunks...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.split_documents(docs)
        logger.info(f"[UPLOAD] ✓ Chunks creados: {len(chunks)}")
        
        # Agregar al vector store
        logger.info(f"[UPLOAD] Agregando chunks al vector store...")
        vector_store.add_documents(chunks)
        logger.info(f"[UPLOAD] ✓ Chunks agregados")
        
        # Persistir cambios en disco
        logger.info(f"[UPLOAD] Persistiendo cambios en disco...")
        vector_store.persist()
        logger.info(f"[UPLOAD] ✓ Cambios persistidos en {PERSIST_DIR}")
        
        # Limpiar archivo temporal
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"[UPLOAD] ✓ Archivo temporal eliminado")
        
        logger.info(f"[UPLOAD] ✅ Proceso completado exitosamente")
        return True
    except Exception as e:
        logger.error(f"[UPLOAD] ❌ Error: {str(e)}", exc_info=True)
        raise Exception(f"Error cargando documento: {str(e)}")
