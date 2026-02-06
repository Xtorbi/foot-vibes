import { Routes, Route, useLocation } from 'react-router-dom';
import { ModeProvider } from './contexts/ModeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Ranking from './pages/Ranking';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Contact from './pages/Contact';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isVotePage = location.pathname === '/vote';

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1629]">
      {!isHomePage && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/classement" element={<Ranking />} />
          <Route path="/confidentialite" element={<Privacy />} />
          <Route path="/cgu" element={<Terms />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      {!isVotePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ModeProvider>
      <AppContent />
    </ModeProvider>
  );
}

export default App;
