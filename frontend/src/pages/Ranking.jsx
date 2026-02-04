import { useState, useEffect } from 'react';
import RankingTable from '../components/RankingTable';
import { fetchRanking } from '../utils/api';
import { CLUB_NAMES } from '../config/clubs';

const PERIODS = [
  { id: 'week', label: '7 jours' },
  { id: 'month', label: '30 jours' },
  { id: 'season', label: 'Toute la saison' },
];

function Ranking() {
  const [players, setPlayers] = useState([]);
  const [total, setTotal] = useState(0);
  const [clubFilter, setClubFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('Tous');
  const [periodFilter, setPeriodFilter] = useState('season');
  const [frenchOnly, setFrenchOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchRanking({
          club: clubFilter || undefined,
          position: positionFilter === 'Tous' ? undefined : positionFilter,
          period: periodFilter === 'season' ? undefined : periodFilter,
          nationality: frenchOnly ? 'France' : undefined,
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
  }, [clubFilter, positionFilter, periodFilter, frenchOnly, search]);

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Ligne 1: Club + Position (dropdowns) + Toggle Français */}
      <div className="flex flex-wrap items-center gap-3 mb-4 animate-fade-in-up">
        {/* Club dropdown */}
        <select
          value={clubFilter}
          onChange={(e) => setClubFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200
                     bg-fv-navy border border-white/10 text-white
                     focus:outline-none focus:border-fv-green/50
                     [&>option]:bg-fv-navy [&>option]:text-white"
          style={{ colorScheme: 'dark' }}
        >
          <option value="">Tous les clubs</option>
          {CLUB_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {/* Position dropdown */}
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200
                     bg-fv-navy border border-white/10 text-white
                     focus:outline-none focus:border-fv-green/50
                     [&>option]:bg-fv-navy [&>option]:text-white"
          style={{ colorScheme: 'dark' }}
        >
          <option value="Tous">Tous les postes</option>
          <option value="Gardien">Gardien</option>
          <option value="Defenseur">Défenseur</option>
          <option value="Milieu">Milieu</option>
          <option value="Attaquant">Attaquant</option>
        </select>

        {/* Toggle Français - iOS style */}
        <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
          <span className="text-sm text-white/60">🇫🇷 Français uniquement</span>
          <div
            onClick={() => setFrenchOnly(!frenchOnly)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              frenchOnly ? 'bg-fv-green' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                frenchOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>

      {/* Ligne 2: Période */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 flex-wrap animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriodFilter(p.id)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              periodFilter === p.id
                ? 'bg-fv-green/20 text-fv-green border border-fv-green/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Ligne 4: Recherche */}
      <input
        type="text"
        placeholder="Rechercher un joueur..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl mb-4 sm:mb-6
                   text-sm sm:text-base text-white placeholder-white/30
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
