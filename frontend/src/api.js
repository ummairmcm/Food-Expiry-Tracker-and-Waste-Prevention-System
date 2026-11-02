// All back-end calls live here, so components never touch fetch directly.
async function request(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body.errors || [body.error]).filter(Boolean).join(', ');
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  items: () => request('/items'),
  eatFirst: () => request('/eat-first'),
  stats: () => request('/stats'),
  add: (item) => request('/items', { method: 'POST', body: JSON.stringify(item) }),
  consume: (id) => request(`/items/${id}/consume`, { method: 'POST', body: '{}' }),
  waste: (id) => request(`/items/${id}/waste`, { method: 'POST', body: '{}' }),
  remove: (id) => request(`/items/${id}`, { method: 'DELETE' }),
};
