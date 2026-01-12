from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(chunk_size=100, model="gpt-4o-mini")

vector_store = Chroma(
    collection_name="internal-assistant-docs",
    embedding_function=embeddings,
    persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary
)