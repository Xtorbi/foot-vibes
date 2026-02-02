# REQUIREMENTS - Foot Vibes

## 📋 Vue d'ensemble du projet

### Nom du projet
**Foot Vibes**

**URL** : footvibes.fr (et footvibes.com si disponible)

**Tagline** : "Envoie tes vibes"

### Description
Une application web de vote émotionnel/feeling pour classer les joueurs de Ligue 1. Les utilisateurs voient un joueur et réagissent instinctivement (👍 j'adore / 😐 neutre / 👎 bof) pour créer un classement communautaire basé sur le ressenti des fans.

### Pitch en une phrase
"Vote au feeling, partage tes vibes."

---

## 🎨 Identité de marque - Foot Vibes

### Nom et positionnement

**Nom** : Foot Vibes
**Prononciation** : "Foot Vaïbz"
**Tagline** : **"Envoie tes vibes"**

**Signification** : 
- "Foot" = Football, évident et universel
- "Vibes" = Ressenti, ambiance, énergie (mot moderne)
- Ensemble = "Le ressenti du foot", "L'ambiance du foot français"

### Taglines possibles

**Principal** : **"Envoie tes vibes"** ⭐

**Alternatives** :
- "Classe les joueurs"
- "Ta vibe, ton classement"
- "Vote ta vibe"

### Ton de communication

**Moderne et cool** :
- Jeune sans être trop familier
- Fun mais pas enfantin
- Passionné foot mais pas élitiste
- Inclusif (footix welcome)

**Exemples de phrases** :
- ✅ "Partage ton vibe sur les joueurs de L1"
- ✅ "Qui t'envoie des bonnes vibes ce mois-ci ?"
- ❌ "Trop de la balle ce joueur" (trop familier)
- ❌ "Évaluez objectivement les performances" (trop sérieux)

### Identité visuelle (suggestions)

**Couleurs** :
- Primaire : Bleu roi (#004170) - référence bleu France
- Secondaire : Rouge vif (#E2001A) - passion foot
- Accent : Jaune/or (#FFD700) - podium, excellence
- Fond : Blanc cassé (#FAFAFA)

**Typographie** :
- Titres : Police moderne, bold, un peu arrondie
- Corps : Sans-serif lisible
- CTA : Bold et impactant

**Style** :
- Moderne et épuré
- Pas trop corporate
- Couleurs vives mais pas flashy
- Icônes simples et claires

---

## 🎯 Vision & Objectifs

### Problème à résoudre
- Les classements de joueurs sont trop objectifs (stats uniquement)
- Pas d'outil pour capturer le **ressenti émotionnel** des fans
- Les fans veulent exprimer leur opinion de manière simple et rapide

### Solution
- **Vote au feeling** : Réaction instinctive en <1 seconde
- **Stats contextuelles** : Infos de la saison pour éclairer le vote (form actuelle)
- **Interface addictive** : Type TikTok/Tinder (swipe rapide)
- **Classement émotionnel** : Reflète l'opinion collective, pas les stats

### Objectifs du MVP
1. ✅ Permettre de voter sur **tous les joueurs de L1** (tous les joueurs)
2. ✅ Offrir un **mode club** pour ne voter que sur son équipe
3. ✅ Générer un **classement de popularité** en temps réel
4. ✅ Créer une expérience **addictive** et fun

---

## 👥 Utilisateurs cibles

### Persona 1 : "Thomas, 28 ans, fan omnivore de L1"
- Regarde plusieurs matchs par week-end
- Aime tous les clubs, pas de préférence marquée
- Veut découvrir des joueurs de tous les clubs
- **Use case** : Vote sur toute la L1

### Persona 2 : "Marie, 35 ans, fan PSG hardcore"
- Ne regarde QUE les matchs du PSG
- Connaît tous les joueurs PSG par cœur
- Pas très intéressée par les autres clubs
- **Use case** : Vote uniquement sur PSG

### Persona 3 : "Lucas, 22 ans, fan OM passionné"
- Supporter OM depuis l'enfance
- Déteste le PSG (rivalité)
- Aime comparer OM vs autres clubs
- **Use case** : Vote d'abord sur OM, puis sur L1 complète

### Persona 4 : "Kevin, 19 ans, footix casual" ⭐ IMPORTANT
- Regarde surtout les gros matchs à la télé
- Ne connaît que les stars : Mbappé, Dembélé, Lacazette...
- Suit le PSG et l'OM par défaut (gros clubs)
- **Ne connaît PAS** les joueurs de Brest, Auxerre, Le Havre
- **Risque** : Si on lui montre trop de joueurs inconnus → bounce
- **Use case** : Veut voter sur les stars d'abord, découvrir ensuite

**🎯 Enjeu clé** : Ne pas perdre Kevin dans les 30 premières secondes !

---

## 🎮 Stratégie d'engagement pour le footix casual

### Problème identifié

**Scénario catastrophe** :
```
Kevin arrive sur le site
Vote 1 : Joueur de Brest inconnu → "C'est qui ?"
Vote 2 : Joueur d'Auxerre inconnu → "Connais pas"
Vote 3 : Joueur de Strasbourg inconnu → "Ça m'intéresse pas"
→ QUITTE LE SITE (bounce) ❌
```

### Solution : Algorithme de démarrage intelligent

**Principe** : Commencer par les stars, puis introduire progressivement les autres

#### 1. Pondération par popularité du club

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
    
    // Pénalité votes (favorise joueurs peu votés)
    const votePenalty = Math.log(p.total_votes + 1) * 10;
    
    // NOUVEAU : Bonus club populaire (SURTOUT au début)
    const clubPopularity = {
      'Paris Saint Germain': 100,
      'Olympique de Marseille': 80,
      'Olympique Lyonnais': 60,
      'AS Monaco': 50,
      'LOSC Lille': 40,
      'OGC Nice': 35,
      'RC Lens': 30,
      'Stade Rennais': 25,
      // ... autres clubs: 10-20
    };
    
    // Bonus dégressif selon le nombre de votes de l'utilisateur
    // Plus le user vote, moins le bonus club compte
    const clubBonus = clubPopularity[p.club] || 10;
    const bonusMultiplier = Math.max(0, 1 - (voteCount / 50)); // Décroît de 1 à 0 sur 50 votes
    
    return Math.max(1, baseWeight - votePenalty + (clubBonus * bonusMultiplier));
  });
  
  return weightedRandomChoice(players, weights);
}
```

**Résultat** :
- **Votes 1-10** : Très forte probabilité de voir PSG/OM/Lyon (Kevin content ✅)
- **Votes 11-30** : Mix stars + joueurs moins connus
- **Votes 31+** : Équilibrage normal (tous les clubs)

#### 2. Mode "Onboarding" - Les 3 premiers votes

**Option premium** : Garantir les 3 premiers votes sur des stars

```javascript
const ONBOARDING_STARS = [
  'Kylian Mbappé', 'Ousmane Dembélé', 'Bradley Barcola',  // PSG
  'Pierre-Emerick Aubameyang', 'Mason Greenwood',          // OM
  'Alexandre Lacazette', 'Nemanja Matic',                  // Lyon
  'Folarin Balogun', 'Denis Zakaria',                      // Monaco
  'Jonathan David'                                          // Lille
];

async function getPlayerForVote(voteCount, context) {
  // Les 3 premiers votes = stars garanties
  if (voteCount < 3) {
    return getRandomFromList(ONBOARDING_STARS.filter(notVotedYet));
  }
  
  // Après : algorithme pondéré normal
  return getSmartWeightedPlayer(voteCount, context);
}
```

**UX** :
```
Vote 1 : Mbappé → "Ah oui, facile !" 👍
Vote 2 : Lacazette → "Je connais !" 👍
Vote 3 : Greenwood → "Lui aussi !" 👍
→ Kevin est accroché ✅

Vote 4 : Joueur de Brest
→ Mais Kevin est déjà engagé, il continue
```

#### 3. Message d'encouragement adapté

**Après les 3 premiers votes** :
```
┌─────────────────────────────────┐
│  🔥 3 votes ! Tu es lancé !     │
│                                 │
│  Découvre maintenant d'autres   │
│  talents de la Ligue 1...       │
└─────────────────────────────────┘
```

---

## 📊 Impact sur les métriques

### Sans stratégie footix
```
100 footix arrivent
├─ 60 voient joueur inconnu en premier
├─ 40 d'entre eux partent (bounce 40%) ❌
└─ 60 restent et votent

Résultat : 60 utilisateurs actifs
```

### Avec stratégie footix
```
100 footix arrivent
├─ 90 voient star PSG/OM/Lyon en premier
├─ 5 partent quand même (bounce 5%) ✅
└─ 95 restent et votent

Résultat : 95 utilisateurs actifs (+58%)
```

---

## 🎯 Configuration recommandée

### Pondération clubs (coefficient de popularité)

```javascript
const CLUB_POPULARITY = {
  // Tier S - Les incontournables
  'Paris Saint Germain': 100,
  'Olympique de Marseille': 80,
  
  // Tier A - Clubs historiques
  'Olympique Lyonnais': 60,
  'AS Monaco': 50,
  'LOSC Lille': 40,
  
  // Tier B - Clubs établis
  'OGC Nice': 35,
  'RC Lens': 30,
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
  'Angers SCO': 10,
  'AS Saint-Étienne': 30  // Historique mais promu
};
```

### Décroissance du bonus

```javascript
// Formule de décroissance
bonusMultiplier = Math.max(0, 1 - (voteCount / 50));

// Exemples :
// Vote 0  : multiplier = 1.0  (bonus 100%)
// Vote 10 : multiplier = 0.8  (bonus 80%)
// Vote 25 : multiplier = 0.5  (bonus 50%)
// Vote 50+: multiplier = 0.0  (bonus 0%, algo normal)
```

**Résultat** : Transition douce stars → tous joueurs

---

## 🎨 User Experience

### Navigation simple et épurée

**Header minimaliste (toutes les pages)** :

```
Desktop :
┌─────────────────────────────────────────┐
│ FOOT VIBES              📊 Classement │ ← Lien permanent
└─────────────────────────────────────────┘

OU (si sur page classement) :

┌─────────────────────────────────────────┐
│ FOOT VIBES              🗳️ Voter      │ ← Lien permanent
└─────────────────────────────────────────┘
```

**Mobile** :
```
┌─────────────────────────────────────────┐
│ FOOT VIBES                   📊       │
└─────────────────────────────────────────┘
```

**Principe** :
- Header simple avec logo/titre à gauche
- **1 seul lien à droite** : celui de l'autre page
  - Sur page Vote → affiche "📊 Classement"
  - Sur page Classement → affiche "🗳️ Voter"
- Sticky (reste en haut au scroll)
- Clean et pas surchargé

### Wireframes mis à jour

#### Page de vote (header épuré)

```
┌─────────────────────────────────────────┐
│ FOOT VIBES              📊 Classement │ ← Header sticky
├─────────────────────────────────────────┤
│  MODE: Paris SG                    ⚙️   │
│  Votes effectués : 12                   │
│                                          │
│         ┌───────────────────┐            │
│         │                   │            │
│         │    [PHOTO]        │            │
│         │     Grande        │            │
│         │                   │            │
│         └───────────────────┘            │
│                                          │
│          Bradley Barcola                 │
│          Paris SG · Attaquant            │
│          🇫🇷 France · #29 · 22 ans       │
│                                          │
│          Cette saison :                  │
│          ⚽ 12 buts · 🎯 8 passes D      │
│          📊 18 matches                   │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │   👍  J'ADORE                   │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │   😐  MOYEN                    │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │   👎  BEURK                     │    │
│  └─────────────────────────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

#### Page classement (header épuré)

```
┌─────────────────────────────────────────┐
│ FOOT VIBES              🗳️ Voter      │ ← Header sticky
├─────────────────────────────────────────┤
│                                          │
│  MODE: ○ Global L1    ● Paris SG        │
│                                          │
│  Filtres :                               │
│  [Tous] [Gardien] [Déf] [Mil] [Att]    │
│                                          │
│  [Rechercher un joueur... 🔍]           │
│                                          │
├──┬────────────┬─────┬──────┬───────────┤
│# │ Joueur     │ Club│ Poste│ Score     │
├──┼────────────┼─────┼──────┼───────────┤
│1 │ Barcola    │ PSG │ ATT  │ +287 🔥   │
│2 │ Dembélé    │ PSG │ ATT  │ +245      │
│3 │ Donnarumma │ PSG │ GK   │ +198      │
│  │ ...        │     │      │           │
└──┴────────────┴─────┴──────┴───────────┘
```

### Variantes de header

#### Option A : Lien texte simple ⭐ RECOMMANDÉ

```
┌─────────────────────────────────────────┐
│ FOOT VIBES              📊 Classement │
└─────────────────────────────────────────┘
```

**CSS** :
```css
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-link {
  color: #004170;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #E2001A;
}
```

#### Option B : Bouton CTA

```
┌─────────────────────────────────────────┐
│ FOOT VIBES        [📊 Voir classement]│ ← Bouton
└─────────────────────────────────────────┘
```

#### Option C : Icon + texte (mobile compact)

```
Desktop :
┌─────────────────────────────────────────┐
│ FOOT VIBES        📊 Voir le classement│
└─────────────────────────────────────────┘

Mobile :
┌─────────────────────────────────────────┐
│ BILLBOARD                          📊   │ ← Juste icon
└─────────────────────────────────────────┘
```

### Comportement au clic

**Scénario 1 : User sur page Vote**
```
Header affiche : "📊 Classement"
User clique
→ Navigation vers /classement
→ Header change : "🗳️ Voter"
```

**Scénario 2 : User sur page Classement**
```
Header affiche : "🗳️ Voter"
User clique
→ Navigation vers /vote
→ Header change : "📊 Classement"
```

### Menu hamburger (optionnel)

Si besoin d'accéder à d'autres pages (Accueil, Paramètres) :

```
┌─────────────────────────────────────────┐
│ ☰  FOOT VIBES           📊 Classement │
└─────────────────────────────────────────┘

Clic sur ☰ :
┌─────────────────────────┐
│ 🏠 Accueil              │
│ ℹ️ À propos            │
│ ⚙️ Changer de mode     │
└─────────────────────────┘
```

### Structure HTML/React simple

```jsx
// Header.jsx
function Header() {
  const location = useLocation();
  const isVotePage = location.pathname === '/vote';
  
  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Titre */}
        <Link to="/" className="text-2xl font-bold text-blue-900">
          FOOT VIBES
        </Link>
        
        {/* Lien navigation */}
        {isVotePage ? (
          <Link to="/classement" className="text-blue-900 font-semibold hover:text-red-600">
            📊 Classement
          </Link>
        ) : (
          <Link to="/vote" className="text-blue-900 font-semibold hover:text-red-600">
            🗳️ Voter
          </Link>
        )}
      </div>
    </header>
  );
}
```

### Avantages de cette approche

✅ **Ultra simple** :
- Juste logo + 1 lien
- Pas de navigation complexe
- Visuellement épuré

✅ **Toujours accessible** :
- Header sticky
- Visible à tout moment
- 1 clic pour changer de page

✅ **Clair** :
- User sait toujours où il est
- Sait où il peut aller
- Pas de confusion

✅ **Performance** :
- Léger (pas de menu complexe)
- Rapide à charger
- Responsive facile

### Flow utilisateur complet

```
Homepage (affichage direct)
    │
    ├─→ Clic [🏆 TOUTE LA LIGUE 1] → Vote (context=ligue1)
    │
    ├─→ Clic [PSG] → Vote (context=psg)
    ├─→ Clic [OM] → Vote (context=om)
    ├─→ Clic [Lyon] → Vote (context=lyon)
    ├─→ ... (18 clubs affichés directement)
    │
    └─→ Clic [📊 Classement] → Page classement

Note : Gain de friction - 1 clic au lieu de 3
      (pas d'écran de sélection intermédiaire)
```

```
┌──────────────────────────────────┐
│ FOOT VIBES    📊 Classement      │ ← Header permanent
├──────────────────────────────────┤
│                                  │
│     PAGE VOTE                    │
│                                  │
└──────────────────────────────────┘
    ↕️ Clic "📊 Classement"
┌──────────────────────────────────┐
│ FOOT VIBES    🗳️ Voter           │ ← Header permanent
├──────────────────────────────────┤
│                                  │
│     PAGE CLASSEMENT              │
│                                  │
└──────────────────────────────────┘
```

### Wireframes

#### Homepage (nouvelle version - clubs directs)

**Desktop** :
```
┌─────────────────────────────────────────────────────┐
│ FOOT VIBES                        📊 Classement     │
├─────────────────────────────────────────────────────┤
│                                                     │
│         ┌──────────────────────────────┐          │
│         │  🏆 TOUTE LA LIGUE 1         │          │
│         │  Vote sur tous les joueurs    │          │
│         │                               │          │
│         │     [C'EST PARTI →]          │          │
│         └──────────────────────────────┘          │
│                                                     │
│         OU vote pour ton club :                     │
│                                                     │
│    [PSG]  [OM]  [Lyon]  [Monaco]  [Lille]  [Nice] │
│    [Lens] [Rennes] [Brest] [Strasbourg] [Toulouse]│
│    [Montpellier] [Nantes] [Reims] [Le Havre] [...] │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Mobile** :
```
┌───────────────────────┐
│ FOOT VIBES       📊  │
├───────────────────────┤
│                       │
│  ┌─────────────────┐ │
│  │ 🏆 TOUTE LA L1  │ │
│  │ tous les joueurs     │ │
│  │                 │ │
│  │ [C'EST PARTI]   │ │
│  └─────────────────┘ │
│                       │
│  OU ton club :        │
│                       │
│  [PSG]     [OM]      │
│  [Lyon]    [Monaco]  │
│  [Lille]   [Nice]    │
│  [Lens]    [Rennes]  │
│  [Brest]   [Strasb.] │
│  [Toulouse][Montpel.]│
│  ... (18 clubs total)│
│                       │
└───────────────────────┘
```

**Avantages** :
- ✅ 1 clic au lieu de 3 (-66%)
- ✅ Visibilité immédiate de tous les clubs
- ✅ Code plus simple (1 page en moins)
- ✅ Meilleure conversion (+40% estimée)

---

#### Page de vote

**Design Mobile-First validé** :
- Photo très grande (focus sur le joueur)
- Boutons pleins avec icônes + labels courts
- Stats visibles pour contexte
- Vote sur le feeling général (pas la dernière perfo)

**Desktop** :
```
┌─────────────────────────────────────────┐
│ FOOT VIBES              📊 Classement   │
├─────────────────────────────────────────┤
│  MODE: Paris SG                    ⚙️  │
│  Votes effectués : 12                   │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │   [PHOTO]       │             │
│         │   400x400       │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│          Bradley Barcola                │
│          Paris SG · Attaquant           │
│          🇫🇷 France · #29 · 22 ans      │
│                                         │
│          Cette saison :                 │
│          ⚽ 12 buts · 🎯 8 passes D     │
│          📊 18 matches                  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │        👍  J'ADORE                │ │ ← Bouton vert
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │        😐  MOYEN                  │ │ ← Bouton gris
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │        👎  BEURK                  │ │ ← Bouton rouge
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Mobile** :
```
┌───────────────────────┐
│ FOOT VIBES       📊  │
├───────────────────────┤
│ MODE: PSG        ⚙️  │
│ Votes : 12           │
│                       │
│   ┌─────────────┐    │
│   │             │    │
│   │   [PHOTO]   │    │
│   │   300x300   │    │
│   │             │    │
│   └─────────────┘    │
│                       │
│   B. Barcola          │
│   PSG · ATT           │
│   🇫🇷 #29 · 22a      │
│                       │
│   ⚽ 12 · 🎯 8 · 📊 18│
│                       │
│  ┌─────────────────┐ │
│  │  👍  J'ADORE    │ │
│  └─────────────────┘ │
│                       │
│  ┌─────────────────┐ │
│  │  😐  MOYEN      │ │
│  └─────────────────┘ │
│                       │
│  ┌─────────────────┐ │
│  │  👎  BEURK      │ │
│  └─────────────────┘ │
│                       │
└───────────────────────┘
```

**Choix de wording validés** :
- 👍 **J'ADORE** (positif, feeling général)
- 😐 **MOYEN** (neutre)
- 👎 **BEURK** (négatif, fun)

**Rationale** :
- Wording intemporel (pas lié à une performance récente)
- Permet à Kevin le footix de voter même sans suivre chaque match
- Stats affichées fournissent le contexte nécessaire
- Cohérent avec "Foot Vibes" (feeling saison, pas perfo)

**Design des boutons** :
```css
/* Bouton J'ADORE */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
color: white;
min-height: 60px;
border-radius: 12px;
font-size: 1.25rem;
font-weight: 700;

/* Bouton MOYEN */
background: #f3f4f6;
color: #6b7280;
border: 2px solid #d1d5db;

/* Bouton BEURK */
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
color: white;

/* Hover effects */
transform: scale(1.02);
box-shadow: 0 8px 16px rgba(0,0,0,0.1);

/* Active */
transform: scale(0.98);
```
- Vote sur le ressenti global saison (pas juste dernière perfo)
- Stats affichées pour aider à décider
- Footix ET hardcore peuvent voter
- Ton décontracté mais pas trop familier

### Design des boutons de vote

**Spécifications** :

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
  min-height: 60px; /* Zone tactile confortable */
  margin-bottom: 1rem;
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
  /* Reste identique */
}

/* Bouton BEURK */
.vote-down {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  /* Reste identique */
}
```

**Tailles responsive** :

```css
/* Mobile (< 768px) */
.player-photo {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 16px;
}

.vote-button {
  min-height: 60px;
  font-size: 1.125rem;
}

/* Desktop (≥ 768px) */
@media (min-width: 768px) {
  .player-photo {
    width: 400px;
    height: 400px;
  }
  
  .vote-button {
    max-width: 400px;
    margin: 0 auto 1rem;
  }
}
```

---

### Gestes/Interactions

**Desktop** :
- Clic sur bouton 👍😐👎
- Raccourcis clavier : ← (down) / → (up) / ↓ (neutral)

**Mobile** :
- Tap sur boutons
- **Optionnel v1.1** : Swipe gauche/droite/bas

---

## 🎮 User Stories détaillées

### Epic 1 : Choix du mode de vote

**US-1.1** : Voir tous les modes disponibles dès l'arrivée
- **En tant qu'**utilisateur
- **Je veux**voir immédiatement toutes les options (L1 + 18 clubs)
- **Afin de**commencer à voter en 1 clic

**Critères d'acceptation** :
- [ ] Page d'accueil avec "Toute la Ligue 1" en évidence
- [ ] Les 18 clubs affichés directement (grid responsive)
- [ ] Desktop : 5-6 clubs par ligne (3-4 lignes total)
- [ ] Mobile : 2 clubs par ligne (9 lignes total)
- [ ] Clic sur un club ou L1 → Vote direct (pas d'écran intermédiaire)
- [ ] Mode sauvegardé en localStorage pour la session

**US-1.2** : Changer de mode facilement
- **En tant qu'**utilisateur en session de vote
- **Je veux**pouvoir changer de mode (PSG → OM par exemple)
- **Afin de**voter sur différents groupes de joueurs

**Critères d'acceptation** :
- [ ] Icône ⚙️ en haut à droite de la page vote
- [ ] Clic → Retour à la homepage
- [ ] Compteur de votes conservé entre les changements

---
- [ ] Confirmation visuelle du club sélectionné

---

### Epic 2 : Voter au feeling

**US-2.1** : Voir un joueur et réagir instinctivement
- **En tant qu'**utilisateur
- **Je veux**voir un joueur avec sa photo
- **Afin de**réagir émotionnellement

**Critères d'acceptation** :
- [ ] Photo du joueur (grande taille, >300px)
- [ ] Nom, club, poste visibles
- [ ] 3 boutons clairs : 👍 😐 👎
- [ ] Temps de chargement < 1s
- [ ] Joueurs apparaissent aléatoirement

**US-2.2** : Voter rapidement en série
- **En tant qu'**utilisateur
- **Je veux**que le joueur suivant apparaisse instantanément
- **Afin de**rester dans le flow

**Critères d'acceptation** :
- [ ] Clic → joueur suivant en < 0.5s
- [ ] Animation de transition fluide
- [ ] Pas de rechargement de page
- [ ] Compteur de votes visible

**US-2.3** : Voir ma progression et l'impact de mon vote
- **En tant qu'**utilisateur
- **Je veux**savoir combien j'ai voté et l'impact de mon dernier vote
- **Afin de**me sentir progresser et utile

**Critères d'acceptation** :
- [ ] Compteur "Votes effectués : X"
- [ ] Optionnel : Barre de progression (X/450 ou X/25)
- [ ] **Feedback après chaque vote** :
  - "Barcola est passé de #9 à #8 ! 🔥" (si changement de rang)
  - "Ton vote compte ! Barcola reste #8" (si pas de changement)
  - Animation/message flash (2 secondes)
- [ ] Message d'encouragement tous les 10 votes (optionnel)

**US-2.4** : Voir les stats du joueur pour m'aider à décider
- **En tant qu'**utilisateur
- **Je veux**voir les stats de la saison du joueur
- **Afin de**baser mon vote sur sa forme actuelle

**Critères d'acceptation** :
- [ ] Affichage différencié selon le poste :
  - Gardien : Clean sheets + Arrêts
  - Joueur de champ : Buts + Passes D
- [ ] Nombre de matches joués visible
- [ ] Nationalité avec drapeau (emoji ou icône)
- [ ] Stats claires et lisibles
- [ ] Si stats à 0 (pas joué) : affichage approprié

**US-2.5** : Changer de mode en cours de route
- **En tant qu'**utilisateur
- **Je veux**pouvoir passer de "PSG" à "L1 complète"
- **Afin de**explorer d'autres joueurs

**Critères d'acceptation** :
- [ ] Bouton/menu "Changer de mode" visible
- [ ] Retour à la sélection de mode
- [ ] Votes déjà effectués conservés
- [ ] Transition fluide

---

### Epic 3 : Consulter le classement

**US-3.1** : Voir le classement global ou par club
- **En tant qu'**utilisateur
- **Je veux**voir le classement
- **Afin de**découvrir qui est le plus aimé

**Critères d'acceptation** :
- [ ] Classement global L1 par défaut
- [ ] Switch "Global" / "Mon club" (PSG)
- [ ] Tri par score (upvotes - downvotes)
- [ ] Rang, nom, club, poste, score affichés

**US-3.2** : Filtrer le classement
- **En tant qu'**utilisateur
- **Je veux**filtrer par poste ou club
- **Afin de**comparer ce qui est comparable

**Critères d'acceptation** :
- [ ] Filtres : Tous / Gardien / Défenseur / Milieu / Attaquant
- [ ] Filtre par club (liste déroulante des 18)
- [ ] Combinaison filtres possible (ex: Attaquants PSG)
- [ ] Filtrage instantané (pas de reload)

**US-3.3** : Chercher un joueur spécifique
- **En tant qu'**utilisateur
- **Je veux**chercher un joueur par nom
- **Afin de**voir son classement

**Critères d'acceptation** :
- [ ] Barre de recherche
- [ ] Auto-complétion
- [ ] Résultats en temps réel
- [ ] Affichage du rang du joueur

---

## ⚙️ Exigences techniques

### Stack technique

**Frontend** :
- Framework : React 18+
- Build : Vite
- Styling : TailwindCSS
- Routing : React Router v6
- State : React Context ou Zustand (simple)

**Backend** :
- Runtime : Node.js 18+
- Framework : Express.js
- Base de données : SQLite3
- API : REST

**Déploiement** :
- Frontend : Vercel (gratuit, optimisé React)
- Backend : Railway ou Render (gratuit)
- Base de données : SQLite fichier sur serveur

---

### Architecture

```
project/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           (sélection mode)
│   │   │   ├── ClubSelector.jsx   (choix du club)
│   │   │   ├── Vote.jsx           (page de vote)
│   │   │   └── Ranking.jsx        (classement)
│   │   ├── components/
│   │   │   ├── PlayerCard.jsx
│   │   │   ├── VoteButtons.jsx
│   │   │   └── RankingTable.jsx
│   │   ├── contexts/
│   │   │   └── ModeContext.jsx    (L1 vs club)
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── players.js
│   │   └── votes.js
│   ├── controllers/
│   │   ├── playersController.js
│   │   └── votesController.js
│   ├── models/
│   │   └── database.js
│   ├── scripts/
│   │   └── importPlayers.js       (API-Football)
│   └── server.js
│
└── database/
    └── ligue1.db
```

---

### Base de données

**Schéma** :

```sql
-- Table principale
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Infos personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    name TEXT NOT NULL,                   -- Nom complet (first_name + last_name)
    club TEXT NOT NULL,
    position TEXT NOT NULL CHECK(position IN ('Gardien', 'Défenseur', 'Milieu', 'Attaquant')),
    nationality TEXT,                     -- Pays
    photo_url TEXT,
    age INTEGER,
    number INTEGER,
    
    -- Stats saison
    matches_played INTEGER DEFAULT 0,     -- Nb matches joués cette saison
    goals INTEGER DEFAULT 0,              -- Nb de buts
    assists INTEGER DEFAULT 0,            -- Nb de passes décisives
    clean_sheets INTEGER DEFAULT 0,       -- Nb de clean sheets (gardiens)
    saves INTEGER DEFAULT 0,              -- Nb d'arrêts (gardiens)
    
    -- Scores de vote
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    neutral_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
    
    -- ✨ Gestion saisons
    source_season TEXT NOT NULL,          -- "2024-2025", "2025-2026", etc.
    
    -- Gestion transferts
    archived BOOLEAN DEFAULT false,       -- Joueur archivé (transfert hors L1 ou fin saison)
    archived_reason TEXT,                 -- Ex: "Transféré Real Madrid" ou "Fin saison 2024-2025"
    archived_at TIMESTAMP,
    
    -- Métadonnées
    api_id INTEGER,                       -- ID API-Football (pour updates)
    is_historical BOOLEAN DEFAULT FALSE,  -- Pour v2 (légendes)
    era TEXT,                             -- Pour v2
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

### Gestion des saisons avec `source_season`

**Problème** : Les saisons de foot chevauchent 2 années civiles (Août 2025 → Juin 2026)

**Solution** : Champ `source_season` pour gérer le reset annuel proprement

**Format** : `"YYYY-YYYY"` (ex: `"2024-2025"`, `"2025-2026"`)

**Stratégie de changement de saison** :

```javascript
// Configuration
const CURRENT_SEASON = '2025-2026';  // Saison actuelle (en cours)

// 1. Fin de saison (Juin 2026)
await db.run(`
  UPDATE players 
  SET archived = true,
      archived_reason = 'Fin de saison 2025-2026',
      archived_at = CURRENT_TIMESTAMP
  WHERE source_season = '2025-2026'
`);

// 2. Début nouvelle saison (Août 2026)
// Import avec source_season = '2026-2027'
await importSeasonData('2026-2027', LIGUE_1_ID);

// 3. Toutes les requêtes filtrent sur la saison active
const players = await db.all(`
  SELECT * FROM players
  WHERE source_season = ?
    AND archived = false
    AND matches_played > 0
`, [CURRENT_SEASON]);
```

**Avantages** :
- ✅ Historique complet préservé
- ✅ Peut comparer performances entre saisons
- ✅ Reset propre sans perte de données
- ✅ Aucune incohérence lors du changement

**Pages futures (v1.1+)** :
- `/archive/2024-2025` - Classement final saison 2024-2025
- `/archive/2025-2026` - Classement final saison 2025-2026
- `/compare?s1=2024-2025&s2=2025-2026` - Comparaison entre saisons

```sql
CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'neutral', 'down')),
    context TEXT DEFAULT 'ligue1',  -- 'ligue1', 'psg', 'om', etc.
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE INDEX idx_votes_player ON votes(player_id);
CREATE INDEX idx_votes_context ON votes(context);
```

---

### API Endpoints

**Joueurs** :

```
GET /api/players/random
Query params: ?context=ligue1|psg|om|...
Response: { 
  id, first_name, last_name, name, club, position, 
  nationality, photo_url, age, number,
  matches_played, goals, assists, clean_sheets, saves
}
Description: Retourne 1 joueur aléatoire selon le contexte avec toutes ses stats
Note: Algorithme pondéré - favorise les joueurs avec peu de votes

Algorithme de sélection pondérée:
```javascript
// Les joueurs avec peu de votes ont plus de chances d'apparaître
function getWeightedRandomPlayer(context, excludeIds = []) {
  const players = await db.all(`
    SELECT * FROM players 
    WHERE (club = ? OR ? = 'ligue1')
    AND id NOT IN (?)
  `, [context, context, excludeIds]);
  
  // Poids inversement proportionnel au nombre de votes
  const weights = players.map(p => {
    const baseWeight = 100;
    const votePenalty = Math.log(p.total_votes + 1) * 10;
    return Math.max(1, baseWeight - votePenalty);
  });
  
  return weightedRandomChoice(players, weights);
}
```

GET /api/players
Query params: ?context=ligue1&position=Attaquant&club=PSG&search=Mbappé
Response: { players: [...], total: 450 }
Description: Liste filtrée des joueurs avec pagination

GET /api/players/:id
Response: { id, name, ..., upvotes, downvotes, score, rank }
Description: Détails d'un joueur avec son rang

GET /api/ranking
Query params: ?context=ligue1&position=Attaquant&club=PSG&limit=50&offset=0
Response: { players: [{rank, ...}], total }
Description: Classement trié par score
```
**Votes** :
```
POST /api/vote
Body: { player_id: 123, vote: "up"|"neutral"|"down", context: "psg" }
Response: { 
  success: true, 
  player: { new_score, old_rank, new_rank, rank_change },
  message: "Barcola est passé de #9 à #8 !"
}
Description: Enregistre un vote et met à jour les scores

Limitations appliquées (MVP):
- Rate limiting: 1 vote toutes les 2 secondes
- IP tracking: 100 votes maximum par jour par IP
- Validation: player_id existe, vote valide, context valide

Limitations v1.1 (ajoutées):
- Browser fingerprinting: 200 votes/jour/utilisateur
- 1 seul vote par joueur par utilisateur (no re-vote)
- Detection patterns suspects

Headers requis:
- Content-Type: application/json
- (v1.1) X-Fingerprint: [browser fingerprint hash]

Codes erreur:
- 429: Rate limit dépassé (attendre 2s)
- 403: Limite IP dépassée (100 votes/jour)
- 409: Déjà voté pour ce joueur (v1.1)
```
**Contextes** :
```
GET /api/contexts
Response: { contexts: [
  { id: 'ligue1', name: 'Ligue 1 complète', player_count: 450 },
  { id: 'psg', name: 'Paris SG', player_count: 25 },
  ...
]}
Description: Liste des modes disponibles
```
---

### Système de scoring

**Formule simple** (MVP) :
```
score = upvotes - downvotes
```
**Classement** :
```sql
SELECT 
  id, name, club, position,
  upvotes, downvotes, neutral_votes,
  (upvotes - downvotes) as score,
  ROW_NUMBER() OVER (ORDER BY (upvotes - downvotes) DESC) as rank
FROM players
WHERE club = ? OR ? IS NULL  -- Filtre club optionnel
  AND position = ? OR ? IS NULL  -- Filtre poste optionnel
ORDER BY score DESC
LIMIT 50 OFFSET 0;
```

**Alternative v1.1** (ratio positif) :
```
score = (upvotes / total_votes) * 100
filtre: minimum 10 votes pour apparaître
```

---

### Import des données

**Source** : API-Football (https://www.api-football.com/)

**Script d'import** (`backend/scripts/importPlayers.js`) :

```javascript
// Pseudo-code
const L1_CLUBS = [
  { id: 85, name: 'Paris Saint Germain' },
  { id: 81, name: 'Olympique Marseille' },
  { id: 91, name: 'AS Monaco' },
  // ... 15 autres clubs
];

const L1_LEAGUE_ID = 61;
const SEASON = 2024;

async function importAllPlayers() {
  for (const club of L1_CLUBS) {
    // Récupérer l'effectif du club
    const squad = await fetchClubSquad(club.id);
    
    for (const player of squad.players) {
      // Récupérer les stats du joueur pour la saison
      const stats = await fetchPlayerStats(player.id, L1_LEAGUE_ID, SEASON);
      
      await db.run(`
        INSERT INTO players (
          first_name, last_name, name, club, position, nationality,
          photo_url, age, number,
          matches_played, goals, assists, clean_sheets, saves
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        extractFirstName(player.name),
        extractLastName(player.name),
        player.name,
        club.name,
        normalizePosition(player.position),
        player.nationality,
        player.photo,
        player.age,
        player.number,
        stats.matches_played || 0,
        stats.goals || 0,
        stats.assists || 0,
        stats.clean_sheets || 0,
        stats.saves || 0
      ]);
    }
    
    await sleep(1000); // Rate limiting
  }
}

function normalizePosition(apiPosition) {
  const mapping = {
    'Goalkeeper': 'Gardien',
    'Defender': 'Défenseur',
    'Midfielder': 'Milieu',
    'Attacker': 'Attaquant'
  };
  return mapping[apiPosition] || 'Milieu';
}

function extractFirstName(fullName) {
  // Ex: "Bradley Barcola" → "Bradley"
  const parts = fullName.split(' ');
  return parts.slice(0, -1).join(' ') || parts[0];
}

function extractLastName(fullName) {
  // Ex: "Bradley Barcola" → "Barcola"
  const parts = fullName.split(' ');
  return parts[parts.length - 1];
}

async function fetchPlayerStats(playerId, leagueId, season) {
  // API-Football endpoint: /players?id={playerId}&league={leagueId}&season={season}
  const response = await apiFootball.get('/players', {
    params: { id: playerId, league: leagueId, season: season }
  });
  
  const playerData = response.data.response[0];
  const stats = playerData.statistics[0]; // Stats pour la ligue spécifiée
  
  return {
    matches_played: stats.games.appearences || 0,
    goals: stats.goals.total || 0,
    assists: stats.goals.assists || 0,
    clean_sheets: stats.goals.conceded === 0 ? stats.games.appearences : 0, // Approximation
    saves: stats.goals.saves || 0
  };
}
```

**Note importante sur les stats** :
- L'API-Football fournit les stats de la saison en cours
- Pour les clean sheets : calculé approximativement (matchs sans but encaissé)
- Si un joueur n'a pas joué de match cette saison : toutes les stats à 0
- Les stats sont mises à jour une fois lors de l'import initial
  - **v1.1** : Script de mise à jour hebdomadaire des stats

**Données importées** :
- ~tous les joueurs des 18 clubs de L1
- **Infos personnelles** : Prénom, nom, club, poste, nationalité, âge, numéro
- **Photos officielles** (via API-Football)
- **Stats saison 2025-2026** :
  - Pour tous : Matches joués
  - Pour joueurs de champ : Buts, passes décisives
  - Pour gardiens : Clean sheets, arrêts
- Positions normalisées en français

---

## 🏆 Les 18 clubs de Ligue 1 (saison 2024-2025)

### Liste officielle (noms selon L'Équipe.fr)

| Nom officiel | Nom court (UI) | Popularité |
| --- | --- | --- |
| Paris Saint-Germain | Paris SG | 100 |
| Olympique de Marseille | OM | 80 |
| Olympique Lyonnais | Lyon | 60 |
| AS Monaco | Monaco | 50 |
| LOSC Lille | Lille | 40 |
| OGC Nice | Nice | 35 |
| RC Lens | Lens | 30 |
| AS Saint-Étienne | Saint-Étienne | 30 |
| Stade Rennais | Rennes | 25 |
| Stade Brestois 29 | Brest | 20 |
| RC Strasbourg Alsace | Strasbourg | 15 |
| Toulouse FC | Toulouse | 15 |
| Montpellier HSC | Montpellier | 15 |
| FC Nantes | Nantes | 15 |
| Stade de Reims | Reims | 12 |
| Le Havre AC | Le Havre | 10 |
| AJ Auxerre | Auxerre | 10 |
| Angers SCO | Angers | 10 |

**Note** : Le score de popularité est utilisé pour l'algorithme de pondération (voir section "Kevin le footix")

### Utilisation dans l'UI

**Homepage - Boutons clubs** : Noms courts uniquement
```
[Paris SG] [OM] [Lyon] [Monaco] [Lille] [Nice]
[Lens] [Rennes] [Brest] [Strasbourg] [Toulouse]
[Montpellier] [Nantes] [Reims] [Le Havre]
[Auxerre] [Angers] [Saint-Étienne]
```

**Page de vote - Header** : `MODE: Paris SG`

**Carte joueur** : `Paris SG · Attaquant`

**Classement** : `Club: Paris SG`

---

## 🎨 Design & Interface

### Charte graphique

**Couleurs** :
```css
:root {
  --primary-blue: #004170;    /* Bleu Ligue 1 */
  --primary-red: #E2001A;     /* Rouge accent */
  --white: #FFFFFF;
  --gray-light: #F5F5F5;
  --gray-dark: #333333;
  --success: #10B981;         /* Vert pour 👍 */
  --warning: #F59E0B;         /* Orange pour 😐 */
  --danger: #EF4444;          /* Rouge pour 👎 */
}
```

**Typographie** :
- Titres : Inter Bold / Montserrat Bold
- Corps : Inter Regular / System UI

### Wireframes détaillés

#### 1. Page d'accueil (Home)

```
┌─────────────────────────────────────────┐
│  FOOT VIBES                      │
│  Vote pour tes joueurs préférés         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🏆 TOUTE LA LIGUE 1            │   │
│  │                                 │   │
│  │  Vote sur tous les joueurs       │   │
│  │  de L1 2024-2025                │   │
│  │                                 │   │
│  │         [COMMENCER] →           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⚽ MON CLUB                     │   │
│  │                                 │   │
│  │  Vote uniquement sur            │   │
│  │  les joueurs de ton équipe      │   │
│  │                                 │   │
│  │    [CHOISIR MON CLUB] →         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📊 VOIR LE CLASSEMENT          │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### 2. Sélection du club

```
┌─────────────────────────────────────────┐
│  ← Retour          MON CLUB             │
├─────────────────────────────────────────┤
│                                         │
│  Choisis ton équipe :                   │
│                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │PSG │ │ OM │ │Lyon│ │Nice│ │Lens│   │
│  └────┘ └────┘ └────┘ └────┘ └────┘   │
│                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │Renn│ │Lill│ │Mona│ │Bres│ │Stras   │
│  └────┘ └────┘ └────┘ └────┘ └────┘   │
│                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │Toul│ │Mont│ │Nant│ │Reim│ ...      │
│  └────┘ └────┘ └────┘ └────┘          │
│                                         │
│  [Rechercher un club... 🔍]            │
│                                         │
└─────────────────────────────────────────┘
```

#### 3. Page de vote

```
┌─────────────────────────────────────────┐
│  ☰ Menu    MODE: Paris SG    ⚙️ Changer │
├─────────────────────────────────────────┤
│                                         │
│         Votes effectués : 12            │
│         ▓▓▓░░░░░░░ 12/25               │
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │                   │           │
│         │    [PHOTO]        │           │
│         │     Grande        │           │
│         │     400x400       │           │
│         │                   │           │
│         │                   │           │
│         └───────────────────┘           │
│                                         │
│          Bradley Barcola                │
│          Paris SG · Attaquant           │
│          🇫🇷 France · #29 · 22 ans      │
│                                         │
│          Cette saison :                 │
│          ⚽ 12 buts · 🎯 8 passes D     │
│          📊 18 matches                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   👍  J'ADORE                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   😐  MOYEN                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   👎  BEURK                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Voir le classement]                   │
│                                         │
└─────────────────────────────────────────┘

Exemple pour un gardien (Donnarumma) :
│          Gianluigi Donnarumma          │
│          Paris SG · Gardien            │
│          🇮🇹 Italie · #99 · 25 ans     │
│                                         │
│          Cette saison :                 │
│          🧤 8 clean sheets · ✋ 67 arrêts│
│          📊 15 matches                  │

Raccourcis clavier :
← ou 👎 = Down
→ ou 👍 = Up
↓ ou 😐 = Neutral
```

#### 4. Page classement

```
┌─────────────────────────────────────────┐
│  CLASSEMENT         [Retour au vote]    │
├─────────────────────────────────────────┤
│                                         │
│  ○ Global L1    ● Paris SG              │
│                                         │
│  Filtres :                              │
│  [Tous] [Gardien] [Déf] [Mil] [Att]    │
│                                         │
│  [Rechercher un joueur... 🔍]          │
│                                         │
├──┬────────────┬─────┬──────┬──────────┤
│# │ Joueur     │ Club│ Poste│ Score    │
├──┼────────────┼─────┼──────┼──────────┤
│1 │ Barcola    │ PSG │ ATT  │ +287 🔥  │
│2 │ Dembélé    │ PSG │ ATT  │ +245     │
│3 │ Donnarumma │ PSG │ GK   │ +198     │
│4 │ Marquinhos │ PSG │ DEF  │ +156     │
│5 │ Vitinha    │ PSG │ MIL  │ +134     │
│  │ ...        │     │      │          │
├──┴────────────┴─────┴──────┴──────────┤
│                                         │
│  [Charger plus] (25/25)                 │
│                                         │
└─────────────────────────────────────────┘
```

### Animations

**Au vote** :
```css
/* Clic sur 👍 */
.vote-up {
  animation: slideUpFade 0.4s ease-out;
  /* Carte monte et fade out en vert */
}

/* Clic sur 👎 */
.vote-down {
  animation: slideDownFade 0.4s ease-out;
  /* Carte descend et fade out en rouge */
}

/* Clic sur 😐 */
.vote-neutral {
  animation: fadeOut 0.3s ease-out;
  /* Simple fade out */
}

/* Nouveau joueur */
.player-enter {
  animation: slideInBottom 0.3s ease-out;
  /* Slide from bottom */
}

/* Feedback après vote */
.vote-feedback {
  animation: slideInTop 0.3s ease-out, fadeOut 0.3s ease-out 1.7s;
  /* Apparaît en haut, reste 2s, disparaît */
}
```

**Messages feedback** (après chaque vote) :
- Changement de rang : "🔥 Barcola : #9 → #8 !"
- Pas de changement : "✅ Ton vote compte ! Barcola reste #8"
- Nouveau dans le top 10 : "⭐ Barcola entre dans le top 10 !"
- Sort du top 10 : "Barcola : #9 → #11"

**Messages encouragement** (tous les 10/25/50 votes) :
- 10 votes : "🔥 10 votes ! Continue !"
- 25 votes : "⭐ 25 votes ! T'es chaud !"
- 50 votes : "🚀 50 votes ! Champion !"
- 100 votes : "👑 100 votes ! Légende !"

---

## 🔐 Système anti-spam détaillé

### Architecture de protection (Defense in Depth)

**Principe** : Plusieurs couches de protection plutôt qu'une seule barrière

```
Requête de vote
    ↓
[Couche 1] Rate Limiting (2 secondes)
    ↓ (bloque scripts rapides)
[Couche 2] IP Tracking (100 votes/jour)
    ↓ (bloque spam massif d'une IP)
[Couche 3] Fingerprinting (v1.1) (200 votes/jour)
    ↓ (bloque spam d'un utilisateur)
[Couche 4] One Vote Per Player (v1.1) (1 vote/joueur)
    ↓ (empêche re-vote)
Vote enregistré ✅
```

### Implémentation MVP (Semaine 1)

#### 1. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const voteLimiter = rateLimit({
  windowMs: 2 * 1000,              // 2 secondes
  max: 1,                          // 1 requête max
  message: { error: 'Attends 2 secondes entre chaque vote' }
});

app.post('/api/vote', voteLimiter, voteController.handleVote);
```

#### 2. IP Tracking (100 votes/jour)
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

### Implémentation v1.1 (Semaine 2)

#### 3. Browser Fingerprinting (FingerprintJS)
```javascript
// Frontend
import FingerprintJS from '@fingerprintjs/fingerprintjs';
const fp = await FingerprintJS.load();
const result = await fp.get();
const fingerprint = result.visitorId;

// Backend - Limite 200 votes/jour/user + 1 vote/joueur
async function checkFingerprintLimit(req, res, next) {
  const { fingerprint, player_id } = req.body;
  
  // Déjà voté pour ce joueur ?
  const alreadyVoted = await db.get(`
    SELECT id FROM votes
    WHERE fingerprint = ? AND player_id = ?
  `, [fingerprint, player_id]);
  
  if (alreadyVoted) {
    return res.status(409).json({
      error: 'Tu as déjà voté pour ce joueur'
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

### Niveau de protection

| Version | Protection | Effort pour contourner |
| --- | --- | --- |
| **MVP** | ~75% | Moyen (VPN) |
| **v1.1** | ~98% | Très élevé (ferme de navigateurs + VPN) |

---

---

## 📊 Données des 18 clubs

```javascript
const L1_CLUBS_2024_2025 = [
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
  { id: 'saintetienne', name: 'AS Saint-Étienne', api_id: 1063 }
];
```

---

## 🚀 Plan de développement

### Phase 1 : Setup & Import (Jour 1-2)

**Jour 1** :
- [ ] Setup projet (React + Vite + TailwindCSS)
- [ ] Setup backend (Express + SQLite)
- [ ] Créer schéma base de données
- [ ] Tester connexion frontend ↔ backend

**Jour 2** :
- [ ] Obtenir clé API-Football
- [ ] Créer script d'import joueurs
- [ ] Importer les tous les joueurs avec toutes leurs stats
- [ ] Vérifier données (noms, clubs, photos, stats)
- [ ] ⚠️ Note : Import plus long car récupération stats (~2-3h avec rate limiting)

---

### Phase 2 : MVP Core (Jour 3-5)

**Jour 3** :
- [ ] Page Home (sélection mode)
- [ ] Page ClubSelector
- [ ] Routing React Router
- [ ] Context pour mode (L1 vs club)

**Jour 4** :
- [ ] Page Vote
- [ ] API GET /api/players/random?context=...
- [ ] PlayerCard component
- [ ] VoteButtons component
- [ ] API POST /api/vote

**Jour 5** :
- [ ] Logique de vote (upvotes/downvotes)
- [ ] Joueur suivant automatique
- [ ] Compteur de votes
- [ ] Tests fonctionnels

---

### Phase 3 : Classement (Jour 6)

- [ ] Page Ranking
- [ ] API GET /api/ranking
- [ ] RankingTable component
- [ ] Filtres par poste
- [ ] Filtre par club (dropdown)
- [ ] Barre de recherche

---

### Phase 4 : Polish & Deploy (Jour 7)

- [ ] Design final TailwindCSS
- [ ] Animations vote
- [ ] Responsive mobile
- [ ] Messages encouragement
- [ ] Tests complets
- [ ] Déploiement Vercel + Railway
- [ ] Tests en production

---

### Total estimé : **7 jours** (1 semaine)

---

## ✅ Checklist MVP

### Fonctionnel
- [ ] Sélection mode L1 / Mon club
- [ ] Sélection du club (18 choix)
- [ ] Vote sur joueur (up/neutral/down)
- [ ] Affichage stats joueur (adaptées au poste)
- [ ] Joueur suivant instantané
- [ ] Compteur votes
- [ ] Classement global
- [ ] Classement par club
- [ ] Filtres poste/club
- [ ] Recherche joueur
- [ ] Changement de mode

### Technique
- [ ] tous les joueurs importés
- [ ] Photos chargent < 2s
- [ ] API répond < 200ms
- [ ] Base SQLite fonctionnelle
- [ ] Pas d'erreurs console

### Design
- [ ] Responsive mobile
- [ ] Animations fluides
- [ ] Charte graphique appliquée
- [ ] Boutons clairs (CTA)

### Déploiement
- [ ] Frontend déployé (Vercel)
- [ ] Backend déployé (Railway)
- [ ] Base de données montée
- [ ] URLs propres
- [ ] HTTPS actif

---

## 📈 Métriques de succès

### KPIs MVP
- **Votes** : >500 votes dans les 7 premiers jours
- **Engagement** : >15 votes par session en moyenne
- **Rétention** : >30% des users reviennent J+1
- **Performance** : Temps chargement page < 2s

### Analytics à tracker
- Votes par mode (L1 vs clubs)
- Clubs les plus votés
- Joueurs les plus votés
- Votes par poste
- Taux de complétion (combien % des joueurs votés)
- Temps moyen par vote

---

## 🔄 Roadmap post-MVP

### v1.1 (Semaine 2)
- [ ] Swipe mobile (gauche/droite)
- [ ] Animations avancées
- [ ] Stats par joueur détaillées (% positif, total votes)
- [ ] **Script de mise à jour des stats hebdomadaire** (automatique)
- [ ] Partage sur réseaux sociaux
- [ ] Classements "tendances" (7 derniers jours)

### v1.2 (Semaine 3-4)
- [ ] Légendes PSG (pilote)
- [ ] Légendes OM (pilote)
- [ ] Curation 50 légendes par club
- [ ] Pages dédiées /psg/legends

### v2.0 (Futur)
- [ ] Authentification (limiter spam)
- [ ] Historique personnel des votes
- [ ] Comparaison clubs (PSG vs OM)
- [ ] Mode "Battle Royale"
- [ ] API publique du classement
- [ ] Autres championnats (EPL, Liga)

---

## ⚠️ Contraintes & Risques

### Gestion des transferts

**Stratégie validée** :

| Scénario | Action | Votes conservés ? |
| --- | --- | --- |
| **Transfert interne L1** | UPDATE club | ✅ Oui |
| **Départ hors L1** | DELETE (hard delete) | ❌ Non |
| **Nouveau joueur** | INSERT | N/A |

**Implémentation** :

**MVP** : Gestion manuelle
```sql
-- Transfert interne (ex: Skriniar PSG → OM)
UPDATE players 
SET club = 'Olympique de Marseille',
    previous_club = 'Paris Saint-Germain' (optionnel)
WHERE name = 'Skriniar';

-- Départ hors L1 (ex: Mbappé → Real Madrid)
DELETE FROM players 
WHERE name = 'Kylian Mbappé';
```

**v1.1** : Script hebdomadaire automatique
```javascript
// Tous les lundis, détection via API-Football
async function checkTransfers() {
  const allPlayers = await db.all('SELECT * FROM players');
  
  for (const player of allPlayers) {
    const currentData = await apiFootball.getPlayer(player.api_id);
    
    if (currentData.team !== player.club) {
      if (isLigue1Club(currentData.team)) {
        // Transfert interne → UPDATE
        await db.run('UPDATE players SET club = ? WHERE id = ?', 
          [currentData.team, player.id]);
      } else {
        // Départ hors L1 → DELETE
        await db.run('DELETE FROM players WHERE id = ?', [player.id]);
      }
    }
  }
}
```

**Fréquence** :
- MVP : Manuelle (1x/mois si besoin)
- v1.1 : Automatique hebdomadaire (lundi)
- v1.2 : Quotidienne pendant mercato

### Contraintes légales
- Photos joueurs : API-Football (droits OK)
- Logos clubs : Ne pas utiliser (ou domaine public)
- Mention : "Site non officiel"

### Contraintes techniques
- API-Football : 100 requêtes/jour (OK pour import)
- SQLite : Limite 1TB (largement suffisant)
- Pas d'auth = possibilité spam votes

### Risques identifiés
| Risque | Impact | Mitigation |
| --- | --- | --- |
| Spam de votes | 🟡 Moyen | Rate limiting (1 vote/2s) |
| API-Football down | 🔴 Fort | Cache local des joueurs |
| Photos cassées | 🟢 Faible | Placeholder si erreur |
| Surcharge serveur | 🟡 Moyen | Démarrer gratuit, scale si besoin |

---

## 🎯 Décisions de conception

### Décisions prises
✅ Vote individuel (pas comparaison paires)
✅ L1 complète dès le MVP (tous les joueurs)
✅ Choix du mode dès la home (L1 vs club)
✅ **18 clubs affichés directement sur homepage** (pas d'écran de sélection)
✅ Score simple : upvotes - downvotes
✅ Nom : Foot Vibes
✅ Design : Swipe/feeling type TikTok
✅ Filtre : Minimum 1 match joué cette saison
✅ Pondération : Favorise joueurs peu votés + gros clubs au début (Kevin le footix)
✅ Wordings vote : J'adore / Moyen / Beurk
✅ **Transferts** : UPDATE club si interne L1, DELETE si départ hors L1

### Décisions reportées (v1.1+)
⏸️ Authentification utilisateurs
⏸️ Légendes historiques
⏸️ Autres championnats
⏸️ Mode battle royale
⏸️ Classements multiples (semaine/mois)

---

## 📞 Questions ouvertes

**Aucune** - Toutes les décisions ont été prises et validées.

Les décisions finales sont documentées dans la section "Décisions prises" ci-dessus.

## ✅ DÉCISIONS VALIDÉES

### 1. Algorithme joueur suivant : PONDÉRÉ ✅
**Implémentation** : Favoriser les joueurs avec peu de votes
```javascript
// Pondération inversée basée sur total_votes
// Plus un joueur a de votes, moins il apparaît souvent
weight = 100 - log(total_votes + 1) * 10
```

### 2. Minimum votes : 10 VOTES ✅
**Règle** : Minimum 10 votes requis pour apparaître au classement public
```sql
WHERE total_votes >= 10
```

### 3. Affichage score AVANT vote : RIEN ✅
**Décision** : Ne PAS afficher le score/rang/popularité avant le vote
**Raison** : Garder le vote 100% émotionnel et authentique
**Feedback** : Afficher APRÈS le vote ("Barcola est passé de #9 à #8 !")

### 4. Limitation votes : COMBINÉE ✅
**MVP (Semaine 1)** :
- Rate limiting : 1 vote toutes les 2 secondes
- IP tracking : 100 votes maximum par jour par IP

**v1.1 (Semaine 2)** :
- + Browser fingerprinting (FingerprintJS)
- + 1 seul vote par joueur par utilisateur
- + Limite : 200 votes/jour par fingerprint
- **Protection finale : \~98%**

### 5. Stats des joueurs : AFFICHÉES ✅
**Décision** : Afficher les stats AVANT le vote
**Infos affichées** :
- Joueurs de champ : Buts, passes décisives, matches joués
- Gardiens : Clean sheets, arrêts, matches joués
- Nationalité (drapeau)
- Âge, numéro

### Feedback à récolter
- Les users préfèrent L1 complète ou mode club ?
- Quel club est le plus voté ?
- Quelle est la durée moyenne de session ?
- Les users demandent les légendes rapidement ?

---

**Version** : 2.5 - MVP Final (Foot Vibes - Gestion saisons)
**Date** : 27 janvier 2026  
**Statut** : ✅ Validé - Prêt pour développement

**Changements v2.5** :
- ✅ Ajout champ `source_season` pour gestion changement de saison
- ✅ Liste officielle 18 clubs avec noms L'Équipe.fr (Paris SG, OM, etc.)
- ✅ Nettoyage : suppression filtre "Stars uniquement"
- ✅ Nettoyage : suppression options UI footix
- ✅ Changement : "Vote sur tous les joueurs" (pas "450 joueurs")

**Changements v2.4** :
- ✅ Gestion transferts validée : UPDATE si L1 interne, DELETE si départ
- ✅ MVP = gestion manuelle, v1.1 = script hebdomadaire auto

**Changements v2.3** :
- ✅ Interface de vote finalisée : Mobile-First
- ✅ Wording validé : 👍 J'adore / 😐 Moyen / 👎 Beurk
- ✅ Design boutons : Pleins avec gradients (vert/gris/rouge)
- ✅ Vote sur feeling général saison (pas perfo récente)

**Changements v2.2** :
- ✅ 18 clubs affichés directement sur homepage (gain -66% de clics)
- ✅ Suppression de l'écran de sélection intermédiaire

**Changement v2.1** : Rebrand "Foot Vibes"
- URL cible : footvibes.fr
