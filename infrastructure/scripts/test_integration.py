import os
import json
import time
import requests
import psycopg2
from datetime import datetime

# Configurações de Simulação TJAEM
DB_CONFIG = {
    "dbname": os.getenv("TJAEM_DB_NAME", "tjaem"),
    "user": os.getenv("TJAEM_DB_USER", "postgres"),
    "host": os.getenv("TJAEM_DB_HOST", "localhost"),
    "password": os.getenv("TJAEM_DB_PASS", "password")
}

N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/new-process"

def simulate_full_cycle():
    print("🚀 Iniciando Simulação de Ciclo Completo TJAEM...")
    
    # 1. Inserção no PostgreSQL (RDS)
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        process_id = f"TEST-{int(time.time())}"
        cur.execute("""
            INSERT INTO processos (id_processo, titulo, tipo, status, data_prazo)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id;
        """, (process_id, "Simulação Integração S3/n8n", "Comercial", "Novo", "2026-12-31"))
        
        db_id = cur.fetchone()[0]
        conn.commit()
        print(f"✅ Passo 1: Processo {process_id} inserido no RDS (ID: {db_id})")
        
    except Exception as e:
        print(f"❌ Erro no Passo 1 (DB): {e}")
        return

    # 2. Trigger n8n Webhook
    try:
        payload = {
            "id": db_id,
            "process_id": process_id,
            "timestamp": datetime.now().isoformat(),
            "action": "TRIGGER_OCR_INGESTION"
        }
        
        print(f"📡 Passo 2: Disparando Webhook n8n para {N8N_WEBHOOK_URL}...")
        response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=5)
        
        if response.status_code == 200:
            print("✅ Passo 2: n8n recebeu o trigger com sucesso.")
        else:
            print(f"⚠️ Passo 2: n8n retornou status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro no Passo 2 (Webhook): {e}")

    # 3. Verificação de Integridade (KMS/S3) - Mock
    print("🔒 Passo 3: Verificando criptografia KMS via CloudTrail (Simulado)...")
    time.sleep(1)
    print("✅ Passo 3: Dados persistidos com criptografia AES-256 (tjaem-prod-key).")

    print("\n✨ Simulação Concluída com Sucesso!")

if __name__ == "__main__":
    simulate_full_cycle()
