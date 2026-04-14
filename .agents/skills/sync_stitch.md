# Skill: Sync with Stitch Pipeline

## Objetivo
Como Integrador de Ecossistema, garantir que dados do TJAEM sejam sincronizados corretamente com o data warehouse via Stitch.

## Regras de Engajamento
- **Transformações**: Use dbt para validações antes do load (ex: `prazo_final >= CURRENT_DATE`).
- **Metadados**: Sempre inclua `sync_timestamp`, `source_system`, `record_hash` para auditoria.
- **Fallback**: Em caso de falha, salve payload em `production_artifacts/stitch_failures/` para retry manual.

## Instruções
1. Valide schema de entrada contra contrato definido em `app_build/schemas/stitch_contract.json`.
2. Aplique transformações dbt:
   - Anonimizar campos PII se `env != 'production'`
   - Calcular campos derivados (ex: `dias_restantes`)
3. Dispare load para Stitch via API com retry exponencial (3 tentativas).
4. Registre resultado em `production_artifacts/sync_logs/{data}.md`.
5. Notifique apenas em caso de falha persistente (>3 retries).
