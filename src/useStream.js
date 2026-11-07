import { useEffect, useState } from 'react';
import Hls from 'hls.js';
import { STREAMS } from './catalog.js';
import { getProfile, getSession } from './store.js';

const LICENSE_URL = '/api/license';

const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function keyIdsInitData(initDataType, initData, { decryptdata }) {
  if (initData || !decryptdata?.keyId) return { initDataType, initData };
  const json = JSON.stringify({ kids: [b64url(decryptdata.keyId)] });
  return { initDataType: 'keyids', initData: new TextEncoder().encode(json) };
}

function readError(xhr) {
  if (!xhr) return null;
  try {
    const text = xhr.response instanceof ArrayBuffer ? new TextDecoder().decode(xhr.response) : xhr.responseText;
    return JSON.parse(text).error || null;
  } catch { return null; }
}

function drmConfig(titleId) {
  return {
    emeEnabled: true,
    drmSystems: { 'org.w3.clearkey': { licenseUrl: LICENSE_URL, generateRequest: keyIdsInitData } },
    licenseXhrSetup(xhr, url) {
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Kinora-Session', getSession()?.email || '');
      xhr.setRequestHeader('X-Kinora-Title', titleId || '');
      xhr.setRequestHeader('X-Kinora-Kids', getProfile()?.kids ? '1' : '0');
    },
  };
}

export function useStream(ref, streamKey, { startAt = 0, enabled = true, capLevel = false, titleId, onError } = {}) {
  const [hls, setHls] = useState(null);
  useEffect(() => {
    const video = ref.current;
    const entry = STREAMS[streamKey];
    if (!video || !enabled || !entry) return;
    const src = typeof entry === 'string' ? entry : entry.url;
    const drm = typeof entry === 'object' && entry.drm;
    if (Hls.isSupported()) {
      const h = new Hls({ startPosition: startAt, capLevelToPlayerSize: capLevel, enableWorker: true, ...(drm && drmConfig(titleId)) });
      h.loadSource(src);
      h.attachMedia(video);
      h.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.KEY_SYSTEM_ERROR) {
          onError?.(readError(data.networkDetails) || 'This title could not be unlocked for playback.');
          h.destroy();
        } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) h.startLoad();
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) h.recoverMediaError();
        else h.destroy();
      });
      setHls(h);
      return () => { h.destroy(); setHls(null); };
    }
    if (drm) { onError?.('Protected titles need a browser with ClearKey support (Chrome, Edge or Firefox).'); return; }
    video.src = src;
    const seek = () => { video.currentTime = startAt; };
    video.addEventListener('loadedmetadata', seek, { once: true });
    return () => { video.removeEventListener('loadedmetadata', seek); video.removeAttribute('src'); video.load(); };
  }, [ref, streamKey, startAt, enabled, capLevel, titleId]);
  return hls;
}
