import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { useGameStore } from './store/gameStore';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { HostView } from './pages/HostView';
import { StudentView } from './pages/StudentView';
import { GamePlay } from './pages/GamePlay';
import { QuestBuilder } from './pages/QuestBuilder';

function App() {
  const location = useLocation();
  const isHostView = location.pathname === '/host';
  const isPlayView = location.pathname.startsWith('/play');

  const hideHeader = isHostView || isPlayView;
  const isFullPage = isHostView || location.pathname === '/' || location.pathname === '/play/game';

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'slayground-storage') {
        useGameStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="h-screen w-screen bg-background text-white selection:bg-primary/30 fixed inset-0 overflow-hidden font-sans">
      {/* Global Animated Background */}
      <div className="bg-mesh" />
      <div className="bg-grid" />

      {!hideHeader && <Header />}

      <main className={isFullPage ? 'absolute inset-0 overflow-hidden' : 'absolute inset-0 pt-16 md:pt-24 px-4 overflow-y-auto scrollbar-hide'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/quest/new" element={<QuestBuilder />} />
          <Route path="/admin/quest/edit/:id" element={<QuestBuilder />} />
          <Route path="/host" element={<HostView />} />
          <Route path="/play" element={<StudentView />} />
          <Route path="/play/game" element={<GamePlay />} />

          <Route path="*" element={<div className="text-center pt-20">404: Zone Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
