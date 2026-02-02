# 02 - Personas & Strategie d'engagement

## Personas utilisateurs

### Persona 1 : "Thomas, 28 ans, fan omnivore de L1"
- Regarde plusieurs matchs par week-end
- Aime tous les clubs, pas de preference marquee
- Veut decouvrir des joueurs de tous les clubs
- **Use case** : Vote sur toute la L1

### Persona 2 : "Marie, 35 ans, fan PSG hardcore"
- Ne regarde QUE les matchs du PSG
- Connait tous les joueurs PSG par coeur
- Pas tres interessee par les autres clubs
- **Use case** : Vote uniquement sur PSG

### Persona 3 : "Lucas, 22 ans, fan OM passionne"
- Supporter OM depuis l'enfance
- Deteste le PSG (rivalite)
- Aime comparer OM vs autres clubs
- **Use case** : Vote d'abord sur OM, puis sur L1 complete

### Persona 4 : "Kevin, 19 ans, footix casual" (IMPORTANT)
- Regarde surtout les gros matchs a la tele
- Ne connait que les stars : Mbappe, Dembele, Lacazette...
- Suit le PSG et l'OM par defaut (gros clubs)
- **Ne connait PAS** les joueurs de Brest, Auxerre, Le Havre
- **Risque** : Si on lui montre trop de joueurs inconnus -> bounce
- **Use case** : Veut voter sur les stars d'abord, decouvrir ensuite

**Enjeu cle** : Ne pas perdre Kevin dans les 30 premieres secondes !

---

## Strategie d'engagement pour le footix casual

### Probleme identifie

**Scenario catastrophe** :
```
Kevin arrive sur le site
Vote 1 : Joueur de Brest inconnu -> "C'est qui ?"
Vote 2 : Joueur d'Auxerre inconnu -> "Connais pas"
Vote 3 : Joueur de Strasbourg inconnu -> "Ca m'interesse pas"
-> QUITTE LE SITE (bounce)
```

### Solution : Algorithme de demarrage intelligent

**Principe** : Commencer par les stars, puis introduire progressivement les autres

#### 1. Ponderation par popularite du club

```javascript
function getSmartWeightedPlayer(voteCount, context, excludeIds = []) {
  const players = await db.all(`
    SELECT * FROM players
    WHERE matches_played > 0
    AND (club = ? OR ? = 'ligue1')
    AND id NOT IN (?)
  `, [context, context, excludeIds]);

  const weights = players.map(p => {
    let baseWeight = 100;

    // Penalite votes (favorise joueurs peu votes)
    const votePenalty = Math.log(p.total_votes + 1) * 10;

    // Bonus club populaire (SURTOUT au debut)
    const clubBonus = CLUB_POPULARITY[p.club] || 10;

    // Bonus degressif selon le nombre de votes de l'utilisateur
    // Plus le user vote, moins le bonus club compte
    const bonusMultiplier = Math.max(0, 1 - (voteCount / 50));

    return Math.max(1, baseWeight - votePenalty + (clubBonus * bonusMultiplier));
  });

  return weightedRandomChoice(players, weights);
}
```

**Resultat** :
- **Votes 1-10** : Tres forte probabilite de voir PSG/OM/Lyon (Kevin content)
- **Votes 11-30** : Mix stars + joueurs moins connus
- **Votes 31+** : Equilibrage normal (tous les clubs)

#### 2. Mode "Onboarding" - Les 3 premiers votes

Garantir les 3 premiers votes sur des stars :

```javascript
const ONBOARDING_STARS = [
  'Kylian Mbappe', 'Ousmane Dembele', 'Bradley Barcola',   // PSG
  'Pierre-Emerick Aubameyang', 'Mason Greenwood',           // OM
  'Alexandre Lacazette', 'Nemanja Matic',                   // Lyon
  'Folarin Balogun', 'Denis Zakaria',                       // Monaco
  'Jonathan David'                                           // Lille
];

async function getPlayerForVote(voteCount, context) {
  // Les 3 premiers votes = stars garanties
  if (voteCount < 3) {
    return getRandomFromList(ONBOARDING_STARS.filter(notVotedYet));
  }

  // Apres : algorithme pondere normal
  return getSmartWeightedPlayer(voteCount, context);
}
```

#### 3. Message d'encouragement adapte

Apres les 3 premiers votes :
```
3 votes ! Tu es lance !
Decouvre maintenant d'autres talents de la Ligue 1...
```

---

## Impact sur les metriques

### Sans strategie footix
```
100 footix arrivent
- 60 voient joueur inconnu en premier
- 40 d'entre eux partent (bounce 40%)
- 60 restent et votent
Resultat : 60 utilisateurs actifs
```

### Avec strategie footix
```
100 footix arrivent
- 90 voient star PSG/OM/Lyon en premier
- 5 partent quand meme (bounce 5%)
- 95 restent et votent
Resultat : 95 utilisateurs actifs (+58%)
```

---

## Decroissance du bonus popularite

```javascript
// Formule de decroissance
bonusMultiplier = Math.max(0, 1 - (voteCount / 50));

// Exemples :
// Vote 0  : multiplier = 1.0  (bonus 100%)
// Vote 10 : multiplier = 0.8  (bonus 80%)
// Vote 25 : multiplier = 0.5  (bonus 50%)
// Vote 50+: multiplier = 0.0  (bonus 0%, algo normal)
```

**Resultat** : Transition douce stars -> tous joueurs
