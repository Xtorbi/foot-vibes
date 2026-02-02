# 04 - User Stories

## Epic 1 : Choix du mode de vote

### US-1.1 : Voir tous les modes disponibles des l'arrivee

- **En tant qu'** utilisateur
- **Je veux** voir immediatement toutes les options (L1 + 18 clubs)
- **Afin de** commencer a voter en 1 clic

**Criteres d'acceptation** :
- [ ] Page d'accueil avec "Toute la Ligue 1" en evidence
- [ ] Les 18 clubs affiches directement (grid responsive)
- [ ] Desktop : 5-6 clubs par ligne (3-4 lignes total)
- [ ] Mobile : 2 clubs par ligne (9 lignes total)
- [ ] Clic sur un club ou L1 -> Vote direct (pas d'ecran intermediaire)
- [ ] Mode sauvegarde en localStorage pour la session

### US-1.2 : Changer de mode facilement

- **En tant qu'** utilisateur en session de vote
- **Je veux** pouvoir changer de mode (PSG -> OM par exemple)
- **Afin de** voter sur differents groupes de joueurs

**Criteres d'acceptation** :
- [ ] Icone gear en haut a droite de la page vote
- [ ] Clic -> Retour a la homepage
- [ ] Compteur de votes conserve entre les changements
- [ ] Confirmation visuelle du club selectionne

---

## Epic 2 : Voter au feeling

### US-2.1 : Voir un joueur et reagir instinctivement

- **En tant qu'** utilisateur
- **Je veux** voir un joueur avec sa photo
- **Afin de** reagir emotionnellement

**Criteres d'acceptation** :
- [ ] Photo du joueur (grande taille, >300px)
- [ ] Nom, club, poste visibles
- [ ] 3 boutons clairs : J'adore / Moyen / Beurk
- [ ] Temps de chargement < 1s
- [ ] Joueurs apparaissent aleatoirement

### US-2.2 : Voter rapidement en serie

- **En tant qu'** utilisateur
- **Je veux** que le joueur suivant apparaisse instantanement
- **Afin de** rester dans le flow

**Criteres d'acceptation** :
- [ ] Clic -> joueur suivant en < 0.5s
- [ ] Animation de transition fluide
- [ ] Pas de rechargement de page
- [ ] Compteur de votes visible

### US-2.3 : Voir ma progression et l'impact de mon vote

- **En tant qu'** utilisateur
- **Je veux** savoir combien j'ai vote et l'impact de mon dernier vote
- **Afin de** me sentir progresser et utile

**Criteres d'acceptation** :
- [ ] Compteur "Votes effectues : X"
- [ ] Optionnel : Barre de progression (X/450 ou X/25)
- [ ] Feedback apres chaque vote :
  - "Barcola est passe de #9 a #8 !" (si changement de rang)
  - "Ton vote compte ! Barcola reste #8" (si pas de changement)
  - Animation/message flash (2 secondes)
- [ ] Message d'encouragement tous les 10 votes (optionnel)

### US-2.4 : Voir les stats du joueur pour m'aider a decider

- **En tant qu'** utilisateur
- **Je veux** voir les stats de la saison du joueur
- **Afin de** baser mon vote sur sa forme actuelle

**Criteres d'acceptation** :
- [ ] Affichage differencie selon le poste :
  - Gardien : Clean sheets + Arrets
  - Joueur de champ : Buts + Passes D
- [ ] Nombre de matches joues visible
- [ ] Nationalite avec drapeau
- [ ] Stats claires et lisibles
- [ ] Si stats a 0 (pas joue) : affichage approprie

### US-2.5 : Changer de mode en cours de route

- **En tant qu'** utilisateur
- **Je veux** pouvoir passer de "PSG" a "L1 complete"
- **Afin d'** explorer d'autres joueurs

**Criteres d'acceptation** :
- [ ] Bouton/menu "Changer de mode" visible
- [ ] Retour a la selection de mode
- [ ] Votes deja effectues conserves
- [ ] Transition fluide

---

## Epic 3 : Consulter le classement

### US-3.1 : Voir le classement global ou par club

- **En tant qu'** utilisateur
- **Je veux** voir le classement
- **Afin de** decouvrir qui est le plus aime

**Criteres d'acceptation** :
- [ ] Classement global L1 par defaut
- [ ] Switch "Global" / "Mon club" (PSG)
- [ ] Tri par score (upvotes - downvotes)
- [ ] Rang, nom, club, poste, score affiches

### US-3.2 : Filtrer le classement

- **En tant qu'** utilisateur
- **Je veux** filtrer par poste ou club
- **Afin de** comparer ce qui est comparable

**Criteres d'acceptation** :
- [ ] Filtres : Tous / Gardien / Defenseur / Milieu / Attaquant
- [ ] Filtre par club (liste deroulante des 18)
- [ ] Combinaison filtres possible (ex: Attaquants PSG)
- [ ] Filtrage instantane (pas de reload)

### US-3.3 : Chercher un joueur specifique

- **En tant qu'** utilisateur
- **Je veux** chercher un joueur par nom
- **Afin de** voir son classement

**Criteres d'acceptation** :
- [ ] Barre de recherche
- [ ] Auto-completion
- [ ] Resultats en temps reel
- [ ] Affichage du rang du joueur
