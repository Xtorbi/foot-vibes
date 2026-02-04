const { queryAll, queryOne } = require('../models/database');
const { CURRENT_SEASON, CLUB_POPULARITY, L1_CLUBS } = require('../config/clubs');

function getRandomPlayer(req, res) {
  const { context = 'ligue1', exclude = '' } = req.query;
  const excludeIds = exclude ? exclude.split(',').map(Number) : [];

  // Récupérer la journée actuelle
  const statusRow = queryOne('SELECT current_matchday FROM league_status WHERE id = 1');
  const currentMatchday = statusRow ? statusRow.current_matchday : 1;

  let query = `
    SELECT * FROM players
    WHERE source_season = ?
      AND archived = 0
  `;
  const params = [CURRENT_SEASON];

  if (context !== 'ligue1') {
    const club = L1_CLUBS.find(c => c.id === context);
    if (club) {
      query += ' AND club = ?';
      params.push(club.name);
    }
  }

  const allPlayers = queryAll(query, params).filter(p => !excludeIds.includes(p.id));

  if (allPlayers.length === 0) {
    return res.status(404).json({ error: 'Aucun joueur disponible' });
  }

  // Répartir en buckets par récence de la dernière journée jouée
  // 80% → Joueurs ayant joué la journée actuelle (J)
  // 15% → Joueurs ayant joué J-1
  // 4%  → Joueurs ayant joué J-2
  // 1%  → Reste (J-3 et avant)
  const buckets = { current: [], jMinus1: [], jMinus2: [], older: [] };

  for (const player of allPlayers) {
    const diff = currentMatchday - (player.last_matchday_played || 0);
    if (diff === 0) buckets.current.push(player);
    else if (diff === 1) buckets.jMinus1.push(player);
    else if (diff === 2) buckets.jMinus2.push(player);
    else buckets.older.push(player);
  }

  // Sélection 80/15/4/1 avec fallback
  const roll = Math.random() * 100;
  let bucket;

  if (roll < 80 && buckets.current.length > 0) {
    bucket = buckets.current;
  } else if (roll < 95 && buckets.jMinus1.length > 0) {
    bucket = buckets.jMinus1;
  } else if (roll < 99 && buckets.jMinus2.length > 0) {
    bucket = buckets.jMinus2;
  } else if (buckets.older.length > 0) {
    bucket = buckets.older;
  } else {
    // Fallback: combiner tous les buckets disponibles
    bucket = buckets.current.concat(buckets.jMinus1, buckets.jMinus2);
    if (bucket.length === 0) bucket = allPlayers;
  }

  // Sélection aléatoire pondérée dans le bucket (garder pondération votes/club)
  const weights = bucket.map(p => {
    const baseWeight = 100;
    const votePenalty = Math.log(p.total_votes + 1) * 10;
    const clubBonus = CLUB_POPULARITY[p.club] || 10;
    return Math.max(1, baseWeight - votePenalty + clubBonus * 0.5);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < bucket.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return res.json(bucket[i]);
    }
  }

  res.json(bucket[bucket.length - 1]);
}

function getPlayers(req, res) {
  const { position, club, search, limit = '50', offset = '0' } = req.query;

  let query = `SELECT * FROM players WHERE source_season = ? AND archived = 0`;
  let countQuery = `SELECT COUNT(*) as total FROM players WHERE source_season = ? AND archived = 0`;
  const params = [CURRENT_SEASON];
  const countParams = [CURRENT_SEASON];

  if (position) {
    query += ' AND position = ?';
    countQuery += ' AND position = ?';
    params.push(position);
    countParams.push(position);
  }

  if (club) {
    query += ' AND club = ?';
    countQuery += ' AND club = ?';
    params.push(club);
    countParams.push(club);
  }

  if (search) {
    query += ' AND name LIKE ?';
    countQuery += ' AND name LIKE ?';
    params.push(`%${search}%`);
    countParams.push(`%${search}%`);
  }

  query += ' ORDER BY score DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const players = queryAll(query, params);
  const row = queryOne(countQuery, countParams);
  const total = row ? row.total : 0;

  res.json({ players, total });
}

function getPlayerById(req, res) {
  const { id } = req.params;

  const player = queryOne('SELECT * FROM players WHERE id = ?', [parseInt(id, 10)]);
  if (!player) {
    return res.status(404).json({ error: 'Joueur non trouve' });
  }

  const rankRow = queryOne(`
    SELECT COUNT(*) + 1 as rank FROM players
    WHERE score > ? AND source_season = ? AND archived = 0
  `, [player.score, CURRENT_SEASON]);

  res.json({ ...player, rank: rankRow ? rankRow.rank : 1 });
}

function getRanking(req, res) {
  const { context, position, club, search, period, nationality, limit = '50', offset = '0' } = req.query;

  // Calcul de la date de début selon la période
  let dateFilter = null;
  if (period === 'week') {
    dateFilter = "datetime('now', '-7 days')";
  } else if (period === 'month') {
    dateFilter = "datetime('now', '-30 days')";
  }
  // 'season' ou undefined = pas de filtre date (tout depuis le début)

  let query, countQuery;
  const params = [];
  const countParams = [];

  if (dateFilter) {
    // Score calculé dynamiquement sur la période
    query = `
      SELECT p.*,
        COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 1 WHEN v.vote_type = 'down' THEN -1 ELSE 0 END), 0) as period_score,
        COUNT(v.id) as period_votes,
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 1 WHEN v.vote_type = 'down' THEN -1 ELSE 0 END), 0) DESC) as rank
      FROM players p
      LEFT JOIN votes v ON p.id = v.player_id AND v.voted_at >= ${dateFilter}
      WHERE p.source_season = ?
        AND p.archived = 0
    `;
    countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM players p
      LEFT JOIN votes v ON p.id = v.player_id AND v.voted_at >= ${dateFilter}
      WHERE p.source_season = ? AND p.archived = 0
    `;
    params.push(CURRENT_SEASON);
    countParams.push(CURRENT_SEASON);
  } else {
    // Score total (comportement actuel)
    query = `
      SELECT *, ROW_NUMBER() OVER (ORDER BY score DESC) as rank
      FROM players
      WHERE source_season = ?
        AND archived = 0
        AND total_votes >= 1
    `;
    countQuery = `
      SELECT COUNT(*) as total FROM players
      WHERE source_season = ? AND archived = 0 AND total_votes >= 1
    `;
    params.push(CURRENT_SEASON);
    countParams.push(CURRENT_SEASON);
  }

  // Préfixe pour les colonnes (p. si période, rien sinon)
  const col = dateFilter ? 'p.' : '';

  if (context && context !== 'ligue1') {
    const clubData = L1_CLUBS.find(c => c.id === context);
    if (clubData) {
      query += ` AND ${col}club = ?`;
      countQuery += ` AND ${col}club = ?`;
      params.push(clubData.name);
      countParams.push(clubData.name);
    }
  }

  if (position) {
    query += ` AND ${col}position = ?`;
    countQuery += ` AND ${col}position = ?`;
    params.push(position);
    countParams.push(position);
  }

  if (club) {
    query += ` AND ${col}club = ?`;
    countQuery += ` AND ${col}club = ?`;
    params.push(club);
    countParams.push(club);
  }

  if (search) {
    query += ` AND ${col}name LIKE ?`;
    countQuery += ` AND ${col}name LIKE ?`;
    params.push(`%${search}%`);
    countParams.push(`%${search}%`);
  }

  if (nationality) {
    query += ` AND ${col}nationality = ?`;
    countQuery += ` AND ${col}nationality = ?`;
    params.push(nationality);
    countParams.push(nationality);
  }

  if (dateFilter) {
    // GROUP BY et filtre sur joueurs ayant des votes dans la période
    query += ' GROUP BY p.id HAVING period_votes >= 1 ORDER BY period_score DESC LIMIT ? OFFSET ?';
  } else {
    query += ' ORDER BY score DESC LIMIT ? OFFSET ?';
  }
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const players = queryAll(query, params);
  const row = queryOne(countQuery, countParams);
  const total = row ? row.total : 0;

  // Pour les résultats avec période, utiliser period_score comme score
  const result = dateFilter
    ? players.map(p => ({ ...p, score: p.period_score, total_votes: p.period_votes }))
    : players;

  res.json({ players: result, total });
}

function getContexts(req, res) {
  const totalRow = queryOne(`
    SELECT COUNT(*) as count FROM players
    WHERE source_season = ? AND archived = 0
  `, [CURRENT_SEASON]);

  const contexts = [
    { id: 'ligue1', name: 'Ligue 1 complete', player_count: totalRow ? totalRow.count : 0 },
  ];

  for (const club of L1_CLUBS) {
    const row = queryOne(`
      SELECT COUNT(*) as count FROM players
      WHERE club = ? AND source_season = ? AND archived = 0
    `, [club.name, CURRENT_SEASON]);

    contexts.push({ id: club.id, name: club.shortName, player_count: row ? row.count : 0 });
  }

  res.json({ contexts });
}

module.exports = { getRandomPlayer, getPlayers, getPlayerById, getRanking, getContexts };
