/**
 * TJAEM Dev Server
 * Serve app_build/ com suporte a /master e /automation
 * Execute: node serve.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = path.join(__dirname, 'app_build');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]; // strip query string

  // Normalize trailing slash
  if (urlPath !== '/' && urlPath.endsWith('/')) urlPath = urlPath.slice(0, -1);

  // Map root to app_build/index.html
  if (urlPath === '' || urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  let resolved = filePath;

  // Try exact file first
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    return serve(res, resolved);
  }

  // Try as directory → index.html
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    const dirIndex = path.join(resolved, 'index.html');
    if (fs.existsSync(dirIndex)) return serve(res, dirIndex);
  }

  // Try adding .html
  if (fs.existsSync(resolved + '.html')) return serve(res, resolved + '.html');

  // SPA fallback → app_build/index.html
  const fallback = path.join(ROOT, 'index.html');
  if (fs.existsSync(fallback)) return serve(res, fallback);

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 – Not Found');
});

function serve(res, filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const data = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mime });
  res.end(data);
}

server.listen(PORT, () => {
  console.log(`\n✅ TJAEM Dev Server rodando em http://localhost:${PORT}`);
  console.log(`   Dashboard  → http://localhost:${PORT}/`);
  console.log(`   Master     → http://localhost:${PORT}/master/`);
  console.log(`   Automation → http://localhost:${PORT}/automation/`);
  console.log('\nPressione Ctrl+C para parar.\n');
});
