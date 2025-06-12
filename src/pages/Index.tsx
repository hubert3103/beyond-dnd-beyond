
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { hasSelectedLanguage } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (!hasSelectedLanguage) {
      // Stay on language selector
      return;
    }
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!user.role) {
      navigate('/role-selection');
      return;
    }
    
    navigate(user.role === 'player' ? '/player' : '/dm');
  }, [hasSelectedLanguage, user, navigate]);

  // This component is just for routing logic
  return null;
};

export default Index;
