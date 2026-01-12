#from langchain_chroma import Chroma
#from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
# embeddings = OpenAIEmbeddings(chunk_size=100, model="gpt-4o-mini")

# vector_store = Chroma(
#     collection_name="internal-assistant-docs",
#     embedding_function=embeddings,
#     persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary
# )

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

pregunta = "¿En qué año llegó el ser humano a la Luna por primera vez?"

response = llm.invoke(pregunta)

print(response.content)