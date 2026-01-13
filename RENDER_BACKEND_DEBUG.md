# Guía de Despliegue - Render Backend Python

## Status Actual

El backend Python está configurado pero el puerto no se está detectando en Render.

## Lo que hemos hecho:

1. ✅ Implementamos lazy initialization del sistema RAG
2. ✅ El endpoint `/health` está disponible inmediatamente
3. ✅ Todos los loggers fueron removidos para producción
4. ✅ Lazy imports para no fallar en startup

## Checklist para Render Dashboard:

### 1. Verificar Enviroment Variables

En el dashboard de Render para el servicio `rag-python-backend`:

- [ ] `OPENAI_API_KEY` - DEBE estar configurada con tu API key de OpenAI
- [ ] `PYTHONUNBUFFERED=1` - Para output en tiempo real
- [ ] `ENVIRONMENT=production`

**IMPORTANTE**: El servicio NO va a funcionar sin `OPENAI_API_KEY`. Si no lo tienes:

1. Obtén una API key en https://platform.openai.com/
2. Cópiala a tu clipboard
3. En Render dashboard, añade la variable

### 2. Deploy Cleanup

Si el servicio `rag-python-backend` está en estado "failure" o "crashed":

1. En el dashboard de Render:

   - Navega a "rag-python-backend"
   - Click en "Settings" (engranaje)
   - Scroll down y click "Clear Build Cache"
   - Click "Save Settings"

2. Luego, en la página principal del servicio:
   - Click en "Deploy" → "Latest Deploy"
   - Click en los 3 puntos (•••) → "Redeploy"

### 3. Monitoreo de Logs

Una vez desplegado, verifica los logs:

Expected logs si funciona:

```
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Expected response en /health:

```json
{
  "status": "ok",
  "rag_available": false
}
```

`rag_available: false` es normal - inicializa en la primera solicitud a `/chat`.

## Si aún no funciona:

1. **"No open ports detected"** persiste:

   - El servidor no está arrancando
   - Verifica que `OPENAI_API_KEY` esté configurada
   - Check los logs en Render para mensajes de error

2. **Puerto vinculado pero API responde lentamente**:

   - Primera solicitud a `/chat` inicializa RAG (puede tomar 10-30 seg)
   - Las siguientes solicitudes son rápidas

3. **Error "Cannot find module"**:
   - requirements.txt podría estar incompleto
   - Verify: `langchain-openai`, `chromadb`, `fastapi`, `uvicorn` están presentes

## Quick Test Local

Para probar localmente antes de Render:

```bash
cd services
pip install -r requirements.txt
OPENAI_API_KEY=your_key_here python run.py
```

Luego en otro terminal:

```bash
curl http://localhost:8000/health
```

## Endpoints Disponibles

- `GET /health` - Health check (inmediato)
- `POST /chat` - Enviar pregunta (inicializa RAG si es la primera)
- `POST /upload` - Subir documento
- `GET /documents` - Listar documentos
- `DELETE /documents/{id}` - Eliminar documento
