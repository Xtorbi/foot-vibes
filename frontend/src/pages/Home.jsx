import { useNavigate } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import ClubGrid from '../components/ClubGrid';

function Home() {
  const navigate = useNavigate();
  const { setMode } = useMode();

  const handleLigue1 = () => {
    setMode('ligue1');
    navigate('/vote');
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Hero CTA */}
      <div className="relative bg-fv-navy-light rounded-3xl p-8 md:p-10 text-center mb-8 overflow-hidden animate-fade-in-up border border-white/5">
        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-fv-green/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-fv-green/5 rounded-full blur-2xl" />

        {/* Lignes décoratives */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-fv-green/30 to-transparent" />

        <div className="relative">
          <p className="text-fv-green text-xs font-bold tracking-[0.25em] uppercase mb-4">
            SAISON 2025-2026
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-white mb-2 tracking-tight">
            VOTE POUR TES
          </h1>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-fv-green mb-4 tracking-tight">
            JOUEURS PRÉFÉRÉS
          </h1>
          <p className="text-white/50 mb-8">
            481 joueurs · 18 clubs · Classe-les selon tes vibes
          </p>
          <button
            onClick={handleLigue1}
            className="bg-fv-green text-fv-navy font-bold
                       px-8 py-4 rounded-full text-lg
                       hover:bg-fv-green-dark hover:scale-105
                       active:scale-95 transition-all duration-200
                       inline-flex items-center gap-2"
          >
            COMMENCER À VOTER
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Séparateur */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/40 text-sm font-medium">ou choisis ton club</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Clubs */}
      <ClubGrid />
    </main>
  );
}

export default Home;
