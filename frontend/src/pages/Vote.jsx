import { useState, useEffect, useRef } from 'react';
import { useMode } from '../contexts/ModeContext';
import PlayerCard from '../components/PlayerCard';
import PlayerCardSkeleton from '../components/PlayerCardSkeleton';
import VoteButtons from '../components/VoteButtons';
import Confetti from '../components/Confetti';
import { fetchRandomPlayer, submitVote } from '../utils/api';

const MILESTONES = {
  10: '10 votes ! Tu t\'es bien échauffé.',
  25: '25 votes ! Quelle aisance balle au pied.',
  50: '50 votes ! Ciseau-retourné.',
  100: '100 votes ! Quelle merveille !',
  250: '250 votes ! Mais où t\'arrêteras-tu ?',
  500: '500 votes ! Hall of Fame !',
};

function Vote() {
  const { mode, voteCount, incrementVoteCount } = useMode();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [celebration, setCelebration] = useState({ trigger: 0, message: '' });
  const [exitDirection, setExitDirection] = useState(null);
  const [voteFlash, setVoteFlash] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [error, setError] = useState(null);

  // Utiliser une ref pour les IDs votés (pas de re-render)
  const votedIdsRef = useRef([]);

  const loadPlayer = async () => {
    setLoading(true);
    setShowCard(false);
    setError(null);
    try {
      const data = await fetchRandomPlayer(mode, votedIdsRef.current);
      setPlayer(data);
      // Petit délai avant d'afficher pour éviter le flash
      setTimeout(() => setShowCard(true), 50);
    } catch (err) {
      console.error('Erreur chargement joueur:', err);
      setError('Impossible de charger le joueur. Vérifie que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  // Charger le premier joueur au montage ou changement de mode
  useEffect(() => {
    votedIdsRef.current = [];
    loadPlayer();
  }, [mode]);

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

      // Ajouter à la ref
      votedIdsRef.current = [...votedIdsRef.current, player.id];

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
      }, 400);
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

  const bgStyle = 'bg-vibes';

  return (
    <main className={`h-[calc(100vh-64px)] ${bgStyle} px-4 flex flex-col justify-center`}>
      <Confetti trigger={celebration.trigger} message={celebration.message} />
      <div className="max-w-sm mx-auto w-full">
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
        ) : loading || !showCard || !player ? (
          <PlayerCardSkeleton />
        ) : (
          <div className="relative">
            <PlayerCard
              key={player?.id}
              player={player}
              animate
              exitDirection={exitDirection}
              voteFlash={voteFlash}
              voteCount={player?.total_votes}
            />
            <VoteButtons onVote={handleVote} disabled={loading || exitDirection} />

            <p className="text-center text-white/40 text-sm mt-4">
              Mes votes : {voteCount}
            </p>

            {feedback && (
              <div className="absolute left-0 right-0 -bottom-8 flex justify-center">
                <div className="bg-white/10 text-white text-center py-1.5 px-4 rounded-full text-xs
                                animate-feedback-in backdrop-blur-sm border border-white/10">
                  {feedback}
                </div>
              </div>
            )}

            <p className="hidden sm:block text-center text-white/20 text-[10px] mt-4">
              ← → pour voter · ↓ pour passer
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Vote;
