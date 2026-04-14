# Troubleshooting - TJAEM Portal

## Problemas Comuns e Soluções

### 1. Tela Branca em https://portal.tjaembrasil.com.br/

**Causa:** Arquivos do frontend não foram copiados para `infrastructure/public/`

**Solução:**
```bash
# Windows
deploy.bat

# Linux/Mac
cp -r app_build/* infrastructure/public/
```

**Verificação:**
```bash
docker-compose -f infrastructure/docker-compose-n8n.yml exec caddy ls -la /var/www/html
```

Deve mostrar `index.html`, `app.js`, `style.css`, etc.

---

### 2. HTTP 502 em https://portal.tjaembrasil.com.br/automation

**Causa:** n8n não está rodando ou configuração incorreta

**Solução:**
```bash
# Verificar se n8n está rodando
docker-compose -f infrastructure/docker-compose-n8n.yml ps

# Ver logs do n8n
docker-compose -f infrastructure/docker-compose-n8n.yml logs n8n

# Reiniciar n8n
docker-compose -f infrastructure/docker-compose-n8n.yml restart n8n
```

**Verificar config/.env:**
- `N8N_ENCRYPTION_KEY` deve estar preenchido
- `DB_POSTGRESDB_PASSWORD` deve estar correto

---

### 3. Erro 502 Geral

**Causas possíveis:**
1. Caddy não está rodando
2. Porta 80/443 já em uso
3. TLS/SSL não configurado

**Solução:**
```bash
# Verificar status
docker-compose -f infrastructure/docker-compose-n8n.yml ps

# Ver logs do Caddy
docker-compose -f infrastructure/docker-compose-n8n.yml logs caddy

# Reiniciar tudo
docker-compose -f infrastructure/docker-compose-n8n.yml down
docker-compose -f infrastructure/docker-compose-n8n.yml up -d
```

---

### 4. AI Lab não funciona

**Causa:** Proxy AI não está rodando

**Solução:**
```bash
# Verificar se ai-proxy está rodando
docker-compose -f infrastructure/docker-compose-n8n.yml ps

# Ver logs
docker-compose -f infrastructure/docker-compose-n8n.yml logs ai-proxy

# Verificar se OPENROUTER_API_KEY está configurada
cat config/.env | grep OPENROUTER
```

---

### 5. Banco de Dados não conecta

**Causa:** RDS endpoint incorreto ou senha errada

**Solução:**
1. Verificar `DB_POSTGRESDB_HOST` no `config/.env`
2. Após `terraform apply`, atualizar o endpoint RDS
3. Verificar security group permite acesso na porta 5432

---

## Deploy Completo

```bash
# 1. Copiar arquivos
deploy.bat

# 2. Subir serviços
cd infrastructure
docker-compose -f docker-compose-n8n.yml up -d

# 3. Verificar
docker-compose -f docker-compose-n8n.yml ps

# 4. Ver logs
docker-compose -f docker-compose-n8n.yml logs -f
```

---

## Acesso After Deploy

- **Portal:** https://portal.tjaembrasil.com.br/
- **n8n:** https://portal.tjaembrasil.com.br/automation/
- **AI Lab:** Funciona automaticamente via proxy
