"""Script de prueba para verificar la conexión con el webhook de n8n"""
import requests
from datetime import datetime
import uuid

N8N_WEBHOOK_URL = "https://n8n-n8n.zbifex.easypanel.host/webhook/68e0a262-f84d-4840-8ed3-bd9e34bee3ef"

def test_webhook():
    payload = {
        "question": "Pregunta de prueba desde script",
        "response": "Respuesta de prueba - No tengo información",
        "timestamp": datetime.now().isoformat(),
        "conversation_id": str(uuid.uuid4()),
        "message_id": str(uuid.uuid4())
    }
    
    print(f"🚀 Enviando request a: {N8N_WEBHOOK_URL}")
    print(f"📦 Payload: {payload}")
    
    try:
        response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=10)
        
        print(f"\n📡 Status code: {response.status_code}")
        print(f"📄 Response headers: {dict(response.headers)}")
        print(f"📄 Response text: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Webhook funcionó correctamente!")
        else:
            print(f"\n⚠️ Webhook respondió con código {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("\n⏱️ Timeout al conectar con el webhook")
    except requests.exceptions.ConnectionError as e:
        print(f"\n🔌 Error de conexión: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    test_webhook()
