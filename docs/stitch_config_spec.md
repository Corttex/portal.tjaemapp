# 📈 Especificação de Configuração Stitch Data

Este documento define os parâmetros para a replicação de dados CDC (Change Data Capture) entre o AWS RDS PostgreSQL e o Google BigQuery.

---

## 🔗 Fonte (Source): AWS RDS PostgreSQL

| Parâmetro | Valor |
|-----------|-------|
| **Host** | `tjaem-prod-db.xxxxxx.sa-east-1.rds.amazonaws.com` |
| **Porta** | `5432` |
| **Database** | `tjaem` |
| **Username** | `stitch_user` (Permissions: SELECT + USAGE) |
| **Método de Replicação** | Logical Replication (Standard CDC) |

### Tabelas para Sincronização:
1. `public.usuarios`: Integração total (Full Table).
2. `public.processos`: Incremental (Key: `data_atualizacao`).
3. `public.cursos_ead`: Full Table.
4. `public.system_logs`: Incremental (Key: `id`).

---

## 🎯 Destino (Destination): Google BigQuery

| Parâmetro | Valor |
|-----------|-------|
| **Project ID** | `tjaem-analytical-platform` |
| **Dataset** | `stitch_raw_data` |
| **Location** | `sa-east1` (São Paulo) |
| **Loading Method** | BigQuery Storage Write API |

---

## ⚙️ Configurações de Frequência

- **Intervalo de Sync:** 30 minutos.
- **Detecção de Deleção:** Ativada (Soft Deletes tracked in `_sdc_deleted_at`).

---

> [!IMPORTANT]
> Certifique-se de que o Security Group do RDS permite o inbound traffic dos IPs oficiais do Stitch Data (ver documentação oficial do Stitch).
