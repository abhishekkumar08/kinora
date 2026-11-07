import { useEffect, useState } from 'react';
import { actions, useProfileData } from '../store.js';
import { navigate, setQuery } from '../router.jsx';
import { formatDuration } from '../lib.js';
import * as Icon from './Icons.jsx';

export const Wordmark = ({ height = 30 }) => (
  <span className="wordmark" style={{ fontSize: height }}>KINORA</span>
);

export const Avatar = ({ profile, size = 32 }) => (
  <span className="avatar" style={{ width: size, height: size, background: `linear-gradient(135deg, ${profile.color}, #111 140%)`, fontSize: size * 0.5 }}>
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="34" cy="6" r="14" fill="rgba(255,255,255,.14)" />
      <path d="M-4 40 L20 22 L44 40 Z" fill="rgba(0,0,0,.18)" />
    </svg>
    <b className="avatar-initial">{(profile.name || '?').trim().charAt(0).toUpperCase() || '?'}</b>
    {profile.kids && <span className="avatar-kids">kids</span>}
  </span>
);

export const Maturity = ({ value, big }) => <span className={`maturity${big ? ' big' : ''}`}>{value}</span>;

export function Meta({ title }) {
  return (
    <div className="meta">
      {title.isNew && <span className="meta-new">New</span>}
      <Maturity value={title.maturity} />
      <span>{title.type === 'series' ? `${title.seasons.length} Season${title.seasons.length > 1 ? 's' : ''}` : formatDuration(title.minutes)}</span>
      <span className="hd">HD</span>
    </div>
  );
}

export const Genres = ({ title }) => (
  <div className="genres">{title.tags.concat(title.genres[0]).map((g, i) => <span key={g}>{i > 0 && <i>•</i>}{g}</span>)}</div>
);

export const CircleButton = ({ label, onClick, children, className = '' }) => (
  <button type="button" className={`circle-btn ${className}`} aria-label={label} title={label} onClick={e => { e.stopPropagation(); onClick?.(e); }}>{children}</button>
);

export function ListButton({ title }) {
  const { myList } = useProfileData();
  const inList = myList.includes(title.id);
  return (
    <CircleButton label={inList ? 'Remove from My List' : 'Add to My List'} onClick={() => actions.toggleList(title.id)}>
      {inList ? <Icon.Check size={20} /> : <Icon.Plus size={20} />}
    </CircleButton>
  );
}

const RATINGS = [[-1, 'Not for me', Icon.ThumbDown], [1, 'I like this', Icon.ThumbUp], [2, 'Love this!', Icon.ThumbsLove]];

export function RateButton({ title }) {
  const { ratings } = useProfileData();
  const [open, setOpen] = useState(false);
  const current = ratings[title.id] || 0;
  const [, , CurrentIcon] = RATINGS.find(r => r[0] === current) || RATINGS[1];
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 2500);
    return () => clearTimeout(t);
  }, [open]);
  return (
    <span className="rate" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <CircleButton label="Rate" className={current ? 'rated' : ''} onClick={() => setOpen(o => !o)}>
        <CurrentIcon size={current === 2 ? 22 : 18} />
      </CircleButton>
      {open && (
        <span className="rate-pop" role="menu">
          {RATINGS.map(([v, label, R]) => (
            <button key={v} type="button" role="menuitemradio" aria-checked={current === v} aria-label={label} title={label}
              className={current === v ? 'on' : ''} onClick={e => { e.stopPropagation(); actions.rate(title.id, v); setOpen(false); }}>
              <R size={v === 2 ? 24 : 20} />
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

export const playPath = (title, s, e) => title.type === 'series' ? `/watch/${title.id}?s=${s || 1}&e=${e || 1}` : `/watch/${title.id}`;
export const openDetails = id => setQuery('jbv', id);
export const play = (title, s, e) => navigate(playPath(title, s, e));

let muted = (() => { try { return localStorage.getItem('kinora:muted') !== '0'; } catch { return true; } })();
const muteSubs = new Set();
export function useMuted() {
  const [m, setM] = useState(muted);
  useEffect(() => { muteSubs.add(setM); return () => muteSubs.delete(setM); }, []);
  const set = v => { muted = v; try { localStorage.setItem('kinora:muted', v ? '1' : '0'); } catch { /* ignore */ } muteSubs.forEach(f => f(v)); };
  return [m, set];
}

export function MuteButton({ className = '' }) {
  const [m, setM] = useMuted();
  return (
    <CircleButton className={`mute ${className}`} label={m ? 'Turn audio on' : 'Turn audio off'} onClick={() => setM(!m)}>
      {m ? <Icon.VolumeOff size={20} /> : <Icon.VolumeOn size={20} />}
    </CircleButton>
  );
}
