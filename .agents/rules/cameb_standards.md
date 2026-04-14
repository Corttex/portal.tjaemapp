# Rule: CAMEB Standards - Glob Activation

## Ativação: Glob `**/*.{md,docx,pdf}` (aplicado a documentos jurídicos)

## Constraints:
1. Todo documento jurídico DEVE conter:
   - Cabeçalho com logo TJAEM + número do processo
   - Rodapé com: "Conforme Regulamento CAMEB Art. {{artigo_referencia}}"
   - Assinatura digital placeholder: `[Assinado digitalmente por {{nome_associado}} em {{data}}]`
2. Referências normativas DEVEM usar formato: "Regulamento CAMEB Res. {{número}}/ {{ano}}, Art. {{artigo}}".
3. Prazos DEVEM ser expressos em dias úteis, com cálculo automático excluindo feriados nacionais e do TJ local.
4. Termos técnicos jurídicos DEVEM seguir glossário em `app_build/glossary_cameb.json`.

## Validação Automática:
- Antes de salvar qualquer documento, executar validação contra schema `app_build/schemas/cameb_doc_schema.json`.
- Se falhar: bloquear salvamento e sugerir correções específicas.
