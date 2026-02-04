import { useNavigate } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import CLUBS, { getClubLogo } from '../config/clubs';

function ClubGrid() {
  const navigate = useNavigate();
  const { setMode } = useMode();

  const handleClubClick = (clubId) => {
    setMode(clubId);
    navigate('/vote');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {CLUBS.map((club, index) => (
        <button
          key={club.id}
          onClick={() => handleClubClick(club.id)}
          style={{
            background: `linear-gradient(135deg, ${club.colors[0]}30, ${club.colors[1]}15)`,
            animationDelay: `${index * 25}ms`,
            animationFillMode: 'backwards',
          }}
          className="flex flex-col items-center justify-center gap-2 p-4
                     border-2 border-white/10 rounded-2xl
                     hover:border-fv-green/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]
                     hover:scale-105 active:scale-95
                     transition-all duration-200 animate-fade-in-up"
        >
          <img
            src={getClubLogo(club.tmId)}
            alt=""
            className="w-12 h-12 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="text-white font-semibold text-sm">{club.name}</span>
        </button>
      ))}
    </div>
  );
}

export default ClubGrid;
