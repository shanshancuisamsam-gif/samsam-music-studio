import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export function validatePng(bytes, name = 'PNG') {
  if (!bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) throw Error(`${name}: invalid PNG signature`);
  let offset = 8, header, ended = false;
  const data = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) throw Error(`${name}: truncated chunk`);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) throw Error(`${name}: corrupt ${type} chunk`);
    if (type === 'IHDR') header = bytes.subarray(offset + 8, end - 4);
    if (type === 'IDAT') data.push(bytes.subarray(offset + 8, end - 4));
    offset = end;
    if (type === 'IEND') { ended = true; break; }
  }
  if (!header || !data.length || !ended || offset !== bytes.length) throw Error(`${name}: incomplete PNG`);
  const pixels = inflateSync(Buffer.concat(data));
  const width = header.readUInt32BE(0), height = header.readUInt32BE(4);
  if (!width || !height || !pixels.length) throw Error(`${name}: empty image`);
  return { width, height, colorType: header[9] };
}
export async function checkAssets() {
  const assets = await readdir(resolve(root, 'assets'));
  for (const name of assets) {
    const bytes = await readFile(resolve(root, 'assets', name));
    if (!bytes.length) throw Error(`Empty asset: ${name}`);
    if (name.endsWith('.png')) validatePng(bytes, name);
    if (name.endsWith('.webp') && (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP')) throw Error(`Invalid WebP: ${name}`);
  }
  for (const path of ['index.html', 'src/components.js']) {
    const source = await readFile(resolve(root, path), 'utf8');
    for (const [, asset] of source.matchAll(/(?:href|background)="(assets\/[^"$]+)"/g)) await readFile(resolve(root, asset));
  }
  console.log(`Validated ${assets.length} image assets and page references.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await checkAssets();
