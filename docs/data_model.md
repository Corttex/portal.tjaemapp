# 📊 Dicionário de Dados TJAEM

Estrutura fundamental do banco de dados PostgreSQL (AWS RDS) e sua integração com BigQuery via Stitch.

---

## 🏗️ Tabelas Principais

### `processos`
Armazena a espinha dorsal de todo caso jurídico.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária. |
| `numero_processo` | VARCHAR | Formato YYYY-XXX (ex: 2026-045). |
| `tipo` | VARCHAR | Condominial, Comercial, Trabalhista, etc. |
| `status` | ENUM | Conciliação, Instrução, Sentença, Arquivado. |
| `data_prazo` | TIMESTAMP | Data limite para a próxima ação. |
| `urgencia` | VARCHAR | ALERTA, URGENTE, NORMAL. |

### `cursos_ead`
Mapeia o catálogo educacional aos tipos de processos.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | Chave primária. |
| `nome_curso` | VARCHAR | Nome do módulo (ex: Mediação Predial). |
| `recomendado_para` | VARCHAR | Tipo de processo correspondente. |
| `link_moodle` | TEXT | URL de acesso direto. |

---

## 🚨 View Crítica: `tjaem_critical_deadlines`

Esta view é utilizada pelo n8n para disparar automações de alerta.

**Definição:**
```sql
CREATE VIEW tjaem_critical_deadlines AS
SELECT 
    p.numero_processo, 
    p.tipo, 
    p.data_prazo,
    p.urgencia,
    u.nome AS associado_nome,
    u.email AS associado_email
FROM processos p
JOIN usuarios u ON p.associado_id = u.id
WHERE p.data_prazo <= (CURRENT_DATE + INTERVAL '3 days')
  AND p.status NOT IN ('Sentença', 'Arquivado');
```

---

## 📈 Sincronização Stitch Data

Toda a estrutura acima é replicada para o **Google BigQuery** para auditoria CAMEB.

**Destino:** `tjaem_bi_dataset`
- **Tabela `stg_processos`:** Dados brutos sincronizados.
- **Tabela `rpt_jurisprudencia`:** Cruzamento de dados de processos com resultados históricos para predição de sentenças.

---

> [!CAUTION]
> Alterações em colunas da tabela `processos` exigem atualização imediata dos campos mapeados no n8n e no Stitch para evitar falhas no pipeline.
