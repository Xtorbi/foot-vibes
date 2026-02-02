import { Routes, Route, useLocation } from 'react-router-dom';
import { ModeProvider } from './contexts/ModeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Ranking from './pages/Ranking';

function AppContent() {
  const location = useLocation();
  const isVotePage = location.pathname === '/vote';

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1629]">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/classement" element={<Ranking />} />
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
