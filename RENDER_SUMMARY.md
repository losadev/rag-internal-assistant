# Render Deployment - Resumen Configuración

## 📊 Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           VERCEL (Frontend - Ya Desplegado)            │
│         https://your-app.vercel.app                    │
│                                                         │
└──────────────────┬──────────────────────────────────────┘
                   │
     ┌─────────────┴──────────────┐
     │                            │
     ▼                            ▼
┌─────────────────────┐   ┌──────────────────────┐
│  RENDER - MCP       │   │  RENDER - Python     │
│  rag-mcp-server     │   │  rag-python-backend  │
│  :4000              │   │  :8000               │
│ /mcp endpoint       │   │ /chat endpoint       │
└─────────────────────┘   └──────────────────────┘
```

## 🔧 Variables de Entorno Finales

### MCP Server (Render)

```env
NODE_ENV=production
PORT=4000
MCP_API_KEY=your_secure_key
N8N_WEBHOOK_URL=https://n8n-instance/webhook/id
```

### Python Backend (Render)

```env
ENVIRONMENT=production
PYTHONUNBUFFERED=1
GROQ_API_KEY=sk-xxx
CHROMA_DB_PATH=/tmp/chroma_db
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_MCP_SERVER_URL=https://rag-mcp-server.onrender.com
NEXT_PUBLIC_API_URL=https://rag-python-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 📋 Checklist de Deployment

- [ ] MCP Server creado en Render
  - [ ] Health check funciona: `/health` → `{ok: true}`
  - [ ] MCP endpoint responde: POST `/mcp`
- [ ] Python Backend creado en Render
  - [ ] API responde: `/docs` → Swagger UI
  - [ ] Chat endpoint funciona: POST `/chat`
- [ ] URLs actualizadas en Vercel
  - [ ] `NEXT_PUBLIC_MCP_SERVER_URL` → Render MCP URL
  - [ ] `NEXT_PUBLIC_API_URL` → Render Python URL
- [ ] Frontend redeployado en Vercel
  - [ ] Nueva build completada
  - [ ] URLs de backend funcionan

## 🔗 URLs Finales

| Componente         | URL                                            |
| ------------------ | ---------------------------------------------- |
| **Frontend**       | `https://your-app.vercel.app`                  |
| **MCP Server**     | `https://rag-mcp-server.onrender.com`          |
| **Python Backend** | `https://rag-python-backend.onrender.com`      |
| **MCP Health**     | `https://rag-mcp-server.onrender.com/health`   |
| **Python Docs**    | `https://rag-python-backend.onrender.com/docs` |

## 🧪 Testing

```bash
# Test MCP Server
curl https://rag-mcp-server.onrender.com/health

# Test Python Backend
curl https://rag-python-backend.onrender.com/docs

# Test desde Frontend
# 1. Abre la app en Vercel
# 2. Intenta crear un chat
# 3. Revisa la consola del navegador (F12) para errores
```

## ⚡ Pro Tips

- Render inicia con plan Free que duerme después de 15 min de inactividad
- Actualiza a "Standard" para aplicaciones 24/7
- Las primeras compilaciones pueden tardar 5-10 minutos
- Guarda los logs de despliegue para debugging

## 📞 Soporte

Si tienes problemas:

1. Revisa logs en Render Dashboard
2. Verifica variables de entorno
3. Confirma CORS está habilitado en Python
4. Comprueba que Vercel puede llegar a URLs de Render
