# 07 - Systeme anti-spam

## Architecture de protection (Defense in Depth)

**Principe** : Plusieurs couches de protection plutot qu'une seule barriere

```
Requete de vote
    |
[Couche 1] Rate Limiting (2 secondes)
    |  (bloque scripts rapides)
[Couche 2] IP Tracking (100 votes/jour)
    |  (bloque spam massif d'une IP)
[Couche 3] Fingerprinting (v1.1) (200 votes/jour)
    |  (bloque spam d'un utilisateur)
[Couche 4] One Vote Per Player (v1.1) (1 vote/joueur)
    |  (empeche re-vote)
Vote enregistre
```

---

## Implementation MVP

### Couche 1 : Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const voteLimiter = rateLimit({
  windowMs: 2 * 1000,        // 2 secondes
  max: 1,                    // 1 requete max
  message: { error: 'Attends 2 secondes entre chaque vote' }
});

app.post('/api/vote', voteLimiter, voteController.handleVote);
```

### Couche 2 : IP Tracking (100 votes/jour)

```javascript
const votesByIP = new Map();

async function checkIPLimit(req, res, next) {
  const ip = req.ip;
  const today = new Date().toDateString();
  const key = `${ip}-${today}`;

  let votesToday = votesByIP.get(key) || 0;

  if (votesToday >= 100) {
    return res.status(403).json({
      error: 'Limite quotidienne atteinte (100 votes/jour)'
    });
  }

  res.on('finish', () => {
    if (res.statusCode === 200) {
      votesByIP.set(key, votesToday + 1);
    }
  });

  next();
}
```

---

## Implementation v1.1

### Couche 3 : Browser Fingerprinting (FingerprintJS)

```javascript
// Frontend
import FingerprintJS from '@fingerprintjs/fingerprintjs';
const fp = await FingerprintJS.load();
const result = await fp.get();
const fingerprint = result.visitorId;

// Backend - Limite 200 votes/jour/user + 1 vote/joueur
async function checkFingerprintLimit(req, res, next) {
  const { fingerprint, player_id } = req.body;

  // Deja vote pour ce joueur ?
  const alreadyVoted = await db.get(`
    SELECT id FROM votes
    WHERE fingerprint = ? AND player_id = ?
  `, [fingerprint, player_id]);

  if (alreadyVoted) {
    return res.status(409).json({
      error: 'Tu as deja vote pour ce joueur'
    });
  }

  // Limite quotidienne
  const votesToday = await db.get(`
    SELECT COUNT(*) as count FROM votes
    WHERE fingerprint = ? AND DATE(voted_at) = DATE('now')
  `, [fingerprint]);

  if (votesToday.count >= 200) {
    return res.status(403).json({
      error: 'Limite quotidienne atteinte (200 votes/jour)'
    });
  }

  next();
}
```

---

## Niveau de protection

| Version | Protection | Effort pour contourner |
|---------|-----------|----------------------|
| **MVP** | ~75% | Moyen (VPN) |
| **v1.1** | ~98% | Tres eleve (ferme de navigateurs + VPN) |
