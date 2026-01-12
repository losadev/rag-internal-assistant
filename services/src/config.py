# Configuracion de los modelos
EMBEDDING_MODEL = "text-embedding-3-large"
QUERY_MODEL = "gpt-4o-mini" # hace multiples queries, por lo tanto es mas economico
GENERATION_MODEL = "gpt-4o" # genera la respuesta final, por lo tanto es mas caro

# Configuracion de la base de datos vectorial
PERSIST_DIR = "C:\\Users\\Pablo\\Desktop\\Cursos Coding\\Curso Langchain y Langgraph\\Tema 3\\chroma_db"

# Configuracion del retriever
SEARCH_TYPE = "mmr"
MMR_DIVERSITY_LAMBDA = 0.7
MMR_FETCH_K = 20 # evalua 20 documentos para luego seleccionar los mejores K
SEARCH_K = 2  # devuelve los 2 mejores documentos