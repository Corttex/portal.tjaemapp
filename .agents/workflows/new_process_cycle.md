---
description: Orquestrar ciclo completo de novo processo: espec → código → deploy → notificação
---

Quando o usuário digitar `/new_process <tipo> <id_processo> <associado_email>`, orquestre:

### Sequência de Execução:
1. **@pm_juridico** + `generate_legal_doc.md`:
   - Gerar minuta de convite para audiência baseada no `tipo`.
   - Salvar em `production_artifacts/documentos/convites/{id_processo}.md`.
   - PAUSAR para aprovação humana do template.

2. **@engineer_tjaem** + `sync_stitch.md`:
   - Inserir registro na tabela `processos` via payload Stitch.
   - Confirmar sincronização com BigQuery.

3. **@integrator** + `trigger_n8n.md`:
   - Disparar workflow `new_process_automation` no n8n com:
     ```json
     {
       "id_processo": "{{id_processo}}",
       "tipo": "{{tipo}}",
       "associado_email": "{{associado_email}}",
       "template_path": "production_artifacts/documentos/convites/{{id_processo}.md"
     }
     ```

4. **@qa_legal**:
   - Validar que todos os campos PII estão anonimizados em logs.
   - Confirmar que webhook n8n usou autenticação correta.

5. **@devops_cloud**:
   - Verificar se pasta foi criada no S3 (`tjaem-central-arquivos-prod/processos/{{id_processo}}/`).
   - Confirmar que policy de bucket está com "Block Public Access".

6. **Notificação Final**:
   - Enviar resumo ao usuário com:
     ✅ Minuta gerada: [link]
     ✅ Processo sincronizado: Stitch ID {id}
     ✅ Workflow disparado: n8n Execution {id}
     🎓 Curso recomendado: [link EAD]
