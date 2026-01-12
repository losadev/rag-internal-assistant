# Configuracion de los modelos
EMBEDDING_MODEL = "text-embedding-3-large"
QUERY_MODEL = "gpt-4o-mini" # hace multiples queries, por lo tanto es mas economico
GENERATION_MODEL = "gpt-4o" # genera la respuesta final, por lo tanto es mas caro

# Configuracion de la base de datos vectorial
import os
PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

# Configuracion del retriever
SEARCH_TYPE = "mmr"
MMR_DIVERSITY_LAMBDA = 0.7
MMR_FETCH_K = 20 # evalua 20 documentos para luego seleccionar los mejores K
SEARCH_K = 2  # devuelve los 2 mejores documentos

# Webhook de n8n para preguntas sin respuesta
N8N_WEBHOOK_URL = "https://n8n-n8n.zbifex.easypanel.host/webhook/68e0a262-f84d-4840-8ed3-bd9e34bee3ef"