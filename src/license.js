import { MATURITY } from './lib.js';

export const b64url = hex => Buffer.from(hex, 'hex').toString('base64url');

const deny = (status, error) => ({ status, json: { error } });

export function grantLicense({ body, headers, keys, titles }) {
  if (!headers['x-kinora-session']) return deny(401, 'Sign in to play this title.');
  const title = titles[headers['x-kinora-title']];
  const entry = title?.drm && keys[title.drm];
  if (!entry) return deny(404, 'No protected stream for this title.');
  if (headers['x-kinora-kids'] === '1' && MATURITY.indexOf(title.maturity) > MATURITY.indexOf('U/A 7+')) {
    return deny(403, 'This title is not available on a Kids profile.');
  }
  let req;
  try { req = JSON.parse(body); } catch { return deny(400, 'Malformed license request.'); }
  const kid = b64url(entry.kid);
  if (!Array.isArray(req?.kids) || !req.kids.includes(kid)) return deny(403, 'Key not issued for this title.');
  return { status: 200, json: { keys: [{ kty: 'oct', kid, k: b64url(entry.key) }], type: req.type || 'temporary' } };
}
