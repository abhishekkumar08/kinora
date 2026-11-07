import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { img } from '../catalog.js';
import { useStream } from '../useStream.js';
import { formatClock } from '../lib.js';
import { CircleButton, Genres, ListButton, Meta, MuteButton, RateButton, openDetails, play, useMuted } from './Shared.jsx';
import * as Icon from './Icons.jsx';

const OPEN_DELAY = 500;
const PREVIEW_DELAY = 800;

function HoverCard({ entry, onClose }) {
  const { title, rect, progress } = entry;
  const ref = useRef(null);
  const video = useRef(null);
  const [shown, setShown] = useState(false);
  const [preview, setPreview] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted] = useMuted();

  const w = Math.round(rect.width * 1.5);
  const mediaH = Math.round(w * 9 / 16);
  const left = Math.min(Math.max(rect.left + rect.width / 2 - w / 2, 36), innerWidth - 36 - w);
  const top = rect.top + scrollY - (mediaH - rect.height) / 2;
  const origin = `${rect.left + rect.width / 2 - left}px ${mediaH / 2}px`;

  useLayoutEffect(() => { const r = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(r); }, []);
  useEffect(() => { const t = setTimeout(() => setPreview(true), PREVIEW_DELAY); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const close = () => onClose();
    addEventListener('scroll', close, { passive: true });
    return () => removeEventListener('scroll', close);
  }, [onClose]);

  useStream(video, title.stream, { startAt: title.previewAt, enabled: preview, capLevel: true, titleId: title.id });
  useEffect(() => {
    const v = video.current;
    if (!v || !preview) return;
    v.muted = muted;
    v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
  }, [preview, muted]);

  const ep = entry.s ? `S${entry.s}:E${entry.e}` : null;

  return createPortal(
    <div ref={ref} className={`hover-card${shown ? ' shown' : ''}`} style={{ left, top, width: w, transformOrigin: origin }}
      onMouseLeave={onClose} role="dialog" aria-label={title.title}>
      <div className="hover-media" style={{ height: mediaH }} onClick={() => play(title, entry.s, entry.e)}>
        <img src={img(title.id, 640, 360)} alt="" />
        <video ref={video} className={playing ? 'on' : ''} muted playsInline loop
          onTimeUpdate={e => !playing && e.currentTarget.currentTime > title.previewAt + 0.2 && setPlaying(true)} />
        {!playing && <span className="card-title" style={{ fontFamily: `'${title.font}', sans-serif` }}>{title.title}</span>}
        {playing && <MuteButton className="hover-mute" />}
      </div>
      <div className="hover-info">
        <div className="hover-controls">
          <CircleButton label="Play" className="play" onClick={() => play(title, entry.s, entry.e)}><Icon.Play size={20} /></CircleButton>
          <ListButton title={title} />
          <RateButton title={title} />
          <CircleButton label="Episodes and info" className="expand" onClick={() => { onClose(); openDetails(title.id); }}><Icon.ChevronDown size={20} /></CircleButton>
        </div>
        {progress != null ? (
          <div className="hover-progress">
            <span className="bar"><span style={{ width: `${progress * 100}%` }} /></span>
            <span>{ep && <b>{ep} </b>}{formatClock(entry.dur - entry.pos)} left</span>
          </div>
        ) : <Meta title={title} />}
        <Genres title={title} />
      </div>
    </div>,
    document.body,
  );
}

function useHover() {
  const [entry, setEntry] = useState(null);
  const timer = useRef();
  const enter = (el, data) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setEntry({ ...data, rect: el.getBoundingClientRect() }), OPEN_DELAY);
  };
  const leave = () => clearTimeout(timer.current);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { entry, enter, leave, close: () => setEntry(null) };
}

const RankNumber = ({ n }) => (
  <svg className="rank-num" viewBox="0 0 100 150" aria-hidden="true">
    <text x={n === 10 ? 4 : 50} y="138" textAnchor={n === 10 ? 'start' : 'middle'} fontSize={n === 10 ? 118 : 150}>{n}</text>
  </svg>
);

function Card({ item, ranked, hover }) {
  const { title } = item;
  const el = useRef(null);
  return (
    <button ref={el} type="button" className={`card${ranked ? ' ranked' : ''}`} aria-label={title.title}
      onMouseEnter={() => hover.enter(el.current, item)} onMouseLeave={hover.leave}
      onClick={() => openDetails(title.id)}>
      {ranked ? (
        <>
          <RankNumber n={ranked} />
          <img className="poster" src={img(title.id, 300, 450)} alt="" loading="lazy" />
        </>
      ) : (
        <>
          <img src={img(title.id, 640, 360)} alt="" loading="lazy" />
          <span className="card-title" style={{ fontFamily: `'${title.font}', sans-serif` }}>{title.title}</span>
          {title.original && <span className="card-mark">K</span>}
          {title.isNew && !item.progress && <span className="card-badge">Recently added</span>}
          {item.progress != null && <span className="card-progress"><span style={{ width: `${item.progress * 100}%` }} /></span>}
        </>
      )}
    </button>
  );
}

export function Row({ title, items, ranked }) {
  const scroller = useRef(null);
  const [page, setPage] = useState({ i: 0, n: 1 });
  const hover = useHover();

  const measure = () => {
    const s = scroller.current;
    if (!s) return;
    const n = Math.max(1, Math.ceil((s.scrollWidth - 8) / s.clientWidth - 0.05));
    setPage({ i: Math.round(s.scrollLeft / s.clientWidth), n });
  };
  useEffect(() => { measure(); addEventListener('resize', measure); return () => removeEventListener('resize', measure); }, [items.length]);

  const go = dir => scroller.current.scrollBy({ left: dir * (scroller.current.clientWidth - 72), behavior: 'smooth' });

  if (!items.length) return null;
  return (
    <section className="row" aria-label={title}>
      <div className="row-head">
        <h2>{title}</h2>
        {page.n > 1 && <span className="row-pages" aria-hidden="true">{Array.from({ length: page.n }, (_, i) => <i key={i} className={i === page.i ? 'on' : ''} />)}</span>}
      </div>
      <div className="row-body">
        {page.i > 0 && <button type="button" className="row-arrow left" aria-label="Previous titles" onClick={() => go(-1)}><Icon.ChevronLeft size={28} /></button>}
        <div className="row-scroller" ref={scroller} onScroll={measure}>
          {items.map((item, i) => <Card key={item.title.id + (item.s || '')} item={item} ranked={ranked ? i + 1 : 0} hover={hover} />)}
        </div>
        {page.i < page.n - 1 && <button type="button" className="row-arrow right" aria-label="See more titles" onClick={() => go(1)}><Icon.ChevronRight size={28} /></button>}
      </div>
      {hover.entry && <HoverCard key={hover.entry.title.id} entry={hover.entry} onClose={hover.close} />}
    </section>
  );
}

export function Grid({ items, title, empty }) {
  const hover = useHover();
  return (
    <section className="grid-page">
      {title && <h1 className="grid-title">{title}</h1>}
      {items.length ? (
        <div className="grid">{items.map(item => <Card key={item.title.id} item={item} hover={hover} />)}</div>
      ) : empty}
      {hover.entry && <HoverCard key={hover.entry.title.id} entry={hover.entry} onClose={hover.close} />}
    </section>
  );
}
