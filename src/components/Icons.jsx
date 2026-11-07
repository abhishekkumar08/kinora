const I = ({ children, size = 24, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{children}</svg>
);

export const Play = p => <I {...p}><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none" /></I>;
export const Pause = p => <I {...p}><rect x="6" y="4.5" width="4" height="15" fill="currentColor" stroke="none" /><rect x="14" y="4.5" width="4" height="15" fill="currentColor" stroke="none" /></I>;
export const Plus = p => <I {...p}><path d="M12 5v14M5 12h14" /></I>;
export const Check = p => <I {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></I>;
export const Close = p => <I {...p}><path d="M6 6l12 12M18 6L6 18" /></I>;
export const ChevronDown = p => <I {...p}><path d="M6 9l6 6 6-6" /></I>;
export const ChevronLeft = p => <I {...p}><path d="M15 5l-7 7 7 7" /></I>;
export const ChevronRight = p => <I {...p}><path d="M9 5l7 7-7 7" /></I>;
export const Search = p => <I {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></I>;
export const Bell = p => <I {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></I>;
export const Back = p => <I {...p}><path d="M20 12H5M11 5l-7 7 7 7" /></I>;
export const Info = p => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></I>;
export const VolumeOn = p => <I {...p}><path d="M4 9.5h4l5-4v13l-5-4H4z" fill="currentColor" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></I>;
export const VolumeOff = p => <I {...p}><path d="M4 9.5h4l5-4v13l-5-4H4z" fill="currentColor" /><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" /></I>;
export const Replay = p => <I {...p}><path d="M4 12a8 8 0 1 0 2.5-5.8" /><path d="M4 4v4h4" /></I>;
export const Fullscreen = p => <I {...p}><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></I>;
export const ExitFullscreen = p => <I {...p}><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" /></I>;
export const NextEp = p => <I {...p}><path d="M5 5v14l10-7z" fill="currentColor" stroke="none" /><path d="M18 5v14" /></I>;
export const Episodes = p => <I {...p}><rect x="3" y="7" width="13" height="12" rx="1" /><path d="M7 4h13v12" /></I>;
export const Speed = p => <I {...p}><path d="M4.5 16a8 8 0 1 1 15 0" /><path d="M12 13l4-4" /></I>;
export const Subtitles = p => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 14h4M13 14h4M7 11h10" /></I>;
export const Pencil = p => <I {...p}><path d="M4 20l4-1 11-11-3-3L5 16z" /></I>;

const Skip = ({ dir, ...p }) => (
  <I {...p}>
    <path d={dir < 0 ? 'M5 12a7 7 0 1 0 2.2-5.1' : 'M19 12a7 7 0 1 1-2.2-5.1'} />
    <path d={dir < 0 ? 'M7 3.5v3.5h3.5' : 'M17 3.5v3.5h-3.5'} />
    <text x="12" y="15.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" stroke="none">10</text>
  </I>
);
export const Rewind10 = p => <Skip dir={-1} {...p} />;
export const Forward10 = p => <Skip dir={1} {...p} />;

const Thumb = ({ down, ...p }) => (
  <g transform={down ? 'rotate(180 12 12)' : undefined} {...p}>
    <path d="M7 11v9H4v-9zM7 11l4-7c1.5 0 2.5 1 2.2 2.6L12.6 10H18a2 2 0 0 1 2 2.3l-1.1 5.9A2 2 0 0 1 17 20H7" />
  </g>
);
export const ThumbUp = p => <I {...p}><Thumb /></I>;
export const ThumbDown = p => <I {...p}><Thumb down /></I>;
export const ThumbsLove = p => (
  <I {...p} viewBox="0 0 28 24">
    <g transform="translate(-1 1) scale(.92)"><Thumb /></g>
    <g transform="translate(7 -1) scale(.92)"><Thumb /></g>
  </I>
);
