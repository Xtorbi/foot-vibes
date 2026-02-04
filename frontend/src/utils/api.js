const API_BASE = '/api';

export async function fetchRandomPlayer(context, excludeIds = []) {
  const params = new URLSearchParams({ context });
  if (excludeIds.length > 0) {
    params.set('exclude', excludeIds.join(','));
  }
  const res = await fetch(`${API_BASE}/players/random?${params}`);
  if (!res.ok) throw new Error('Erreur chargement joueur');
  return res.json();
}

export async function submitVote(playerId, vote, context) {
  const res = await fetch(`${API_BASE}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, vote, context }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erreur vote');
  }
  return res.json();
}

export async function fetchRanking({ context, position, club, search, period, nationality, limit = 50, offset = 0 }) {
  const params = new URLSearchParams();
  if (context) params.set('context', context);
  if (position) params.set('position', position);
  if (club) params.set('club', club);
  if (search) params.set('search', search);
  if (period) params.set('period', period);
  if (nationality) params.set('nationality', nationality);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  const res = await fetch(`${API_BASE}/ranking?${params}`);
  if (!res.ok) throw new Error('Erreur chargement classement');
  return res.json();
}

export async function fetchContexts() {
  const res = await fetch(`${API_BASE}/contexts`);
  if (!res.ok) throw new Error('Erreur chargement contextes');
  return res.json();
}
