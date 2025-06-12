
import { useState } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import CharactersTab from '../components/tabs/CharactersTab';
import SpellsTab from '../components/tabs/SpellsTab';
import ItemsTab from '../components/tabs/ItemsTab';
import ManualsTab from '../components/tabs/ManualsTab';

export type TabType = 'characters' | 'spells' | 'items' | 'manuals';

const PlayerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('characters');

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
