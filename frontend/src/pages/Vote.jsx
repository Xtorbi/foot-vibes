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
  const [stack, setStack] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [celebration, setCelebration] = useState({ trigger: 0, message: '' });
  const [exitDirection, setExitDirection] = useState(null);
  const [error, setError] = useState(null);

  const votedIdsRef = useRef([]);

  // Charger les 2 premiers joueurs au montage / changement de mode
  useEffect(() => {
    const init = async () => {
      votedIdsRef.current = [];
      setStack([]);
      setInitialLoading(true);
      setError(null);
      try {
        const first = await fetchRandomPlayer(mode, []);
        // Charger le 2e en parallèle sans bloquer l'affichage
        setStack([first]);
        setInitialLoading(false);
        const second = await fetchRandomPlayer(mode, [first.id]);
        setStack([first, second]);
      } catch (err) {
        console.error('Erreur chargement joueurs:', err);
        setError('Impossible de charger les joueurs. Vérifie que le backend est démarré.');
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, [mode]);

  const handleVote = async (voteType) => {
    if (stack.length === 0 || exitDirection) return;

    const currentPlayer = stack[0];
    const direction = voteType === 'up' ? 'right' : voteType === 'down' ? 'left' : 'down';
    setExitDirection(direction);

    try {
      const result = await submitVote(currentPlayer.id, voteType, mode);
      const newCount = voteCount + 1;
      incrementVoteCount();

      votedIdsRef.current = [...votedIdsRef.current, currentPlayer.id];

      if (MILESTONES[newCount]) {
        setCelebration({ trigger: Date.now(), message: MILESTONES[newCount] });
      }

      if (result.message) {
        setFeedback(result.message);
        setTimeout(() => setFeedback(null), 2000);
      }

      // Attendre la fin de l'animation de sortie
      setTimeout(() => {
        // Promouvoir la carte suivante (batché par React)
        setExitDirection(null);
        setStack(prev => prev.slice(1));

        // Charger le prochain joueur en arrière-plan
        const remainingIds = stack.slice(1).map(p => p.id);
        fetchRandomPlayer(mode, [...votedIdsRef.current, ...remainingIds])
          .then(newPlayer => {
            if (newPlayer) {
              setStack(prev => [...prev, newPlayer]);
            }
          })
          .catch(() => {});
      }, 250);
    } catch (err) {
      console.error('Erreur vote:', err);
      setExitDirection(null);
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
  }, [stack, exitDirection]);

  const bgStyle = 'bg-vibes';
  const currentPlayer = stack[0];
  const nextPlayer = stack[1];

  return (
    <main className={`h-[calc(100vh-64px)] ${bgStyle} px-4 flex flex-col justify-center`}>
      <Confetti trigger={celebration.trigger} message={celebration.message} />
      <div className="max-w-sm mx-auto w-full">
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-fv-green text-fv-navy font-bold px-6 py-2 rounded-full hover:bg-fv-green-dark transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : initialLoading || !currentPlayer ? (
          <PlayerCardSkeleton />
        ) : (
          <div className="relative">
            {/* Pile de cartes */}
            <div className="relative">
              {/* Carte du dessous (joueur suivant) - absolute derrière, visible seulement pendant l'exit */}
              {nextPlayer && (
                <div className={`absolute inset-x-0 top-0 transition-opacity duration-150 ${exitDirection ? 'opacity-100' : 'opacity-0'}`}>
                  <PlayerCard
                    key={nextPlayer.id}
                    player={nextPlayer}
                    voteCount={nextPlayer.total_votes}
                  />
                </div>
              )}

              {/* Carte du dessus (joueur actuel) - relative, maintient la taille */}
              <div className="relative z-10">
                <PlayerCard
                  key={currentPlayer.id}
                  player={currentPlayer}
                  exitDirection={exitDirection}
                  voteCount={currentPlayer.total_votes}
                />
              </div>
            </div>

            <VoteButtons onVote={handleVote} disabled={!!exitDirection} />

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
