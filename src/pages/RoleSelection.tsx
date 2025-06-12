
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleRoleSelect = (role: 'player' | 'dm') => {
    setRole(role);
    navigate(role === 'player' ? '/player' : '/dm');
  };

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex flex-col items-center justify-center p-6 space-y-8">
      <Button
        onClick={() => handleRoleSelect('player')}
        className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white font-bold py-8 rounded-lg flex flex-col items-center space-y-2"
      >
        <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center mb-2">
          <span className="text-lg">⚀</span>
        </div>
        <span className="text-xl">PLAYER</span>
      </Button>
      
      <Button
        onClick={() => handleRoleSelect('dm')}
        className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white font-bold py-8 rounded-lg flex flex-col items-center space-y-2"
      >
        <div className="w-12 h-12 border-2 border-white rounded flex items-center justify-center mb-2">
          <span className="text-lg">📋</span>
        </div>
        <span className="text-xl">DM</span>
      </Button>
    </div>
  );
};

export default RoleSelection;
