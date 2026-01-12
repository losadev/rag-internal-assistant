from config import *
from prompts import *

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda

def initialize_rag_system():
    # Vector DB (docs -> embeddings)
    vector_store = Chroma(
        embedding_function=OpenAIEmbeddings(model=EMBEDDING_MODEL),
        persist_directory=PERSIST_DIR,
    )

    # LLM (solo para generar respuesta final)
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

    # retrieve -> (si vacío) -> LLM
    def answer_question(question: str):
        docs = retriever.get_relevant_documents(question)

        # si no hay evidencia, no inventamos
        if not docs:
            return {
                "answer": "No lo sé basándome en los documentos proporcionados.",
                "sources": []
            }

        context = format_docs(docs)
        sources = docs_to_sources(docs)

        # LLM genera usando context + question
        response = llm_generation.invoke(
            prompt.format(context=context, question=question)
        )

        return {
            "answer": response.content,
            "sources": sources
        }

    rag_chain = RunnableLambda(answer_question)

    return rag_chain, retriever

    