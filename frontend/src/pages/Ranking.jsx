import { useState, useEffect } from 'react';
import { useMode } from '../contexts/ModeContext';
import RankingTable from '../components/RankingTable';
import { fetchRanking } from '../utils/api';

const POSITIONS = ['Tous', 'Gardien', 'Defenseur', 'Milieu', 'Attaquant'];

function Ranking() {
  const { mode } = useMode();
  const [players, setPlayers] = useState([]);
  const [total, setTotal] = useState(0);
  const [positionFilter, setPositionFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const [context, setContext] = useState(mode);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchRanking({
          context,
          position: positionFilter === 'Tous' ? undefined : positionFilter,
          search: search || undefined,
        });
        setPlayers(data.players);
        setTotal(data.total);
      } catch (err) {
        console.error('Erreur classement:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [context, positionFilter, search]);

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Mode toggle */}
      <div className="flex gap-3 mb-4 animate-fade-in-up">
        <button
          onClick={() => setContext('ligue1')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
            context === 'ligue1'
              ? 'bg-fv-green text-fv-navy'
              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          Global L1
        </button>
        {mode !== 'ligue1' && (
          <button
            onClick={() => setContext(mode)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              context === mode
                ? 'bg-fv-green text-fv-navy'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {mode.toUpperCase()}
          </button>
        )}
      </div>

      {/* Position filters */}
      <div className="flex gap-2 mb-4 flex-wrap animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => setPositionFilter(pos)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              positionFilter === pos
                ? 'bg-fv-green/20 text-fv-green border border-fv-green/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher un joueur..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl mb-6
                   text-white placeholder-white/30
                   focus:outline-none focus:border-fv-green/50 focus:bg-white/10
                   transition-all duration-200 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-fv-green" />
        </div>
      ) : (
        <>
          <RankingTable players={players} />
          {total > 0 && (
            <p className="text-center text-white/40 mt-4 text-sm animate-fade-in-up">
              {players.length} / {total} joueurs
            </p>
          )}
        </>
      )}
    </main>
  );
}

export default Ranking;
