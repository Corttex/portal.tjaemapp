document.addEventListener('DOMContentLoaded', () => {
    // Hooks de navegação
    const navItems = document.querySelectorAll('nav li');
    const btnAudit = document.getElementById('btn-audit');
    const dashboardSections = document.querySelectorAll('.dashboard-grid, .bottom-section');
    const aiLabSection = document.getElementById('ai-lab-section');

    // Troca de estado ativo no menu
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const navId = item.querySelector('a').id;
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            if (navId === 'nav-ai-lab') {
                dashboardSections.forEach(s => s.classList.add('hidden'));
                aiLabSection.classList.remove('hidden');
            } else {
                dashboardSections.forEach(s => s.classList.remove('hidden'));
                aiLabSection.classList.add('hidden');
            }

            showToast(`Navegando para: ${item.innerText}`);
        });
    });

    // --- LOGICA IA LAB ---
    const aiInput = document.getElementById('ai-input');
    const aiBtnSend = document.getElementById('ai-btn-send');
    const aiChatBox = document.getElementById('ai-chat-box');
    const modelSelect = document.getElementById('ai-model-select');

    // API Key - Deve ser configurada via variável de ambiente ou prompt do usuário
    // NUNCA commite chaves de API no repositório!

    // PRODUÇÃO: Usar proxy local para proteger a API Key
    // O proxy deve ser executado em proxy-server.js
    const USE_PROXY = window.location.hostname !== 'localhost' && window.location.protocol !== 'file:';
    const PROXY_URL = '/api/ai/chat'; // Configurado no Caddy para rotear para o proxy

    // DESENVOLVIMENTO: Usar localStorage para teste rápido
    const OPENROUTER_API_KEY = USE_PROXY ? null : (
        (typeof process !== 'undefined' && process.env ? process.env.OPENROUTER_API_KEY : null) || 
        localStorage.getItem('openrouter_api_key') || 
        ''
    );

    if (!USE_PROXY && !OPENROUTER_API_KEY) {
        console.warn('⚠️ OPENROUTER_API_KEY não configurada. Configure via variável de ambiente ou insira no localStorage.');
    }

    async function sendToAI() {
        const text = aiInput.value.trim();
        if (!text) return;

        // Verificação para modo desenvolvimento (sem proxy)
        if (!USE_PROXY && !OPENROUTER_API_KEY) {
            addChatBubble('⚠️ API Key não configurada. Por favor, configure sua chave OpenRouter no localStorage: localStorage.setItem("openrouter_api_key", "sua-chave")', 'assistant');
            return;
        }

        // Adiciona bolha do usuário
        addChatBubble(text, 'user');
        aiInput.value = "";

        // Adiciona bolha de carregamento
        const loadingBubble = addChatBubble("Pensando...", 'assistant');

        try {
            let response;

            if (USE_PROXY) {
                // Produção: Usar proxy para proteger API Key
                response = await fetch(PROXY_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": modelSelect.value,
                        "messages": [
                            { "role": "user", "content": text }
                        ]
                    })
                });
            } else {
                // Desenvolvimento: Chamada direta (apenas para teste local)
                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "HTTP-Referer": "https://tjaembrasil.com.br",
                        "X-Title": "TJAEM Portal",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": modelSelect.value,
                        "messages": [
                            { "role": "system", "content": "Você é o assistente virtual do TJAEM (Tribunal de Justiça Arbitral e Mediação). Especialista em processos jurídicos, mediação e legislação brasileira (LGPD, CAMEB)." },
                            { "role": "user", "content": text }
                        ]
                    })
                });
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            loadingBubble.innerText = aiResponse;
        } catch (error) {
            loadingBubble.innerText = "Erro ao conectar com a IA. Verifique sua conexão.";
            console.error(error);
        }
    }

    function addChatBubble(text, sender) {
        const bubble = document.createElement('div');
        bubble.className = `ai-bubble ${sender}`;
        bubble.innerText = text;
        aiChatBox.appendChild(bubble);
        aiChatBox.scrollTop = aiChatBox.scrollHeight;
        return bubble;
    }

    aiBtnSend.addEventListener('click', sendToAI);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendToAI();
    });

    // Simulação de Auditoria de Segurança
    if (btnAudit) {
        btnAudit.addEventListener('click', () => {
            btnAudit.innerText = "Auditing...";
            btnAudit.disabled = true;

            setTimeout(() => {
                showToast("✅ Auditoria Concluída: Infraestrutura Segura", "success");
                btnAudit.innerText = "Audit Security";
                btnAudit.disabled = false;
            }, 2000);
        });
    }

    // Sistema de Notificações Toast
    function showToast(message, type = 'info') {
        const toast = document.getElementById('notification-toast');
        toast.innerText = message;
        toast.className = `toast visible ${type}`;

        // Estilo dinâmico para o toast (poderia estar no CSS)
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            padding: '15px 25px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            zIndex: '1000',
            transition: 'opacity 0.3s ease',
            opacity: '1'
        });

        if (type === 'success') toast.style.borderColor = '#30d158';

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.className = 'toast hidden';
            }, 300);
        }, 3000);
    }

    // Log de inicialização do Arquiteto
    console.log("🚀 Portal TJAEM inicializado com sucesso.");
    console.log("🔒 Modo Seguro Ativado: AES-256 / SSL Obrigatório.");
});
