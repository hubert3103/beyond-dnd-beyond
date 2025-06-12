
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const UnderConstruction = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">Under Construction</h1>
        <p className="text-gray-300">DM features are coming soon!</p>
        <Button
          onClick={() => navigate('/role-selection')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default UnderConstruction;
