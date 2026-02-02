# 06 - API Endpoints

## Joueurs

### GET /api/players/random

Retourne 1 joueur aleatoire selon le contexte avec toutes ses stats.

**Query params** : `?context=ligue1|psg|om|...&voteCount=12`

**Response** :
```json
{
  "id": 42,
  "first_name": "Bradley",
  "last_name": "Barcola",
  "name": "Bradley Barcola",
  "club": "Paris Saint-Germain",
  "position": "Attaquant",
  "nationality": "France",
  "photo_url": "https://...",
  "age": 22,
  "number": 29,
  "matches_played": 18,
  "goals": 12,
  "assists": 8,
  "clean_sheets": 0,
  "saves": 0
}
```

**Algorithme de selection ponderee** :

```javascript
function getWeightedRandomPlayer(context, excludeIds = []) {
  const players = await db.all(`
    SELECT * FROM players
    WHERE (club = ? OR ? = 'ligue1')
    AND id NOT IN (?)
  `, [context, context, excludeIds]);

  const weights = players.map(p => {
    const baseWeight = 100;
    const votePenalty = Math.log(p.total_votes + 1) * 10;
    return Math.max(1, baseWeight - votePenalty);
  });

  return weightedRandomChoice(players, weights);
}
```

Note : Favorise les joueurs avec peu de votes.

---

### GET /api/players

Liste filtree des joueurs avec pagination.

**Query params** : `?context=ligue1&position=Attaquant&club=PSG&search=Mbappe`

**Response** :
```json
{
  "players": [...],
  "total": 450
}
```

---

### GET /api/players/:id

Details d'un joueur avec son rang.

**Response** :
```json
{
  "id": 42,
  "name": "Bradley Barcola",
  "club": "Paris Saint-Germain",
  "position": "Attaquant",
  "upvotes": 287,
  "downvotes": 45,
  "score": 242,
  "rank": 1
}
```

---

### GET /api/ranking

Classement trie par score.

**Query params** : `?context=ligue1&position=Attaquant&club=PSG&limit=50&offset=0`

**Response** :
```json
{
  "players": [
    { "rank": 1, "id": 42, "name": "Barcola", "club": "PSG", "position": "ATT", "score": 287 },
    ...
  ],
  "total": 450
}
```

---

### GET /api/contexts

Liste des modes disponibles.

**Response** :
```json
{
  "contexts": [
    { "id": "ligue1", "name": "Ligue 1 complete", "player_count": 450 },
    { "id": "psg", "name": "Paris SG", "player_count": 25 },
    ...
  ]
}
```

---

## Votes

### POST /api/vote

Enregistre un vote et met a jour les scores.

**Body** :
```json
{
  "player_id": 123,
  "vote": "up",
  "context": "psg"
}
```

**Response (succes)** :
```json
{
  "success": true,
  "player": {
    "new_score": 288,
    "old_rank": 9,
    "new_rank": 8,
    "rank_change": 1
  },
  "message": "Barcola est passe de #9 a #8 !"
}
```

**Headers requis** :
- `Content-Type: application/json`
- (v1.1) `X-Fingerprint: [browser fingerprint hash]`

**Codes erreur** :
- `429` : Rate limit depasse (attendre 2s)
- `403` : Limite IP depassee (100 votes/jour)
- `409` : Deja vote pour ce joueur (v1.1)

---

## Limitations

### MVP
- Rate limiting : 1 vote toutes les 2 secondes
- IP tracking : 100 votes maximum par jour par IP
- Validation : player_id existe, vote valide, context valide

### v1.1
- Browser fingerprinting : 200 votes/jour/utilisateur
- 1 seul vote par joueur par utilisateur (no re-vote)
- Detection patterns suspects
