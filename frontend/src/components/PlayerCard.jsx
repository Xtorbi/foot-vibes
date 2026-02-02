import { useState, useRef } from 'react';

// Icônes de position
const POSITION_ICONS = {
  'Gardien': '🧤',
  'Defenseur': '🛡️',
  'Milieu': '',
  'Attaquant': '⚡',
};

// Placeholder SVG en base64
const PLACEHOLDER_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='20' fill='%234a5568'/%3E%3Cellipse cx='50' cy='85' rx='30' ry='25' fill='%234a5568'/%3E%3C/svg%3E";

function PlayerCard({ player, animate = false }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (!player) return null;

  const isGoalkeeper = player.position === 'Gardien';
  const nameParts = player.name.split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || '';
  const lastName = nameParts[nameParts.length - 1] || player.name;
  const positionIcon = POSITION_ICONS[player.position] || '⚽';

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
    <div className={`w-full max-w-[300px] mx-auto ${animate ? 'animate-fade-in-up' : ''}`}>
      {/* Card principale avec effet 3D */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="card-shine bg-fv-navy-light rounded-2xl overflow-hidden shadow-material-3
                   transition-all duration-150 hover:shadow-material-5"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Badge position avec icône */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="px-3 py-0.5 bg-fv-navy text-white text-[10px] font-semibold tracking-wider rounded-full uppercase flex items-center gap-1">
            <span>{positionIcon}</span>
            {player.position}
          </span>
        </div>

        {/* Photo + Nom */}
        <div className="relative flex flex-col items-center px-4 pb-3">
          {/* Photo avec placeholder */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-fv-navy mb-2 bg-fv-navy">
            <img
              src={player.photo_url || PLACEHOLDER_PHOTO}
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER_PHOTO; }}
            />
          </div>

          {/* Nom */}
          {firstName && (
            <p className="text-white/70 text-xs tracking-wide">{firstName}</p>
          )}
          <h2 className="text-white text-lg font-extrabold tracking-wide uppercase">
            {lastName}
          </h2>
        </div>

        {/* Club */}
        <div className="text-center py-2 border-t border-fv-navy">
          <p className="text-white/50 text-[10px] tracking-widest uppercase">{player.club}</p>
        </div>

        {/* Stats grid compact */}
        <div className="grid grid-cols-2 border-t border-fv-navy text-xs">
          <div className="py-2 px-3 border-r border-b border-fv-navy">
            <span className="text-white/50">Matchs</span>
            <span className="text-white font-bold ml-1">{player.matches_played || '-'}</span>
          </div>
          <div className="py-2 px-3 border-b border-fv-navy">
            <span className="text-white/50">{isGoalkeeper ? 'Clean sheets' : 'Buts'}</span>
            <span className="text-white font-bold ml-1">{isGoalkeeper ? (player.clean_sheets || '-') : (player.goals || '-')}</span>
          </div>
          <div className="py-2 px-3 border-r border-fv-navy">
            <span className="text-white/50">Âge</span>
            <span className="text-white font-bold ml-1">{player.age || '-'}</span>
          </div>
          <div className="py-2 px-3">
            <span className="text-white/50">{isGoalkeeper ? 'Arrêts' : 'Passes décisives'}</span>
            <span className="text-white font-bold ml-1">{isGoalkeeper ? (player.saves || '-') : (player.assists || '-')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
