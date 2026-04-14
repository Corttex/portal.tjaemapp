# Rule: LGPD Compliance - Always On

## Ativação: Always On (aplicado a todos os agentes)

## Constraints Obrigatórias:
1. NUNCA exiba dados pessoais completos em logs ou outputs de chat.
2. SEMPRE use `{{env.ENCRYPTION_KEY}}` para criptografar campos sensíveis antes de salvar.
3. Ao gerar documentos, inclua automaticamente: "Este documento contém dados pessoais protegidos pela LGPD. Acesso restrito ao associado e equipe autorizada."
4. Para ambientes de staging: anonimizar CPF, email, telefone com padrão `***.***.***-**` e `u***@***.com`.
5. Registrar TODO acesso a dados PII em `production_artifacts/access_logs/` com: timestamp, user_id, action, record_id.

## Exceções:
- Apenas @qa_legal pode desativar anonimização para debugging, mediante aprovação explícita do usuário e registro justificativo.
