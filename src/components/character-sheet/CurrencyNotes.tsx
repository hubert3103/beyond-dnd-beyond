
import { useState } from 'react';
import { ChevronDown, ChevronRight, Coins, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const CurrencyNotes = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrency] = useState({
    cp: 23,
    sp: 15,
    ep: 2,
    gp: 150,
    pp: 3
  });
  const [notes, setNotes] = useState(
    "- Saved the village of Greenhill from goblin raiders\n- Has a standing invitation to stay at the Silver Stag Inn\n- Owes a favor to the ranger Kael Brightwood\n- Investigating strange magical disturbances in the Whispering Woods"
  );

  const handleCurrencyChange = (type: keyof typeof currency, value: string) => {
    setCurrency({
      ...currency,
      [type]: parseInt(value) || 0
    });
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
              onChange={(e) => setNotes(e.target.value)}
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
