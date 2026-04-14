# 📘 Guia do Usuário: Portal TJAEM

Bem-vindo ao centro operacional do TJAEM. Este guia orienta sobre o uso das ferramentas de IA e comandos integrados para máxima produtividade jurídica.

---

## 🚀 Comandos Integrados (Slash Commands)

Você pode interagir diretamente com o ecossistema através do chat ou console de comandos:

### `/ver_prazos [id_associado]`
Lista todos os processos vinculados ao associado que possuem prazos críticos (via Stitch/BigQuery).
- **Exemplo:** `/ver_prazos ASSOC-123`
- **Retorno:** Tabela de prazos com níveis de urgência (🚨, 🔴, 🟡).

### `/gerar_minuta [tipo] [id_processo]`
Cria um rascunho jurídico baseado em templates inteligentes e jurisprudência CAMEB.
- **Tipos:** `contestacao`, `ata_conciliacao`, `sentenca_arbitral`.
- **Exemplo:** `/gerar_minuta contestacao #2026-089`

### `/sugerir_ead [tipo_processo]`
Recomenda cursos da plataforma Moodle baseados na especialidade do caso.
- **Exemplo:** `/sugerir_ead Condominial`

### `/disparar_workflow [nome] [params]`
Aciona workflows manuais no n8n para fins de teste ou processos específicos.
- **Exemplo:** `/disparar_workflow deadline_alert {"canal":"sms"}`

---

## 📁 Central de Documentos & OCR

Para extrair dados de documentos físicos:
1. Faça o upload da imagem/PDF no portal.
2. O sistema acionará o n8n para realizar o OCR.
3. Os dados extraídos (CPFs, Nomes, Valores) aparecerão como sugestões de preenchimento no formulário do processo.

---

## 🎓 Progresso EAD & CAMEB

O dashboard exibe seu progresso educacional. 
- **Conformidade:** Lembre-se que certos processos arbitrais exigem certificações específicas (módulos avançados do EAD).
- **Biblioteca:** Acesse a aba "Normas CAMEB" para consultar o regulamento atualizado.

---

## 📈 Dashboard de Business Intelligence

Os dados sincronizados via **Stitch** podem ser visualizados na aba "Relatórios":
- **Índice de Conciliação:** Porcentagem de acordos fechados.
- **Eficiência de Prazos:** Gráfico de cumprimento de metas processuais.

---

> [!TIP]
> Em caso de dúvidas técnicas ou falhas em workflows, utilize o comando `/auditar_seguranca` para verificar o status dos serviços core (n8n, RDS, S3).
