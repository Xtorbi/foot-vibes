# 03 - UX / UI

## Navigation

### Header minimaliste (toutes les pages)

**Principe** :
- Header simple avec logo/titre a gauche
- **1 seul lien a droite** : celui de l'autre page
  - Sur page Vote -> affiche "Classement"
  - Sur page Classement -> affiche "Voter"
- Sticky (reste en haut au scroll)
- Clean et pas surcharge

**Desktop** :
```
+------------------------------------------+
| FOOT VIBES              Classement       |
+------------------------------------------+
```

**Mobile** :
```
+------------------------------------------+
| FOOT VIBES                   Classement  |
+------------------------------------------+
```

### Comportement au clic

**Sur page Vote** : Header affiche "Classement" -> clic -> /classement
**Sur page Classement** : Header affiche "Voter" -> clic -> /vote

---

## Flow utilisateur complet

```
Homepage (affichage direct)
    |
    +-> Clic [TOUTE LA LIGUE 1] -> Vote (context=ligue1)
    |
    +-> Clic [PSG] -> Vote (context=psg)
    +-> Clic [OM] -> Vote (context=om)
    +-> Clic [Lyon] -> Vote (context=lyon)
    +-> ... (18 clubs affiches directement)
    |
    +-> Clic [Classement] -> Page classement

Note : 1 clic au lieu de 3 (pas d'ecran de selection intermediaire)
```

---

## Wireframes

### Homepage

**Desktop** :
```
+----------------------------------------------------+
| FOOT VIBES                        Classement       |
|----------------------------------------------------|
|                                                    |
|         +------------------------------+           |
|         |  TOUTE LA LIGUE 1            |           |
|         |  Vote sur tous les joueurs   |           |
|         |                              |           |
|         |     [C'EST PARTI ->]         |           |
|         +------------------------------+           |
|                                                    |
|         OU vote pour ton club :                    |
|                                                    |
|    [PSG]  [OM]  [Lyon]  [Monaco]  [Lille]  [Nice] |
|    [Lens] [Rennes] [Brest] [Strasbourg] [Toulouse]|
|    [Montpellier] [Nantes] [Reims] [Le Havre] [..] |
|                                                    |
+----------------------------------------------------+
```

**Mobile** :
```
+-----------------------+
| FOOT VIBES  Classement|
|-----------------------|
|                       |
|  +-----------------+  |
|  | TOUTE LA L1     |  |
|  | tous les joueurs|  |
|  |                 |  |
|  | [C'EST PARTI]   |  |
|  +-----------------+  |
|                       |
|  OU ton club :        |
|                       |
|  [PSG]     [OM]      |
|  [Lyon]    [Monaco]  |
|  [Lille]   [Nice]    |
|  [Lens]    [Rennes]  |
|  [Brest]   [Strasb.] |
|  [Toulouse][Montpel.]|
|  ... (18 clubs total) |
|                       |
+-----------------------+
```

### Page de vote

**Desktop** :
```
+------------------------------------------+
| FOOT VIBES              Classement       |
|------------------------------------------|
|  MODE: Paris SG                     gear |
|  Votes effectues : 12                    |
|                                          |
|         +-------------------+            |
|         |                   |            |
|         |    [PHOTO]        |            |
|         |     400x400       |            |
|         |                   |            |
|         +-------------------+            |
|                                          |
|          Bradley Barcola                 |
|          Paris SG - Attaquant            |
|          France - #29 - 22 ans           |
|                                          |
|          Cette saison :                  |
|          12 buts - 8 passes D            |
|          18 matches                      |
|                                          |
|  +-----------------------------------+   |
|  |        J'ADORE                    |   |  <- Bouton vert
|  +-----------------------------------+   |
|                                          |
|  +-----------------------------------+   |
|  |        MOYEN                      |   |  <- Bouton gris
|  +-----------------------------------+   |
|                                          |
|  +-----------------------------------+   |
|  |        BEURK                      |   |  <- Bouton rouge
|  +-----------------------------------+   |
|                                          |
+------------------------------------------+
```

**Exemple gardien (Donnarumma)** :
```
          Gianluigi Donnarumma
          Paris SG - Gardien
          Italie - #99 - 25 ans

          Cette saison :
          8 clean sheets - 67 arrets
          15 matches
```

**Raccourcis clavier** :
- Fleche gauche ou bouton = Down (Beurk)
- Fleche droite ou bouton = Up (J'adore)
- Fleche bas ou bouton = Neutral (Moyen)

### Page classement

```
+------------------------------------------+
| FOOT VIBES              Voter            |
|------------------------------------------|
|                                          |
|  MODE: o Global L1    * Paris SG         |
|                                          |
|  Filtres :                               |
|  [Tous] [Gardien] [Def] [Mil] [Att]     |
|                                          |
|  [Rechercher un joueur...]               |
|                                          |
|--+------------+-----+------+------------|
|# | Joueur     | Club| Poste| Score      |
|--+------------+-----+------+------------|
|1 | Barcola    | PSG | ATT  | +287       |
|2 | Dembele    | PSG | ATT  | +245       |
|3 | Donnarumma | PSG | GK   | +198       |
|4 | Marquinhos | PSG | DEF  | +156       |
|5 | Vitinha    | PSG | MIL  | +134       |
|  | ...        |     |      |            |
|--+------------+-----+------+------------|
|                                          |
|  [Charger plus] (25/25)                  |
|                                          |
+------------------------------------------+
```

---

## Design des boutons de vote

**Wording valide** :
- J'ADORE (positif, feeling general)
- MOYEN (neutre)
- BEURK (negatif, fun)

**Rationale** :
- Wording intemporel (pas lie a une performance recente)
- Permet a Kevin le footix de voter meme sans suivre chaque match
- Stats affichees fournissent le contexte necessaire
- Coherent avec "Foot Vibes" (feeling saison, pas perfo)

### Specs CSS boutons

```css
/* Bouton J'ADORE */
.vote-up {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 12px;
  width: 100%;
  min-height: 60px;
  cursor: pointer;
  transition: all 0.2s;
}

.vote-up:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.vote-up:active {
  transform: scale(0.98);
}

/* Bouton MOYEN */
.vote-neutral {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

/* Bouton BEURK */
.vote-down {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}
```

### Tailles responsive

```css
/* Mobile (< 768px) */
.player-photo { width: 300px; height: 300px; object-fit: cover; border-radius: 16px; }
.vote-button { min-height: 60px; font-size: 1.125rem; }

/* Desktop (>= 768px) */
@media (min-width: 768px) {
  .player-photo { width: 400px; height: 400px; }
  .vote-button { max-width: 400px; margin: 0 auto 1rem; }
}
```

---

## Animations

### Au vote

```css
/* Clic sur J'adore -> carte monte et fade out en vert */
.vote-up { animation: slideUpFade 0.4s ease-out; }

/* Clic sur Beurk -> carte descend et fade out en rouge */
.vote-down { animation: slideDownFade 0.4s ease-out; }

/* Clic sur Moyen -> simple fade out */
.vote-neutral { animation: fadeOut 0.3s ease-out; }

/* Nouveau joueur -> slide from bottom */
.player-enter { animation: slideInBottom 0.3s ease-out; }

/* Feedback apres vote -> apparait en haut, reste 2s, disparait */
.vote-feedback { animation: slideInTop 0.3s ease-out, fadeOut 0.3s ease-out 1.7s; }
```

### Messages feedback (apres chaque vote)

- Changement de rang : "Barcola : #9 -> #8 !"
- Pas de changement : "Ton vote compte ! Barcola reste #8"
- Nouveau dans le top 10 : "Barcola entre dans le top 10 !"
- Sort du top 10 : "Barcola : #9 -> #11"

### Messages encouragement

- 10 votes : "10 votes ! Continue !"
- 25 votes : "25 votes ! T'es chaud !"
- 50 votes : "50 votes ! Champion !"
- 100 votes : "100 votes ! Legende !"

---

## Gestes / Interactions

**Desktop** :
- Clic sur bouton J'adore / Moyen / Beurk
- Raccourcis clavier : fleche gauche (down) / fleche droite (up) / fleche bas (neutral)

**Mobile** :
- Tap sur boutons
- **Optionnel v1.1** : Swipe gauche/droite/bas
