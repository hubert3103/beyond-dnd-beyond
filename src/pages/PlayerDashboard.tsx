import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import CharactersTab from '../components/tabs/CharactersTab';
import SpellsTab from '../components/tabs/SpellsTab';
import ItemsTab from '../components/tabs/ItemsTab';
import ManualsTab from '../components/tabs/ManualsTab';

export type TabType = 'characters' | 'spells' | 'items' | 'manuals';

const PlayerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const location = useLocation();

  // Handle navigation from other pages with tab state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'characters':
        return <CharactersTab />;
      case 'spells':
        return <SpellsTab />;
      case 'items':
        return <ItemsTab />;
      case 'manuals':
        return <ManualsTab />;
      default:
        return <CharactersTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex flex-col">
      <Header activeTab={activeTab} />
      <main className="flex-1 pb-20">
        {renderActiveTab()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default PlayerDashboard;
