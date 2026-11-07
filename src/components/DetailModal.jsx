import { useEffect, useMemo, useRef, useState } from 'react';
import { BY_ID, TITLES, TOP10_MOVIES, TOP10_SHOWS, img } from '../catalog.js';
import { useStream } from '../useStream.js';
import { setQuery } from '../router.jsx';
import { useProfile, useProfileData } from '../store.js';
import { allowedFor, continueWatching, formatDuration } from '../lib.js';
import { ListButton, Maturity, MuteButton, RateButton, play, useMuted } from './Shared.jsx';
import * as Icon from './Icons.jsx';

const REASONS = { U: 'suitable for all', 'U/A 7+': 'mild peril', 'U/A 13+': 'language, violence', 'U/A 16+': 'violence, language, threat', A: 'violence, language, sex, substances' };

const close = () => setQuery('jbv', null);

function Header({ title, resume }) {
  const video = useRef(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [muted] = useMuted();
  useEffect(() => { const t = setTimeout(() => setOn(true), 1000); return () => clearTimeout(t); }, []);
  useStream(video, title.stream, { startAt: title.previewAt, enabled: on, titleId: title.id });
  useEffect(() => {
    const v = video.current;
    if (!on || !v) return;
    v.muted = muted;
    v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
  }, [on, muted]);

  return (
    <div className="modal-head">
      <img src={img(title.id, 1280, 720)} alt="" />
      <video ref={video} className={ready ? 'on' : ''} playsInline muted loop
        onTimeUpdate={e => !ready && e.currentTarget.currentTime > title.previewAt + 0.2 && setReady(true)} />
      <div className="modal-head-shade" />
      <div className="modal-head-info">
        <h2 className="title-logo" style={{ fontFamily: `'${title.font}', sans-serif` }}>{title.title}</h2>
        <div className="modal-actions">
          <button type="button" className="btn btn-play rect" onClick={() => play(title, resume?.s, resume?.e)}>
            <Icon.Play size={24} /> {resume ? 'Resume' : 'Play'}
          </button>
          <ListButton title={title} />
          <RateButton title={title} />
          {ready && <MuteButton className="modal-mute" />}
        </div>
        {resume && (
          <div className="modal-resume">
            <span className="bar"><span style={{ width: `${resume.progress * 100}%` }} /></span>
            <span>{Math.max(1, Math.round((resume.dur - resume.pos) / 60))} of {Math.round(resume.dur / 60)}m</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Episodes({ title, resume }) {
  const [season, setSeason] = useState(resume?.s || 1);
  const { bookmarks } = useProfileData();
  const s = title.seasons.find(x => x.n === season);
  return (
    <section className="episodes">
      <div className="episodes-head">
        <h3>Episodes</h3>
        {title.seasons.length > 1 ? (
          <select value={season} onChange={e => setSeason(Number(e.target.value))} aria-label="Season">
            {title.seasons.map(x => <option key={x.n} value={x.n}>Season {x.n} ({x.episodes.length} Episodes)</option>)}
          </select>
        ) : <span className="episodes-season">{title.title}</span>}
      </div>
      <p className="episodes-sub">Season {season}: <Maturity value={title.maturity} /> {REASONS[title.maturity]}</p>
      <ol className="episode-list">
        {s.episodes.map(ep => {
          const b = bookmarks[`${title.id}:${season}:${ep.n}`];
          const active = resume && resume.s === season && resume.e === ep.n;
          return (
            <li key={ep.n}>
              <button type="button" className={`episode${active ? ' active' : ''}`} onClick={() => play(title, season, ep.n)}>
                <span className="episode-n">{ep.n}</span>
                <span className="episode-thumb">
                  <img src={img(`${title.id}-s${season}e${ep.n}`, 260, 146)} alt="" loading="lazy" />
                  <span className="episode-play"><Icon.Play size={20} /></span>
                  {b?.dur > 0 && <span className="card-progress"><span style={{ width: `${Math.min(1, b.pos / b.dur) * 100}%` }} /></span>}
                </span>
                <span className="episode-text">
                  <span className="episode-top"><b>{ep.name}</b><span>{ep.minutes}m</span></span>
                  <span className="episode-syn">{ep.synopsis}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function MoreLikeThis({ title, profile }) {
  const [all, setAll] = useState(false);
  const similar = useMemo(() => TITLES
    .filter(t => t.id !== title.id && allowedFor(profile, t))
    .map(t => ({ t, score: t.genres.filter(g => title.genres.includes(g)).length * 2 + t.tags.filter(g => title.tags.includes(g)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12).map(x => x.t), [title, profile]);
  return (
    <section className="similar">
      <h3>More Like This</h3>
      <div className={`similar-grid${all ? '' : ' collapsed'}`}>
        {similar.map(t => (
          <div key={t.id} className="similar-card" role="button" tabIndex={0} onClick={() => setQuery('jbv', t.id)} onKeyDown={e => e.key === 'Enter' && setQuery('jbv', t.id)}>
            <div className="similar-img">
              <img src={img(t.id, 400, 225)} alt="" loading="lazy" />
              <span className="similar-dur">{t.type === 'series' ? `${t.seasons.length} Season${t.seasons.length > 1 ? 's' : ''}` : formatDuration(t.minutes)}</span>
              <span className="card-title" style={{ fontFamily: `'${t.font}', sans-serif` }}>{t.title}</span>
              <span className="similar-play" onClick={e => { e.stopPropagation(); play(t); }}><Icon.Play size={22} /></span>
            </div>
            <div className="similar-body">
              <div className="similar-top">
                <span><Maturity value={t.maturity} /> <span className="hd">HD</span> {t.year}</span>
                <ListButton title={t} />
              </div>
              <p>{t.synopsis}</p>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className={`similar-toggle${all ? ' up' : ''}`} aria-label={all ? 'Show less' : 'Show more'} onClick={() => setAll(a => !a)}>
        <Icon.ChevronDown size={24} />
      </button>
    </section>
  );
}

export function DetailModal({ id }) {
  const title = BY_ID[id];
  const profile = useProfile();
  const { bookmarks } = useProfileData();
  const closeRef = useRef(null);
  const resume = useMemo(() => title && continueWatching(bookmarks, BY_ID).find(r => r.title.id === title.id), [bookmarks, title]);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && close();
    addEventListener('keydown', onKey);
    document.documentElement.classList.add('modal-open');
    closeRef.current?.focus({ preventScroll: true });
    return () => { removeEventListener('keydown', onKey); document.documentElement.classList.remove('modal-open'); };
  }, []);

  if (!title) return null;
  const rank = [...TOP10_SHOWS, ...TOP10_MOVIES].indexOf(title);
  const rankText = rank < 0 ? null : `#${(rank % 10) + 1} in ${title.type === 'series' ? 'Shows' : 'Movies'} Today`;

  return (
    <div className="modal-layer" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title.title}>
        <button ref={closeRef} type="button" className="modal-close" aria-label="Close" onClick={close}><Icon.Close size={22} /></button>
        <Header key={title.id} title={title} resume={resume} />
        <div className="modal-body">
          <div className="modal-details">
            <div className="modal-left">
              <div className="meta">
                {title.isNew && <span className="meta-new">New</span>}
                <span>{title.year}</span>
                <span>{title.type === 'series' ? `${title.seasons.length} Season${title.seasons.length > 1 ? 's' : ''}` : formatDuration(title.minutes)}</span>
                <span className="hd">HD</span>
              </div>
              <div className="modal-maturity"><Maturity value={title.maturity} /> <span>{REASONS[title.maturity]}</span></div>
              {rankText && <p className="modal-rank"><span className="top10">TOP<b>10</b></span>{rankText}</p>}
              <p className="modal-synopsis">{title.synopsis}</p>
            </div>
            <div className="modal-right">
              <p><span className="label">Cast: </span>{title.cast.slice(0, 3).join(', ')}, <i>more</i></p>
              <p><span className="label">Genres: </span>{title.genres.join(', ')}</p>
              <p><span className="label">This {title.type === 'series' ? 'show' : 'movie'} is: </span>{title.tags.join(', ')}</p>
            </div>
          </div>
          {title.type === 'series' && <Episodes key={title.id} title={title} resume={resume} />}
          <MoreLikeThis title={title} profile={profile} />
          <section className="about">
            <h3>About <b>{title.title}</b></h3>
            <p><span className="label">{title.type === 'series' ? 'Creator' : 'Director'}: </span>{title.creators.join(', ')}</p>
            <p><span className="label">Cast: </span>{title.cast.join(', ')}</p>
            <p><span className="label">Genres: </span>{title.genres.join(', ')}</p>
            <p><span className="label">This {title.type === 'series' ? 'show' : 'movie'} is: </span>{title.tags.join(', ')}</p>
            <p><span className="label">Maturity rating: </span><Maturity value={title.maturity} /> {REASONS[title.maturity]}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
