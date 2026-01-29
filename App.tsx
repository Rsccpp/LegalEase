
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { PlatformInfoModal } from './components/PlatformInfoModal';
import { AppView, ModalTab } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<ModalTab>('mission');

  const navigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const openInfo = (tab: ModalTab) => {
    // If we're not on landing, navigate there first (optional, but good for context)
    if (currentView !== AppView.LANDING) {
      setCurrentView(AppView.LANDING);
    }
    setActiveInfoTab(tab);
    setIsInfoModalOpen(true);
  };

  return (
    <Layout 
      onNavigate={navigate} 
      onOpenInfo={openInfo}
    >
      {currentView === AppView.LANDING ? (
        <LandingView 
          onStart={() => navigate(AppView.DASHBOARD)} 
          onOpenInfo={openInfo}
        />
      ) : (
        <DashboardView />
      )}

      <PlatformInfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        activeTab={activeInfoTab}
        onTabChange={setActiveInfoTab}
      />
    </Layout>
  );
};

export default App;
