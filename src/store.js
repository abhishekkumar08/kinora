import { useSyncExternalStore } from 'react';

const KEY = 'kinora:v1';
const COLORS = ['#e50914', '#2f7de1', '#f5b400', '#2bb673', '#9b51e0'];

const fresh = () => ({
  session: null,
  profiles: [
    { id: 'p1', name: 'You', color: COLORS[1], kids: false },
    { id: 'p2', name: 'Guest', color: COLORS[2], kids: false },
    { id: 'kids', name: 'Kids', color: COLORS[3], kids: true },
  ],
  data: {},
});

function load() {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return fresh(); }
}

let state = load();
let active = sessionStorage.getItem('kinora:profile');
const subs = new Set();

function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked: keep in memory */ }
  subs.forEach(f => f());
}

const subscribe = f => (subs.add(f), () => subs.delete(f));
const snapshot = () => state;

window.addEventListener('storage', e => { if (e.key === KEY) { state = load(); subs.forEach(f => f()); } });

export const useStore = () => useSyncExternalStore(subscribe, snapshot);

export const getSession = () => state.session;
export const getProfile = () => state.profiles.find(p => p.id === active) || null;
export const useProfile = () => { useStore(); return getProfile(); };

const profileData = () => state.data[active] || { myList: [], ratings: {}, bookmarks: {} };
export const useProfileData = () => { useStore(); return profileData(); };

function updateProfileData(fn) {
  if (!active) return;
  state = { ...state, data: { ...state.data, [active]: fn(profileData()) } };
  emit();
}

export const AVATAR_COLORS = COLORS;

export const actions = {
  signIn(email) { state = { ...state, session: { email } }; emit(); },
  signOut() { state = { ...state, session: null }; actions.choose(null); },
  choose(id) {
    active = id;
    id ? sessionStorage.setItem('kinora:profile', id) : sessionStorage.removeItem('kinora:profile');
    state = { ...state };
    emit();
  },
  saveProfile(p) {
    const exists = state.profiles.some(x => x.id === p.id);
    state = { ...state, profiles: exists ? state.profiles.map(x => x.id === p.id ? p : x) : [...state.profiles, p] };
    emit();
  },
  deleteProfile(id) {
    const { [id]: _, ...data } = state.data;
    state = { ...state, profiles: state.profiles.filter(p => p.id !== id), data };
    if (active === id) actions.choose(null); else emit();
  },
  toggleList(titleId) {
    updateProfileData(d => ({ ...d, myList: d.myList.includes(titleId) ? d.myList.filter(x => x !== titleId) : [titleId, ...d.myList] }));
  },
  rate(titleId, value) {
    updateProfileData(d => ({ ...d, ratings: { ...d.ratings, [titleId]: d.ratings[titleId] === value ? 0 : value } }));
  },
  bookmark(key, b) {
    updateProfileData(d => ({ ...d, bookmarks: { ...d.bookmarks, [key]: { ...b, at: Date.now() } } }));
  },
};
