# RAG Internal Assistant - Deployment Guide

## Deployment Architecture

- **Frontend**: Next.js 16 - Deployed on **Vercel** ✅
- **MCP Server**: Express.js - Deploy on **Render**
- **Python Backend**: FastAPI - Deploy on **Render**

## Deploying to Render

### Prerequisites

1. Push your code to GitHub (already done)
2. Create a [Render account](https://render.com)
3. Connect your GitHub repository to Render

### Step 1: Deploy MCP Server

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select your GitHub repository
4. Configure:
   - **Name**: `rag-mcp-server`
   - **Runtime**: Node
   - **Build Command**: `cd apps/mcp-server && pnpm install && pnpm build`
   - **Start Command**: `cd apps/mcp-server && pnpm start`
   - **Plan**: Standard
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `MCP_API_KEY`: Your API key (from `.env`)
   - `N8N_WEBHOOK_URL`: Your n8n webhook URL
6. Click **Create Web Service**

**MCP Server URL**: `https://rag-mcp-server.onrender.com`

### Step 2: Deploy Python Backend

1. Click **New +** → **Web Service**
2. Select your GitHub repository
3. Configure:
   - **Name**: `rag-python-backend`
   - **Runtime**: Python 3
   - **Build Command**: `cd services && pip install -r requirements.txt`
   - **Start Command**: `cd services && uvicorn src.main:app --host 0.0.0.0 --port 8000`
   - **Plan**: Standard
4. Add environment variables:
   - `ENVIRONMENT`: `production`
   - `PYTHONUNBUFFERED`: `1`
   - `GROQ_API_KEY`: Your Groq API key
   - `CHROMA_DB_PATH`: `/tmp/chroma_db`
5. Click **Create Web Service**

**Python Backend URL**: `https://rag-python-backend.onrender.com`

### Step 3: Update Frontend Environment Variables

1. Go to your **Vercel project settings**
2. Update environment variables:
   - `NEXT_PUBLIC_MCP_SERVER_URL`: `https://rag-mcp-server.onrender.com`
   - `NEXT_PUBLIC_API_URL`: `https://rag-python-backend.onrender.com`
3. Redeploy frontend

## Environment Variables Summary

### `.env` files needed in Render:

**MCP Server** (`apps/mcp-server/.env`):

```env
NODE_ENV=production
PORT=4000
MCP_API_KEY=your_secure_api_key
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/id
```

**Python Backend** (`services/.env`):

```env
ENVIRONMENT=production
PYTHONUNBUFFERED=1
GROQ_API_KEY=your_groq_key
CHROMA_DB_PATH=/tmp/chroma_db
```

## Verifying Deployment

1. **MCP Server Health**: `https://rag-mcp-server.onrender.com/health`
2. **Python Backend**: `https://rag-python-backend.onrender.com/docs` (Swagger UI)
3. **Frontend**: Access your Vercel URL

## Troubleshooting

### MCP Server won't start

- Check `MCP_API_KEY` is set
- Verify `N8N_WEBHOOK_URL` is correct
- Check logs in Render dashboard

### Python Backend won't start

- Ensure `requirements.txt` is up to date
- Check `GROQ_API_KEY` is valid
- Verify Chroma database path permissions

### Frontend can't connect

- Check CORS settings in both backends
- Verify URLs in Vercel environment variables
- Check browser console for errors

## Local Development

```bash
# Install dependencies (from root)
pnpm install

# Terminal 1: Frontend
pnpm run web:dev

# Terminal 2: MCP Server
cd apps/mcp-server && pnpm dev

# Terminal 3: Python Backend
cd services
source .venv/bin/activate  # or .\.venv\Scripts\Activate on Windows
uvicorn src.main:app --reload
```
