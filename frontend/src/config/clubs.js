// Clubs Ligue 1 2025-2026 avec logos
// Logos via Transfermarkt CDN

const CLUBS = [
  { id: 'psg', name: 'Paris SG', tmId: 583 },
  { id: 'om', name: 'OM', tmId: 244 },
  { id: 'lyon', name: 'Lyon', tmId: 1041 },
  { id: 'monaco', name: 'Monaco', tmId: 162 },
  { id: 'lille', name: 'Lille', tmId: 1082 },
  { id: 'nice', name: 'Nice', tmId: 417 },
  { id: 'lens', name: 'Lens', tmId: 826 },
  { id: 'rennes', name: 'Rennes', tmId: 273 },
  { id: 'brest', name: 'Brest', tmId: 3911 },
  { id: 'strasbourg', name: 'Strasbourg', tmId: 667 },
  { id: 'toulouse', name: 'Toulouse', tmId: 415 },
  { id: 'nantes', name: 'Nantes', tmId: 995 },
  { id: 'lehavre', name: 'Le Havre', tmId: 738 },
  { id: 'auxerre', name: 'Auxerre', tmId: 290 },
  { id: 'angers', name: 'Angers', tmId: 1420 },
  { id: 'lorient', name: 'Lorient', tmId: 1158 },
  { id: 'parisfc', name: 'Paris FC', tmId: 10004 },
  { id: 'metz', name: 'Metz', tmId: 347 },
];

// Génère l'URL du logo Transfermarkt
export const getClubLogo = (tmId) =>
  `https://tmssl.akamaized.net/images/wappen/head/${tmId}.png`;

// Map club name -> logo URL
export const CLUB_LOGOS = {};
CLUBS.forEach(club => {
  CLUB_LOGOS[club.name] = getClubLogo(club.tmId);
  CLUB_LOGOS[club.id] = getClubLogo(club.tmId);
});

// Alias pour les noms complets de la BDD
const CLUB_ALIASES = {
  'Paris Saint-Germain': 'psg',
  'Olympique de Marseille': 'om',
  'Olympique Lyonnais': 'lyon',
  'AS Monaco': 'monaco',
  'LOSC Lille': 'lille',
  'OGC Nice': 'nice',
  'RC Lens': 'lens',
  'Stade Rennais': 'rennes',
  'Stade Brestois 29': 'brest',
  'RC Strasbourg Alsace': 'strasbourg',
  'Toulouse FC': 'toulouse',
  'FC Nantes': 'nantes',
  'Le Havre AC': 'lehavre',
  'AJ Auxerre': 'auxerre',
  'Angers SCO': 'angers',
  'FC Lorient': 'lorient',
  'Paris FC': 'parisfc',
  'FC Metz': 'metz',
};

Object.entries(CLUB_ALIASES).forEach(([fullName, id]) => {
  CLUB_LOGOS[fullName] = CLUB_LOGOS[id];
});

export default CLUBS;
