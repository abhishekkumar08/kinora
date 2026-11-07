import { useState } from 'react';
import { actions, AVATAR_COLORS, useStore } from '../store.js';
import { Link, navigate } from '../router.jsx';
import { Avatar, Wordmark } from './Shared.jsx';
import * as Icon from './Icons.jsx';

const MAX_PROFILES = 5;

function ProfileEditor({ profile, onDone }) {
  const [p, setP] = useState(profile);
  const isNew = !profile.name;
  const save = e => {
    e.preventDefault();
    if (!p.name.trim()) return;
    actions.saveProfile({ ...p, name: p.name.trim() });
    onDone();
  };
  return (
    <form className="profile-editor" onSubmit={save}>
      <h1>{isNew ? 'Add Profile' : 'Edit Profile'}</h1>
      {isNew && <p className="sub">Add a profile for another person watching Kinora.</p>}
      <div className="editor-body">
        <Avatar profile={p} size={120} />
        <div className="editor-fields">
          <input autoFocus value={p.name} maxLength={20} placeholder="Name" aria-label="Profile name" onChange={e => setP({ ...p, name: e.target.value })} />
          <div className="colors" role="radiogroup" aria-label="Avatar colour">
            {AVATAR_COLORS.map(c => (
              <button key={c} type="button" role="radio" aria-checked={p.color === c} aria-label={`Colour ${c}`} className={p.color === c ? 'on' : ''} style={{ background: c }} onClick={() => setP({ ...p, color: c })} />
            ))}
          </div>
          <label className="kids-toggle">
            <input type="checkbox" checked={p.kids} onChange={e => setP({ ...p, kids: e.target.checked })} />
            <span>Kids profile</span>
            <small>Only shows titles rated U/A 7+ and below.</small>
          </label>
        </div>
      </div>
      <div className="editor-actions">
        <button type="submit" className="btn-white">{isNew ? 'Continue' : 'Save'}</button>
        <button type="button" className="btn-outline" onClick={onDone}>Cancel</button>
        {!isNew && <button type="button" className="btn-outline" onClick={() => { actions.deleteProfile(p.id); onDone(); }}>Delete Profile</button>}
      </div>
    </form>
  );
}

export function ProfileGate({ manage }) {
  const { profiles } = useStore();
  const [editing, setEditing] = useState(null);

  if (editing) return <div className="gate"><ProfileEditor profile={editing} onDone={() => setEditing(null)} /></div>;

  return (
    <div className="gate">
      <header className="gate-logo"><Wordmark height={34} /></header>
      <h1>{manage ? 'Manage Profiles:' : "Who's watching?"}</h1>
      <ul className="gate-list">
        {profiles.map(p => (
          <li key={p.id}>
            <button type="button" className="gate-profile" onClick={() => manage ? setEditing(p) : (actions.choose(p.id), navigate('/browse', { replace: true }))}>
              <span className="gate-avatar">
                <Avatar profile={p} size={140} />
                {manage && <span className="gate-edit"><Icon.Pencil size={36} /></span>}
              </span>
              <span className="gate-name">{p.name}</span>
            </button>
          </li>
        ))}
        {profiles.length < MAX_PROFILES && (
          <li>
            <button type="button" className="gate-profile add" onClick={() => setEditing({ id: `p${Date.now()}`, name: '', color: AVATAR_COLORS[profiles.length % AVATAR_COLORS.length], kids: false })}>
              <span className="gate-avatar add-box"><Icon.Plus size={64} /></span>
              <span className="gate-name">Add Profile</span>
            </button>
          </li>
        )}
      </ul>
      {manage
        ? <Link to="/browse" className="btn-white gate-btn">Done</Link>
        : <Link to="/profiles/manage" className="btn-outline gate-btn">Manage Profiles</Link>}
    </div>
  );
}
