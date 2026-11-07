import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grantLicense, b64url } from './license.js';

const keys = { bbb: { kid: '00112233445566778899aabbccddeeff', key: 'ffeeddccbbaa99887766554433221100' } };
const titles = {
  calm: { id: 'calm', maturity: 'U', drm: 'bbb' },
  dark: { id: 'dark', maturity: 'A', drm: 'bbb' },
  open: { id: 'open', maturity: 'U' },
};
const kid = b64url('00112233445566778899aabbccddeeff');
const body = JSON.stringify({ kids: [kid], type: 'temporary' });
const ask = (headers, b = body) => grantLicense({ body: b, headers, keys, titles });
const signedIn = { 'x-kinora-session': 'demo@kinora.test' };

test('grants the title key as a ClearKey JSON Web Key set', () => {
  const r = ask({ ...signedIn, 'x-kinora-title': 'calm' });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { keys: [{ kty: 'oct', kid, k: b64url('ffeeddccbbaa99887766554433221100') }], type: 'temporary' });
});

test('refuses without a session', () => {
  assert.equal(ask({ 'x-kinora-title': 'calm' }).status, 401);
});

test('refuses unknown or unprotected titles', () => {
  assert.equal(ask({ ...signedIn, 'x-kinora-title': 'nope' }).status, 404);
  assert.equal(ask({ ...signedIn, 'x-kinora-title': 'open' }).status, 404);
});

test('kids profiles cannot license titles above U/A 7+', () => {
  assert.equal(ask({ ...signedIn, 'x-kinora-title': 'dark', 'x-kinora-kids': '1' }).status, 403);
  assert.equal(ask({ ...signedIn, 'x-kinora-title': 'calm', 'x-kinora-kids': '1' }).status, 200);
});

test('refuses key ids that do not belong to the title, and bad bodies', () => {
  const other = JSON.stringify({ kids: [b64url('ffffffffffffffffffffffffffffffff')] });
  assert.equal(ask({ ...signedIn, 'x-kinora-title': 'calm' }, other).status, 403);
  assert.equal(ask({ ...signedIn, 'x-kinora-title': 'calm' }, 'not json').status, 400);
});
