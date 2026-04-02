import http from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const HTML_DIR = path.join(ROOT, 'html');
const OUT_DIR = path.join(ROOT, 'artifacts', 'screenshots');

function log(msg) {
  process.stdout.write(`${msg}\n`);
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
  if (ext === '.ttf') return 'font/ttf';
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

function getChangedHtmlFilesFromGitHubEvent() {
  // In GitHub Actions we can diff against the previous commit.
  // Fallback to all html/*.html if diff isn't available.
  try {
    const out = execSync('git diff --name-only HEAD^ HEAD --diff-filter=ACM', {
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

function listAllHtmlFiles() {
  if (!existsSync(HTML_DIR)) return [];
  const entries = [];
  for (const name of ['index.html']) {
    const p = path.join(HTML_DIR, name);
    if (existsSync(p)) entries.push(`html/${name}`);
  }
  // naive recursive listing without fs.readdir recursion noise:
  // since this folder is flat for .html files, just glob by extension using git.
  try {
    const out = execSync('git ls-files "html/*.html"', { encoding: 'utf8' }).trim();
    if (!out) return entries;
    return out.split('\n').filter(Boolean);
  } catch {
    return entries;
  }
}

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
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
    } catch {
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

function slugFromHtmlPath(p) {
  return p.replace(/^html\//, '').replace(/\.html$/, '');
}

async function main() {
  ensureDir(OUT_DIR);

  const changed = getChangedHtmlFilesFromGitHubEvent();
  const targets = changed.length ? changed : listAllHtmlFiles();

  writeFileSync(path.join(OUT_DIR, 'targets.json'), JSON.stringify({ targets }, null, 2), 'utf8');

  if (targets.length === 0) {
    log('[ci:screenshots] No targets found.');
    return;
  }

  const { server, port } = await startStaticServer();
  const base = `http://127.0.0.1:${port}`;

  // In CI we install Playwright browsers.
  // Locally (behind corporate SSL), downloads may fail; fallback to the system Chrome channel.
  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    log('[ci:screenshots] Playwright bundled Chromium missing. Trying system Chrome channel…');
    browser = await chromium.launch({ channel: 'chrome' });
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const results = [];
  for (const file of targets) {
    const url = `${base}/${file.replace(/^html\//, '')}`;
    const slug = slugFromHtmlPath(file);
    const outPng = path.join(OUT_DIR, `${slug}.png`);

    log(`[ci:screenshots] Rendering ${file}`);
    const resp = await page.goto(url, { waitUntil: 'networkidle' });
    const status = resp?.status() ?? 0;
    await page.waitForTimeout(300); // allow layout settle
    await page.screenshot({ path: outPng, fullPage: true });

    results.push({ file, url, status, outPng: path.relative(ROOT, outPng) });
  }

  await browser.close();
  server.close();

  writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify({ results }, null, 2), 'utf8');
  log(`[ci:screenshots] Done. Wrote ${results.length} screenshots to ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch((e) => {
  process.stderr.write(`[ci:screenshots] Failed: ${e?.message ?? String(e)}\n`);
  process.exitCode = 1;
});

