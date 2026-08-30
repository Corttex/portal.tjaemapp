# Visão Geral: O que são e como se conectam TJAEM e CAMEB

**TJAEM (Tribunal de Justiça Arbitral e Mediação):** É o ambiente institucional e operacional onde ocorrem os procedimentos de mediação, conciliação e arbitragem (com base na Lei Federal nº 9.307/96 e na Lei de Mediação nº 13.140/15). Nele atuam os juízes arbitrais, mediadores, secretarias e associados.

**CAMEB (Câmara / Conselho de Arbitragem e Mediação do Brasil):** É a entidade regulatória e normativa que estabelece os regulamentos, resoluções (ex: Res. 05/2025), padrões éticos, termos de consentimento, cálculo de prazos e diretrizes de conformidade jurídica e LGPD.

**A Relação no Sistema:** O sistema do TJAEM atua como o braço executor do regulamento CAMEB, garantindo que toda petição, ata e sentença arbitral esteja em estrita conformidade com as regras estabelecidas nas Diretrizes Normativas CAMEB.

---

## O que já foi estruturado no Ecossistema
Conforme o PRD do Ecossistema TJAEM e a Arquitetura do Sistema:

**Frontend & Interface (The Sovereign Archive):**
*   Portais para Associados/Magistrados (portal.tjaembrasil.com.br), Painel Master e Hub de Automação.
*   Módulos de Dashboard, Gestão de Casos (Conciliação, Instrução, Sentença), Central de Documentos, Portal EAD (Moodle) e Relatórios de Conformidade CAMEB.
*   Ajustes de segurança aplicados no frontend.

**Camada de Orquestração (n8n):**
*   Workflows para ingestão de processos, alerta diário de prazos críticos (tjaem_critical_deadlines), captura OCR de documentos físicos para estruturação em planilha/banco e aprovação de magistrados arbitrais.

**Dados & Armazenamento:**
*   **AWS RDS PostgreSQL (15.10):** Modelagem com tabelas processos, usuarios, cursos_ead e system_logs.
*   **AWS S3:** Bucket tjaem-central-arquivos-prod com criptografia em repouso (AES-256).
*   **Stitch Data & Google BigQuery:** Pipeline ELT (CDC) a cada 30 minutos para auditoria, analytics e predição jurisprudencial.

**Padronização CAMEB:**
*   Regras de cabeçalho com número do processo e logo, rodapé normativo, validação prévia de schemas JSON e contagem de prazos em dias úteis com exclusão de feriados.

---

## Alinhamento do Fluxo Processual Ponta a Ponta
Para garantir segurança jurídica e máxima eficiência no portal, o fluxo ideal do processo arbitral deve seguir esta jornada:

`[1. Entrada & Triagem] ➔ [2. Citação & Notificação] ➔ [3. Conciliação / Mediação]`
`⬇`
`[6. Arquivamento & BI] ⬅ [5. Sentença Arbitral] ⬅ [4. Instrução & Provas]`

**Entrada & Distribuição:**
*   Requerimento inicial via formulário ou API.
*   Verificação de cláusula compromissória.
*   Criação automática do diretório no S3 e registro no PostgreSQL.
*   Recomendação automática de capacitação EAD ao árbitro de acordo com a matéria do conflito.

**Citação & Notificação das Partes:**
*   Disparo de notificação eletrônica com link de confirmação (AR eletrônico).
*   Contagem automática de prazo de resposta em dias úteis.

**Audiência de Conciliação / Mediação:**
*   Agendamento de audiência virtual.
*   Geração automática da Ata de Conciliação.

**Instrução Probatória & Documentação:**
*   Upload de provas e documentos com extração OCR inteligente.
*   Validação de integridade dos arquivos (hash SHA-256).

**Decisão & Sentença Arbitral:**
*   Geração assistida de minuta com embasamento nas resoluções CAMEB.
*   Validação de schema do documento CAMEB.
*   Assinatura digital do árbitro / presidente.
*   Notificação da sentença às partes.

**Cumprimento & Arquivamento:**
*   Registro do desfecho e geração de certidão de trânsito em julgado.
*   Sincronização com BigQuery para métricas.
*   Rotina de anonimização de dados pessoais para processos arquivados (LGPD).

---

## O que podemos melhorar (Propostas de Evolução)

### A. Validade Jurídica e Assinatura Digital
*   **Assinatura Digital ICP-Brasil / Gov.br:** Substituir placeholders por integração real de assinatura digital, incluindo carimbo de tempo oficial.
*   **Validador Público de Sentenças:** Criar página pública de conferência de autenticidade via QR Code.

### B. Arquitetura & Segurança de Backend
*   **API Backend Centralizada:** Migrar regras de autenticação, autorização (RBAC) e manipulação de banco para API dedicada (Node.js/NestJS ou Python/FastAPI).
*   **Gerenciamento Seguro de Credenciais:** Mover chaves de IA (OpenRouter) e credenciais do banco para o AWS Secrets Manager.

### C. Experiência em Audiências e IA
*   **Módulo de Audiências Virtuais com Transcrição:** Integrar sala virtual com gravação e transcrição automática por IA, gerando minuta preliminar.
*   **RAG Jurídico (Base de Conhecimento CAMEB):** Implementar busca semântica sobre Resoluções CAMEB e jurisprudências para sugerir fundamentações.

### D. Portal das Partes e Advogados (Balcão Virtual)
*   **Acesso Simplificado:** Visão restrita para partes consultarem andamento, anexarem documentos e assinarem acordos.
*   **Módulo Financeiro:** Recolhimento de taxas de protocolo, honorários e custas via Pix/Boleto integrado.
