
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <AlertCircle className="h-8 w-8 text-red-600" />
      <p className="text-gray-600 text-center">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
