
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
        return ''; // Remove "Spell list" title
      case 'items':
        return ''; // Remove "Items list" title
      case 'manuals':
        return 'Manuals';
      default:
        return 'My characters';
    }
  };

  return (
    <>
      <header className="bg-[#4a4a4a] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowProfileMenu(true)}
            className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
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
          <div className="w-6" />
        </div>
      </header>
      
      {showProfileMenu && (
        <ProfileMenu onClose={() => setShowProfileMenu(false)} />
      )}
    </>
  );
};

export default Header;
