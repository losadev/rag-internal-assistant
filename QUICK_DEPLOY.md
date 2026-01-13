# 🚀 Deployment en Render - Guía Rápida

## Paso 1: Prepara tu repositorio

```bash
# El código ya está en GitHub (losadev/rag-internal-assistant)
# Asegúrate de que todo esté committed
git status
```

## Paso 2: Crea cuenta en Render

1. Ve a https://render.com
2. Sign up (con GitHub es más fácil)
3. Autoriza Render para acceder a tu GitHub

## Paso 3: Deploy MCP Server

### 3a. Nueva Web Service

1. Dashboard → Click **New +** → **Web Service**
2. Selecciona `losadev/rag-internal-assistant`
3. Completa estos campos:

| Campo              | Valor                        |
| ------------------ | ---------------------------- |
| **Name**           | `rag-mcp-server`             |
| **Runtime**        | `Node`                       |
| **Root Directory** | `apps/mcp-server`            |
| **Build Command**  | `pnpm install && pnpm build` |
| **Start Command**  | `pnpm start`                 |
| **Instance Type**  | `Standard`                   |
| **Region**         | `Ohio` (o tu región)         |

### 3b. Environment Variables

Click **Add from .env** o agrega manualmente:

- `NODE_ENV` = `production`
- `MCP_API_KEY` = Tu API key segura (crea una)
- `N8N_WEBHOOK_URL` = Tu URL de n8n webhook

**Resultado esperado:**

- Clic en **Create Web Service**
- Espera a que compile (5-10 minutos)
- Verde ✅ = Éxito
- Anota la URL: `https://rag-mcp-server.onrender.com`

## Paso 4: Deploy Python Backend

### 4a. Nueva Web Service

1. Dashboard → Click **New +** → **Web Service**
2. Selecciona `losadev/rag-internal-assistant`
3. Completa estos campos:

| Campo              | Valor                                             |
| ------------------ | ------------------------------------------------- |
| **Name**           | `rag-python-backend`                              |
| **Runtime**        | `Python 3`                                        |
| **Root Directory** | `services`                                        |
| **Build Command**  | `pip install -r requirements.txt`                 |
| **Start Command**  | `uvicorn src.main:app --host 0.0.0.0 --port 8000` |
| **Instance Type**  | `Standard`                                        |
| **Region**         | `Ohio` (igual que MCP)                            |

### 4b. Environment Variables

- `ENVIRONMENT` = `production`
- `PYTHONUNBUFFERED` = `1`
- `GROQ_API_KEY` = Tu Groq API key
- `CHROMA_DB_PATH` = `/tmp/chroma_db`

**Resultado esperado:**

- Clic en **Create Web Service**
- Espera a que compile
- Verde ✅ = Éxito
- Anota la URL: `https://rag-python-backend.onrender.com`

## Paso 5: Actualiza Frontend en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com
2. Selecciona `rag-internal-assistant`
3. **Settings** → **Environment Variables**
4. Edita o crea:
   - `NEXT_PUBLIC_MCP_SERVER_URL` = `https://rag-mcp-server.onrender.com`
   - `NEXT_PUBLIC_API_URL` = `https://rag-python-backend.onrender.com`
5. **Save** y espera a que redeploy automático termine

## ✅ Verificación

Abre estas URLs en tu navegador o con curl:

```bash
# MCP Server health check
curl https://rag-mcp-server.onrender.com/health
# Esperado: {"ok":true}

# Python Backend API docs
curl https://rag-python-backend.onrender.com/docs
# Esperado: HTML con Swagger UI

# Frontend
https://your-vercel-url.app
# Prueba crear un chat
```

## 🎯 URLs Finales

```
Frontend:  https://your-app.vercel.app
MCP:       https://rag-mcp-server.onrender.com
Backend:   https://rag-python-backend.onrender.com
```

## ❌ Troubleshooting

### "MCP server returns 500"

- Verifica `MCP_API_KEY` es correcto
- Verifica `N8N_WEBHOOK_URL` es valida
- Mira logs en Render Dashboard

### "Python backend won't start"

- Verifica `GROQ_API_KEY` es correcto
- Chequea que `requirements.txt` tenga todas las dependencias
- Revisa logs de construcción

### "Frontend shows blank / can't connect"

- Verifica URLs en `.env` de Vercel
- Comprueba que Render services están corriendo (verde)
- Abre DevTools (F12) y mira Network tab
- Verifica CORS está habilitado en backends

## 💡 Tips Pro

- Render free tier duerme después de 15 min → usa "Standard" para 24/7
- Primera construcción tarda 5-10 minutos
- Auto-redeploy cuando hay push a GitHub
- Los secretos (API keys) están seguros en Render
