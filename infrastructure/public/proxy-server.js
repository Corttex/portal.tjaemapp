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

require('dotenv').config({ path: '../config/.env' });

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
                    resolve(JSON.parse(data));
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

            // Adiciona system prompt do TJAEM
            if (!chatBody.messages) {
                chatBody.messages = [];
            }

            // Garante que o system prompt está presente
            const hasSystemPrompt = chatBody.messages.some(m => m.role === 'system');
            if (!hasSystemPrompt) {
                chatBody.messages.unshift({
                    role: 'system',
                    content: 'Você é o assistente virtual do TJAEM (Tribunal de Justiça Arbitral e Mediação). Especialista em processos jurídicos, mediação e legislação brasileira (LGPD, CAMEB).'
                });
            }

            const response = await makeOpenRouterRequest(chatBody);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));

        } catch (error) {
            console.error('Erro no proxy:', error.message);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro ao comunicar com OpenRouter' }));
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
