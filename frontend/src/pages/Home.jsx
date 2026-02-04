import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import ClubGrid from '../components/ClubGrid';

function Home() {
  const navigate = useNavigate();
  const { setMode } = useMode();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLigue1 = () => {
    setMode('ligue1');
    navigate('/vote');
  };

  return (
    <main className="min-h-screen bg-aurora-static">
      {/* Header sticky qui apparaît au scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? 'bg-fv-navy/95 backdrop-blur-md border-b border-white/10 py-3'
            : 'bg-transparent py-4 pointer-events-none'}`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center max-w-4xl">
          <div
            className={`flex items-baseline gap-1 transition-all duration-300
              ${scrolled ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
          >
            <span className="text-xl font-heading font-black tracking-wide text-white">
              FOOT
            </span>
            <span className="text-xl font-heading font-black tracking-wide text-fv-green">
              VIBES
            </span>
          </div>
          <div
            className={`flex gap-3 transition-all duration-300
              ${scrolled ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
          >
            <Link
              to="/classement"
              className="text-white/70 hover:text-white font-medium text-sm px-4 py-2 rounded-full
                         border border-white/20 hover:border-white/40 transition-all"
            >
              Classement
            </Link>
            <button
              onClick={handleLigue1}
              className="bg-fv-green text-fv-navy font-bold text-sm px-4 py-2 rounded-full
                         hover:bg-fv-green-dark transition-all"
            >
              Voter
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-10 animate-fade-in-up">
          {/* Logo FOOT VIBES */}
          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-5xl sm:text-6xl md:text-7xl font-heading font-black tracking-wide text-white">
              FOOT
            </span>
            <span className="text-5xl sm:text-6xl md:text-7xl font-heading font-black tracking-wide text-fv-green logo-glow">
              VIBES
            </span>
          </div>

          {/* Tagline */}
          <p className="text-white/70 text-lg sm:text-xl mb-2">
            Vote pour tes joueurs preferés
          </p>
          <p className="text-fv-green text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-8">
            Saison 2025-2026
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLigue1}
              className="bg-fv-green text-fv-navy font-bold
                         px-8 py-4 rounded-full text-lg
                         hover:bg-fv-green-dark hover:scale-105
                         active:scale-95 transition-all duration-200
                         inline-flex items-center gap-2 shadow-lg"
            >
              Commencer a voter
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <Link
              to="/classement"
              className="text-white/70 hover:text-white font-bold text-lg
                         px-8 py-4 rounded-full border-2 border-white/20 hover:border-white/40
                         transition-all duration-200"
            >
              Voir le classement
            </Link>
          </div>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/40 text-sm font-medium">ou choisis ton club</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Clubs Grid */}
        <ClubGrid />
      </div>
    </main>
  );
}

export default Home;
