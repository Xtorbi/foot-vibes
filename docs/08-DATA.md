# 08 - Donnees des clubs et import

## Les 18 clubs de Ligue 1 (saison 2024-2025)

### Liste officielle (noms selon L'Equipe.fr)

| Nom officiel | Nom court (UI) | Popularite | API-Football ID |
|--------------|----------------|------------|-----------------|
| Paris Saint-Germain | Paris SG | 100 | 85 |
| Olympique de Marseille | OM | 80 | 81 |
| Olympique Lyonnais | Lyon | 60 | 80 |
| AS Monaco | Monaco | 50 | 91 |
| LOSC Lille | Lille | 40 | 42 |
| OGC Nice | Nice | 35 | 108 |
| RC Lens | Lens | 30 | 83 |
| AS Saint-Etienne | Saint-Etienne | 30 | 1063 |
| Stade Rennais | Rennes | 25 | 94 |
| Stade Brestois 29 | Brest | 20 | 106 |
| RC Strasbourg Alsace | Strasbourg | 15 | 87 |
| Toulouse FC | Toulouse | 15 | 96 |
| Montpellier HSC | Montpellier | 15 | 82 |
| FC Nantes | Nantes | 15 | 84 |
| Stade de Reims | Reims | 12 | 547 |
| Le Havre AC | Le Havre | 10 | 79 |
| AJ Auxerre | Auxerre | 10 | 97 |
| Angers SCO | Angers | 10 | 532 |

Note : Le score de popularite est utilise pour l'algorithme de ponderation (voir 02-PERSONAS.md)

### Utilisation dans l'UI

**Homepage - Boutons clubs** : Noms courts uniquement
```
[Paris SG] [OM] [Lyon] [Monaco] [Lille] [Nice]
[Lens] [Rennes] [Brest] [Strasbourg] [Toulouse]
[Montpellier] [Nantes] [Reims] [Le Havre]
[Auxerre] [Angers] [Saint-Etienne]
```

**Page de vote - Header** : `MODE: Paris SG`
**Carte joueur** : `Paris SG - Attaquant`
**Classement** : `Club: Paris SG`

---

## Ponderation par popularite

### Tiers de clubs

```javascript
const CLUB_POPULARITY = {
  // Tier S - Les incontournables
  'Paris Saint Germain': 100,
  'Olympique de Marseille': 80,

  // Tier A - Clubs historiques
  'Olympique Lyonnais': 60,
  'AS Monaco': 50,
  'LOSC Lille': 40,

  // Tier B - Clubs etablis
  'OGC Nice': 35,
  'RC Lens': 30,
  'AS Saint-Etienne': 30,
  'Stade Rennais': 25,
  'Stade Brestois 29': 20,

  // Tier C - Autres clubs L1
  'RC Strasbourg': 15,
  'Toulouse FC': 15,
  'Montpellier HSC': 15,
  'FC Nantes': 15,
  'Stade de Reims': 12,
  'Le Havre AC': 10,
  'AJ Auxerre': 10,
  'Angers SCO': 10
};
```

---

## Configuration import API-Football

**Source** : https://www.api-football.com/

**Constantes** :
```javascript
const L1_LEAGUE_ID = 61;
const SEASON = 2024;

const L1_CLUBS = [
  { id: 'psg', name: 'Paris Saint-Germain', api_id: 85 },
  { id: 'om', name: 'Olympique de Marseille', api_id: 81 },
  { id: 'monaco', name: 'AS Monaco', api_id: 91 },
  { id: 'lyon', name: 'Olympique Lyonnais', api_id: 80 },
  { id: 'lille', name: 'LOSC Lille', api_id: 42 },
  { id: 'rennes', name: 'Stade Rennais', api_id: 94 },
  { id: 'nice', name: 'OGC Nice', api_id: 108 },
  { id: 'lens', name: 'RC Lens', api_id: 83 },
  { id: 'brest', name: 'Stade Brestois 29', api_id: 106 },
  { id: 'strasbourg', name: 'RC Strasbourg', api_id: 87 },
  { id: 'toulouse', name: 'Toulouse FC', api_id: 96 },
  { id: 'montpellier', name: 'Montpellier HSC', api_id: 82 },
  { id: 'nantes', name: 'FC Nantes', api_id: 84 },
  { id: 'reims', name: 'Stade de Reims', api_id: 547 },
  { id: 'lehavre', name: 'Le Havre AC', api_id: 79 },
  { id: 'auxerre', name: 'AJ Auxerre', api_id: 97 },
  { id: 'angers', name: 'Angers SCO', api_id: 532 },
  { id: 'saintetienne', name: 'AS Saint-Etienne', api_id: 1063 }
];
```

### Donnees importees par joueur

- **Infos personnelles** : Prenom, nom, club, poste, nationalite, age, numero
- **Photos officielles** (via API-Football)
- **Stats saison** :
  - Pour tous : Matches joues
  - Pour joueurs de champ : Buts, passes decisives
  - Pour gardiens : Clean sheets, arrets
- Positions normalisees en francais

### Mapping des positions

```javascript
function normalizePosition(apiPosition) {
  const mapping = {
    'Goalkeeper': 'Gardien',
    'Defender': 'Defenseur',
    'Midfielder': 'Milieu',
    'Attacker': 'Attaquant'
  };
  return mapping[apiPosition] || 'Milieu';
}
```

### Notes importantes

- L'API-Football fournit les stats de la saison en cours
- Pour les clean sheets : calcule approximativement (matchs sans but encaisse)
- Si un joueur n'a pas joue de match cette saison : toutes les stats a 0
- Les stats sont mises a jour une fois lors de l'import initial
- **v1.1** : Script de mise a jour hebdomadaire des stats
- API-Football : 100 requetes/jour (OK pour import)
