import { useEffect, useRef, useState } from 'react';
import { Link, navigate, useLocation } from '../router.jsx';
import { actions, useProfile, useStore } from '../store.js';
import { TITLES, img } from '../catalog.js';
import { Avatar, Wordmark, openDetails } from './Shared.jsx';
import * as Icon from './Icons.jsx';

const LINKS = [['/browse', 'Home'], ['/shows', 'Shows'], ['/movies', 'Movies'], ['/latest', 'New & Popular'], ['/my-list', 'My List']];

function SearchBox() {
  const { path, query } = useLocation();
  const onSearch = path === '/search';
  const [open, setOpen] = useState(onSearch);
  const [q, setQ] = useState(onSearch ? query.get('q') || '' : '');
  const input = useRef(null);
  const from = useRef('/browse');

  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { if (!onSearch) from.current = path + location.search; }, [onSearch, path]);

  const change = v => {
    setQ(v);
    if (v) navigate(`/search?q=${encodeURIComponent(v)}`, { replace: onSearch });
    else navigate(from.current, { replace: true });
  };

  return (
    <div className={`search${open ? ' open' : ''}`}>
      <button type="button" className="nav-icon" aria-label="Search" onClick={() => setOpen(true)}><Icon.Search size={22} /></button>
      {open && (
        <input ref={input} value={q} placeholder="Titles, people, genres" aria-label="Search titles"
          onChange={e => change(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && (change(''), setOpen(false))}
          onBlur={() => !q && setOpen(false)} />
      )}
      {open && q && <button type="button" className="search-clear" aria-label="Clear search" onMouseDown={e => e.preventDefault()} onClick={() => change('')}><Icon.Close size={16} /></button>}
    </div>
  );
}

function Menu({ trigger, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const t = useRef();
  const enter = () => { clearTimeout(t.current); setOpen(true); };
  const leave = () => { t.current = setTimeout(() => setOpen(false), 250); };
  return (
    <div className={`menu ${className}`} onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={leave}>
      {trigger(open)}
      {open && <div className="menu-pop" role="menu">{children}</div>}
    </div>
  );
}

export function Nav() {
  const { path } = useLocation();
  const { profiles } = useStore();
  const profile = useProfile();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const f = () => setSolid(scrollY > 0);
    f();
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);

  const kids = profiles.find(p => p.kids);
  const fresh = TITLES.filter(t => t.isNew).slice(0, 4);

  return (
    <header className={`nav${solid ? ' solid' : ''}`}>
      <Link to="/browse" className="nav-logo" aria-label="Kinora home"><Wordmark height={28} /></Link>
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map(([to, label]) => (
          <Link key={to} to={to} className={path === to ? 'active' : ''} aria-current={path === to ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
      <Menu className="nav-browse" trigger={open => <button type="button" className="nav-browse-btn">Browse <Icon.ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none' }} /></button>}>
        {LINKS.map(([to, label]) => <Link key={to} to={to} className="menu-item">{label}</Link>)}
      </Menu>
      <div className="nav-right">
        <SearchBox />
        {kids && !profile?.kids && <button type="button" className="nav-kids" onClick={() => actions.choose(kids.id)}>Kids</button>}
        <Menu className="nav-bell" trigger={() => (
          <button type="button" className="nav-icon" aria-label="Notifications"><Icon.Bell size={22} /><span className="badge">{fresh.length}</span></button>
        )}>
          {fresh.map(t => (
            <button key={t.id} type="button" className="notif" onClick={() => openDetails(t.id)}>
              <img src={img(t.id, 224, 126)} alt="" />
              <span><b>New Arrival</b>{t.title}<small>{t.genres[0]}</small></span>
            </button>
          ))}
        </Menu>
        {profile && (
          <Menu className="nav-profile" trigger={open => (
            <button type="button" className="nav-avatar" aria-label="Account and profiles">
              <Avatar profile={profile} size={32} /><Icon.ChevronDown size={14} className="caret" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>
          )}>
            {profiles.filter(p => p.id !== profile.id).map(p => (
              <button key={p.id} type="button" className="menu-item profile-item" onClick={() => actions.choose(p.id)}><Avatar profile={p} size={32} />{p.name}</button>
            ))}
            <Link to="/profiles/manage" className="menu-item"><Icon.Pencil size={18} /> Manage Profiles</Link>
            <hr />
            <button type="button" className="menu-item signout" onClick={() => { actions.signOut(); navigate('/'); }}>Sign out of Kinora</button>
          </Menu>
        )}
      </div>
    </header>
  );
}
