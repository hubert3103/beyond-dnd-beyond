
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InspirationToggleProps {
  character: any;
  setCharacter: (character: any) => void;
}

const InspirationToggle = ({ character, setCharacter }: InspirationToggleProps) => {
  const hasInspiration = character.inspiration || false;

  const toggleInspiration = () => {
    const updatedCharacter = {
      ...character,
      inspiration: !hasInspiration
    };
    setCharacter(updatedCharacter);
  };

  return (
    <Button
      variant={hasInspiration ? "default" : "outline"}
      size="sm"
      onClick={toggleInspiration}
      className={cn(
        "flex items-center space-x-2 transition-all duration-200",
        hasInspiration 
          ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg" 
          : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
      )}
    >
      <Lightbulb 
        className={cn(
          "h-4 w-4 transition-all duration-200",
          hasInspiration ? "text-white" : "text-yellow-600"
        )} 
        fill={hasInspiration ? "currentColor" : "none"}
      />
      <span className="text-sm font-medium">
        {hasInspiration ? "Inspired" : "Inspiration"}
      </span>
    </Button>
  );
};

export default InspirationToggle;
