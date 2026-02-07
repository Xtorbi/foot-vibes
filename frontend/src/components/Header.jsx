import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ClubSelector from './ClubSelector';

function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isVotePage = location.pathname === '/vote';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-fv-navy/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="group">
          <img
            src="/logo.png"
            alt="Topflop"
            className="h-8 sm:h-10 group-hover:brightness-125 transition-all"
          />
        </Link>

        {/* Navigation */}
        {isVotePage ? (
          <div className="flex items-center gap-2">
            <ClubSelector />
            <Link
              to="/classement"
              className="bg-fv-green text-fv-navy font-bold text-sm sm:text-base
                         px-4 sm:px-5 py-1.5 sm:py-2 rounded-full
                         hover:bg-fv-green-dark hover:scale-105
                         active:scale-95 transition-all duration-200"
            >
              Classement
            </Link>
          </div>
        ) : (
          <Link
            to="/vote"
            className="bg-fv-green text-fv-navy font-bold text-sm sm:text-base
                       px-4 sm:px-5 py-1.5 sm:py-2 rounded-full
                       hover:bg-fv-green-dark hover:scale-105
                       active:scale-95 transition-all duration-200"
          >
            Voter
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
