# ✅ Checklist de Segurança e Conformidade TJAEM

Este checklist garante que a infraestrutura e a operação do TJAEM atendam aos padrões de justiça arbitral e proteção de dados.

## 🛡️ Infraestrutura AWS (Core Security)
- [ ] **IAM:** Habilitar MFA em todos os usuários administrativos e rotacionar chaves de acesso anualmente.
- [ ] **S3:** Garantir "Block Public Access" ativado e criptografia via KMS em buckets de documentos.
- [ ] **RDS:** Habilitar criptografia em repouso e backups automatizados com retenção de 30 dias.
- [ ] **VPC:** Implementar VPC Flow Logs e isolar o banco de dados em subnets privadas.
- [ ] **Secrets:** Usar AWS Secrets Manager para gerenciar credenciais de DB e APIs n8n/Stitch.

## 💻 Segurança da Aplicação & n8n
- [ ] **Workflows:** Proteger todos os webhooks n8n com Bearer Tokens ou IP Whitelisting.
- [ ] **Input:** Validar schemas de JSON em todos os webhooks para prevenir injection.
- [ ] **SSL/TLS:** Mínimo TLS 1.2 obrigatório em todas as comunicações.
- [ ] **Logs:** Integrar logs do n8n com o AWS CloudWatch para detecção de anomalias em tempo real.

## ⚖️ Conformidade CAMEB & LGPD
- [ ] **Anonimização:** Dados de processos arquivados devem ser anonimizados no BigQuery após o prazo legal.
- [ ] **Auditoria:** Gravar log de quem acessou a view `tjaem_critical_deadlines`.
- [ ] **Direito do Titular:** Implementar workflow de exportação de dados para solicitações de associados.
- [ ] **Ata de Segurança:** Gerar relatório mensal de conformidade para o Conselho CAMEB.

## 📊 Monitoramento Crítico
- [ ] Alertas ativos para:
      • Tentativas de login falhas (> 10 em 5 min).
      • Erros 5xx em workflows n8n de prazos.
      • Consumo de storage S3 acima do previsto.
- [ ] Revisão trimestral de permissões Stitch (mínimo privilégio no BigQuery).

---

> [!WARNING]
> O não cumprimento deste checklist pode resultar em suspensão da certificação CAMEB e riscos jurídicos sob a LGPD.
