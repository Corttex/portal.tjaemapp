/**
 * TJAEM Authentication Module
 * 
 * Autenticação segura com proteção contra brute-force e gestão de sessão
 */

// ============================================================
// 1. CONFIGURAÇÃO SEGURA
// ============================================================

const AuthConfig = Object.freeze({
    // Em produção, NUNCA armazenar credenciais no frontend
    // Usar autenticação via servidor com JWT tokens
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 horas
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
    PASSWORD_MIN_LENGTH: 8,

    // Webhook endpoints (em produção, usar seu backend)
    LOGIN_ENDPOINT: '/api/auth/login',
    VERIFY_ENDPOINT: '/api/auth/verify',
    LOGOUT_ENDPOINT: '/api/auth/logout'
});

// ============================================================
// 2. ESTADO DA AUTENTICAÇÃO (PROTEGIDO)
// ============================================================

// Objeto privado (não exposto globalmente)
const _authState = {
    currentUser: null,
    isAuthenticated: false,
    loginAttempts: 0,
    lastAttemptTime: 0,
    isLocked: false
};

// Congela o estado para impedir modificação externa
Object.freeze(_authState);

// ============================================================
// 3. UTILITÁRIOS DE SEGURANÇA
// ============================================================

/**
 * Hash simples para senhas (NOTA: em produção usar bcrypt no servidor)
 * Esta é uma proteção básica para não armazenar senhas em plaintext
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'tjaem_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera token CSRF para proteger formulários
 */
function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Armazena token CSRF no sessionStorage
 */
function initCSRFProtection() {
    if (!sessionStorage.getItem('tjaem_csrf_token')) {
        sessionStorage.setItem('tjaem_csrf_token', generateCSRFToken());
    }
}

/**
 * Obtém token CSRF para usar em formulários
 */
function getCSRFToken() {
    return sessionStorage.getItem('tjaem_csrf_token');
}

// ============================================================
// 4. CONTROLE DE TENTATIVAS DE LOGIN
// ============================================================

/**
 * Verifica se o login está bloqueado por muitas tentativas
 */
function isLoginLocked() {
    if (!_authState.isLocked) return false;

    const now = Date.now();
    const lockoutEnd = _authState.lastAttemptTime + AuthConfig.LOCKOUT_DURATION;

    if (now >= lockoutEnd) {
        // Desbloqueia após tempo
        _authState.loginAttempts = 0;
        _authState.isLocked = false;
        return false;
    }

    const remainingTime = Math.ceil((lockoutEnd - now) / 60000);
    console.warn(`⚠️ Conta bloqueada. Tentar novamente em ${remainingTime} minutos`);
    return true;
}

/**
 * Registra tentativa de login falha
 */
function recordFailedAttempt() {
    _authState.loginAttempts++;
    _authState.lastAttemptTime = Date.now();

    if (_authState.loginAttempts >= AuthConfig.MAX_LOGIN_ATTEMPTS) {
        _authState.isLocked = true;
        console.warn(`🔒 Conta bloqueada por ${AuthConfig.LOCKOUT_DURATION / 60000} minutos`);
    }

    const remaining = AuthConfig.MAX_LOGIN_ATTEMPTS - _authState.loginAttempts;
    return {
        success: false,
        message: `Credenciais inválidas. Tentativas restantes: ${remaining}`,
        attemptsLeft: remaining,
        locked: _authState.isLocked
    };
}

/**
 * Reseta contador de tentativas após login bem-sucedido
 */
function resetLoginAttempts() {
    _authState.loginAttempts = 0;
    _authState.isLocked = false;
}

// ============================================================
// 5. AUTENTICAÇÃO SIMULADA (MODO DESENVOLVIMENTO)
// ============================================================

/**
 * Autentica via servidor — credenciais NUNCA validadas no cliente.
 * O servidor emite um cookie HttpOnly (tjaem_sid) que o JS não pode ler.
 * Em caso de sucesso, o servidor retorna apenas dados públicos do usuário.
 */
async function authenticateViaServer(cpf, senha) {
    const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', // Inclui/salva cookies
        body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), password: senha })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        return { success: false, error: data.message || 'Credenciais inválidas' };
    }

    // Servidor define o cookie HttpOnly automaticamente
    // data.user contém apenas informações públicas (sem senha, sem token)
    return { success: true, user: data.user };
}

// ============================================================
// 6. FUNÇÕES PÚBLICAS DE AUTENTICAÇÃO
// ============================================================

/**
 * Realiza login do usuário
 * @param {string} cpf - CPF do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object>} - Resultado do login
 */
async function doSecureLogin(cpf, senha) {
    // Verifica se está bloqueado
    if (isLoginLocked()) {
        return {
            success: false,
            error: 'Conta temporariamente bloqueada. Aguarde alguns minutos.'
        };
    }

    // Sanitiza inputs
    const sanitizedCPF = cpf.replace(/\D/g, '');
    const sanitizedSenha = String(senha).trim();

    // Validações básicas
    if (sanitizedCPF.length !== 11) {
        return { success: false, error: 'CPF inválido' };
    }

    if (sanitizedSenha.length < AuthConfig.PASSWORD_MIN_LENGTH) {
        return { success: false, error: 'Senha muito curta' };
    }

    // Tenta autenticação
    let result;

    // Autenticação sempre via servidor — nunca local
    result = await authenticateViaServer(sanitizedCPF, sanitizedSenha);

    if (!result.success) {
        return recordFailedAttempt();
    }

    // Login bem-sucedido
    resetLoginAttempts();
    _authState.currentUser = result.user;
    _authState.isAuthenticated = true;

    // Cria sessão segura
    if (window.TJAEMSecurity) {
        window.TJAEMSecurity.createSession(result.user);
    }

    // Registra evento de segurança
    if (window.TJAEMSecurity) {
        window.TJAEMSecurity.logSecurityEvent('login_success', {
            userId: result.user.id,
            timestamp: Date.now()
        });
    }

    return {
        success: true,
        user: result.user,
        message: 'Login realizado com sucesso'
    };
}

/**
 * Realiza logout do usuário — invalida cookie HttpOnly no servidor
 */
async function doSecureLogout() {
    try {
        // Servidor destrói o cookie HttpOnly
        await fetch('/api/v1/auth/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });
    } catch {}

    // Limpa estado local
    _authState.currentUser = null;
    _authState.isAuthenticated = false;
    sessionStorage.clear();

    // Redireciona para login
    window.location.replace('/');
}

/**
 * Verifica se usuário está autenticado
 */
function isAuthenticated() {
    if (!window.TJAEMSecurity) return false;
    return window.TJAEMSecurity.isSessionValid();
}

/**
 * Obtém usuário atual (somente leitura)
 */
function getCurrentUser() {
    if (!_authState.currentUser) return null;

    // Retorna cópia para impedir modificação
    return Object.freeze({ ..._authState.currentUser });
}

/**
 * Verifica se usuário tem permissão específica
 */
function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;

    // Admin tem todas as permissões
    if (user.isAdmin) return true;

    return user.permissions && user.permissions.includes(permission);
}

/**
 * Verifica se usuário é administrador
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.isAdmin === true;
}

// ============================================================
// 7. PROTEÇÃO DE ROTAS
// ============================================================

/**
 * Protege páginas que requerem autenticação
 * Chamar esta função no início de páginas protegidas
 */
function requireAuth(requiredPermission = null) {
    if (!isAuthenticated()) {
        console.warn('⚠️ Acesso negado: usuário não autenticado');
        window.location.href = '/index.html';
        return false;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        console.warn(`⚠️ Acesso negado: permissão '${requiredPermission}' necessária`);
        window.location.href = '/app_build/index.html';
        return false;
    }

    return true;
}

// ============================================================
// 8. INICIALIZAÇÃO
// ============================================================

/**
 * Inicializa módulo de autenticação
 */
function initAuth() {
    console.log('🔐 Inicializando módulo de autenticação TJAEM...');

    // Inicializa proteção CSRF
    initCSRFProtection();

    // Verifica se sessão é válida
    if (window.TJAEMSecurity && window.TJAEMSecurity.isSessionValid()) {
        console.log('✅ Sessão válida encontrada');
    } else {
        console.log('⚠️ Nenhuma sessão ativa - redirecionar para login');
    }
}

// Exporta API pública
window.TJAEMAuth = Object.freeze({
    config: AuthConfig,
    doSecureLogin,
    doSecureLogout,
    isAuthenticated,
    getCurrentUser,
    hasPermission,
    isAdmin,
    requireAuth,
    getCSRFToken,
    initAuth
});

// Auto-inicializa
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
