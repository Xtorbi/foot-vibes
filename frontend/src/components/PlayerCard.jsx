import { useState, useRef } from 'react';
import { CLUB_LOGOS } from '../config/clubs';

// Placeholder SVG en base64
const PLACEHOLDER_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='20' fill='%234a5568'/%3E%3Cellipse cx='50' cy='85' rx='30' ry='25' fill='%234a5568'/%3E%3C/svg%3E";

// Mapping positions avec accents
const POSITIONS = {
  'Defenseur': 'Défenseur',
  'Gardien': 'Gardien',
  'Milieu': 'Milieu',
  'Attaquant': 'Attaquant',
};

// Formater le nom du club (première lettre cap, reste minuscule sauf villes)
const formatClubName = (name) => {
  if (!name) return '';
  const lowercaseWords = ['de', 'du', 'des', 'et', 'le', 'la', 'les', 'fc', 'sc', 'ac', 'as', 'en'];
  return name.split(' ').map((word, index) => {
    const lower = word.toLowerCase();
    // Toujours capitaliser le premier mot
    if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    // Mots de liaison en minuscules
    if (lowercaseWords.includes(lower)) return lower;
    // Autres mots (villes, etc.) avec majuscule
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
};

function PlayerCard({ player, animate = false, exitDirection = null, voteFlash = null, voteCount = null }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (!player) return null;

  const getExitClass = () => {
    if (!exitDirection) return '';
    if (exitDirection === 'left') return 'animate-exit-left';
    if (exitDirection === 'right') return 'animate-exit-right';
    if (exitDirection === 'down') return 'animate-exit-down';
    return '';
  };

  const getFlashOverlay = () => {
    if (!voteFlash) return null;
    const colors = {
      up: 'bg-emerald-500/30',
      down: 'bg-red-500/30',
      neutral: 'bg-white/20',
    };
    return (
      <div
        className={`absolute inset-0 ${colors[voteFlash]} rounded-2xl animate-vote-flash pointer-events-none z-20`}
      />
    );
  };

  const isGoalkeeper = player.position === 'Gardien';
  const nameParts = player.name.split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || '';
  const lastName = nameParts[nameParts.length - 1] || player.name;
  const clubLogo = CLUB_LOGOS[player.club];

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 10, y: -x * 10 }); // Max 10deg tilt
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className={`w-full max-w-[300px] mx-auto ${getExitClass()}`}>
      {/* Card principale avec effet 3D */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative card-shine bg-fv-navy-light rounded-2xl overflow-hidden shadow-material-3
                   transition-all duration-150 hover:shadow-material-5"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Flash overlay */}
        {getFlashOverlay()}

        {/* Header : position à gauche, votes à droite */}
        <div className="flex justify-between items-center px-3 pt-3 pb-1">
          <span className="text-white/50 text-xs tracking-wider">
            {POSITIONS[player.position] || player.position}
          </span>
          {voteCount !== null && (
            <span className="text-white/50 text-xs">
              {voteCount} votes reçus
            </span>
          )}
        </div>

        {/* Photo + Nom */}
        <div className="relative flex flex-col items-center px-4 pb-3">
          {/* Photo avec placeholder */}
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-fv-navy mb-2 bg-fv-navy">
            <img
              src={player.photo_url || PLACEHOLDER_PHOTO}
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER_PHOTO; }}
            />
          </div>

          {/* Nom */}
          {firstName && (
            <p className="text-white/70 text-sm tracking-wide capitalize">{firstName.toLowerCase()}</p>
          )}
          <h2 className="text-white text-2xl font-extrabold tracking-wide uppercase">
            {lastName}
          </h2>
        </div>

        {/* Club */}
        <div className="flex justify-center items-center gap-2 pt-1 pb-3">
          {clubLogo && (
            <img src={clubLogo} alt={player.club} className="w-4 h-4 object-contain" />
          )}
          <p className="text-white/50 text-xs tracking-wide">{formatClubName(player.club)}</p>
        </div>

        {/* Stats tableau 2 colonnes */}
        <div className="grid grid-cols-2 border-t border-fv-navy">
          <div className="flex justify-between items-center px-4 py-2 border-r border-b border-fv-navy">
            <span className="text-white/70 text-sm">Matchs</span>
            <span className="text-white font-bold text-lg">{player.matches_played || '-'}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2 border-b border-fv-navy">
            <span className="text-white/70 text-sm">{isGoalkeeper ? 'C. sheets' : 'Buts'}</span>
            <span className="text-white font-bold text-lg">{isGoalkeeper ? (player.clean_sheets || '-') : (player.goals || '-')}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2 border-r border-fv-navy">
            <span className="text-white/70 text-sm">Âge</span>
            <span className="text-white font-bold text-lg">{player.age || '-'}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-2">
            <span className="text-white/70 text-sm">{isGoalkeeper ? 'Arrêts' : 'Passes'}</span>
            <span className="text-white font-bold text-lg">{isGoalkeeper ? (player.saves || '-') : (player.assists || '-')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
