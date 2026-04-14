# 🔌 Referência de API TJAEM

Esta documentação detalha os endpoints e estruturas de dados utilizados para integração com o ecossistema TJAEM via n8n e serviços externos.

---

## 📥 Webhook de Entrada de Processos

Acionado quando um novo processo é distribuído ou iniciado no portal.

**Endpoint:** `POST /webhooks/incoming-process`

**Autenticação:** Header `X-TJAEM-Token` (Obrigatório)

### Request Body (JSON)
```json
{
  "id_processo": "2026-045",
  "tipo": "Condominial",
  "associado_id": "ASSOC-123",
  "metadata": {
    "autor": "Condomínio Solaris",
    "reu": "João Silva",
    "valor_causa": 5000.00,
    "urgencia": "ALERTA"
  }
}
```

### Resposta de Sucesso (200 OK)
```json
{
  "status": "success",
  "message": "Processo registrado e workflows iniciados",
  "s3_path": "s3://tjaem-central/processos/2026-045/",
  "ead_suggestion": "Módulo 3: Mediação Predial"
}
```

---

## 📂 Integração AWS S3 (Central de Arquivos)

API para envio e gestão de documentos anexos aos processos.

**Endpoint:** `POST /api/v1/documents/upload`

**Parâmetros de Path:**
- `id_processo`: ID do processo jurídico.

**Body (Multipart Form Data):**
- `file`: O documento (PDF, JPG, PNG).
- `tipo_documento`: "peticao", "identidade", "comprovante_residencia".

---

## 🔍 Extração OCR (Inteligência Artificial)

Aciona o processamento de imagem para extração de dados estruturados.

**Endpoint:** `POST /api/v1/ocr/process`

### Request Body
```json
{
  "file_url": "s3://tjaem-central/temp/scan_001.jpg",
  "extract_fields": ["nome", "telefone", "email", "cpf"]
}
```

### Resposta (200 OK)
```json
{
  "extracted_data": {
    "nome": "Carlos Oliveira",
    "telefone": "(11) 98888-7777",
    "email": "carlos@cortex.com",
    "cpf": "123.456.789-00"
  },
  "confidence": 0.98
}
```

---

## 🛠️ Erros Comuns

| Código | Mensagem | Causa |
|--------|----------|-------|
| 401 | Unauthorized | Token ausente ou inválido. |
| 404 | Not Found | Processo ID não localizado no PostgreSQL. |
| 422 | Unprocessable Entity | Formato de arquivo não suportado (apenas PDF/Img). |
| 503 | Service Unavailable | n8n ou Stitch fora de operação. |

---

> [!TIP]
> Use o comando `/disparar_workflow` no dashboard para testar esses endpoints manualmente em ambiente de sandbox.
