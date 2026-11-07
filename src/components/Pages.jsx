import { useMemo } from 'react';
import { BILLBOARDS, BY_ID, ROWS, TITLES, TOP10_MOVIES, TOP10_SHOWS } from '../catalog.js';
import { useProfile, useProfileData } from '../store.js';
import { allowedFor, continueWatching, searchTitles } from '../lib.js';
import { setQuery } from '../router.jsx';
import { Billboard } from './Billboard.jsx';
import { Grid, Row } from './Row.jsx';

const KINDS = { shows: 'series', movies: 'movie' };
const wrap = titles => titles.map(title => ({ title }));

function useRows(kind) {
  const profile = useProfile();
  const { myList, bookmarks } = useProfileData();
  return useMemo(() => {
    const ok = t => allowedFor(profile, t) && (!KINDS[kind] || t.type === KINDS[kind]);
    return ROWS.map(r => {
      if (r.dynamic === 'continue') return { ...r, items: continueWatching(bookmarks, BY_ID).filter(x => ok(x.title)) };
      if (r.dynamic === 'mylist') return { ...r, items: wrap(myList.map(id => BY_ID[id]).filter(t => t && ok(t))) };
      return { ...r, items: wrap(r.items.filter(ok)) };
    }).filter(r => r.items.length >= (r.ranked ? 5 : 1));
  }, [profile, myList, bookmarks, kind]);
}

function featured(kind, profile) {
  const pick = BY_ID[BILLBOARDS[kind]];
  if (pick && allowedFor(profile, pick)) return pick;
  return TITLES.find(t => allowedFor(profile, t) && (!KINDS[kind] || t.type === KINDS[kind]));
}

export function Browse({ kind = 'home' }) {
  const profile = useProfile();
  const rows = useRows(kind);
  const hero = featured(kind, profile);
  return (
    <main className="browse">
      {kind !== 'home' && <h1 className="page-heading">{kind === 'shows' ? 'Shows' : 'Movies'}</h1>}
      {hero && <Billboard key={hero.id} title={hero} />}
      <div className="rows">{rows.map(r => <Row key={r.id} title={r.title} items={r.items} ranked={r.ranked} />)}</div>
    </main>
  );
}

export function Latest() {
  const profile = useProfile();
  const ok = t => allowedFor(profile, t);
  const rows = [
    { id: 'new', title: 'New on Kinora', items: TITLES.filter(t => t.year >= 2025 && ok(t)) },
    { id: 'tshows', title: 'Top 10 Shows in India Today', items: TOP10_SHOWS.filter(ok), ranked: true },
    { id: 'tmovies', title: 'Top 10 Movies in India Today', items: TOP10_MOVIES.filter(ok), ranked: true },
    { id: 'soon', title: 'Worth the Wait', items: TITLES.filter(t => t.isNew && ok(t)) },
  ].filter(r => r.items.length >= (r.ranked ? 5 : 1));
  return (
    <main className="browse latest">
      <h1 className="page-heading">New & Popular</h1>
      <div className="rows">{rows.map(r => <Row key={r.id} title={r.title} items={wrap(r.items)} ranked={r.ranked} />)}</div>
    </main>
  );
}

export function MyList() {
  const profile = useProfile();
  const { myList } = useProfileData();
  const items = wrap(myList.map(id => BY_ID[id]).filter(t => t && allowedFor(profile, t)));
  return (
    <main className="browse">
      <Grid title="My List" items={items}
        empty={<p className="empty">You haven't added any titles to your list yet. Use the + button on any title to save it here.</p>} />
    </main>
  );
}

export function SearchPage({ q }) {
  const profile = useProfile();
  const results = searchTitles(TITLES.filter(t => allowedFor(profile, t)), q);
  const related = [...new Set(results.flatMap(t => t.genres))].slice(0, 6);
  return (
    <main className="browse search-page">
      {related.length > 0 && (
        <p className="related">Explore titles related to:
          {related.map(g => <button key={g} type="button" onClick={() => setQuery('q', g, { replace: true })}>{g}</button>)}
        </p>
      )}
      <Grid items={wrap(results)} empty={
        <div className="empty">
          <p>Your search for "{q}" did not have any matches.</p>
          <p>Suggestions:</p>
          <ul><li>Try different keywords</li><li>Looking for a movie or TV show?</li><li>Try using a movie, TV show title, an actor or director</li><li>Try a genre, like comedy, romance, sports, or drama</li></ul>
        </div>
      } />
    </main>
  );
}
