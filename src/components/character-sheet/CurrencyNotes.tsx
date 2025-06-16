
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Coins, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CurrencyNotesProps {
  character: any;
  setCharacter: (character: any) => void;
}

const CurrencyNotes = ({ character, setCharacter }: CurrencyNotesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize currency from character data
  const [currency, setCurrency] = useState({
    cp: 0,
    sp: 0,
    ep: 0,
    gp: 0,
    pp: 0
  });
  
  const [notes, setNotes] = useState('');

  // Load currency and notes from character data on mount
  useEffect(() => {
    if (character?.equipment?.currency) {
      setCurrency({
        cp: character.equipment.currency.cp || 0,
        sp: character.equipment.currency.sp || 0,
        ep: character.equipment.currency.ep || 0,
        gp: character.equipment.currency.gp || 0,
        pp: character.equipment.currency.pp || 0
      });
    }
    
    // Set notes from character background or default
    if (character?.background_data?.notes) {
      setNotes(character.background_data.notes);
    } else {
      setNotes('');
    }
  }, [character]);

  const handleCurrencyChange = (type: keyof typeof currency, value: string) => {
    const newCurrency = {
      ...currency,
      [type]: parseInt(value) || 0
    };
    setCurrency(newCurrency);
    
    // Update character data
    const updatedCharacter = {
      ...character,
      equipment: {
        ...character.equipment,
        currency: newCurrency
      }
    };
    setCharacter(updatedCharacter);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    
    // Update character data
    const updatedCharacter = {
      ...character,
      background_data: {
        ...character.background_data,
        notes: value
      }
    };
    setCharacter(updatedCharacter);
  };

  const totalGoldValue = currency.cp * 0.01 + currency.sp * 0.1 + currency.ep * 0.5 + currency.gp + currency.pp * 10;

  const currencies = [
    { key: 'cp', name: 'Copper', color: 'text-orange-600' },
    { key: 'sp', name: 'Silver', color: 'text-gray-500' },
    { key: 'ep', name: 'Electrum', color: 'text-yellow-600' },
    { key: 'gp', name: 'Gold', color: 'text-yellow-500' },
    { key: 'pp', name: 'Platinum', color: 'text-blue-400' }
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-lg font-semibold">Currency & Notes</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {/* Currency Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-yellow-600" />
              <h3 className="font-medium text-gray-700">Currency</h3>
              <span className="text-sm text-gray-500">
                (≈ {totalGoldValue.toFixed(2)} gp total)
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {currencies.map((curr) => (
                <div key={curr.key} className="space-y-1">
                  <label className={`text-xs font-medium ${curr.color}`}>
                    {curr.name}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={currency[curr.key as keyof typeof currency]}
                    onChange={(e) => handleCurrencyChange(curr.key as keyof typeof currency, e.target.value)}
                    className="text-center text-sm"
                  />
                  <div className="text-xs text-center text-gray-500">
                    {curr.key.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <h3 className="font-medium text-gray-700">Notes</h3>
            </div>
            
            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Character notes, backstory, goals, important NPCs..."
              className="min-h-32 resize-none"
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default CurrencyNotes;
