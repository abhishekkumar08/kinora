import { test } from 'node:test';
import assert from 'node:assert/strict';
import { continueWatching, nextEpisode, allowedFor, searchTitles, formatDuration, formatClock } from './lib.js';

const movie = { id: 'm1', title: 'Glass Harbor', type: 'movie', maturity: 'U/A 16+', genres: ['Thriller'], cast: ['Ira Vale'], tags: ['Dark'] };
const show = { id: 's1', title: 'Low Orbit', type: 'series', maturity: 'U/A 7+', genres: ['Sci-Fi'], cast: [], tags: [],
  seasons: [{ n: 1, episodes: [{ n: 1 }, { n: 2 }] }, { n: 2, episodes: [{ n: 1 }] }] };
const byId = { m1: movie, s1: show };

test('continueWatching: newest first, drops finished and barely-started', () => {
  const rows = continueWatching({
    'm1': { titleId: 'm1', pos: 600, dur: 6000, at: 1 },
    's1:1:2': { titleId: 's1', s: 1, e: 2, pos: 300, dur: 1500, at: 3 },
    'x:old': { titleId: 's1', s: 1, e: 1, pos: 1490, dur: 1500, at: 2 },
    'gone': { titleId: 'nope', pos: 100, dur: 200, at: 4 },
    'tiny': { titleId: 'm1', pos: 4, dur: 6000, at: 5 },
  }, byId);
  assert.deepEqual(rows.map(r => [r.title.id, r.s ?? null, r.e ?? null]), [['s1', 1, 2], ['m1', null, null]]);
  assert.equal(rows[0].progress, 0.2);
});

test('continueWatching: one entry per title, the latest episode wins', () => {
  const rows = continueWatching({
    'a': { titleId: 's1', s: 1, e: 1, pos: 100, dur: 1500, at: 1 },
    'b': { titleId: 's1', s: 2, e: 1, pos: 100, dur: 1500, at: 2 },
  }, byId);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].s, 2);
});

test('nextEpisode walks into the next season and stops at the end', () => {
  assert.deepEqual(nextEpisode(show, 1, 1), { s: 1, e: 2 });
  assert.deepEqual(nextEpisode(show, 1, 2), { s: 2, e: 1 });
  assert.equal(nextEpisode(show, 2, 1), null);
  assert.equal(nextEpisode(movie), null);
});

test('kids profiles only see titles rated U/A 7+ or lower', () => {
  assert.equal(allowedFor({ kids: true }, show), true);
  assert.equal(allowedFor({ kids: true }, movie), false);
  assert.equal(allowedFor({ kids: false }, movie), true);
});

test('search matches title, genre, cast and tags, case-insensitive', () => {
  const all = [movie, show];
  assert.deepEqual(searchTitles(all, 'orbit').map(t => t.id), ['s1']);
  assert.deepEqual(searchTitles(all, 'ira').map(t => t.id), ['m1']);
  assert.deepEqual(searchTitles(all, 'sci-fi').map(t => t.id), ['s1']);
  assert.deepEqual(searchTitles(all, '  ').map(t => t.id), []);
});

test('formatting', () => {
  assert.equal(formatDuration(112), '1h 52m');
  assert.equal(formatDuration(45), '45m');
  assert.equal(formatClock(3723), '1:02:03');
  assert.equal(formatClock(65), '1:05');
  assert.equal(formatClock(NaN), '0:00');
});
