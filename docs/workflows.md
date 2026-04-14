# 🔄 Catálogo de Workflows n8n

Este documento cataloga as principais automações que operam como o "sistema nervoso" do TJAEM.

---

## 1. Monitoramento de Prazos (Deadline Alert)
Verifica a view `tjaem_critical_deadlines` no PostgreSQL e dispara alertas.

```mermaid
graph LR
    Start([Agendamento 08:00]) --> Query[Select da View de Prazos]
    Query --> Check{Há Prazos < 3 dias?}
    Check -- Sim --> Notif[Enviar WhatsApp/Email]
    Notif --> Log[Registrar Alerta no DB]
    Check -- Não --> End([Fim])
```

- **Frequência:** Diário (manhã).
- **Canais:** WhatsApp (via API externa) e Portal.

---

## 2. Ingestão de Novo Processo
Inicia o setup para todo novo caso arbitral.

```mermaid
graph TD
    Webhook[Receber Webhook] --> DB[Criar Registro no RDS]
    DB --> S3[Criar Bucket/Pasta S3]
    S3 --> EAD[Verificar recomendação EAD]
    EAD --> MSG[Enviar Welcome Kit p/ Associado]
```

- **Gatilho:** API do Portal ou Webhook externo.
- **Ação Crítica:** Vincula automaticamente o curso EAD baseado no campo `tipo_processo`.

---

## 3. Captura OCR e Sincronização (OCR Flow)
Processa imagens de documentos e transforma em dados estruturados.

```mermaid
graph TD
    Upload[Documento no S3] --> Trigger[S3 Event Notification]
    Trigger --> OCR[IA Vision: Extração]
    OCR --> Validation{Dados Válidos?}
    Validation -- Sim --> Excel[Gerar Planilha/CSV]
    Excel --> Stitch[Aguardar Ciclo Stitch]
    Validation -- Não --> Error[Notificar Erro p/ Painel]
```

---

## 4. Sincronização Stitch Data
Pipeline ELT para Business Intelligence.

- **Conector:** PostgreSQL → BigQuery.
- **Tabelas Sincronizadas:** `processos`, `usuarios`, `ead_progresso`, `cobrancas`.
- **Frequência:** A cada 30 minutos.

---

> [!IMPORTANT]
> Todos os logs de execução destes workflows são consolidados na tabela `system_logs` do RDS para auditoria CAMEB.
