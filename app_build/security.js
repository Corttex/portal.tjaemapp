/**
 * TJAEM Security Utilities
 * 
 * Proteções contra XSS, manipulação de dados e injeção de código
 */

// ============================================================
// 1. SANITIZAÇÃO HTML (Prevenção XSS)
// ============================================================

/**
 * Escapa caracteres HTML perigosos para prevenir XSS
 * @param {string} str - String para escapar
 * @returns {string} - String segura para inserção no DOM
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Versão alternativa usando replace (mais rápida)
 */
function escapeHTMLFast(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Insere texto de forma segura no DOM (previne XSS)
 * NUNCA usar innerHTML com dados de usuário!
 * @param {HTMLElement} element - Elemento alvo
 * @param {string} htmlContent - Conteúdo HTML seguro (sem dados de usuário)
 * @param {Object} userData - Dados de usuário para inserir (serão escapados)
 */
function safeInsertDOM(element, htmlContent, userData = {}) {
    // Escapa todos os dados de usuário antes de inserir
    let safeHTML = htmlContent;
    for (const [key, value] of Object.entries(userData)) {
        const placeholder = `{{${key}}}`;
        safeHTML = safeHTML.replace(new RegExp(placeholder, 'g'), escapeHTMLFast(String(value)));
    }
    element.innerHTML = safeHTML;
}

// ============================================================
// 2. VALIDAÇÃO DE INPUTS
// ============================================================

/**
 * Valida formato de CPF (apenas numérico e dígitos verificadores)
 */
function validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Impede CPFs com todos dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Valida dígitos verificadores (algoritmo oficial)
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

/**
 * Sanitiza input de texto (remove tags HTML e caracteres especiais perigosos)
 */
function sanitizeInput(str, maxLength = 255) {
    if (typeof str !== 'string') return '';
    
    // Remove tags HTML completamente
    let sanitized = str.replace(/<[^>]*>/g, '');
    
    // Remove caracteres de controle
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Limita tamanho
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized.trim();
}

/**
 * Valida formato de email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================================
// 3. PROTEÇÃO CONTRA MANIPULAÇÃO DE CONSOLE
// ============================================================

/**
 * Congela objetos globais para impedir modificação via console
 * NOTA: Isso dificulta mas não impede completamente (usuário avançado pode bypass)
 */
function protectGlobalObjects() {
    // Protege objetos críticos contra modificação
    const criticalObjects = [
        'loggedUser',
        'isApproved',
        'currentUser',
        'userPermissions'
    ];
    
    criticalObjects.forEach(objName => {
        if (window[objName]) {
            try {
                Object.freeze(window[objName]);
                Object.defineProperty(window, objName, {
                    writable: false,
                    configurable: false
                });
                console.log(`🔒 ${objName} protegido contra modificação`);
            } catch (e) {
                console.warn(`⚠️ Não foi possível proteger ${objName}:`, e.message);
            }
        }
    });
}

/**
 * Detecta tentativas de modificação de variáveis críticas
 */
function setupSecurityMonitoring() {
    // Monitora tentativas de acesso a funções sensíveis
    const sensitiveVars = ['loggedUser', 'isApproved', 'doLogin', 'doLogout'];
    
    setInterval(() => {
        sensitiveVars.forEach(varName => {
            const currentValue = window[varName];
            // Se alguém tentar mudar para valores suspeitos
            if (varName === 'isApproved' && currentValue === true && !window._authCompleted) {
                console.warn(`⚠️ DETECTADO: Tentativa de bypass de autenticação em ${varName}`);
                // Reseta para estado seguro
                window[varName] = false;
                showToast('⚠️ Tentativa de manipulação detectada. Sessão encerrada.', 'error');
                setTimeout(() => doLogout(), 2000);
            }
        });
    }, 1000);
}

// ============================================================
// 4. SESSÃO SEGURA
// ============================================================

/**
 * Gera token de sessão temporário (simulação - em produção usar JWT do servidor)
 */
function generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica se sessão é válida
 */
function isSessionValid() {
    const session = sessionStorage.getItem('tjaem_session');
    if (!session) return false;
    
    try {
        const data = JSON.parse(session);
        // Sessão expira em 8 horas
        const now = Date.now();
        const expiration = data.createdAt + (8 * 60 * 60 * 1000);
        return now < expiration;
    } catch (e) {
        return false;
    }
}

/**
 * Cria nova sessão
 */
function createSession(userData) {
    const session = {
        token: generateSessionToken(),
        user: {
            id: userData.id,
            nome: userData.nome,
            role: userData.role,
            isAdmin: userData.isAdmin || false
        },
        createdAt: Date.now()
    };
    
    // NÃO armazenar dados sensíveis no sessionStorage
    sessionStorage.setItem('tjaem_session', JSON.stringify(session));
    return session;
}

/**
 * Limpa sessão (logout)
 */
function clearSession() {
    sessionStorage.removeItem('tjaem_session');
    localStorage.removeItem('tjaem-dark-mode'); // Mantém preferências do usuário
}

// ============================================================
// 5. UTILITÁRIOS DE SEGURANÇA
// ============================================================

/**
 * Previne ataques de clickjacking (se inserido em iframe)
 */
function preventClickjacking() {
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }
}

/**
 * Desabilita botões de desenvolvedor (dificulta debugging malicioso)
 * NOTA: Isso é opcional e pode ser irritante para devs legítimos
 */
function disableDevTools() {
    // Desabilita botão direito
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Desabilita teclas de atalho DevTools
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
            e.preventDefault();
        }
        // Ctrl+U (view source)
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
            e.preventDefault();
        }
    });
}

// ============================================================
// 6. LOG DE SEGURANÇA
// ============================================================

/**
 * Logger de eventos de segurança
 */
function logSecurityEvent(event, details = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event: event,
        details: details,
        userAgent: navigator.userAgent
    };
    
    // Em produção, enviar para servidor de logs
    console.log('🔒 Security Event:', logEntry);
    
    // Armazena localmente para auditoria
    const logs = JSON.parse(localStorage.getItem('tjaem_security_logs') || '[]');
    logs.push(logEntry);
    
    // Mantém apenas últimos 100 logs
    if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('tjaem_security_logs', JSON.stringify(logs));
}

// ============================================================
// 7. INICIALIZAÇÃO
// ============================================================

/**
 * Inicializa todas as proteções de segurança
 */
function initSecurity() {
    console.log('🔒 Inicializando proteções de segurança TJAEM...');
    
    // Previne clickjacking
    preventClickjacking();
    
    // Protege objetos globais (após serem criados)
    setTimeout(() => {
        protectGlobalObjects();
        setupSecurityMonitoring();
    }, 1000);
    
    // Registra inicialização
    logSecurityEvent('security_init', {
        url: window.location.href,
        timestamp: Date.now()
    });
    
    console.log('✅ Proteções de segurança ativadas');
}

// Exporta funções para uso global
window.TJAEMSecurity = {
    escapeHTML,
    escapeHTMLFast,
    safeInsertDOM,
    validateCPF,
    sanitizeInput,
    validateEmail,
    isSessionValid,
    createSession,
    clearSession,
    logSecurityEvent,
    initSecurity
};

// Auto-inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSecurity);
} else {
    initSecurity();
}
