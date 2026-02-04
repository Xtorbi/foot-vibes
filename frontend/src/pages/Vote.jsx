import { useState, useEffect, useCallback } from 'react';
import { useMode } from '../contexts/ModeContext';
import PlayerCard from '../components/PlayerCard';
import PlayerCardSkeleton from '../components/PlayerCardSkeleton';
import VoteButtons from '../components/VoteButtons';
import Confetti from '../components/Confetti';
import { fetchRandomPlayer, submitVote } from '../utils/api';

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
  const [exitDirection, setExitDirection] = useState(null); // 'left', 'right', 'down'
  const [voteFlash, setVoteFlash] = useState(null); // 'up', 'down', 'neutral'
  const [error, setError] = useState(null);

  const loadPlayer = useCallback(async () => {
    setPlayer(null); // Reset immédiat pour éviter le blink
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRandomPlayer(mode, votedIds);
      setPlayer(data);
    } catch (err) {
      console.error('Erreur chargement joueur:', err);
      setError('Impossible de charger le joueur. Vérifie que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  }, [mode, votedIds]);

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  const handleVote = async (voteType) => {
    if (!player || exitDirection) return;

    // Flash coloré immédiat
    setVoteFlash(voteType);

    // Déclencher l'animation de sortie après un court délai
    setTimeout(() => {
      const direction = voteType === 'up' ? 'right' : voteType === 'down' ? 'left' : 'down';
      setExitDirection(direction);
    }, 150);

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

      // Attendre la fin de l'animation avant de charger le suivant
      setTimeout(() => {
        setExitDirection(null);
        setVoteFlash(null);
        loadPlayer();
      }, 400); // 150ms flash + 250ms exit
    } catch (err) {
      console.error('Erreur vote:', err);
      setExitDirection(null);
      setVoteFlash(null);
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

  // Statiques: 'bg-deep', 'bg-glow', 'bg-corner', 'bg-dual', 'bg-aurora-static'
  // Animés: 'bg-aurora', 'bg-mesh', 'bg-grid', 'bg-aurora-intense'
  const bgStyle = 'bg-aurora-static';

  return (
    <main className={`min-h-screen ${bgStyle} px-4 py-4`}>
      <Confetti trigger={celebration.trigger} message={celebration.message} />
      <div className="max-w-sm mx-auto">
        {/* Contenu avec feedback en overlay */}
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadPlayer}
              className="bg-fv-green text-fv-navy font-bold px-6 py-2 rounded-full hover:bg-fv-green-dark transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <PlayerCardSkeleton />
        ) : (
          <div className="relative">
            <PlayerCard
              key={player?.id}
              player={player}
              animate
              exitDirection={exitDirection}
              voteFlash={voteFlash}
              voteCount={voteCount}
            />
            <VoteButtons onVote={handleVote} disabled={loading || exitDirection} />

            {/* Feedback overlay - positionné sous les boutons */}
            {feedback && (
              <div className="absolute left-0 right-0 -bottom-8 flex justify-center">
                <div className="bg-white/10 text-white text-center py-1.5 px-4 rounded-full text-xs
                                animate-feedback-in backdrop-blur-sm border border-white/10">
                  {feedback}
                </div>
              </div>
            )}

            {/* Hint clavier - masqué sur mobile */}
            <p className="hidden sm:block text-center text-white/20 text-[10px] mt-10">
              ← → pour voter · ↓ pour passer
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Vote;
