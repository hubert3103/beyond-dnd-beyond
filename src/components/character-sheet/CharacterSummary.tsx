
import { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CharacterSummaryProps {
  character: any;
  setCharacter: (character: any) => void;
}

const CharacterSummary = ({ character, setCharacter }: CharacterSummaryProps) => {
  const [showHPDialog, setShowHPDialog] = useState(false);
  const [tempDamage, setTempDamage] = useState('');
  const [tempHealing, setTempHealing] = useState('');

  const handleNameChange = (value: string) => {
    setCharacter({ ...character, name: value });
  };

  const handleLevelChange = (value: string) => {
    setCharacter({ ...character, level: parseInt(value) });
  };

  const handleDamage = () => {
    const damage = parseInt(tempDamage);
    if (damage > 0) {
      const currentHP = character.currentHP || character.maxHP || 0;
      const newHP = Math.max(0, currentHP - damage);
      setCharacter({ ...character, currentHP: newHP });
      setTempDamage('');
      setShowHPDialog(false);
    }
  };

  const handleHealing = () => {
    const healing = parseInt(tempHealing);
    if (healing > 0) {
      const currentHP = character.currentHP || character.maxHP || 0;
      const maxHP = character.maxHP || 0;
      const newHP = Math.min(maxHP, currentHP + healing);
      setCharacter({ ...character, currentHP: newHP });
      setTempHealing('');
      setShowHPDialog(false);
    }
  };

  // Get HP values with fallbacks
  const currentHP = character.currentHP !== undefined ? character.currentHP : (character.maxHP || 0);
  const maxHP = character.maxHP || 0;
  const tempHP = character.tempHP || 0;

  return (
    <div className="bg-white rounded-lg p-4 mt-4">
      {/* Character Portrait and Basic Info */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <img 
            src={character.avatar} 
            alt="Character avatar"
            className="w-12 h-12"
            style={{
              filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
            }}
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <Input
            value={character.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-lg font-bold"
            placeholder="Character Name"
          />
          
          <div className="flex space-x-2">
            <Select value={character.level.toString()} onValueChange={handleLevelChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Class is now read-only, showing the class from character creation */}
            <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm">
              {character.class_name || 'Unknown Class'}
              {character.species_name && (
                <span className="text-gray-600 ml-1">
                  ({character.species_name})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HP Display */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-700">HP:</span>
          <span className="text-lg font-bold">
            {currentHP} / {maxHP}
          </span>
          {tempHP > 0 && (
            <span className="text-blue-600 text-sm">
              (+{tempHP} temp)
            </span>
          )}
        </div>
        
        <Dialog open={showHPDialog} onOpenChange={setShowHPDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Edit3 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Hit Points</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Apply Damage</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={tempDamage}
                    onChange={(e) => setTempDamage(e.target.value)}
                  />
                  <Button onClick={handleDamage} variant="destructive">
                    Damage
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Apply Healing</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={tempHealing}
                    onChange={(e) => setTempHealing(e.target.value)}
                  />
                  <Button onClick={handleHealing} className="bg-green-600 hover:bg-green-700">
                    Heal
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CharacterSummary;
