
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus } from 'lucide-react';

interface AbilityScoreImprovementModalProps {
  character: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (improvements: { [key: string]: number }) => void;
}

const AbilityScoreImprovementModal = ({ character, isOpen, onClose, onConfirm }: AbilityScoreImprovementModalProps) => {
  const [improvements, setImprovements] = useState<{ [key: string]: number }>({
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  });

  const totalPoints = Object.values(improvements).reduce((sum, val) => sum + val, 0);
  const remainingPoints = 2 - totalPoints;

  const handleImprovement = (ability: string, change: number) => {
    const currentScore = character.abilities[ability]?.score || 10;
    const currentImprovement = improvements[ability];
    const newImprovement = currentImprovement + change;
    
    // Check constraints
    if (newImprovement < 0) return;
    if (newImprovement > 2) return; // Max 2 points per ability
    if (currentScore + newImprovement > 20) return; // Max score of 20
    if (change > 0 && remainingPoints <= 0) return; // No more points to spend
    
    setImprovements(prev => ({
      ...prev,
      [ability]: newImprovement
    }));
  };

  const handleConfirm = () => {
    onConfirm(improvements);
    setImprovements({
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    });
    onClose();
  };

  const abilityNames = {
    strength: 'Strength',
    dexterity: 'Dexterity',
    constitution: 'Constitution',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom',
    charisma: 'Charisma'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ability Score Improvement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              Choose Ability Score Improvements
            </div>
            <div className="text-sm text-gray-600">
              You have {remainingPoints} points remaining
            </div>
            <div className="text-xs text-gray-500 mt-1">
              You can increase two abilities by 1 each, or one ability by 2
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {Object.entries(abilityNames).map(([ability, name]) => {
              const currentScore = character.abilities[ability]?.score || 10;
              const improvement = improvements[ability];
              const newScore = currentScore + improvement;
              
              return (
                <div key={ability} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-600">
                      {currentScore} → {newScore}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImprovement(ability, -1)}
                      disabled={improvement === 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Badge variant={improvement > 0 ? "default" : "secondary"}>
                      +{improvement}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImprovement(ability, 1)}
                      disabled={improvement >= 2 || newScore >= 20 || remainingPoints <= 0}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={totalPoints !== 2}
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AbilityScoreImprovementModal;
