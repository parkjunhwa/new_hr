import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { execSync, spawn } from 'node:child_process';

const ROOT = process.cwd();
const HTML_DIR = path.join(ROOT, 'html');

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function getStagedHtmlFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!out) return [];
    return out
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((p) => p.startsWith('html/') && p.endsWith('.html'));
  } catch {
    return [];
  }
}

function listAllTrackedHtmlFiles() {
  try {
    const out = execSync('git ls-files "html/*.html"', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!out) return [];
    return out
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((p) => p.startsWith('html/') && p.endsWith('.html'));
  } catch {
    return [];
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.woff') return 'font/woff';
  if (ext === '.woff2') return 'font/woff2';
  return 'application/octet-stream';
}

function safeResolveFromHtmlDir(urlPathname) {
  const decoded = decodeURIComponent(urlPathname.split('?')[0]);
  const rel = decoded.replace(/^\//, '');
  const full = path.join(HTML_DIR, rel);
  const normalized = path.normalize(full);
  if (!normalized.startsWith(HTML_DIR)) return null;
  return normalized;
}

function startStaticServer() {
  if (!existsSync(HTML_DIR) || !statSync(HTML_DIR).isDirectory()) {
    throw new Error(`Missing html directory: ${HTML_DIR}`);
  }

  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url ?? '/', 'http://localhost');
    const target =
      reqUrl.pathname === '/' ? path.join(HTML_DIR, 'index.html') : safeResolveFromHtmlDir(reqUrl.pathname);

    if (!target) {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }

    try {
      if (!existsSync(target) || !statSync(target).isFile()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const buf = readFileSync(target);
      res.writeHead(200, { 'Content-Type': contentType(target) });
      res.end(buf);
    } catch (e) {
      res.writeHead(500);
      res.end('Server error');
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') return reject(new Error('Failed to bind server'));
      resolve({ server, port: addr.port });
    });
    server.on('error', reject);
  });
}

function openUrl(url) {
  // macOS: open. (This repo is on darwin)
  try {
    spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const files = args.has('--all') ? listAllTrackedHtmlFiles() : getStagedHtmlFiles();
  if (files.length === 0) {
    log(args.has('--all') ? '[figma-sync] No tracked html/*.html files. Skipping.' : '[figma-sync] No staged html/*.html changes. Skipping.');
    return;
  }

  const { server, port } = await startStaticServer();
  const urls = files.map((p) => `http://127.0.0.1:${port}/${p.replace(/^html\//, '')}`);

  log(args.has('--all') ? '[figma-sync] Opening ALL HTML pages for Figma capture…' : '[figma-sync] Opening staged HTML pages for Figma capture…');
  log('[figma-sync] Keep the browser tabs open until capture finishes.');
  log('[figma-sync] Pages:');
  for (const u of urls) log(`  - ${u}`);

  let openedAny = false;
  for (const u of urls) openedAny = openUrl(u) || openedAny;

  if (!openedAny) {
    log('[figma-sync] Could not auto-open browser. Please open the URLs above manually.');
  }

  // We can't reliably detect "capture done" without tight integration.
  // Give a short grace period so the server stays alive while tabs load.
  await new Promise((r) => setTimeout(r, 5000));
  server.close();
  log('[figma-sync] Local server closed.');
}

main().catch((e) => {
  process.stderr.write(`[figma-sync] Failed: ${e?.message ?? String(e)}\n`);
  process.exitCode = 1;
});

