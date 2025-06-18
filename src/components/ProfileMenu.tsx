
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ProfileMenuProps {
  onClose: () => void;
}

const ProfileMenu = ({ onClose }: ProfileMenuProps) => {
  const { logout, setRole, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRoleSwitch = () => {
    const newRole = user?.role === 'player' ? 'dm' : 'player';
    setRole(newRole);
    navigate(newRole === 'player' ? '/player' : '/dm');
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('account_menu')}</h2>
        
        {user?.email && (
          <div className="text-sm text-gray-600 mb-4">
            {t('signed_in_as')} {user.email}
          </div>
        )}
        
        <Button
          onClick={handleRoleSwitch}
          variant="outline"
          className="w-full"
        >
          {user?.role === 'player' ? t('switch_to_dm') : t('switch_to_player')}
        </Button>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{t('change_language')}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-2 rounded ${language === 'en' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('nl')}
              className={`px-3 py-2 rounded ${language === 'nl' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            >
              NL
            </button>
            <button
              onClick={() => setLanguage('pl')}
              className={`px-3 py-2 rounded ${language === 'pl' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            >
              PL
            </button>
          </div>
        </div>
        
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          {t('logout')}
        </Button>
        
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full"
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};

export default ProfileMenu;
