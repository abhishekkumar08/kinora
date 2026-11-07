// usage: node scripts/package-drm.mjs <input (file, URL or lavfi spec)> <name> [seconds]
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [input, name, seconds = '180'] = process.argv.slice(2);
if (!input || !/^[a-z0-9-]+$/.test(name || '')) {
  console.error('usage: node scripts/package-drm.mjs <input> <name> [seconds]');
  process.exit(1);
}

const LADDER = [
  { h: 360, vb: '800k' },
  { h: 540, vb: '1800k' },
  { h: 720, vb: '3200k' },
];
const SEGMENT = 4;
const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'public/drm', name);
const keysFile = join(root, 'drm-keys.json');

const keys = existsSync(keysFile) ? JSON.parse(readFileSync(keysFile, 'utf8')) : {};
keys[name] ??= { kid: randomBytes(16).toString('hex'), key: randomBytes(16).toString('hex') };
const { kid, key } = keys[name];

const lavfi = input.startsWith('lavfi:');
const src = lavfi ? ['-f', 'lavfi', '-i', input.slice(6), '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000'] : ['-i', input];

const hls = (dir, extra) => execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y', ...src, '-t', seconds, ...extra,
  '-f', 'hls', '-hls_time', String(SEGMENT), '-hls_playlist_type', 'vod',
  '-hls_segment_type', 'fmp4', '-hls_flags', 'single_file',
  '-hls_segment_filename', join(dir, 'media.mp4'), join(dir, 'index.m3u8'),
], { stdio: 'inherit' });

// ffmpeg's cenc-aes-ctr output for AAC does not decrypt (video does), so audio ships clear in its own rendition.
const audioDir = join(out, 'a');
mkdirSync(audioDir, { recursive: true });
hls(audioDir, ['-map', `${lavfi ? 1 : 0}:a:0`, '-c:a', 'aac', '-b:a', '128k', '-ac', '2']);
console.log(`packaged ${name} audio (clear)`);

const kidUri = `data:text/plain;base64,${Buffer.from(kid, 'hex').toString('base64')}`;
const keyTag = `#EXT-X-KEY:METHOD=SAMPLE-AES-CTR,KEYFORMAT="org.w3.clearkey",KEYFORMATVERSIONS="1",URI="${kidUri}",KEYID=0x${kid}`;

for (const [i, r] of LADDER.entries()) {
  const dir = join(out, `v${i}`);
  mkdirSync(dir, { recursive: true });
  hls(dir, [
    '-map', '0:v:0', '-an',
    '-vf', `scale=-2:${r.h}`, '-c:v', 'libx264', '-profile:v', 'main', '-preset', 'veryfast', '-b:v', r.vb, '-maxrate', r.vb, '-bufsize', r.vb,
    '-g', String(SEGMENT * 24), '-keyint_min', String(SEGMENT * 24), '-sc_threshold', '0', '-r', '24',
    '-hls_segment_options', `encryption_scheme=cenc-aes-ctr:encryption_key=${key}:encryption_kid=${kid}`,
  ]);
  const pl = readFileSync(join(dir, 'index.m3u8'), 'utf8').replace(/(#EXT-X-MAP[^\n]*\n)/, `${keyTag}\n$1`);
  writeFileSync(join(dir, 'index.m3u8'), pl);
  console.log(`packaged ${name} ${r.h}p (encrypted)`);
}

writeFileSync(join(out, 'master.m3u8'), ['#EXTM3U', '#EXT-X-VERSION:7', '#EXT-X-INDEPENDENT-SEGMENTS',
  '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="English",LANGUAGE="en",DEFAULT=YES,AUTOSELECT=YES,CHANNELS="2",URI="a/index.m3u8"',
  ...LADDER.flatMap((r, i) => [
    `#EXT-X-STREAM-INF:BANDWIDTH=${(parseInt(r.vb) + 128) * 1000},RESOLUTION=${Math.round(r.h * 16 / 9)}x${r.h},CODECS="avc1.4d401f,mp4a.40.2",AUDIO="aud"`,
    `v${i}/index.m3u8`,
  ])].join('\n') + '\n');
writeFileSync(keysFile, JSON.stringify(keys, null, 2) + '\n');
console.log(`done: public/drm/${name}/master.m3u8 (kid ${kid})`);
