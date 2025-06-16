
import { useState } from 'react';
import { Moon, Sun, Dice6 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RestButtonsProps {
  character: any;
  setCharacter: (character: any) => void;
}

const RestButtons = ({ character, setCharacter }: RestButtonsProps) => {
  const [showShortRestDialog, setShowShortRestDialog] = useState(false);
  const [hitDiceToRoll, setHitDiceToRoll] = useState(0);

  const takeLongRest = () => {
    console.log('Taking long rest');
    
    // Get max HP
    const maxHP = character.hit_points?.max || character.maxHP;
    
    // Reset all spell slots
    const resetSpellSlots: { [key: number]: { max: number; used: number } } = {};
    if (character.spellSlots) {
      Object.keys(character.spellSlots).forEach(level => {
        const levelNum = parseInt(level);
        resetSpellSlots[levelNum] = {
          max: character.spellSlots[levelNum].max,
          used: 0
        };
      });
    }
    
    const updatedCharacter = {
      ...character,
      currentHP: maxHP,
      hit_points: {
        ...character.hit_points,
        current: maxHP,
        temporary: 0,
        hit_dice_remaining: character.level
      },
      spellSlots: resetSpellSlots,
      // Preserve spells with their preparation states
      spells: character.spells || []
    };
    
    setCharacter(updatedCharacter);
    console.log('Long rest completed - HP and spell slots restored, spells preserved');
  };

  const takeShortRest = () => {
    console.log('Taking short rest');
    
    // Reset spell slots for warlock only
    let updatedSpellSlots = character.spellSlots;
    if (character.class_name?.toLowerCase() === 'warlock') {
      updatedSpellSlots = { ...character.spellSlots };
      Object.keys(updatedSpellSlots).forEach(level => {
        const levelNum = parseInt(level);
        updatedSpellSlots[levelNum] = {
          max: updatedSpellSlots[levelNum].max,
          used: 0
        };
      });
    }
    
    const updatedCharacter = {
      ...character,
      spellSlots: updatedSpellSlots,
      // Preserve spells with their preparation states
      spells: character.spells || []
    };
    
    setCharacter(updatedCharacter);
    setShowShortRestDialog(true);
  };

  const rollHitDie = () => {
    const hitDie = character.class_data?.hit_die || 8;
    const conModifier = Math.floor((character.abilities.constitution.score - 10) / 2);
    const roll = Math.floor(Math.random() * hitDie) + 1;
    const healing = Math.max(1, roll + conModifier);
    
    const currentHP = character.hit_points?.current || character.currentHP || 0;
    const maxHP = character.hit_points?.max || character.maxHP;
    const newHP = Math.min(maxHP, currentHP + healing);
    const remainingHitDice = (character.hit_points?.hit_dice_remaining || character.level) - 1;
    
    const updatedCharacter = {
      ...character,
      currentHP: newHP,
      hit_points: {
        ...character.hit_points,
        current: newHP,
        hit_dice_remaining: remainingHitDice
      },
      // Preserve spells with their preparation states
      spells: character.spells || []
    };
    
    setCharacter(updatedCharacter);
    setHitDiceToRoll(hitDiceToRoll + 1);
    
    console.log(`Rolled ${roll} on d${hitDie} + ${conModifier} CON = ${healing} healing`);
  };

  const finishShortRest = () => {
    setShowShortRestDialog(false);
    setHitDiceToRoll(0);
    console.log('Short rest completed');
  };

  const hitDiceRemaining = character.hit_points?.hit_dice_remaining || character.level;

  return (
    <>
      <div className="flex space-x-2 mb-4">
        <Button
          onClick={takeShortRest}
          variant="outline"
          className="flex-1 bg-yellow-50 hover:bg-yellow-100 border-yellow-300"
        >
          <Sun className="h-4 w-4 mr-2" />
          Short Rest
        </Button>
        <Button
          onClick={takeLongRest}
          variant="outline"
          className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-300"
        >
          <Moon className="h-4 w-4 mr-2" />
          Long Rest
        </Button>
      </div>

      <Dialog open={showShortRestDialog} onOpenChange={setShowShortRestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Short Rest</DialogTitle>
            <DialogDescription>
              You can spend hit dice to recover hit points during a short rest.
              {character.class_name?.toLowerCase() === 'warlock' && ' Your spell slots have been restored.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Hit Dice Remaining: {hitDiceRemaining}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Hit Dice Used This Rest: {hitDiceToRoll}
              </p>
              
              <Button
                onClick={rollHitDie}
                disabled={hitDiceRemaining === 0}
                className="mb-4"
              >
                <Dice6 className="h-4 w-4 mr-2" />
                Roll Hit Die (d{character.class_data?.hit_die || 8})
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={finishShortRest}
                className="flex-1"
              >
                Finish Rest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RestButtons;
