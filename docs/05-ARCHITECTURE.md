# 05 - Architecture technique

## Stack technique

### Frontend
- **Framework** : React 18+
- **Build** : Vite
- **Styling** : TailwindCSS
- **Routing** : React Router v6
- **State** : React Context (simple)

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express.js
- **Base de donnees** : SQLite3
- **API** : REST

### Deploiement
- **Frontend** : Vercel (gratuit, optimise React)
- **Backend** : Railway ou Render (gratuit)
- **Base de donnees** : SQLite fichier sur serveur

---

## Structure du projet

```
foot-vibes/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Vote.jsx
│   │   │   └── Ranking.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── PlayerCard.jsx
│   │   │   ├── VoteButtons.jsx
│   │   │   ├── RankingTable.jsx
│   │   │   └── ClubGrid.jsx
│   │   ├── contexts/
│   │   │   └── ModeContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── players.js
│   │   └── votes.js
│   ├── controllers/
│   │   ├── playersController.js
│   │   └── votesController.js
│   ├── middleware/
│   │   ├── rateLimiter.js
│   │   └── ipTracker.js
│   ├── models/
│   │   └── database.js
│   ├── scripts/
│   │   └── importPlayers.js
│   ├── config/
│   │   └── clubs.js
│   ├── server.js
│   └── package.json
│
├── database/
│   └── (ligue1.db genere a l'execution)
│
├── docs/
│   └── (documentation decoupee)
│
├── .env.example
├── .gitignore
└── REQUIREMENTS.md
```

---

## Schema base de donnees

### Table `players`

```sql
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Infos personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    name TEXT NOT NULL,
    club TEXT NOT NULL,
    position TEXT NOT NULL CHECK(position IN ('Gardien', 'Defenseur', 'Milieu', 'Attaquant')),
    nationality TEXT,
    photo_url TEXT,
    age INTEGER,
    number INTEGER,

    -- Stats saison
    matches_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,

    -- Scores de vote
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    neutral_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,

    -- Gestion saisons
    source_season TEXT NOT NULL,

    -- Gestion transferts
    archived BOOLEAN DEFAULT false,
    archived_reason TEXT,
    archived_at TIMESTAMP,

    -- Metadonnees
    api_id INTEGER,
    is_historical BOOLEAN DEFAULT FALSE,
    era TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performances
CREATE INDEX idx_club ON players(club);
CREATE INDEX idx_position ON players(position);
CREATE INDEX idx_score ON players(score DESC);
CREATE INDEX idx_total_votes ON players(total_votes DESC);
CREATE INDEX idx_season ON players(source_season);
CREATE INDEX idx_active ON players(source_season, archived);
```

### Table `votes`

```sql
CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'neutral', 'down')),
    context TEXT DEFAULT 'ligue1',
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE INDEX idx_votes_player ON votes(player_id);
CREATE INDEX idx_votes_context ON votes(context);
```

---

## Gestion des saisons

**Probleme** : Les saisons de foot chevauchent 2 annees civiles (Aout 2025 -> Juin 2026)

**Solution** : Champ `source_season` au format `"YYYY-YYYY"`

### Strategie de changement de saison

```javascript
const CURRENT_SEASON = '2025-2026';

// 1. Fin de saison (Juin 2026)
await db.run(`
  UPDATE players
  SET archived = true,
      archived_reason = 'Fin de saison 2025-2026',
      archived_at = CURRENT_TIMESTAMP
  WHERE source_season = '2025-2026'
`);

// 2. Debut nouvelle saison (Aout 2026)
await importSeasonData('2026-2027', LIGUE_1_ID);

// 3. Toutes les requetes filtrent sur la saison active
const players = await db.all(`
  SELECT * FROM players
  WHERE source_season = ?
    AND archived = false
    AND matches_played > 0
`, [CURRENT_SEASON]);
```

**Avantages** :
- Historique complet preserve
- Peut comparer performances entre saisons
- Reset propre sans perte de donnees

**Pages futures (v1.1+)** :
- `/archive/2024-2025` - Classement final saison 2024-2025
- `/compare?s1=2024-2025&s2=2025-2026` - Comparaison entre saisons

---

## Gestion des transferts

| Scenario | Action | Votes conserves ? |
|----------|--------|-------------------|
| **Transfert interne L1** | UPDATE club | Oui |
| **Depart hors L1** | DELETE (hard delete) | Non |
| **Nouveau joueur** | INSERT | N/A |

### MVP : Gestion manuelle

```sql
-- Transfert interne (ex: Skriniar PSG -> OM)
UPDATE players
SET club = 'Olympique de Marseille'
WHERE name = 'Skriniar';

-- Depart hors L1 (ex: Mbappe -> Real Madrid)
DELETE FROM players
WHERE name = 'Kylian Mbappe';
```

### v1.1 : Script hebdomadaire automatique

```javascript
async function checkTransfers() {
  const allPlayers = await db.all('SELECT * FROM players');

  for (const player of allPlayers) {
    const currentData = await apiFootball.getPlayer(player.api_id);

    if (currentData.team !== player.club) {
      if (isLigue1Club(currentData.team)) {
        await db.run('UPDATE players SET club = ? WHERE id = ?',
          [currentData.team, player.id]);
      } else {
        await db.run('DELETE FROM players WHERE id = ?', [player.id]);
      }
    }
  }
}
```

**Frequence** :
- MVP : Manuelle (1x/mois si besoin)
- v1.1 : Automatique hebdomadaire (lundi)
- v1.2 : Quotidienne pendant mercato
