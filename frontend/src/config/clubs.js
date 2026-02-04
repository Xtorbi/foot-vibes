// Clubs Ligue 1 2025-2026 avec logos
// Logos via Transfermarkt CDN

const CLUBS = [
  { id: 'psg', name: 'Paris SG', tmId: 583, colors: ['#004170', '#DA291C'] },
  { id: 'om', name: 'OM', tmId: 244, colors: ['#2FAEE0', '#FFFFFF'] },
  { id: 'lyon', name: 'Lyon', tmId: 1041, colors: ['#1A3E8F', '#E30613'] },
  { id: 'monaco', name: 'Monaco', tmId: 162, colors: ['#E30613', '#FFFFFF'] },
  { id: 'lille', name: 'Lille', tmId: 1082, colors: ['#E30613', '#1A1A1A'] },
  { id: 'nice', name: 'Nice', tmId: 417, colors: ['#E30613', '#1A1A1A'] },
  { id: 'lens', name: 'Lens', tmId: 826, colors: ['#FFD700', '#E30613'] },
  { id: 'rennes', name: 'Rennes', tmId: 273, colors: ['#E30613', '#1A1A1A'] },
  { id: 'brest', name: 'Brest', tmId: 3911, colors: ['#E30613', '#FFFFFF'] },
  { id: 'strasbourg', name: 'Strasbourg', tmId: 667, colors: ['#1E90FF', '#FFFFFF'] },
  { id: 'toulouse', name: 'Toulouse', tmId: 415, colors: ['#6B2D8B', '#FFFFFF'] },
  { id: 'nantes', name: 'Nantes', tmId: 995, colors: ['#FCDD09', '#2D8C3C'] },
  { id: 'lehavre', name: 'Le Havre', tmId: 738, colors: ['#1E90FF', '#87CEEB'] },
  { id: 'auxerre', name: 'Auxerre', tmId: 290, colors: ['#1E3A8A', '#FFFFFF'] },
  { id: 'angers', name: 'Angers', tmId: 1420, colors: ['#1A1A1A', '#FFFFFF'] },
  { id: 'lorient', name: 'Lorient', tmId: 1158, colors: ['#F97316', '#1A1A1A'] },
  { id: 'parisfc', name: 'Paris FC', tmId: 10004, colors: ['#1E3A8A', '#E30613'] },
  { id: 'metz', name: 'Metz', tmId: 347, colors: ['#8B0000', '#FFFFFF'] },
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

export const CLUB_NAMES = Object.keys(CLUB_ALIASES);

export default CLUBS;
