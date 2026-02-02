import { useState, useEffect, useCallback } from 'react';
import { useMode } from '../contexts/ModeContext';
import PlayerCard from '../components/PlayerCard';
import PlayerCardSkeleton from '../components/PlayerCardSkeleton';
import VoteButtons from '../components/VoteButtons';
import Confetti from '../components/Confetti';
import AnimatedCounter from '../components/AnimatedCounter';
import { fetchRandomPlayer, submitVote } from '../utils/api';
import { CLUB_LOGOS } from '../config/clubs';

const MILESTONES = {
  10: '10 votes !',
  25: '25 votes !',
  50: 'CINQUANTE !',
  100: 'CENT VOTES !',
  250: 'Machine !',
  500: 'LEGENDAIRE !',
};

function Vote() {
  const { mode, voteCount, incrementVoteCount } = useMode();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [votedIds, setVotedIds] = useState([]);
  const [celebration, setCelebration] = useState({ trigger: 0, message: '' });

  const loadPlayer = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRandomPlayer(mode, votedIds);
      setPlayer(data);
    } catch (err) {
      console.error('Erreur chargement joueur:', err);
    } finally {
      setLoading(false);
    }
  }, [mode, votedIds]);

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  const handleVote = async (voteType) => {
    if (!player) return;

    try {
      const result = await submitVote(player.id, voteType, mode);
      const newCount = voteCount + 1;
      incrementVoteCount();
      setVotedIds(prev => [...prev, player.id]);

      // Vérifier si on atteint un milestone
      if (MILESTONES[newCount]) {
        setCelebration({ trigger: Date.now(), message: MILESTONES[newCount] });
      }

      if (result.message) {
        setFeedback(result.message);
        setTimeout(() => setFeedback(null), 2000);
      }

      loadPlayer();
    } catch (err) {
      console.error('Erreur vote:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleVote('up');
      else if (e.key === 'ArrowDown') handleVote('neutral');
      else if (e.key === 'ArrowLeft') handleVote('down');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player]);

  // Styles de fond disponibles: 'bg-fv-navy', 'bg-aurora', 'bg-mesh', 'bg-grid', 'bg-aurora-intense'
  const bgStyle = 'bg-aurora';

  return (
    <main className={`min-h-screen ${bgStyle} px-4 py-4`}>
      <Confetti trigger={celebration.trigger} message={celebration.message} />
      <div className="max-w-sm mx-auto">
        {/* Header discret */}
        <div className="flex justify-between items-center mb-4 text-[10px] text-white/40">
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            {mode !== 'ligue1' && CLUB_LOGOS[mode] && (
              <img src={CLUB_LOGOS[mode]} alt={mode} className="w-4 h-4 object-contain" />
            )}
            {mode === 'ligue1' ? 'Ligue 1' : mode}
          </span>
          <span><AnimatedCounter value={voteCount} /> votes</span>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="bg-white/10 text-white text-center py-1.5 px-3 rounded-lg mb-3 text-xs
                          animate-fade-in-up backdrop-blur-sm border border-white/10">
            {feedback}
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <PlayerCardSkeleton />
        ) : (
          <>
            <PlayerCard key={player?.id} player={player} animate />
            <VoteButtons onVote={handleVote} disabled={loading} />

            {/* Hint clavier */}
            <p className="text-center text-white/20 text-[10px] mt-4">
              ← → pour voter · ↓ pour passer
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default Vote;
