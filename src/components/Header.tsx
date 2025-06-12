
import { useState } from 'react';
import ProfileMenu from './ProfileMenu';
import { TabType } from '../pages/PlayerDashboard';

interface HeaderProps {
  activeTab: TabType;
}

const Header = ({ activeTab }: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'characters':
        return 'My characters';
      case 'spells':
        return 'Spell list';
      case 'items':
        return 'Items list';
      case 'manuals':
        return 'Manuals';
      default:
        return 'My characters';
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'characters':
        return 'Search characters';
      case 'spells':
        return 'Search spells';
      case 'items':
        return 'Search items';
      case 'manuals':
        return 'Search manuals';
      default:
        return 'Search';
    }
  };

  return (
    <>
      <header className="bg-[#4a4a4a] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowProfileMenu(true)}
            className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"
          >
            <img 
              src="/avatarPlaceholder.svg" 
              alt="Profile"
              className="w-6 h-6"
              style={{
                filter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
              }}
            />
          </button>
          <h1 className="text-white font-bold text-lg">{getTabTitle()}</h1>
          {(activeTab === 'spells' || activeTab === 'items') && (
            <button className="text-white">
              <img 
                src="/filterIcon.svg" 
                alt="Filter"
                className="w-6 h-6"
                style={{
                  filter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
                }}
              />
            </button>
          )}
          {activeTab === 'characters' || activeTab === 'manuals' ? (
            <div className="w-6" />
          ) : null}
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            className="w-full bg-gray-200 rounded-lg px-4 py-3 pl-10 text-gray-900"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <img 
              src="/searchIcon.svg" 
              alt="Search"
              className="w-4 h-4"
              style={{
                filter: 'invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
              }}
            />
          </div>
        </div>
      </header>
      
      {showProfileMenu && (
        <ProfileMenu onClose={() => setShowProfileMenu(false)} />
      )}
    </>
  );
};

export default Header;
