// Central fetch wrapper — all HTTP calls go through here.
// Change BASE_URL to your machine's IP if testing on a physical device.
// e.g. 'http://192.168.1.5:3000'
const BASE_URL = 'https://organicle-dashboard-production.up.railway.app';

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get:   (path)       => request('GET',   path),
  post:  (path, body) => request('POST',  path, body),
  patch: (path, body) => request('PATCH', path, body),
};
