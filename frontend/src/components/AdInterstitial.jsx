import { useState, useEffect, useRef } from 'react';

/**
 * Modal publicitaire interstitiel
 * Affiché après certains milestones de vote
 * Skip button après 5 secondes
 *
 * @param {boolean} isOpen - Afficher ou non la modal
 * @param {function} onClose - Callback de fermeture
 * @param {string} slot - ID du slot AdSense
 */

// Mode dev : affiche un placeholder visible (mettre à false en prod)
const DEV_MODE = true;

function AdInterstitial({ isOpen, onClose, slot }) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [adBlocked, setAdBlocked] = useState(false);
  const adRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    // En mode dev, skip la détection ad blocker
    if (!DEV_MODE) {
      // Détecter ad blocker
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.cssText = 'position:absolute;left:-10000px;';
      document.body.appendChild(testAd);

      setTimeout(() => {
        if (testAd.offsetHeight === 0) {
          setAdBlocked(true);
          // Si ad blocker, fermer immédiatement
          onClose();
        }
        document.body.removeChild(testAd);
      }, 100);
    }

    // Countdown pour le skip
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Initialiser AdSense (sauf en mode dev)
    if (!DEV_MODE) {
      try {
        if (window.adsbygoogle && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.warn('AdSense interstitiel non disponible:', err);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, onClose]);

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || adBlocked) return null;

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: '#0f1629',
      }}
    >
      {/* Header avec countdown/skip */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
        <span className="text-white/40 text-xs uppercase tracking-wider">Publicité</span>
        {canSkip ? (
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Continuer
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>Passer dans</span>
            <span className="bg-white/10 px-3 py-1 rounded-full font-bold">{countdown}</span>
          </div>
        )}
      </div>

      {/* Zone pub centrale */}
      <div className="flex-1 flex items-center justify-center w-full px-4">
        {DEV_MODE ? (
          <div className="w-full max-w-2xl aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-white/40">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold text-xl">ESPACE PUBLICITAIRE</span>
            <span className="text-sm mt-1">Format vidéo ou display</span>
          </div>
        ) : (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', maxWidth: 728, height: 'auto', minHeight: 250 }}
            data-ad-client="ca-pub-5498498962137796"
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
        <p className="text-white/20 text-xs">
          Les pubs nous aident à garder Foot Vibes gratuit
        </p>
      </div>
    </div>
  );
}

export default AdInterstitial;
