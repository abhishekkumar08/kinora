import { useEffect, useRef, useState } from 'react';
import { img } from '../catalog.js';
import { useStream } from '../useStream.js';
import { useLocation } from '../router.jsx';
import { CircleButton, Maturity, MuteButton, openDetails, play, useMuted } from './Shared.jsx';
import * as Icon from './Icons.jsx';

const TRAILER_SECONDS = 45;

export function Billboard({ title }) {
  const box = useRef(null);
  const video = useRef(null);
  const [phase, setPhase] = useState('image');
  const [visible, setVisible] = useState(true);
  const [muted] = useMuted();
  const { query } = useLocation();
  const modalOpen = query.has('jbv');

  useEffect(() => {
    setPhase('image');
    const t = setTimeout(() => setPhase('loading'), 2500);
    return () => clearTimeout(t);
  }, [title.id]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  useStream(video, title.stream, { startAt: title.previewAt, enabled: phase !== 'image' && phase !== 'ended', titleId: title.id });

  useEffect(() => {
    const v = video.current;
    if (!v || (phase !== 'loading' && phase !== 'playing')) return;
    v.muted = muted;
    if (visible && !modalOpen && !document.hidden) v.play().catch(() => { v.muted = true; v.play().catch(() => setPhase('ended')); });
    else v.pause();
  }, [phase, visible, modalOpen, muted]);

  const onTime = () => {
    const v = video.current;
    if (phase === 'loading' && v.currentTime > title.previewAt + 0.2) setPhase('playing');
    if (v.currentTime > title.previewAt + TRAILER_SECONDS) setPhase('ended');
  };

  return (
    <section className={`billboard ${phase}`} ref={box} aria-label={`Featured: ${title.title}`}>
      <img className="billboard-img" src={img(title.id, 1600, 900)} alt="" />
      <video ref={video} className="billboard-video" playsInline muted onTimeUpdate={onTime} onEnded={() => setPhase('ended')} />
      <div className="billboard-shade" />
      <div className="billboard-info">
        <h1 className="title-logo" style={{ fontFamily: `'${title.font}', sans-serif` }}>{title.title}</h1>
        {title.original && <p className="billboard-kicker">A Kinora Original {title.type === 'series' ? 'Series' : 'Film'}</p>}
        <p className="billboard-synopsis">{title.synopsis}</p>
        <div className="billboard-actions">
          <button type="button" className="btn btn-play" onClick={() => play(title)}><Icon.Play size={22} /> Play</button>
          <button type="button" className="btn btn-more" onClick={() => openDetails(title.id)}><Icon.Info size={22} /> More Info</button>
        </div>
      </div>
      <div className="billboard-side">
        {phase === 'ended'
          ? <CircleButton label="Replay trailer" onClick={() => setPhase('loading')}><Icon.Replay size={20} /></CircleButton>
          : phase === 'playing' && <MuteButton />}
        <Maturity value={title.maturity} big />
      </div>
    </section>
  );
}
