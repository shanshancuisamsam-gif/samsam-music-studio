import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const root = resolve('.');
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const file = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + sep) || !types[extname(file)]) throw Error();
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] });
    res.end(bytes);
  } catch { res.writeHead(404).end(); }
}).listen(5173, '127.0.0.1', () => console.log('YA Studio • http://localhost:5173'));
