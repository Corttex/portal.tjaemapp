/**
 * OpenRouter API Proxy para o TJAEM
 *
 * Este proxy protege a API Key do OpenRouter, evitando exposição no frontend.
 *
 * Uso:
 * 1. Configure OPENROUTER_API_KEY no arquivo config/.env
 * 2. Execute: node proxy-server.js
 * 3. O frontend deve chamar: fetch('/api/ai/chat', {...})
 *
 * Segurança:
 * - API Key nunca exposta no browser
 * - Rate limiting básico
 * - Validação de origem
 */

// Carregar variáveis de ambiente (suporta tanto dev quanto produção Docker)
const path = require('path');
const envPath = path.join(__dirname, '..', 'config', '.env');

try {
    require('dotenv').config({ path: envPath });
} catch (e) {
    // Em produção Docker, variáveis vêm do env_file
    console.log('Nota: Usando variáveis de ambiente do Docker');
}

const http = require('http');
const https = require('https');

// Configuração
const CONFIG = {
    PORT: process.env.PROXY_PORT || 3000,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    ALLOWED_ORIGINS: [
        'https://portal.tjaembrasil.com.br',
        'https://tjaembrasil.com.br',
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    RATE_LIMIT: {
        maxRequests: 50,
        windowMs: 60 * 1000 // 1 minuto
    }
};

if (!CONFIG.OPENROUTER_API_KEY) {
    console.error('❌ ERRO: OPENROUTER_API_KEY não configurada!');
    console.error('Configure no arquivo config/.env ou como variável de ambiente.');
    process.exit(1);
}

// Rate limiting simples
const requestCounts = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const userRecord = requestCounts.get(ip);

    if (!userRecord || (now - userRecord.start) > CONFIG.RATE_LIMIT.windowMs) {
        requestCounts.set(ip, { start: now, count: 1 });
        return true;
    }

    if (userRecord.count >= CONFIG.RATE_LIMIT.maxRequests) {
        return false;
    }

    userRecord.count++;
    return true;
}

// Função para fazer request ao OpenRouter
function makeOpenRouterRequest(body) {
    return new Promise((resolve, reject) => {
        // Valida body antes de enviar
        if (!body || !body.messages || !Array.isArray(body.messages)) {
            reject(new Error('Body inválido'));
            return;
        }

        // Limita tamanho da mensagem (previne abuso)
        const MAX_MESSAGE_LENGTH = 4000;
        body.messages.forEach(msg => {
            if (msg.content && msg.content.length > MAX_MESSAGE_LENGTH) {
                msg.content = msg.content.substring(0, MAX_MESSAGE_LENGTH);
            }
        });

        const postData = JSON.stringify(body);

        const options = {
            hostname: 'openrouter.ai',
            port: 443,
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://tjaembrasil.com.br',
                'X-Title': 'TJAEM Portal',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);

                    // Sanitiza resposta antes de enviar ao cliente
                    if (response.choices && response.choices[0] && response.choices[0].message) {
                        const content = response.choices[0].message.content;
                        // Limita tamanho da resposta
                        if (content && content.length > 8000) {
                            response.choices[0].message.content = content.substring(0, 8000) + '... [truncado]';
                        }
                    }

                    resolve(response);
                } catch (e) {
                    reject(new Error('Erro ao parsear resposta do OpenRouter'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
    // CORS headers
    const origin = req.headers.origin;
    if (CONFIG.ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Apenas POST permitido
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Método não permitido' }));
        return;
    }

    // Rate limiting
    const clientIp = req.socket.remoteAddress;
    if (!checkRateLimit(clientIp)) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Muitas requisições. Tente novamente em 1 minuto.' }));
        return;
    }

    // Proxy para OpenRouter
    let body = '';
    req.on('data', chunk => { body += chunk; });

    req.on('end', async () => {
        try {
            const chatBody = JSON.parse(body);

            // Valida estrutura do body
            if (!chatBody.messages || !Array.isArray(chatBody.messages)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Estrutura inválida. Required: { messages: [] }' }));
                return;
            }

            // Valida e sanitiza cada mensagem
            const MAX_MESSAGES = 20;
            if (chatBody.messages.length > MAX_MESSAGES) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Máximo de ${MAX_MESSAGES} mensagens permitidas` }));
                return;
            }

            // Sanitiza conteúdo das mensagens
            chatBody.messages.forEach(msg => {
                if (!msg.role || !['system', 'user', 'assistant'].includes(msg.role)) {
                    throw new Error('Role inválido');
                }
                if (!msg.content || typeof msg.content !== 'string') {
                    throw new Error('Conteúdo inválido');
                }
                // Remove tags HTML se houver
                msg.content = msg.content.replace(/<[^>]*>/g, '');
            });

            // Adiciona system prompt do TJAEM
            const hasSystemPrompt = chatBody.messages.some(m => m.role === 'system');
            if (!hasSystemPrompt) {
                chatBody.messages.unshift({
                    role: 'system',
                    content: 'Você é o assistente virtual do TJAEM (Tribunal de Justiça Arbitral e Mediação). Especialista em processos jurídicos, mediação e legislação brasileira (LGPD, CAMEB).'
                });
            }

            // Registra requisição
            console.log(`📝 [${new Date().toISOString()}] AI request from ${clientIp}`);

            const response = await makeOpenRouterRequest(chatBody);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));

        } catch (error) {
            console.error('Erro no proxy:', error.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Requisição inválida' }));
        }
    });
});

// Iniciar servidor
server.listen(CONFIG.PORT, () => {
    console.log('✅ Proxy AI ativo!');
    console.log(`📡 Porta: ${CONFIG.PORT}`);
    console.log(`🌐 Origens permitidas: ${CONFIG.ALLOWED_ORIGINS.join(', ')}`);
    console.log('🔒 API Key protegida no servidor');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n⏹️  Encerrando proxy...');
    server.close(() => {
        console.log('✅ Proxy encerrado.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n⏹️  Encerrando proxy...');
    server.close(() => {
        console.log('✅ Proxy encerrado.');
        process.exit(0);
    });
});
