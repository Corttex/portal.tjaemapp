-- TJAEM Database Initialization Script
-- Target: AWS RDS PostgreSQL

-- 1. Tabela de Associados/Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    funcao VARCHAR(50) DEFAULT 'associado', -- associado, mediador, admin
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Processos Jurídicos
CREATE TYPE status_processo AS ENUM ('Conciliação', 'Instrução', 'Sentença', 'Arquivado');
CREATE TYPE urgencia_processo AS ENUM ('NORMAL', 'ALERTA', 'URGENTE');

CREATE TABLE IF NOT EXISTS processos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_processo VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- Condominial, Comercial, etc.
    status status_processo DEFAULT 'Conciliação',
    urgencia urgencia_processo DEFAULT 'NORMAL',
    data_prazo TIMESTAMP WITH TIME ZONE,
    associado_id UUID REFERENCES usuarios(id),
    metadata JSONB, -- Armazena dados extras do OCR
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Catálogo EAD
CREATE TABLE IF NOT EXISTS cursos_ead (
    id SERIAL PRIMARY KEY,
    nome_curso VARCHAR(255) NOT NULL,
    recomendado_para VARCHAR(100), -- Mapeia com o 'tipo' da tabela processos
    link_moodle TEXT,
    ementa TEXT
);

-- 4. Inserção de Dados Iniciais (Exemplos)
INSERT INTO cursos_ead (nome_curso, recomendado_para, link_moodle) VALUES
('Módulo 1: Introdução à Arbitragem', 'Geral', 'https://ead.tjaem.org/modulo1'),
('Módulo 2: Mediação Comercial Avançada', 'Comercial', 'https://ead.tjaem.org/modulo2'),
('Módulo 3: Mediação Predial e Condominial', 'Condominial', 'https://ead.tjaem.org/modulo3');

-- 5. View Crítica para o n8n: Prazos Próximos
CREATE OR REPLACE VIEW tjaem_critical_deadlines AS
SELECT 
    p.numero_processo, 
    p.tipo, 
    p.data_prazo,
    p.urgencia,
    u.nome AS associado_nome,
    u.email AS associado_email
FROM processos p
JOIN usuarios u ON p.associado_id = u.id
WHERE p.data_prazo <= (CURRENT_TIMESTAMP + INTERVAL '3 days')
  AND p.status NOT IN ('Sentença', 'Arquivado');

-- 6. Trigger para atualização de timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_update_processos_timestamp
BEFORE UPDATE ON processos
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
