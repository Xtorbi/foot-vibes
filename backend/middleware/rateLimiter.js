const rateLimit = require('express-rate-limit');

const voteLimiter = rateLimit({
  windowMs: 2 * 1000,    // 2 secondes
  max: 1,                // 1 requete max par fenetre
  message: { error: 'Attends 2 secondes entre chaque vote' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { voteLimiter };
