from .config import EMBEDDING_MODEL, GENERATION_MODEL, PERSIST_DIR, SEARCH_K, N8N_WEBHOOK_URL
from .prompts import RAG_PROMPT

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
import requests
from datetime import datetime
import uuid

def send_to_n8n_webhook(question: str, response: str, conversation_id: str = None, message_id: str = None):
    """Envía información a n8n cuando la IA no sabe responder"""
    try:
        payload = {
            "question": question,
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "conversation_id": conversation_id or str(uuid.uuid4()),
            "message_id": message_id or str(uuid.uuid4())
        }
        
        requests.post(N8N_WEBHOOK_URL, json=payload, timeout=10)
    except Exception:
        pass

def initialize_rag_system():
    if not os.path.exists(PERSIST_DIR):
        os.makedirs(PERSIST_DIR, exist_ok=True)
    
    try:
        vector_store = Chroma(
            embedding_function=OpenAIEmbeddings(model=EMBEDDING_MODEL),
            persist_directory=PERSIST_DIR,
        )
        
        try:
            collection = vector_store._collection
            collection.count()
        except Exception:
            pass
    except Exception:
        import shutil
        if os.path.exists(PERSIST_DIR):
            shutil.rmtree(PERSIST_DIR)
        
        vector_store = Chroma(
            embedding_function=OpenAIEmbeddings(model=EMBEDDING_MODEL),
            persist_directory=PERSIST_DIR,
        )

    llm_generation = ChatOpenAI(model=GENERATION_MODEL, temperature=0)

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

    def answer_question(question: str, conversation_id: str = None, message_id: str = None):
        docs = retriever.invoke(question)

        if not docs:
            no_info_response = "I don't know based on the provided documents."
            send_to_n8n_webhook(question, no_info_response, conversation_id, message_id)
            
            return {
                "answer": no_info_response,
                "sources": []
            }

        context = format_docs(docs)
        sources = docs_to_sources(docs)

        try:
            response = llm_generation.invoke(
                prompt.format(context=context, question=question)
            )

            answer_text = response.content
            
            no_info_keywords = [
                "no tengo información", "no lo sé", "no puedo responder", "no encuentro información",
                "no sé", "no dispongo", "no cuento con",
                "i don't know", "i do not know", "i don't have", "i cannot answer",
                "no information", "based on the provided documents"
            ]
            if any(keyword in answer_text.lower() for keyword in no_info_keywords):
                send_to_n8n_webhook(question, answer_text, conversation_id, message_id)
            
            return {
                "answer": answer_text,
                "sources": sources
            }
        except Exception:
            return {
                "answer": "Error al generar respuesta. Por favor, intenta de nuevo.",
                "sources": sources
            }

    # Wrapper para manejar el input que puede ser string o dict
    def rag_chain_wrapper(input_data):
        if isinstance(input_data, str):
            # Compatibilidad con llamadas simples (solo pregunta)
            return answer_question(input_data)
        elif isinstance(input_data, dict):
            # Llamadas con metadata adicional
            return answer_question(
                question=input_data.get("question"),
                conversation_id=input_data.get("conversation_id"),
                message_id=input_data.get("message_id")
            )
        else:
            raise ValueError("Input debe ser string o dict")

    rag_chain = RunnableLambda(rag_chain_wrapper)

    return rag_chain, vector_store


def add_documents_to_rag(file_path: str, vector_store):
    """Carga un documento (PDF, TXT, Markdown) al vector store del RAG"""
    try:
        docs = []
        
        if file_path.lower().endswith('.pdf'):
            loader = PyPDFLoader(file_path)
            docs = loader.load()
        elif file_path.lower().endswith(('.txt', '.md')):
            loader = TextLoader(file_path)
            docs = loader.load()
        else:
            raise ValueError("Solo se soportan PDF, TXT y Markdown")
        
        if not docs:
            raise ValueError("No se pudieron cargar documentos del archivo")
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.split_documents(docs)
        
        vector_store.add_documents(chunks)
        vector_store.persist()
        
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return True
    except Exception as e:
        raise Exception(f"Error cargando documento: {str(e)}")
