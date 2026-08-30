-- =============================================================================
-- TJAEM Sovereign Archive & Portal - Schema PostgreSQL
-- Production deployment script for Hetzner / Coolify / Docker / VPS
-- =============================================================================

CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    email VARCHAR(255),
    whatsapp VARCHAR(50),
    full_address TEXT,
    document_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDENTE_ATUALIZACAO',
    link TEXT,
    documents JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_name ON members (name);
CREATE INDEX IF NOT EXISTS idx_members_status ON members (status);
CREATE INDEX IF NOT EXISTS idx_members_cpf ON members (cpf);

CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(50) PRIMARY KEY,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    parties TEXT,
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'EM_ANDAMENTO',
    arbitrator VARCHAR(255),
    value NUMERIC(15,2) DEFAULT 0.00,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_number ON cases (case_number);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (status);

CREATE TABLE IF NOT EXISTS sentences (
    id VARCHAR(50) PRIMARY KEY,
    case_number VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'RASCUNHO',
    author VARCHAR(255),
    signature_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_cpf VARCHAR(20),
    action VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Triggers para atualização de updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_members_timestamp ON members;
CREATE TRIGGER trg_update_members_timestamp
BEFORE UPDATE ON members
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_update_cases_timestamp ON cases;
CREATE TRIGGER trg_update_cases_timestamp
BEFORE UPDATE ON cases
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
