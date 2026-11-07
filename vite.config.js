import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { grantLicense } from './src/license.js';
import { BY_ID } from './src/catalog.js';

const KEYS = new URL('./drm-keys.json', import.meta.url);

function licenseServer() {
  const handle = (req, res) => {
    if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
    let body = '';
    req.on('data', c => { body += c; if (body.length > 10_000) req.destroy(); });
    req.on('end', () => {
      const keys = existsSync(KEYS) ? JSON.parse(readFileSync(KEYS, 'utf8')) : {};
      const { status, json } = grantLicense({ body, headers: req.headers, keys, titles: BY_ID });
      console.log(`[license] ${status} ${req.headers['x-kinora-title'] || '-'}${json.error ? ` (${json.error})` : ''}`);
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(json));
    });
  };
  return {
    name: 'kinora-license',
    configureServer: s => { s.middlewares.use('/api/license', handle); },
    configurePreviewServer: s => { s.middlewares.use('/api/license', handle); },
  };
}

export default defineConfig({ plugins: [react(), licenseServer()] });
