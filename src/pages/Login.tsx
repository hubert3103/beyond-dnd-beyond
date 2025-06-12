
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role) {
        navigate(user.role === 'player' ? '/player' : '/dm');
      } else {
        navigate('/role-selection');
      }
    }
  }, [user, navigate]);

  const handleLogin = () => {
    if (login(email, password)) {
      navigate('/role-selection');
    }
  };

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">BEYOND</h1>
        <h2 className="text-xl text-red-500 font-bold">RED</h2>
        <h3 className="text-2xl font-bold text-white">BEYOND</h3>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-200 border-none rounded-lg px-4 py-3 text-gray-900"
        />
        
        <Input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-200 border-none rounded-lg px-4 py-3 text-gray-900"
        />
        
        <Button
          onClick={handleLogin}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
        >
          LOG IN
        </Button>
      </div>
    </div>
  );
};

export default Login;
