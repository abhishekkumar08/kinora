import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { navigate, useLocation } from './router.jsx';
import { useProfile, useStore } from './store.js';
import { Nav } from './components/Nav.jsx';
import { Browse, Latest, MyList, SearchPage } from './components/Pages.jsx';
import { DetailModal } from './components/DetailModal.jsx';
import { Player } from './components/Player.jsx';
import { ProfileGate } from './components/Profiles.jsx';
import { Landing, Login } from './components/Auth.jsx';
import './styles.css';

function Redirect({ to }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

const PAGES = {
  '/browse': () => <Browse />,
  '/shows': () => <Browse kind="shows" />,
  '/movies': () => <Browse kind="movies" />,
  '/latest': () => <Latest />,
  '/my-list': () => <MyList />,
};

function App() {
  const { path, query } = useLocation();
  const { session } = useStore();
  const profile = useProfile();

  useEffect(() => { scrollTo(0, 0); }, [path]);

  if (!session) {
    if (path === '/') return <Landing />;
    if (path === '/login') return <Login />;
    return <Redirect to="/" />;
  }
  if (path === '/' || path === '/login') return <Redirect to="/browse" />;
  if (path === '/profiles/manage') return <ProfileGate manage />;
  if (!profile) return <ProfileGate />;

  const watch = path.match(/^\/watch\/([\w-]+)$/);
  if (watch) return <Player key={path + location.search} id={watch[1]} s={Number(query.get('s')) || 1} e={Number(query.get('e')) || 1} />;

  const page = path === '/search' ? <SearchPage q={query.get('q') || ''} /> : PAGES[path]?.();
  if (!page) return <Redirect to="/browse" />;

  return (
    <div className="app" key={profile.id}>
      <Nav />
      {page}
      <footer className="app-foot">
        <p>Kinora is a learning project. Titles, synopses and people are fictional. Images: Picsum (Unsplash licence).</p>
        <p>Video: “Big Buck Bunny” and “Tears of Steel” © Blender Foundation, CC BY 3.0 (blender.org); plus public test streams from the Shaka Player demo and Apple.</p>
      </footer>
      {query.get('jbv') && <DetailModal key={query.get('jbv')} id={query.get('jbv')} />}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
