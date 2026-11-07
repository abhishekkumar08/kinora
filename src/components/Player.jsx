import { useCallback, useEffect, useRef, useState } from 'react';
import { BY_ID, img } from '../catalog.js';
import { useStream } from '../useStream.js';
import { actions, useProfileData } from '../store.js';
import { navigate } from '../router.jsx';
import { formatClock, nextEpisode } from '../lib.js';
import { playPath } from './Shared.jsx';
import * as Icon from './Icons.jsx';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];
const HIDE_AFTER = 3000;
const NEXT_PROMPT_SECONDS = 30;

const leave = title => history.length > 1 ? history.back() : navigate(`/browse?jbv=${title.id}`);

function Stats({ hls, video }) {
  const [s, setS] = useState(null);
  useEffect(() => {
    const t = setInterval(() => {
      const v = video.current;
      if (!v) return;
      const lvl = hls?.levels?.[hls.currentLevel];
      const buf = v.buffered.length ? v.buffered.end(v.buffered.length - 1) - v.currentTime : 0;
      const q = v.getVideoPlaybackQuality?.();
      setS({
        res: lvl ? `${lvl.width}x${lvl.height}` : `${v.videoWidth}x${v.videoHeight}`,
        bitrate: lvl ? `${Math.round(lvl.bitrate / 1000)} kbps` : 'native',
        levels: hls?.levels?.map(l => l.height).join(' / ') || 'native',
        auto: hls ? (hls.autoLevelEnabled ? 'auto (ABR)' : 'manual') : 'native',
        drm: hls?.config.emeEnabled ? 'ClearKey · cenc' : 'none',
        bw: hls ? `${Math.round(hls.bandwidthEstimate / 1000)} kbps` : '-',
        buffer: `${buf.toFixed(1)} s`,
        dropped: q ? `${q.droppedVideoFrames} / ${q.totalVideoFrames}` : '-',
      });
    }, 500);
    return () => clearInterval(t);
  }, [hls, video]);
  if (!s) return null;
  return <pre className="player-stats">{Object.entries(s).map(([k, v]) => `${k.padEnd(8)} ${v}`).join('\n')}</pre>;
}

export function Player({ id, s, e }) {
  const title = BY_ID[id];
  const episode = title?.type === 'series' ? title.seasons.find(x => x.n === s)?.episodes.find(x => x.n === e) : null;
  const key = title?.type === 'series' ? `${id}:${s}:${e}` : id;
  const { bookmarks } = useProfileData();
  const [startAt] = useState(() => {
    const b = bookmarks[key];
    return b && b.pos / b.dur < 0.95 ? b.pos : 0;
  });

  const shell = useRef(null);
  const video = useRef(null);
  const hideTimer = useRef();
  const [ui, setUi] = useState(true);
  const [paused, setPaused] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const [time, setTime] = useState({ cur: startAt, dur: 0, buf: 0 });
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [panel, setPanel] = useState(null);
  const [flash, setFlash] = useState(null);
  const [scrub, setScrub] = useState(null);
  const [full, setFull] = useState(false);
  const [stats, setStats] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const [blocked, setBlocked] = useState(null);
  const hls = useStream(video, title?.stream, { startAt, enabled: !!title, titleId: id, onError: setBlocked });
  const next = title ? nextEpisode(title, s, e) : null;

  const save = useCallback(() => {
    const v = video.current;
    if (!v || !v.duration || v.currentTime < 1) return;
    actions.bookmark(key, { titleId: id, s, e, pos: v.currentTime, dur: v.duration });
  }, [key, id, s, e]);

  useEffect(() => {
    const t = setInterval(() => !video.current?.paused && save(), 5000);
    addEventListener('pagehide', save);
    return () => { clearInterval(t); removeEventListener('pagehide', save); save(); };
  }, [save]);

  const poke = useCallback(() => {
    setUi(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => { if (!video.current?.paused) { setUi(false); setPanel(null); } }, HIDE_AFTER);
  }, []);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const toggle = useCallback(() => {
    const v = video.current;
    if (v.paused) { v.play(); setFlash('play'); } else { v.pause(); setFlash('pause'); }
    setTimeout(() => setFlash(null), 600);
    poke();
  }, [poke]);
  const seekBy = useCallback(d => { const v = video.current; v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + d)); setFlash(d < 0 ? 'back' : 'fwd'); setTimeout(() => setFlash(null), 600); poke(); }, [poke]);
  const setVol = useCallback(val => { const v = video.current; v.volume = val; v.muted = val === 0; setVolume(val); setMuted(val === 0); }, []);
  const toggleMute = useCallback(() => { const v = video.current; v.muted = !v.muted; setMuted(v.muted); if (!v.muted && v.volume === 0) setVol(0.5); }, [setVol]);
  const toggleFull = useCallback(() => { document.fullscreenElement ? document.exitFullscreen() : shell.current.requestFullscreen?.(); }, []);
  const goNext = useCallback(() => { if (next) { save(); navigate(playPath(title, next.s, next.e), { replace: true }); } }, [next, save, title]);

  useEffect(() => {
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);

  useEffect(() => {
    const onKey = ev => {
      if (ev.ctrlKey && ev.shiftKey && ev.altKey && ev.code === 'KeyD') { setStats(x => !x); return; }
      if (ev.target.tagName === 'INPUT') return;
      const v = video.current;
      const map = {
        ' ': toggle, k: toggle, ArrowLeft: () => seekBy(-10), ArrowRight: () => seekBy(10),
        ArrowUp: () => setVol(Math.min(1, v.volume + 0.1)), ArrowDown: () => setVol(Math.max(0, v.volume - 0.1)),
        f: toggleFull, m: toggleMute, Escape: () => !document.fullscreenElement && leave(title),
        n: goNext,
      };
      const fn = map[ev.key] || map[ev.key.toLowerCase?.()];
      if (fn) { ev.preventDefault(); fn(); poke(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [toggle, seekBy, setVol, toggleFull, toggleMute, goNext, poke, title]);

  useEffect(() => {
    if (countdown == null) return;
    if (countdown === 0) { goNext(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, goNext]);

  useEffect(() => { video.current?.play().catch(() => setPaused(true)); }, [hls]);

  if (!title) return <div className="player-missing">This title is not available. <button type="button" onClick={() => navigate('/browse')}>Back to browse</button></div>;

  const onTime = () => {
    const v = video.current;
    const buf = v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0;
    setTime({ cur: v.currentTime, dur: v.duration || 0, buf });
  };
  const onEnded = () => {
    save();
    if (next) setCountdown(5);
    else navigate(`/browse?jbv=${title.id}`, { replace: true });
  };

  const pct = time.dur ? (scrub?.t ?? time.cur) / time.dur * 100 : 0;
  const nearEnd = next && time.dur && time.dur - time.cur < NEXT_PROMPT_SECONDS && countdown == null;
  const seekFromEvent = ev => {
    const r = ev.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * time.dur;
  };

  return (
    <div ref={shell} className={`player${ui ? '' : ' idle'}`} onMouseMove={poke} onClick={poke}>
      <video ref={video} className="player-video" playsInline
        onClick={toggle} onDoubleClick={toggleFull}
        onPlay={() => setPaused(false)} onPause={() => { setPaused(true); setUi(true); save(); }}
        onWaiting={() => setWaiting(true)} onPlaying={() => setWaiting(false)} onCanPlay={() => setWaiting(false)}
        onTimeUpdate={onTime} onProgress={onTime} onDurationChange={onTime} onEnded={onEnded} />

      {blocked && (
        <div className="player-blocked" role="alert">
          <h2>Can't play this title</h2>
          <p>{blocked}</p>
          <button type="button" className="btn btn-play rect" onClick={() => leave(title)}>Back to Browse</button>
        </div>
      )}
      {waiting && !blocked && <div className="player-spinner" aria-label="Loading" />}
      {flash && <div className={`player-flash ${flash}`} aria-hidden="true">
        {flash === 'play' ? <Icon.Play size={48} /> : flash === 'pause' ? <Icon.Pause size={48} /> : flash === 'back' ? <Icon.Rewind10 size={48} /> : <Icon.Forward10 size={48} />}
      </div>}
      {stats && <Stats hls={hls} video={video} />}

      {paused && !waiting && ui && countdown == null && (
        <div className="player-paused-info" aria-hidden="true">
          <p>You're watching</p>
          <h2>{title.title}</h2>
          {episode && <h3>Season {s}: Ep. {e} “{episode.name}”</h3>}
          <p className="syn">{episode ? episode.synopsis : title.synopsis}</p>
        </div>
      )}

      <div className="player-top">
        <button type="button" className="player-icon" aria-label="Back to browse" onClick={() => leave(title)}><Icon.Back size={36} /></button>
      </div>

      <div className="player-bottom">
        <div className="player-timeline">
          <div className="player-track" role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={Math.round(time.dur)} aria-valuenow={Math.round(time.cur)} tabIndex={0}
            onMouseMove={ev => setScrub({ t: seekFromEvent(ev), x: ev.clientX - ev.currentTarget.getBoundingClientRect().left })}
            onMouseLeave={() => setScrub(null)}
            onClick={ev => { video.current.currentTime = seekFromEvent(ev); }}>
            <span className="track-buf" style={{ width: `${time.dur ? time.buf / time.dur * 100 : 0}%` }} />
            <span className="track-cur" style={{ width: `${pct}%` }} />
            <span className="track-knob" style={{ left: `${pct}%` }} />
            {scrub && <span className="track-tip" style={{ left: scrub.x }}>{formatClock(scrub.t)}</span>}
          </div>
          <span className="player-remaining">{formatClock(time.dur - time.cur)}</span>
        </div>
        <div className="player-controls">
          <div className="player-group">
            <button type="button" className="player-icon" aria-label={paused ? 'Play' : 'Pause'} onClick={toggle}>{paused ? <Icon.Play size={40} /> : <Icon.Pause size={40} />}</button>
            <button type="button" className="player-icon" aria-label="Back 10 seconds" onClick={() => seekBy(-10)}><Icon.Rewind10 size={40} /></button>
            <button type="button" className="player-icon" aria-label="Forward 10 seconds" onClick={() => seekBy(10)}><Icon.Forward10 size={40} /></button>
            <div className="player-volume">
              <button type="button" className="player-icon" aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggleMute}>{muted || volume === 0 ? <Icon.VolumeOff size={40} /> : <Icon.VolumeOn size={40} />}</button>
              <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} aria-label="Volume" onChange={ev => setVol(Number(ev.target.value))} />
            </div>
          </div>
          <div className="player-title">
            <b>{title.title}</b>{episode && <span> E{e} {episode.name}</span>}
          </div>
          <div className="player-group">
            {next && <button type="button" className="player-icon" aria-label="Next episode" title="Next episode" onClick={goNext}><Icon.NextEp size={40} /></button>}
            {title.type === 'series' && <button type="button" className={`player-icon${panel === 'episodes' ? ' on' : ''}`} aria-label="Episodes" onClick={() => setPanel(p => p === 'episodes' ? null : 'episodes')}><Icon.Episodes size={40} /></button>}
            <button type="button" className={`player-icon${panel === 'speed' ? ' on' : ''}`} aria-label="Playback speed" onClick={() => setPanel(p => p === 'speed' ? null : 'speed')}><Icon.Speed size={40} /></button>
            <button type="button" className="player-icon" aria-label={full ? 'Exit full screen' : 'Full screen'} onClick={toggleFull}>{full ? <Icon.ExitFullscreen size={40} /> : <Icon.Fullscreen size={40} />}</button>
          </div>
        </div>
      </div>

      {panel === 'speed' && (
        <div className="player-panel speed-panel" onClick={ev => ev.stopPropagation()}>
          <h4>Playback Speed</h4>
          <div className="speed-row">
            {SPEEDS.map(x => (
              <button key={x} type="button" className={speed === x ? 'on' : ''} onClick={() => { video.current.playbackRate = x; setSpeed(x); }}>
                <i /> {x === 1 ? '1x (Normal)' : `${x}x`}
              </button>
            ))}
          </div>
        </div>
      )}

      {panel === 'episodes' && (
        <div className="player-panel episodes-panel" onClick={ev => ev.stopPropagation()}>
          <h4>Season {s}</h4>
          {title.seasons.find(x => x.n === s).episodes.map(ep => (
            <button key={ep.n} type="button" className={`ep-item${ep.n === e ? ' on' : ''}`} onClick={() => { save(); navigate(playPath(title, s, ep.n), { replace: true }); }}>
              <span className="ep-n">{ep.n}</span><span className="ep-name">{ep.name}</span>
              {ep.n === e && <span className="ep-detail"><img src={img(`${title.id}-s${s}e${ep.n}`, 260, 146)} alt="" /><span>{ep.synopsis}</span></span>}
            </button>
          ))}
        </div>
      )}

      {nearEnd && (
        <button type="button" className="player-next-pop" onClick={goNext}><Icon.Play size={20} /> Next Episode</button>
      )}

      {countdown != null && next && (
        <div className="player-next-overlay">
          <img src={img(`${title.id}-s${next.s}e${next.e}`, 640, 360)} alt="" />
          <div>
            <p>Next episode in {countdown}</p>
            <h3>S{next.s}:E{next.e} {title.seasons.find(x => x.n === next.s).episodes.find(x => x.n === next.e).name}</h3>
            <div className="next-actions">
              <button type="button" className="btn btn-play rect" onClick={goNext}><Icon.Play size={20} /> Play Now</button>
              <button type="button" className="btn btn-more rect" onClick={() => leave(title)}>Back to Browse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
