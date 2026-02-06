import { useEffect, useRef, useState } from 'react';

/**
 * Composant banner publicitaire réutilisable
 * Supporte plusieurs formats : leaderboard (728x90), banner (320x50), rectangle (300x250), skyscraper (120x600)
 *
 * @param {string} slot - ID du slot AdSense (ex: "1234567890")
 * @param {string} format - Format de la pub : "leaderboard" | "banner" | "rectangle" | "skyscraper"
 * @param {string} className - Classes CSS additionnelles
 */

// Mode dev : affiche des placeholders visibles (mettre à false en prod)
const DEV_MODE = true;

const AD_FORMATS = {
  leaderboard: { width: 728, height: 90, label: 'Leaderboard 728x90' },
  banner: { width: 320, height: 50, label: 'Banner 320x50' },
  rectangle: { width: 300, height: 250, label: 'Rectangle 300x250' },
  skyscraper: { width: 120, height: 600, label: 'Skyscraper 120x600' },
};

function AdBanner({ slot, format = 'banner', className = '' }) {
  const adRef = useRef(null);
  const [adBlocked, setAdBlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const dimensions = AD_FORMATS[format] || AD_FORMATS.banner;

  useEffect(() => {
    // En mode dev, on skip la détection
    if (DEV_MODE) return;

    // Vérifier si AdSense est chargé
    if (typeof window === 'undefined') return;

    // Détecter les ad blockers
    const checkAdBlocker = () => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.cssText = 'position:absolute;left:-10000px;';
      document.body.appendChild(testAd);

      setTimeout(() => {
        if (testAd.offsetHeight === 0) {
          setAdBlocked(true);
        }
        document.body.removeChild(testAd);
      }, 100);
    };

    checkAdBlocker();

    // Initialiser AdSense si disponible
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setLoaded(true);
      }
    } catch (err) {
      console.warn('AdSense non disponible:', err);
      setAdBlocked(true);
    }
  }, [slot]);

  // Si ad blocker détecté (et pas en mode dev), ne rien afficher
  if (adBlocked && !DEV_MODE) {
    return null;
  }

  // Mode dev : placeholder visible
  if (DEV_MODE) {
    return (
      <div
        className={`ad-container flex justify-center items-center ${className}`}
      >
        <div
          className="bg-white/10 border border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center text-white/50 text-xs"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          <span className="font-semibold">PUB</span>
          <span>{dimensions.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ad-container flex justify-center items-center ${className}`}
      style={{ minHeight: dimensions.height }}
    >
      {/* Placeholder pendant le chargement */}
      {!loaded && (
        <div
          className="bg-white/5 rounded-lg animate-pulse"
          style={{ width: dimensions.width, height: dimensions.height }}
        />
      )}

      {/* AdSense unit */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: loaded ? 'block' : 'none',
          width: dimensions.width,
          height: dimensions.height,
        }}
        data-ad-client="ca-pub-5498498962137796"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default AdBanner;
