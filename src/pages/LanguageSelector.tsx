
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const LanguageSelector = () => {
  const navigate = useNavigate();
  const { setLanguage, hasSelectedLanguage } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (hasSelectedLanguage) {
      if (user) {
        if (user.role) {
          navigate(user.role === 'player' ? '/player' : '/dm');
        } else {
          navigate('/role-selection');
        }
      } else {
        navigate('/login');
      }
    }
  }, [hasSelectedLanguage, user, navigate]);

  const handleLanguageSelect = (lang: 'en' | 'nl' | 'pl') => {
    setLanguage(lang);
  };

  if (hasSelectedLanguage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">DND BEYOND</h1>
        <p className="text-gray-300">Select your language</p>
      </div>
      
      <div className="space-y-4 w-full max-w-sm">
        <button
          onClick={() => handleLanguageSelect('en')}
          className="w-full bg-white rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors"
        >
          <div className="w-12 h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden">
            <img src="/eng.png" alt="English flag" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-medium text-gray-900">English</span>
        </button>
        
        <button
          onClick={() => handleLanguageSelect('nl')}
          className="w-full bg-white rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors"
        >
          <div className="w-12 h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden">
            <img src="/dutch.png" alt="Dutch flag" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-medium text-gray-900">Nederlands</span>
        </button>
        
        <button
          onClick={() => handleLanguageSelect('pl')}
          className="w-full bg-white rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors"
        >
          <div className="w-12 h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden">
            <img src="/polish.png" alt="Polish flag" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-medium text-gray-900">Polski</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
