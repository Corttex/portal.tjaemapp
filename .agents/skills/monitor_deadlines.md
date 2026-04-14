# Skill: Monitor Critical Deadlines

## Objetivo
Como QA Jurídico-Técnico, monitorar a view `tjaem_critical_deadlines` no BigQuery via Stitch e alertar sobre prazos.

## Regras de Engajamento
- **Fonte**: View Stitch `tjaem_critical_deadlines` (sincronizada a cada 15min).
- **Gatilhos**: 
  - `nivel_urgencia = 'URGENTE'` → Alerta imediato (SMS + Email)
  - `nivel_urgencia = 'ALERTA'` → Notificação no dashboard + sugestão de curso EAD
- **Ação Recomendada**: Sempre sugira o próximo passo documental + curso EAD relacionado.

## Instruções
1. Consulte a view via query SQL parametrizada por `id_associado`.
2. Para cada registro com `dias_restantes <= 3`:
   a. Gere mensagem personalizada com base no `tipo` do processo.
   b. Inclua link direto para o curso EAD recomendado (`curso_recomendado_nome`).
   c. Sugira template de documento da Central de Arquivos.
3. Formate saída em tabela Markdown para fácil leitura no AppSheet.
4. Se houver >5 alertas, agrupe por `nivel_urgencia` e priorize.
