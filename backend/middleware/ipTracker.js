const MAX_VOTES_PER_DAY = 100;
const votesByIP = new Map();

// Clean up old entries every hour
setInterval(() => {
  const today = new Date().toDateString();
  for (const [key] of votesByIP) {
    if (!key.endsWith(today)) {
      votesByIP.delete(key);
    }
  }
}, 60 * 60 * 1000);

function checkIPLimit(req, res, next) {
  const ip = req.ip;
  const today = new Date().toDateString();
  const key = `${ip}-${today}`;

  const votesToday = votesByIP.get(key) || 0;

  if (votesToday >= MAX_VOTES_PER_DAY) {
    return res.status(403).json({
      error: 'Limite quotidienne atteinte (100 votes/jour)',
    });
  }

  res.on('finish', () => {
    if (res.statusCode === 200) {
      votesByIP.set(key, votesToday + 1);
    }
  });

  next();
}

module.exports = { checkIPLimit };
