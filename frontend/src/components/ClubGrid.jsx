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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
      {CLUBS.map((club, index) => (
        <button
          key={club.id}
          onClick={() => handleClubClick(club.id)}
          className="flex items-center justify-center gap-2 px-3 py-2.5
                     bg-white/5 border border-white/10 rounded-xl
                     font-medium text-white/80 text-sm
                     hover:border-fv-green/50 hover:bg-fv-green/10 hover:text-white
                     hover:-translate-y-0.5 active:scale-95
                     transition-all duration-200 animate-fade-in-up"
          style={{ animationDelay: `${index * 25}ms`, animationFillMode: 'backwards' }}
        >
          <img
            src={getClubLogo(club.tmId)}
            alt=""
            className="w-5 h-5 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span>{club.name}</span>
        </button>
      ))}
    </div>
  );
}

export default ClubGrid;
