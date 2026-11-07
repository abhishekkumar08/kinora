import { useSyncExternalStore } from 'react';

const subs = new Set();
const notify = () => subs.forEach(f => f());
window.addEventListener('popstate', notify);

export function navigate(to, { replace = false } = {}) {
  if (to === location.pathname + location.search) return;
  history[replace ? 'replaceState' : 'pushState'](null, '', to);
  notify();
}

export function setQuery(key, value, opts) {
  const q = new URLSearchParams(location.search);
  value == null || value === '' ? q.delete(key) : q.set(key, value);
  const s = q.toString();
  navigate(location.pathname + (s ? `?${s}` : ''), opts);
}

const snap = () => location.pathname + location.search;
export function useLocation() {
  const href = useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), snap);
  const url = new URL(href, location.origin);
  return { path: url.pathname, query: url.searchParams };
}

export function Link({ to, onClick, ...rest }) {
  return <a href={to} {...rest} onClick={e => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  }} />;
}
