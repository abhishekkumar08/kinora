export const MATURITY = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A'];

export const allowedFor = (profile, title) =>
  !profile?.kids || MATURITY.indexOf(title.maturity) <= MATURITY.indexOf('U/A 7+');

export function continueWatching(bookmarks, byId) {
  const latest = new Map();
  for (const b of Object.values(bookmarks || {})) {
    const title = byId[b.titleId];
    if (!title || !b.dur || b.pos < 10) continue;
    const prev = latest.get(b.titleId);
    if (!prev || b.at > prev.at) latest.set(b.titleId, { ...b, title });
  }
  return [...latest.values()]
    .filter(b => b.pos / b.dur < 0.95)
    .sort((a, b) => b.at - a.at)
    .map(({ title, s, e, pos, dur }) => ({ title, s, e, pos, dur, progress: pos / dur }));
}

export function nextEpisode(title, s, e) {
  if (title.type !== 'series') return null;
  const si = title.seasons.findIndex(x => x.n === s);
  const season = title.seasons[si];
  if (!season) return null;
  if (season.episodes.some(x => x.n === e + 1)) return { s, e: e + 1 };
  const next = title.seasons[si + 1];
  return next ? { s: next.n, e: next.episodes[0].n } : null;
}

export function searchTitles(titles, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return titles.filter(t =>
    [t.title, ...t.genres, ...t.cast, ...t.tags].some(f => f.toLowerCase().includes(needle)));
}

export function formatDuration(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatClock(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const s = Math.floor(sec % 60), m = Math.floor(sec / 60) % 60, h = Math.floor(sec / 3600);
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
