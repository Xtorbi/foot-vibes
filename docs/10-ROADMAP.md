# 10 - Roadmap & Plan de developpement

## Plan de developpement en 10 etapes

| Etape | Nom | Contenu |
|-------|-----|---------|
| 1 | Scaffolding projet | Init monorepo, React+Vite+Tailwind, Express+SQLite, config, structure dossiers, .env, proxy dev |
| 2 | Base de donnees | Schema SQLite (tables players + votes), indexes, migration, module database.js |
| 3 | Import API-Football | Script importPlayers.js, mapping positions FR, extraction stats, rate limiting API, seed de test |
| 4 | API Backend - Joueurs | Routes GET /api/players/random, GET /api/players, GET /api/players/:id, GET /api/contexts, GET /api/ranking |
| 5 | API Backend - Votes | Route POST /api/vote, logique scoring, rate limiting, IP tracking, feedback changement de rang |
| 6 | Frontend - Homepage | Page d'accueil CTA "Toute la L1" + grille 18 clubs, routing React Router, ModeContext, localStorage |
| 7 | Frontend - Page Vote | PlayerCard, VoteButtons, algorithme selection pondere, compteur votes, animations, raccourcis clavier |
| 8 | Frontend - Classement | RankingTable, filtres poste/club, recherche joueur, switch Global/Club, pagination |
| 9 | Header + Navigation + Polish | Header sticky contextuel, responsive mobile-first, charte graphique, animations vote, messages encouragement |
| 10 | Tests + Deploiement | Tests fonctionnels, build production, deploiement Vercel + Railway/Render, HTTPS, verification finale |

---

## Checklist MVP

### Fonctionnel
- [ ] Selection mode L1 / Mon club
- [ ] Selection du club (18 choix)
- [ ] Vote sur joueur (up/neutral/down)
- [ ] Affichage stats joueur (adaptees au poste)
- [ ] Joueur suivant instantane
- [ ] Compteur votes
- [ ] Classement global
- [ ] Classement par club
- [ ] Filtres poste/club
- [ ] Recherche joueur
- [ ] Changement de mode

### Technique
- [ ] Tous les joueurs importes
- [ ] Photos chargent < 2s
- [ ] API repond < 200ms
- [ ] Base SQLite fonctionnelle
- [ ] Pas d'erreurs console

### Design
- [ ] Responsive mobile
- [ ] Animations fluides
- [ ] Charte graphique appliquee
- [ ] Boutons clairs (CTA)

### Deploiement
- [ ] Frontend deploye (Vercel)
- [ ] Backend deploye (Railway)
- [ ] Base de donnees montee
- [ ] URLs propres
- [ ] HTTPS actif

---

## KPIs MVP

- **Votes** : >500 votes dans les 7 premiers jours
- **Engagement** : >15 votes par session en moyenne
- **Retention** : >30% des users reviennent J+1
- **Performance** : Temps chargement page < 2s

### Analytics a tracker
- Votes par mode (L1 vs clubs)
- Clubs les plus votes
- Joueurs les plus votes
- Votes par poste
- Taux de completion (combien % des joueurs votes)
- Temps moyen par vote

---

## Roadmap post-MVP

### v1.1
- [ ] Swipe mobile (gauche/droite)
- [ ] Animations avancees
- [ ] Stats par joueur detaillees (% positif, total votes)
- [ ] Script de mise a jour des stats hebdomadaire (automatique)
- [ ] Partage sur reseaux sociaux
- [ ] Classements "tendances" (7 derniers jours)
- [ ] Browser fingerprinting (anti-spam)
- [ ] 1 seul vote par joueur par utilisateur

### v1.2
- [ ] Legendes PSG (pilote)
- [ ] Legendes OM (pilote)
- [ ] Curation 50 legendes par club
- [ ] Pages dediees /psg/legends

### v2.0
- [ ] Authentification (limiter spam)
- [ ] Historique personnel des votes
- [ ] Comparaison clubs (PSG vs OM)
- [ ] Mode "Battle Royale"
- [ ] API publique du classement
- [ ] Autres championnats (EPL, Liga)

---

## Contraintes et risques

### Contraintes legales
- Photos joueurs : API-Football (droits OK)
- Logos clubs : Ne pas utiliser (ou domaine public)
- Mention : "Site non officiel"

### Contraintes techniques
- API-Football : 100 requetes/jour (OK pour import)
- SQLite : Limite 1TB (largement suffisant)
- Pas d'auth = possibilite spam votes

### Risques identifies

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Spam de votes | Moyen | Rate limiting (1 vote/2s) + IP tracking |
| API-Football down | Fort | Cache local des joueurs |
| Photos cassees | Faible | Placeholder si erreur |
| Surcharge serveur | Moyen | Demarrer gratuit, scale si besoin |

---

## Decisions de conception validees

- Vote individuel (pas comparaison paires)
- L1 complete des le MVP (tous les joueurs)
- Choix du mode des la home (L1 vs club)
- 18 clubs affiches directement sur homepage
- Score simple : upvotes - downvotes
- Nom : Foot Vibes
- Design : Swipe/feeling type TikTok
- Filtre : Minimum 1 match joue cette saison
- Ponderation : Favorise joueurs peu votes + gros clubs au debut
- Wordings vote : J'adore / Moyen / Beurk
- Transferts : UPDATE club si interne L1, DELETE si depart hors L1

### Decisions reportees (v1.1+)
- Authentification utilisateurs
- Legendes historiques
- Autres championnats
- Mode battle royale
- Classements multiples (semaine/mois)
