---
description: Gerar relatório trimestral de conformidade CAMEB com dados do Stitch + jurisprudência
---

Quando o usuário digitar `/compliance_report <trimestre> <ano>`, orquestre:

### Sequência:
1. **@integrator**: Consultar view `compliance_cameb` no BigQuery filtrando por período.
2. **@pm_juridico**: Estruturar relatório com:
   - Tabela de regras vs status
   - Gráfico de tendências (usar Chart.js via `app_build/`)
   - Seção de "Ações Corretivas" com priorização
3. **@engineer_tjaem**: 
   - Gerar PDF via Puppeteer/Playwright em `app_build/`
   - Incluir marca d'água "Confidencial - TJAEM"
4. **@qa_legal**: Validar que nenhum dado pessoal vazou no relatório.
5. **@devops_cloud**: 
   - Upload seguro para S3 com policy de acesso restrito
   - Gerar link assinado (pre-signed URL) com expiração de 7 dias
6. **Entrega**: 
   - Enviar link por email criptografado
   - Registrar acesso em CloudTrail para auditoria
