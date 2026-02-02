# 09 - Systeme de scoring

## Formule de score (MVP)

```
score = upvotes - downvotes
```

Simple et efficace : un joueur tres aime avec beaucoup de J'adore et peu de Beurk aura un score eleve.

---

## Minimum de votes

**Regle** : Minimum 10 votes requis pour apparaitre au classement public.

```sql
WHERE total_votes >= 10
```

Cela evite qu'un joueur avec 1 seul vote positif apparaisse en tete du classement.

---

## Requete de classement

```sql
SELECT
  id, name, club, position,
  upvotes, downvotes, neutral_votes,
  (upvotes - downvotes) as score,
  ROW_NUMBER() OVER (ORDER BY (upvotes - downvotes) DESC) as rank
FROM players
WHERE (club = ? OR ? IS NULL)         -- Filtre club optionnel
  AND (position = ? OR ? IS NULL)     -- Filtre poste optionnel
  AND total_votes >= 10               -- Minimum votes
ORDER BY score DESC
LIMIT 50 OFFSET 0;
```

---

## Affichage du score

### Avant le vote : RIEN

**Decision** : Ne PAS afficher le score/rang/popularite avant le vote.
**Raison** : Garder le vote 100% emotionnel et authentique.

### Apres le vote : Feedback

**Feedback affiche** :
- Changement de rang : "Barcola est passe de #9 a #8 !"
- Pas de changement : "Ton vote compte ! Barcola reste #8"
- Nouveau dans le top 10 : "Barcola entre dans le top 10 !"
- Sort du top 10 : "Barcola : #9 -> #11"

---

## Alternative v1.1 (ratio positif)

```
score = (upvotes / total_votes) * 100
filtre: minimum 10 votes pour apparaitre
```

Cela donne un pourcentage d'approbation plutot qu'un score brut. A evaluer apres le MVP selon les retours utilisateurs.
