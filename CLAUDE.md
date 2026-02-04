# CLAUDE.md - Foot Vibes

**Derniere mise a jour** : 4 fevrier 2026

---

## Etat general du projet

**Statut** : MVP DEPLOYE EN PRODUCTION

Le projet Foot Vibes est une application web de vote emotionnel pour classer les joueurs de Ligue 1. Les utilisateurs votent sur des joueurs (pouce haut / neutre / pouce bas) pour creer un classement communautaire base sur le ressenti des fans.

### URLs de production

- **Frontend** : https://frontend-xtorbis-projects.vercel.app
- **Backend API** : https://foot-vibes-api.onrender.com
- **GitHub** : https://github.com/Xtorbi/foot-vibes

### Session du 4 fevrier 2026 (soir) - Design Vibes

**Nouveau fond anime "Vibes" (index.css)** :
- Classe `.bg-vibes` : ondes animees avec effet parallaxe
- 2 couches d'ondes a vitesses differentes (80s et 60s)
- Ondes en SVG avec degradé vertical (6% opacite en haut, fondu a 30%)
- Couleurs : turquoise (#10B981) + indigo (#6366f1)
- Applique sur les 3 pages : Home, Vote, Classement

**Cartes clubs flat (ClubGrid.jsx)** :
- Fond unifie `bg-white/10` (plus de degrade par club)
- Hover : `bg-white/15`
- `backdrop-blur-sm` pour flouter les ondes derriere

**Page Classement - Top 3 turquoise (RankingTable.jsx)** :
- 1er : turquoise plein (`bg-emerald-500`)
- 2e : turquoise 70% (`bg-emerald-500/70`)
- 3e : turquoise 40% (`bg-emerald-500/40`)
- Plus de style or/argent/bronze

**Drapeaux nationalites - variantes francaises ajoutees** :
- ~50 nouvelles variantes : Allemagne, Espagne, Bresil, Senegal, etc.
- Toutes les nationalites de la BDD maintenant mappees

**Page Vote - viewport optimise** :
- Layout `h-[calc(100vh-64px)]` avec flex center
- Plus besoin de scroller pour voir les boutons
- Espacements reduits : stats py-2, club pb-3, hint mt-4

**Carte joueur - formatage noms (PlayerCard.jsx)** :
- Prenom : capitalize (Geronimo, pas GERONIMO)
- Club : formatage intelligent (Olympique de Marseille)
- Fonction `formatClubName()` : mots de liaison en minuscules

**Logo glow reduit (index.css)** :
- text-shadow : 20px/35% + 40px/15% (etait 30px/50% + 60px/30%)

**BDD - position corrigee** :
- "Defenseur" → "Défenseur" (avec accent)
- Contrainte CHECK mise a jour

**Fichiers modifies** :
- `frontend/src/index.css` : classe `.bg-vibes`, logo-glow reduit
- `frontend/src/pages/Home.jsx` : bg-vibes
- `frontend/src/pages/Vote.jsx` : bg-vibes, layout viewport
- `frontend/src/pages/Ranking.jsx` : bg-vibes
- `frontend/src/components/ClubGrid.jsx` : cartes flat
- `frontend/src/components/RankingTable.jsx` : top 3 turquoise, nationalites FR
- `frontend/src/components/PlayerCard.jsx` : formatage noms, espacements
- `backend/database/ligue1.db` : position Défenseur

---

### Session du 4 fevrier 2026 (matin)

**Refonte page d'accueil (Home.jsx)** :
- Grand logo "FOOT VIBES" central (5xl a 7xl responsive)
- Effet glow vert sur "VIBES" (text-shadow)
- Header masque sur homepage (evite redite logo)
- Header sticky qui apparait au scroll (> 80px) avec logo reduit + nav
- Bouton "Voir le classement" ajoute a cote du CTA principal
- Boutons CTA homogeneises (meme hauteur py-4, meme padding px-8)
- Tagline : "Vote pour tes joueurs de Ligue 1 preferes"

**Cartes clubs (ClubGrid.jsx)** :
- Fond degrade aux couleurs de chaque club (opacite 30%/15%) → remplace par flat en session soir
- Disposition verticale : logo au-dessus du nom
- Hover : bordure verte + glow vert (coherence logo VIBES)
- Logos plus grands (w-12 h-12)

**Couleurs clubs (config/clubs.js)** :
- Ajout propriete `colors` pour chaque club (2 couleurs principales)
- PSG (#004170, #DA291C), OM (#2FAEE0, #FFFFFF), Lyon (#1A3E8F, #E30613)...

**Page Vote - UX amelioree** :
- Ajout message d'erreur visible si API indisponible
- Bouton "Reessayer" pour recharger le joueur
- Affichage "X votes recus" du joueur (total_votes)
- Compteur perso "Mes votes : X" sous les boutons
- Bouton neutre remplace par emoji 🤔 stylise (je ne sais pas)
- Messages paliers theme foot :
  - 10 : "Tu t'es bien echauffe"
  - 25 : "Quelle aisance balle au pied"
  - 50 : "Ciseau-retourne"
  - 100 : "Quelle merveille !"
  - 250 : "Mais ou t'arreteras-tu ?"
  - 500 : "Hall of Fame !"

**Stats gardiens (backend)** :
- Script `updateGoalkeeperStats.js` via API SofaScore
- Source : https://api.sofascore.com (saison 77356 = 2025-2026)
- Stats recuperees : clean_sheets, saves, matches
- 32 gardiens mis a jour avec donnees reelles

---

### Session du 3 fevrier 2026 (soir)

**Refonte carte joueur (PlayerCard.jsx)** :
- Stats en tableau 2 colonnes : label a gauche, valeur a droite
- Chiffres en blanc gras (`text-white font-bold text-xl`)
- Plus d'espace vertical dans les stats (`py-3`)
- Nom de famille plus grand (`text-2xl`)
- Espace sous le club (`pb-6`)

**Page Classement - nouveaux filtres** :
- Filtre par periode : 7 jours / 30 jours / Toute la saison
- Filtre par club : dropdown "Tous les clubs" + 18 clubs
- Filtre par poste : dropdown "Tous les postes"
- Toggle "Francais uniquement" : style iOS (rond blanc qui glisse)
- Drapeaux nationalites affiches via flagcdn.com

**Backend - nouveaux parametres API /ranking** :
- `period` : week / month / (vide = saison)
- `nationality` : filtre par nationalite (ex: "France")
- Index ajoute sur `votes.voted_at` pour performances

**Mapping nationalites (RankingTable.jsx)** :
- ~100 nationalites mappees vers codes ISO (flagcdn.com)
- Inclut variantes francaises : Angleterre, Argentine, Cameroun, Grece, Pologne, Tchequie

**Tailwind config** :
- Couleur `fv-gold` ajoutee (#F5A623)

---

### Session du 3 fevrier 2026 (matin)

**Typographie titres** :
- Font heading : **Bebas Neue** (condensee, bold, style sport/affiche)
- Remplace Montserrat pour les titres
- `tracking-wide` ajoute pour aerer les lettres
- Fonts testees : Bebas Neue, Oswald, Anton, Russo One → Bebas Neue retenue

**Ajustements design page Vote** :
- Fond : nouveau style `bg-aurora-static` (gradient bleu/violet statique, sans animation)
- Feedback vote : repositionne en overlay (ne decale plus la carte)
- Fix blink au changement de joueur (reset player a null avant chargement)

**Ajustements UI** :
- CTA en minuscules : "Voter", "Classement", "Commencer a voter"
- Stats carte joueur : "PD" remplace par "Passes D."

**Styles de fond disponibles** (index.css) :
- Statiques : `bg-deep`, `bg-glow`, `bg-corner`, `bg-dual`, `bg-aurora-static`
- Animes : `bg-aurora`, `bg-mesh`, `bg-grid`, `bg-aurora-intense`

**Configuration Tailwind** (tailwind.config.js) :
- `fontFamily.heading` : Bebas Neue
- `fontFamily.sans` : Inter

---

### Session du 2 fevrier 2026 (soir)

**Deploiement effectue** :
- Backend deploye sur Render (region Frankfurt)
- Frontend deploye sur Vercel
- SPA routing configure (vercel.json)
- API health check OK

**Modifications UI** :
- Bouton downvote rouge plein
- Retrait emojis devant les postes
- Logo club affiche sur la carte joueur
- Logo club dans le header en mode club
- Bouton CLASSEMENT homogene avec VOTER
- Alias clubs BDD -> logos (LOSC Lille, Paris Saint-Germain, etc.)
- Fix logo Paris FC (ID 10004)

**Tests design fond anime** :
- Style "Aurora" (gradient bleu/violet anime) : RETENU - subtil et agreable
- Style "Mesh" (bulles flottantes) : teste, pas retenu
- Style "Grid" (grille + grain) : teste, pas retenu
- Style "Aurora Intense" (couleurs vives + glow) : teste, trop charge

**A explorer plus tard** :
- Autres styles de fond (waves, particles, spotlight)
- Trouver le bon equilibre entre sobre et wahou

---

## Donnees en base

**Import du 2 fevrier 2026** via Transfermarkt :
- **481 joueurs** des 18 clubs de L1 2025-2026
- **440 joueurs** avec au moins 1 match joue
- Stats a jour (buts, passes, matchs)
- Photos OK

**Top buteurs** : Greenwood (21), Panichelli (13), Sulc (12), Marriott (12), Ramos (10)

**Clubs** :
- PSG, OM, Lyon, Monaco, Lille, Nice, Lens, Rennes, Brest
- Strasbourg, Toulouse, Nantes, Le Havre, Auxerre, Angers
- **Promus** : Lorient, Paris FC, Metz

---

## Ce qui est fait

### Frontend (React + Vite + TailwindCSS)

| Composant | Fichier | Statut | Notes |
|-----------|---------|--------|-------|
| App principal | `src/App.jsx` | OK | Routing configure (/, /vote, /classement) |
| Header | `src/components/Header.jsx` | OK | Navigation dynamique selon la page |
| Page Home | `src/pages/Home.jsx` | OK | CTA Ligue 1 + grille des 18 clubs |
| Page Vote | `src/pages/Vote.jsx` | OK | Interface de vote complete avec raccourcis clavier |
| Page Classement | `src/pages/Ranking.jsx` | OK | Filtres club, poste, periode, nationalite, recherche |
| ClubGrid | `src/components/ClubGrid.jsx` | OK | Grille des 18 clubs cliquables |
| PlayerCard | `src/components/PlayerCard.jsx` | OK | Carte joueur avec stats adaptees au poste |
| VoteButtons | `src/components/VoteButtons.jsx` | OK | 3 boutons ronds (pouce bas/neutre/pouce haut) |
| RankingTable | `src/components/RankingTable.jsx` | OK | Tableau classement avec rang, drapeau, nom, club, score |
| ModeContext | `src/contexts/ModeContext.jsx` | OK | Gestion mode (L1/club) + compteur votes en localStorage |
| API utils | `src/utils/api.js` | OK | Fonctions fetch pour l'API |

**Configuration Tailwind** : Couleurs custom (fv-blue, fv-red, fv-gold, fv-bg), fonts (Inter, Montserrat)

### Backend (Node.js + Express + SQLite)

| Element | Fichier | Statut | Notes |
|---------|---------|--------|-------|
| Serveur | `server.js` | OK | Express, CORS, init DB |
| Database | `models/database.js` | OK | sql.js, auto-save, helpers (queryAll, queryOne, runSql) |
| Config clubs | `config/clubs.js` | OK | 18 clubs L1 2025-2026 avec Transfermarkt IDs |
| Routes players | `routes/players.js` | OK | /random, /players, /players/:id, /ranking, /contexts |
| Routes votes | `routes/votes.js` | OK | POST /vote avec middlewares |
| Controller players | `controllers/playersController.js` | OK | Algo pondere par recence + popularite club |
| Controller votes | `controllers/votesController.js` | OK | Gestion vote + feedback rang |
| Rate limiter | `middleware/rateLimiter.js` | OK | 1 vote / 2 secondes |
| IP tracker | `middleware/ipTracker.js` | OK | 100 votes max / jour / IP |

### Base de donnees

| Table | Statut | Notes |
|-------|--------|-------|
| players | OK | Schema complet avec stats, votes, saison, archive |
| votes | OK | Historique des votes avec context |
| league_status | OK | Journee actuelle de la ligue |

**Saison configuree** : 2025-2026

**Clubs** : 18 clubs avec promus (Lorient, Paris FC, Metz) et relegues (Montpellier, Saint-Etienne, Reims)

### Scripts d'import

| Script | Statut | Notes |
|--------|--------|-------|
| importPlayers.js | Cree | Import initial API-Football |
| importTransfermarkt.js | Cree | Import via Transfermarkt |
| updateStats.js | Cree | Mise a jour stats |
| checkDb.js | Cree | Verification donnees |
| verifyData.js | Cree | Validation donnees |
| + nombreux scripts de test/scraping | Crees | Tests L'Equipe, Transfermarkt, etc. |

---

## Ce qui reste a faire

### Priorite haute (pour lancer le MVP)

- [x] **Verifier les donnees en BDD** : 481 joueurs importes (2 fev 2026)
- [x] **Tester l'app de bout en bout** : API testee OK, frontend sur port 5180
- [x] **Test manuel complet** : Navigation, vote, classement OK (2 fev soir)
- [x] **Deploiement** :
  - [x] Frontend sur Vercel : https://frontend-xtorbis-projects.vercel.app
  - [x] Backend sur Render : https://foot-vibes-api.onrender.com
  - [ ] Configuration domaine footvibes.fr (optionnel)

### Priorite moyenne (polish v1.1)

- [ ] **Design** :
  - [ ] Verifier responsive mobile (tester sur telephone)
  - [ ] Ajouter animations de transition au vote (fade in/out)
  - [ ] Messages d'encouragement tous les 10/25/50 votes
- [ ] **UX** :
  - [ ] Feedback visuel ameliore apres vote (animation confetti ou similar)
  - [ ] Placeholder si photo joueur manquante (silhouette generique)
  - [ ] Loader pendant chargement joueur suivant
- [ ] **Anti-spam v1.1** :
  - [ ] Browser fingerprinting (FingerprintJS)
  - [ ] 1 vote par joueur par utilisateur (localStorage + backend)

### Priorite basse (post-MVP v1.2+)

- [ ] Swipe mobile (gauche/droite style Tinder)
- [ ] Partage reseaux sociaux (Twitter/X, Instagram story)
- [x] Classements tendances (7 derniers jours, movers) - filtres periode implementes
- [ ] Legendes historiques (anciens joueurs L1)
- [ ] Authentification utilisateurs (v2.0)
- [ ] Comparaison joueurs (face a face)

---

## Suggestions pour la suite

### Option A : Deployer maintenant (recommande)

Le MVP est fonctionnel. Deployer rapidement permet de :
1. Collecter des vrais votes et feedback utilisateurs
2. Identifier les vrais problemes (pas ceux qu'on imagine)
3. Creer de l'engagement avant la fin de saison L1

**Etapes deploiement** :
1. Creer compte Vercel + deployer frontend (gratuit)
2. Creer compte Railway/Render + deployer backend avec BDD
3. Configurer variables d'environnement (API_URL)
4. Tester en production
5. Configurer domaine footvibes.fr (si achete)

### Option B : Polish avant deploiement

Si l'objectif est une experience plus finie :
1. Ajouter animations de vote (1-2h)
2. Tester/corriger responsive mobile (1-2h)
3. Ajouter messages d'encouragement (30min)
4. Puis deployer

### Option C : Ameliorations fonctionnelles

Avant deploiement, ajouter des features differenciantes :
1. Partage "Mon classement" sur reseaux sociaux
2. Badge/titre selon nombre de votes (Rookie, Expert, Legende)
3. Statistiques personnelles (joueurs les plus votes, etc.)

---

## Architecture technique

```
Billboard/
├── frontend/                 # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/       # Header, PlayerCard, VoteButtons, etc.
│   │   ├── contexts/         # ModeContext (mode L1/club + compteur)
│   │   ├── pages/            # Home, Vote, Ranking
│   │   └── utils/            # api.js (fetch functions)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                  # Node.js + Express + sql.js
│   ├── config/               # clubs.js (18 clubs L1)
│   ├── controllers/          # playersController, votesController
│   ├── middleware/           # rateLimiter, ipTracker
│   ├── models/               # database.js (SQLite)
│   ├── routes/               # players.js, votes.js
│   ├── scripts/              # Import, scraping, verification
│   └── server.js
│
├── database/
│   └── ligue1.db             # SQLite database
│
├── docs/                     # Documentation detaillee
│   ├── 01-BRAND.md
│   ├── 02-PERSONAS.md
│   ├── 03-UX-UI.md
│   ├── 04-USER-STORIES.md
│   ├── 05-ARCHITECTURE.md
│   ├── 06-API.md
│   ├── 07-ANTI-SPAM.md
│   ├── 08-DATA.md
│   ├── 09-SCORING.md
│   └── 10-ROADMAP.md
│
└── REQUIREMENTS.md           # Spec complete du projet
```

---

## API Endpoints implementes

| Methode | Route | Description |
|---------|-------|-------------|
| GET | /api/players/random | Joueur aleatoire pondere (recence + popularite) |
| GET | /api/players | Liste joueurs filtree |
| GET | /api/players/:id | Details joueur avec rang |
| GET | /api/ranking | Classement avec filtres (club, position, period, nationality, search) |
| GET | /api/contexts | Liste des modes (L1 + 18 clubs) |
| POST | /api/vote | Enregistrer un vote |
| GET | /api/health | Health check |

---

## Algorithme de selection joueur

L'algo de selection du joueur suivant utilise 2 criteres :

1. **Recence de la derniere journee jouee** (80/15/4/1%) :
   - 80% : Joueurs ayant joue la journee actuelle
   - 15% : J-1
   - 4% : J-2
   - 1% : Plus ancien

2. **Ponderation dans le bucket** :
   - Penalite votes (favorise joueurs peu votes)
   - Bonus club populaire (PSG/OM en premier pour les nouveaux users)

---

## Commandes utiles

```bash
# Frontend
cd frontend
npm install
npx vite --port 5180    # Dev server sur http://localhost:5180

# Backend
cd backend
npm install
npm start               # API sur http://localhost:3001

# Verification BDD
cd backend
node scripts/checkDb.js

# Reimport donnees Transfermarkt (si besoin)
cd backend
node scripts/importTransfermarkt.js
```

**Note** : Port 5173 souvent occupe par autre projet (MPG), utiliser 5180 pour Foot Vibes.

---

## Notes importantes

1. **Saison** : Configure pour 2025-2026, les clubs ont ete mis a jour avec les promus/relegues
2. **Photos** : Utilise les photos de l'API (Transfermarkt ou API-Football)
3. **Anti-spam** : Rate limiting (2s) + IP tracking (100/jour) implementes
4. **Positions** : Gardien, Defenseur, Milieu, Attaquant (en francais sans accents dans la BDD)
5. **Scores** : upvotes - downvotes (minimum 1 vote pour apparaitre au classement)

---

## Historique des decisions

| Date | Decision |
|------|----------|
| Janvier 2026 | Rebrand "Billboard" -> "Foot Vibes" |
| Janvier 2026 | Choix stack : React + Vite + TailwindCSS / Express + SQLite |
| Janvier 2026 | Wording votes : Pouce haut / Neutre / Pouce bas (icones) |
| Janvier 2026 | Algo pondere par recence de match + popularite club |
| Janvier 2026 | 18 clubs directement sur homepage (pas d'ecran intermediaire) |
| Janvier 2026 | Saison 2025-2026 avec nouveaux promus/relegues |
| 2 fev 2026 | Reimport donnees Transfermarkt : 481 joueurs, bons clubs 2025-2026 |
| 2 fev 2026 | Mise a jour ClubGrid.jsx : retrait relegues, ajout promus |
| 2 fev 2026 | Tests API OK, frontend sur port 5180 (5173 occupe par MPG) |
| 2 fev 2026 (soir) | Test complet MVP : navigation, vote, classement OK - pret pour deploiement |
| 2 fev 2026 (soir) | Deploiement : Backend sur Render, Frontend sur Vercel |
| 2 fev 2026 (soir) | UI : bouton downvote rouge, logos clubs, boutons homogenes |
| 2 fev 2026 (soir) | Design : style Aurora retenu (gradient anime subtil) |
| 3 fev 2026 | Typo titres : Bebas Neue retenue (vs Oswald, Anton, Russo One) |
| 3 fev 2026 | PlayerCard : stats en tableau 2 colonnes, nom agrandi |
| 3 fev 2026 | Classement : filtres periode (7j/30j/saison), club, nationalite |
| 3 fev 2026 | Drapeaux nationalites via flagcdn.com |
| 3 fev 2026 | Toggle iOS pour filtre "Francais uniquement" |
| 4 fev 2026 | Refonte homepage : grand logo + cartes clubs colorees |
| 4 fev 2026 | Header sticky au scroll sur homepage |
| 4 fev 2026 | Vert fv-green (#10B981) comme fil conducteur design |
| 4 fev 2026 (soir) | Fond "Vibes" : ondes animees parallaxe sur toutes les pages |
| 4 fev 2026 (soir) | Cartes clubs flat (bg-white/10) - abandon des couleurs par club |
| 4 fev 2026 (soir) | Top 3 classement : turquoise avec opacites (plus d'or/argent/bronze) |
| 4 fev 2026 (soir) | Vote : layout viewport sans scroll |
| 4 fev 2026 (soir) | Noms clubs : formatage intelligent (Olympique de Marseille) |
