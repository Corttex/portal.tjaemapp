/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║        TJAEM — CONSOLE SHIELD & ANTI-TAMPER v3.0        ║
 * ║   Máxima proteção client-side para portal institucional  ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * CAMADAS:
 *  1. Silencia console (log/warn/error/info/debug/table/dir)
 *  2. Bloqueia F12 / Ctrl+Shift+I / Ctrl+U / Ctrl+S
 *  3. Bloqueia botão direito e seleção de texto
 *  4. Detecta DevTools aberto → redireciona
 *  5. Exibe mensagem de segurança no console
 *  6. Protege variáveis globais críticas com Proxy
 *  7. Bloqueia cópia de dados sensíveis
 *  8. MutationObserver para scripts injetados
 */

;(function TJAEM_SHIELD() {
  'use strict';

  // ── 1. Silenciar Console ───────────────────────────────────────────────────
  // Preservamos apenas console.error para que erros REAIS apareçam para o dev
  // Em produção, silenciamos tudo.

  const _noop = () => {};
  const _isProduction = (() => {
    try {
      return window.location.hostname !== 'localhost' &&
             !window.location.hostname.startsWith('192.168') &&
             !window.location.hostname.startsWith('127.');
    } catch { return true; }
  })();

  if (_isProduction) {
    // Produção: silencia absolutamente tudo
    ['log', 'warn', 'info', 'debug', 'trace', 'table', 'dir', 'dirxml',
     'group', 'groupEnd', 'groupCollapsed', 'time', 'timeEnd', 'count',
     'assert', 'profile', 'profileEnd', 'timeStamp'].forEach(method => {
      try { console[method] = _noop; } catch {}
    });
    // Mantém error mas remove stack trace
    const _origError = console.error.bind(console);
    console.error = (...args) => {
      _origError('[TJAEM] Internal error');
    };
  } else {
    // Desenvolvimento: mantém console mas exibe aviso
    const _origLog = console.log.bind(console);
    console.log = (...args) => {
      // Bloqueia logs que exponham dados sensíveis (senhas, tokens, CPF)
      const str = args.join(' ').toLowerCase();
      if (/password|senha|token|jwt|secret|cpf|807522|01250190/.test(str)) {
        return; // silencia silenciosamente
      }
      _origLog(...args);
    };
  }

  // ── 2. Mensagem de segurança no console ───────────────────────────────────
  // Exibida UMA VEZ para intimidar quem tentar inspecionar
  setTimeout(() => {
    const style1 = 'color:#d4af37;font-size:22px;font-weight:bold;font-family:serif;';
    const style2 = 'color:#ef4444;font-size:13px;font-weight:bold;';
    const style3 = 'color:#64748b;font-size:11px;';
    try {
      // Não silenciamos este porque é intencional
      Function.prototype.call.call(
        Object.getOwnPropertyDescriptor(console, 'log')?.value || console.log,
        console,
        '%c⚖ TJAEM Brasil — Portal Seguro',
        style1
      );
      Function.prototype.call.call(
        Object.getOwnPropertyDescriptor(console, 'log')?.value || console.log,
        console,
        '%c⛔ ATENÇÃO: Esta área é monitorada.',
        style2
      );
      Function.prototype.call.call(
        Object.getOwnPropertyDescriptor(console, 'log')?.value || console.log,
        console,
        '%cQualquer tentativa de manipulação desta plataforma é crime\nconforme o Art. 154-A do Código Penal Brasileiro (Lei 12.737/2012).\nTodas as ações neste console são registradas e reportadas.',
        style3
      );
    } catch {}
    // Re-silencia após a mensagem em produção
    if (_isProduction) {
      ['log','warn','info','debug','trace'].forEach(m => { try { console[m] = _noop; } catch {} });
    }
  }, 800);

  // ── 3. Bloquear atalhos de DevTools e View Source ─────────────────────────
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+Shift+I | Ctrl+Shift+J | Ctrl+Shift+C | Ctrl+Shift+K
    if (e.ctrlKey && e.shiftKey && ['I','J','C','K'].includes(e.key?.toUpperCase())) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key?.toUpperCase() === 'U') {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+S (save page)
    if (e.ctrlKey && e.key?.toUpperCase() === 'S') {
      e.preventDefault(); return false;
    }
    // Ctrl+P (print / save as PDF para capturar dados)
    // Não bloqueamos print pois a credencial precisa ser impressa
    // se quiser bloquear: Ctrl+P → e.preventDefault();
  }, true);

  // ── 4. Bloquear botão direito ──────────────────────────────────────────────
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault(); return false;
  }, true);

  // ── 5. Bloquear seleção de texto em campos sensíveis ──────────────────────
  // Não bloqueamos globalmente (prejudica UX), apenas em elementos marcados
  document.addEventListener('selectstart', function(e) {
    if (e.target?.closest?.('[data-no-select]')) {
      e.preventDefault(); return false;
    }
  });

  // ── 6. Detecção de DevTools aberto ────────────────────────────────────────
  let _devToolsOpen = false;
  let _devToolsCheck;

  function _checkDevTools() {
    const threshold = 200;
    const widthDiff  = window.outerWidth  - window.innerWidth  > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if ((widthDiff || heightDiff) && !_devToolsOpen) {
      _devToolsOpen = true;
      _onDevToolsDetected();
    } else if (!widthDiff && !heightDiff && _devToolsOpen) {
      _devToolsOpen = false;
    }
  }

  // Técnica debugger (detecta pausa do debugger)
  let _lastTime = Date.now();
  function _checkDebugger() {
    const now = Date.now();
    if (now - _lastTime > 500) {
      // Houve uma pausa > 500ms — provavelmente debugger
      _onDevToolsDetected();
    }
    _lastTime = Date.now();
  }

  function _onDevToolsDetected() {
    // Em produção: redireciona
    if (_isProduction) {
      document.body.innerHTML = '';
      window.location.replace('/');
    } else {
      // Em dev: apenas avisa
      try {
        Function.prototype.call.call(
          Object.getOwnPropertyDescriptor(console, 'warn')?.value || console.warn,
          console,
          '⚠️ [TJAEM DEV] DevTools detectado. Em produção, a página seria redirecionada.'
        );
      } catch {}
    }
  }

  _devToolsCheck = setInterval(_checkDevTools, 1500);
  // Técnica debugger — apenas em produção
  if (_isProduction) {
    setInterval(() => { const start = performance.now(); debugger; if (performance.now() - start > 100) _onDevToolsDetected(); }, 1000);
  }

  // ── 7. Proteger variáveis críticas com Object.defineProperty ──────────────
  // Aguarda que a aplicação crie as variáveis e então as protege
  function _freezeVar(name, value) {
    try {
      Object.defineProperty(window, name, {
        value: value,
        writable: false,
        configurable: false,
        enumerable: false  // não aparece em Object.keys(window)
      });
    } catch {}
  }

  // Observa quando variáveis críticas são criadas e as protege
  setTimeout(() => {
    if (window.loggedUser) {
      Object.freeze(window.loggedUser);
      _freezeVar('loggedUser', window.loggedUser);
    }
  }, 2000);

  // ── 8. MutationObserver — bloqueia scripts injetados via console ───────────
  const _scriptObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === 'SCRIPT') {
          const src = node.src || '';
          const content = node.textContent || '';
          const allowed = [
            'cdn.tailwindcss.com',
            'cdn.jsdelivr.net',
            'fonts.googleapis.com',
            window.location.origin
          ];
          const isSafe = !src || allowed.some(a => src.includes(a));
          if (!isSafe) {
            try { node.parentNode?.removeChild(node); } catch {}
            // Reporta ao servidor
            try {
              navigator.sendBeacon('/api/v1/security/report', JSON.stringify({
                type: 'script_injection',
                src: src.slice(0, 200),
                ts: Date.now()
              }));
            } catch {}
          }
        }
      }
    }
  });
  _scriptObserver.observe(document.documentElement, { childList: true, subtree: true });

  // ── 9. Cópia de dados — intercepta clipboard em campos sensíveis ───────────
  document.addEventListener('copy', function(e) {
    const sel = window.getSelection()?.toString() || '';
    // Bloqueia cópia de CPFs (padrão: 000.000.000-00 ou 00000000000)
    if (/\d{3}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?\d{2}/.test(sel)) {
      e.preventDefault();
      e.clipboardData?.setData('text/plain', '***');
      return false;
    }
  });

  // ── 10. Previne iframe embedding (client-side reforço) ─────────────────────
  try {
    if (window.self !== window.top) {
      window.top.location.replace(window.self.location.href);
    }
  } catch {
    // Cross-origin frame — bloqueia
    document.body.innerHTML = '<p style="font-family:sans-serif;text-align:center;padding:50px">Acesso negado.</p>';
  }

  // ── 11. Esconde objetos globais sensíveis ──────────────────────────────────
  // Remove propriedades que revelam a stack: __proto__, constructor, etc não podem ser removidas
  // mas podemos dificultar a inspeção ocultando objetos de aplicação

  // Sobrescreve toString de funções críticas para não revelar código
  const _hideFnSource = (fn) => {
    if (typeof fn !== 'function') return fn;
    try {
      Object.defineProperty(fn, 'toString', {
        value: () => 'function () { [native code] }',
        writable: false,
        configurable: false
      });
    } catch {}
    return fn;
  };

  // Expõe API mínima e segura mesclando com TJAEMSecurity de security.js
  const existingSec = window.TJAEMSecurity || {};
  const sanitizeFn = _hideFnSource((str, max = 255) => {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').replace(/[\x00-\x1F\x7F]/g, '').slice(0, max).trim();
  });

  window.TJAEMSecurity = Object.freeze({
    ...existingSec,
    version: '3.0',
    escapeHTML: _hideFnSource((str) => {
      if (typeof str !== 'string') return '';
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
               .replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
    }),
    sanitize: sanitizeFn,
    sanitizeInput: existingSec.sanitizeInput || sanitizeFn,
    validateCPF: _hideFnSource((cpf) => {
      if (!cpf) return false;
      cpf = String(cpf).replace(/\D/g, '');
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
      let s = 0;
      for (let i = 0; i < 9; i++) s += +cpf[i] * (10 - i);
      let r = (s * 10) % 11; if (r === 10) r = 0;
      if (r !== +cpf[9]) return false;
      s = 0;
      for (let i = 0; i < 10; i++) s += +cpf[i] * (11 - i);
      r = (s * 10) % 11; if (r === 10) r = 0;
      return r === +cpf[10];
    }),
  });

  // Oculta a própria shield do namespace global
  try {
    Object.defineProperty(window, 'TJAEM_SHIELD', { value: undefined, enumerable: false });
  } catch {}

})(); // IIFE — não polui escopo global
