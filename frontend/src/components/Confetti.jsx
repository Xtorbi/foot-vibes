import { useEffect, useState } from 'react';

const COLORS = ['#10B981', '#059669', '#0f1629', '#1a2744', '#fff', '#10B981'];

function Confetti({ trigger, message }) {
  const [particles, setParticles] = useState([]);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    // Créer les particules
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8,
    }));

    setParticles(newParticles);
    setShowMessage(true);

    // Nettoyer après l'animation
    const timer = setTimeout(() => {
      setParticles([]);
      setShowMessage(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0 && !showMessage) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Particules */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Message de félicitations */}
      {showMessage && message && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-material-4
                          animate-bounce-in text-center">
            <p className="text-2xl font-heading font-extrabold text-fv-navy">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Confetti;
