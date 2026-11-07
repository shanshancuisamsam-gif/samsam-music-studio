import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const root = resolve('.');
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const host = option('--host', '127.0.0.1');
const port = Number(option('--port', process.env.PORT || '5173'));
if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('Invalid port');
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const file = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + sep) || !types[extname(file)]) throw Error();
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] });
    res.end(bytes);
  } catch { res.writeHead(404).end(); }
}).listen(port, host, function () {
  console.log(`Music Lab • http://${host}:${this.address().port}`);
});
