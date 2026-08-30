const rateLimitMap = new Map();

const RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 100   // mais restrito (era 120)
};

const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || (now - record.start) > RATE_LIMIT.windowMs) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (record.count >= RATE_LIMIT.maxRequests) return false;
  record.count++;
  return true;
};

// Limpa o mapa a cada 5 minutos para evitar memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of rateLimitMap.entries()) {
    if (now - rec.start > RATE_LIMIT.windowMs * 5) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

const securityHeaders = (req, res, next) => {
  // ── Content-Security-Policy ───────────────────────────────────────────────
  const csp = [
    "default-src 'self'",
    // Tailwind CDN + inline styles necessários
    "script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net 'unsafe-inline'",
    // Google Fonts + inline styles do Tailwind
    "style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    // Imagens: self, HTTPS, data URIs, ui-avatars, unsplash, tjaem
    "img-src 'self' https: data: blob:",
    // Fetch/XHR apenas para nosso servidor e OpenRouter
    "connect-src 'self' https://openrouter.ai",
    // Sem iframes
    "frame-src 'none'",
    "frame-ancestors 'none'",
    // Sem objetos ou applets
    "object-src 'none'",
    "embed-src 'none'",
    // Workers apenas do próprio domínio
    "worker-src 'self'",
    // Formulários apenas para o próprio servidor
    "form-action 'self'",
    // Restringe base URI
    "base-uri 'self'",
    // Força HTTPS em produção
    process.env.NODE_ENV === 'production' ? "upgrade-insecure-requests" : "",
    // Nonce desabilitado (Tailwind CDN não suporta), usar hash futuro
    "manifest-src 'self'"
  ].filter(Boolean).join('; ');

  res.setHeader('Content-Security-Policy', csp);

  // ── Anti-Framing ───────────────────────────────────────────────────────────
  res.setHeader('X-Frame-Options', 'DENY');

  // ── Evita sniffing de Content-Type ────────────────────────────────────────
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // ── XSS Protection (legado — CSP é mais forte) ────────────────────────────
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // ── Referrer mínimo ───────────────────────────────────────────────────────
  res.setHeader('Referrer-Policy', 'same-origin');

  // ── Permissions Policy — desabilita sensores desnecessários ───────────────
  res.setHeader('Permissions-Policy', [
    'camera=()', 'microphone=()', 'geolocation=()',
    'payment=()', 'usb=()', 'bluetooth=()',
    'interest-cohort=()'   // bloqueia FLoC
  ].join(', '));

  // ── HSTS (somente produção) ───────────────────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // ── Oculta informações do servidor ────────────────────────────────────────
  res.removeHeader('X-Powered-By');
  res.setHeader('Server', 'TJAEM-Secure');

  // ── Previne cache de páginas autenticadas ─────────────────────────────────
  if (req.path !== '/' && !req.path.startsWith('/api/v1/health')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // ── Rate Limiting ──────────────────────────────────────────────────────────
  const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Muitas requisições. Aguarde 1 minuto.'
    });
  }

  next();
};

// ── Middleware de bloqueio de acesso direto a HTML ─────────────────────────────
const blockRawHtmlAccess = (req, res, next) => {
  if (req.path.match(/\.html?$/i)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Acesso direto a arquivos HTML não é permitido.'
    });
  }
  // Bloqueia acesso a arquivos de configuração, env, etc
  if (req.path.match(/\.(env|json|config|yml|yaml|lock|log|bak|sql|md)$/i)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// ── Middleware anti-scan (bloqueia user-agents suspeitos) ──────────────────────
const blockScanners = (req, res, next) => {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const suspiciousPatterns = [
    'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab',
    'python-requests', 'go-http-client', 'curl/', 'wget/',
    'dirbuster', 'gobuster', 'wfuzz', 'burpsuite', 'zap'
  ];
  if (suspiciousPatterns.some(p => ua.includes(p))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

module.exports = { securityHeaders, blockRawHtmlAccess, blockScanners };
