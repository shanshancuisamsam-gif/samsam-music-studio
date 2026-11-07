import { cp, mkdir } from 'node:fs/promises';
import { checkAssets } from './check-assets.js';

await checkAssets();
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'src', 'assets', 'licenses']) {
  await cp(file, 'dist/' + file, { recursive: true });
}
