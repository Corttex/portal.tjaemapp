# Proxy AI - TJAEM

Proxy simples para proteger a API Key do OpenRouter em produção.

## Como funciona

```
Browser → Proxy Server → OpenRouter API
(API Key protegida no servidor)
```

## Configuração

### 1. Configurar variáveis de ambiente

Edite o arquivo `config/.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-seu-aqui
```

### 2. Iniciar o proxy

```bash
cd app_build
node proxy-server.js
```

Ou com variável direta:

```bash
OPENROUTER_API_KEY=sk-or-v1-seu-aqui node proxy-server.js
```

### 3. Verificar funcionamento

```
✅ Proxy AI ativo!
📡 Porta: 3000
🌐 Origens permitidas: https://portal.tjaembrasil.com.br, ...
🔒 API Key protegida no servidor
```

## Produção

Em produção, o proxy é iniciado automaticamente pelo Docker Compose e o Caddy roteia as requisições:

```
Browser → Caddy (:443) → Proxy (:3000) → OpenRouter API
```

## Desenvolvimento

Para desenvolvimento local, você pode:

### Opção 1: Usar o proxy (recomendado)
```bash
cd app_build
OPENROUTER_API_KEY=sua-key node proxy-server.js
```

### Opção 2: Usar localStorage (rápido, apenas para teste)
Abra o console do navegador e execute:
```javascript
localStorage.setItem('openrouter_api_key', 'sk-or-v1-sua-key');
```

⚠️ **Atenção:** A Opção 2 expõe a API Key no browser. Use apenas para testes locais rápidos.

## Segurança

- ✅ API Key nunca exposta no browser (em produção)
- ✅ Rate limiting: 50 requisições/minuto por IP
- ✅ Validação de origens permitidas
- ✅ CORS configurado corretamente

## Arquitetura

```
app_build/
├── app.js              # Frontend SPA (usa proxy em produção)
├── proxy-server.js     # Proxy Node.js para OpenRouter
└── README-proxy.md     # Este arquivo
```

## Troubleshooting

### Erro: "OPENROUTER_API_KEY não configurada"
- Verifique se o arquivo `config/.env` tem a variável `OPENROUTER_API_KEY`
- Ou execute com a variável de ambiente definida

### Erro: "Muitas requisições"
- Rate limiting ativado. Aguarde 1 minuto e tente novamente.

### Erro: "Erro ao comunicar com OpenRouter"
- Verifique sua conexão com a internet
- Verifique se a API Key é válida
