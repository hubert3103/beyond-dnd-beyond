
import { TabType } from '../pages/PlayerDashboard';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'characters' as TabType, label: 'Characters', icon: '👤' },
    { id: 'spells' as TabType, label: 'Spells', icon: '🪄' },
    { id: 'items' as TabType, label: 'Items', icon: '🎒' },
    { id: 'manuals' as TabType, label: 'Manuals', icon: '📚' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#4a4a4a] border-t border-gray-600">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 px-2 ${
              activeTab === tab.id ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
