import { useState } from 'react';
import { TITLES, img } from '../catalog.js';
import { actions } from '../store.js';
import { Link, navigate, useLocation } from '../router.jsx';
import { Wordmark } from './Shared.jsx';
import * as Icon from './Icons.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Backdrop = () => (
  <div className="auth-backdrop" aria-hidden="true">
    {TITLES.slice(0, 28).map(t => <img key={t.id} src={img(t.id, 300, 450)} alt="" />)}
  </div>
);

const FAQ = [
  ['What is Kinora?', 'Kinora is a demo streaming app built to study how big streaming services feel to use. Every title in it is fictional and plays an open-licence video.'],
  ['How much does it cost?', 'Nothing. There are no plans, payments or real accounts. Your profiles and progress stay in this browser.'],
  ['Where can I watch?', 'In any modern browser on this machine. Video adapts its quality to your connection as it plays.'],
  ['Can I make profiles for others?', 'Yes, up to five, including kids profiles that only show titles rated U/A 7+ and below.'],
];

function EmailForm({ id }) {
  const [email, setEmail] = useState('');
  return (
    <form className="hero-form" onSubmit={e => { e.preventDefault(); navigate(`/login?email=${encodeURIComponent(email)}`); }}>
      <p>Ready to watch? Enter your email to sign in.</p>
      <div className="hero-row">
        <label className="float">
          <input id={id} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder=" " />
          <span>Email address</span>
        </label>
        <button type="submit" className="btn-red big">Get Started <Icon.ChevronRight size={24} /></button>
      </div>
    </form>
  );
}

export function Landing() {
  const [open, setOpen] = useState(null);
  return (
    <div className="landing">
      <section className="landing-hero">
        <Backdrop />
        <header className="landing-top">
          <Wordmark height={40} />
          <Link to="/login" className="btn-red small">Sign In</Link>
        </header>
        <div className="landing-copy">
          <h1>Stories without the wait.</h1>
          <p className="lead">Series, films and documentaries that start in a heartbeat.</p>
          <EmailForm id="hero-email" />
        </div>
      </section>
      <section className="landing-band">
        <div><h2>Previews that play on hover</h2><p>Rest on any title for a moment and it starts playing, muted, right where you are.</p></div>
        <div><h2>Pick up where you left off</h2><p>Every profile remembers what it was watching, down to the second.</p></div>
        <div><h2>Profiles for the whole house</h2><p>Up to five profiles, each with its own list, ratings and history.</p></div>
      </section>
      <section className="landing-faq">
        <h2>Frequently Asked Questions</h2>
        {FAQ.map(([q, a], i) => (
          <div key={q} className={`faq${open === i ? ' open' : ''}`}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{q}<Icon.Plus size={32} /></button>
            {open === i && <p>{a}</p>}
          </div>
        ))}
        <EmailForm id="faq-email" />
      </section>
      <footer className="landing-foot">
        <p>Kinora is a personal learning project. Titles are fictional; images from Picsum (Unsplash licence).</p>
        <p>Video: “Big Buck Bunny” and “Tears of Steel” © Blender Foundation, CC BY 3.0 (blender.org); plus public test streams from the Shaka Player demo and Apple.</p>
      </footer>
    </div>
  );
}

export function Login() {
  const { query } = useLocation();
  const [email, setEmail] = useState(query.get('email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = e => {
    e.preventDefault();
    if (!EMAIL.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 4) return setError('Your password must contain between 4 and 60 characters.');
    actions.signIn(email);
    navigate('/browse', { replace: true });
  };
  return (
    <div className="login">
      <Backdrop />
      <header className="landing-top"><Link to="/"><Wordmark height={40} /></Link></header>
      <form className="login-card" onSubmit={submit} noValidate>
        <h1>Sign In</h1>
        {error && <p className="login-error" role="alert">{error}</p>}
        <label className="float">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder=" " autoComplete="username" />
          <span>Email address</span>
        </label>
        <label className="float">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder=" " autoComplete="current-password" />
          <span>Password</span>
        </label>
        <button type="submit" className="btn-red block">Sign In</button>
        <p className="login-note">Demo sign-in: any email and a 4+ character password. Nothing leaves this browser.</p>
      </form>
    </div>
  );
}
