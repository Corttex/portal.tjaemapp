-- BigQuery Analytics Views for TJAEM BI
-- Base Dataset: stitch_raw_data

-- 1. View de Performance Procesual
CREATE OR REPLACE VIEW `tjaem-analytical-platform.analytics.vw_process_efficiency` AS
SELECT 
  tipo,
  status,
  COUNT(*) as total_processos,
  AVG(DATE_DIFF(CURRENT_DATE(), DATE(data_criacao), DAY)) as avg_days_open
FROM `tjaem-analytical-platform.stitch_raw_data.processos`
WHERE _sdc_deleted_at IS NULL
GROUP BY 1, 2;

-- 2. View de Engajamento EAD vs Processos
CREATE OR REPLACE VIEW `tjaem-analytical-platform.analytics.vw_ead_coverage` AS
SELECT 
  p.tipo,
  COUNT(DISTINCT p.associado_id) as total_associados,
  COUNT(DISTINCTCASE WHEN c.nome_curso IS NOT NULL THEN p.associado_id END) as associados_capacitados
FROM `tjaem-analytical-platform.stitch_raw_data.processos` p
LEFT JOIN `tjaem-analytical-platform.stitch_raw_data.cursos_ead` c ON p.tipo = c.recomendado_para
WHERE p._sdc_deleted_at IS NULL
GROUP BY 1;

-- 3. Histórico de Prazos Críticos
CREATE OR REPLACE VIEW `tjaem-analytical-platform.analytics.vw_deadline_history` AS
SELECT 
  EXTRACT(MONTH FROM data_prazo) as mes,
  urgencia,
  COUNT(*) as total_ocorrencias
FROM `tjaem-analytical-platform.stitch_raw_data.processos`
GROUP BY 1, 2;
