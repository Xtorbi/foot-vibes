const { queryOne, runSql } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

function handleVote(req, res) {
  const { player_id, vote, context = 'ligue1' } = req.body;

  // Récupérer l'IP du votant (compatible proxies comme Render/Vercel)
  const voterIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || 'unknown';

  // Validation
  if (!player_id || !['up', 'neutral', 'down'].includes(vote)) {
    return res.status(400).json({ error: 'Parametres invalides' });
  }

  const player = queryOne(
    'SELECT * FROM players WHERE id = ? AND source_season = ? AND archived = 0',
    [player_id, CURRENT_SEASON]
  );

  if (!player) {
    return res.status(404).json({ error: 'Joueur non trouve' });
  }

  // Get old rank
  const oldRankRow = queryOne(`
    SELECT COUNT(*) + 1 as rank FROM players
    WHERE score > ? AND source_season = ? AND archived = 0
  `, [player.score, CURRENT_SEASON]);
  const oldRank = oldRankRow ? oldRankRow.rank : 1;

  // Record vote
  runSql('INSERT INTO votes (player_id, vote_type, context, voter_ip) VALUES (?, ?, ?, ?)',
    [player_id, vote, context, voterIp]);

  // Update player scores
  const column = vote === 'up' ? 'upvotes' : vote === 'down' ? 'downvotes' : 'neutral_votes';
  const scoreChange = vote === 'up' ? 1 : vote === 'down' ? -1 : 0;

  runSql(`
    UPDATE players
    SET ${column} = ${column} + 1,
        total_votes = total_votes + 1,
        score = score + ?,
        updated_at = datetime('now')
    WHERE id = ?
  `, [scoreChange, player_id]);

  // Get updated player and new rank
  const updated = queryOne('SELECT * FROM players WHERE id = ?', [player_id]);
  const newRankRow = queryOne(`
    SELECT COUNT(*) + 1 as rank FROM players
    WHERE score > ? AND source_season = ? AND archived = 0
  `, [updated.score, CURRENT_SEASON]);
  const newRank = newRankRow ? newRankRow.rank : 1;

  // Build feedback message
  let message;
  const rankChange = oldRank - newRank;
  if (rankChange > 0) {
    message = `${player.name} est passe de #${oldRank} a #${newRank} !`;
  } else if (rankChange < 0) {
    message = `${player.name} : #${oldRank} -> #${newRank}`;
  } else {
    message = `Ton vote compte ! ${player.name} reste #${newRank}`;
  }

  res.json({
    success: true,
    player: {
      new_score: updated.score,
      old_rank: oldRank,
      new_rank: newRank,
      rank_change: rankChange,
    },
    message,
  });
}

module.exports = { handleVote };
