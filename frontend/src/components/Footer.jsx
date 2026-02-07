import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="py-8 border-t border-white/10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 text-sm">
          <Link to="/a-propos" className="text-white/50 hover:text-white transition-colors">
            À propos
          </Link>
          <Link to="/contact" className="text-white/50 hover:text-white transition-colors">
            Contact
          </Link>
          <Link to="/confidentialite" className="text-white/50 hover:text-white transition-colors">
            Confidentialité
          </Link>
          <Link to="/cgu" className="text-white/50 hover:text-white transition-colors">
            CGU
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-center text-white/30 text-sm">
          <span className="font-semibold text-white">TOP</span>
          <span className="font-semibold text-fv-green">FLOP</span>
          {' '}© 2026
        </p>
      </div>
    </footer>
  );
}

export default Footer;
