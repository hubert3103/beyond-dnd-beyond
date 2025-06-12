
import { TabType } from '../pages/PlayerDashboard';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'characters' as TabType, label: 'Characters', icon: '/characterIcon.svg' },
    { id: 'spells' as TabType, label: 'Spells', icon: '/spellsIcon.svg' },
    { id: 'items' as TabType, label: 'Items', icon: '/d20Icon.svg' },
    { id: 'manuals' as TabType, label: 'Manuals', icon: '/manualsIcon.svg' },
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
            <img 
              src={tab.icon} 
              alt={tab.label}
              className={`w-6 h-6 mb-1 ${
                activeTab === tab.id ? 'filter brightness-0 saturate-100' : 'filter brightness-0 saturate-100 opacity-60'
              }`}
              style={{
                filter: activeTab === tab.id 
                  ? 'invert(27%) sepia(95%) saturate(6456%) hue-rotate(356deg) brightness(98%) contrast(93%)'
                  : 'invert(75%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
              }}
            />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
