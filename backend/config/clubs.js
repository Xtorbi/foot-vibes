const L1_LEAGUE_ID = 61;
const CURRENT_SEASON = '2025-2026';
const API_SEASON = 2025;

// Clubs Ligue 1 saison 2025-2026 (mis à jour avec Transfermarkt)
// Promus: Lorient, Paris FC, Metz | Relégués: Montpellier, Saint-Étienne, Reims
const L1_CLUBS = [
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'Paris SG', tmId: 583, popularity: 100 },
  { id: 'om', name: 'Olympique de Marseille', shortName: 'OM', tmId: 244, popularity: 80 },
  { id: 'lyon', name: 'Olympique Lyonnais', shortName: 'Lyon', tmId: 1041, popularity: 60 },
  { id: 'monaco', name: 'AS Monaco', shortName: 'Monaco', tmId: 162, popularity: 50 },
  { id: 'lille', name: 'LOSC Lille', shortName: 'Lille', tmId: 1082, popularity: 40 },
  { id: 'nice', name: 'OGC Nice', shortName: 'Nice', tmId: 417, popularity: 35 },
  { id: 'lens', name: 'RC Lens', shortName: 'Lens', tmId: 826, popularity: 30 },
  { id: 'rennes', name: 'Stade Rennais', shortName: 'Rennes', tmId: 273, popularity: 25 },
  { id: 'brest', name: 'Stade Brestois 29', shortName: 'Brest', tmId: 3911, popularity: 20 },
  { id: 'strasbourg', name: 'RC Strasbourg Alsace', shortName: 'Strasbourg', tmId: 667, popularity: 15 },
  { id: 'toulouse', name: 'Toulouse FC', shortName: 'Toulouse', tmId: 415, popularity: 15 },
  { id: 'nantes', name: 'FC Nantes', shortName: 'Nantes', tmId: 995, popularity: 15 },
  { id: 'lehavre', name: 'Le Havre AC', shortName: 'Le Havre', tmId: 738, popularity: 10 },
  { id: 'auxerre', name: 'AJ Auxerre', shortName: 'Auxerre', tmId: 290, popularity: 10 },
  { id: 'angers', name: 'Angers SCO', shortName: 'Angers', tmId: 1420, popularity: 10 },
  { id: 'lorient', name: 'FC Lorient', shortName: 'Lorient', tmId: 1158, popularity: 20 },
  { id: 'parisfc', name: 'Paris FC', shortName: 'Paris FC', tmId: 1032, popularity: 15 },
  { id: 'metz', name: 'FC Metz', shortName: 'Metz', tmId: 347, popularity: 15 },
];

const CLUB_POPULARITY = {};
L1_CLUBS.forEach(club => {
  CLUB_POPULARITY[club.name] = club.popularity;
});

const POSITION_MAP = {
  'Goalkeeper': 'Gardien',
  'Defender': 'Defenseur',
  'Midfielder': 'Milieu',
  'Attacker': 'Attaquant',
};

module.exports = {
  L1_LEAGUE_ID,
  CURRENT_SEASON,
  API_SEASON,
  L1_CLUBS,
  CLUB_POPULARITY,
  POSITION_MAP,
};
