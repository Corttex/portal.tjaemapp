# Skill: Trigger n8n Workflow

## Objetivo
Como DevOps Cloud TJAEM, acionar workflows de automação no n8n via webhook seguro.

## Regras de Engajamento
- **Autenticação**: Use header `X-Webhook-Secret: {{env.N8N_WEBHOOK_SECRET}}`.
- **Payload**: Estruture JSON conforme contrato do workflow alvo.
- **Idempotência**: Inclua `idempotency_key: {processo_id}_{timestamp}` para evitar duplicação.
- **Monitoramento**: Após disparo, consulte status via API do n8n e registre em log.

## Instruções
1. Receba comando com: workflow_name, payload_params, priority.
2. Construa payload JSON validando contra schema em `app_build/schemas/n8n_payloads/{workflow_name}.json`.
3. Dispare POST para `{{env.N8N_HOST}}/webhook/{workflow_name}` com headers de segurança.
4. Aguarde resposta (timeout: 30s) e registre:
   - Sucesso: "Workflow {name} disparado. Execution ID: {id}"
   - Falha: Salve erro em `production_artifacts/n8n_errors/` e notifique @devops_cloud.
5. Se priority = 'high', dispare also notificação via Twilio (se configurado).
