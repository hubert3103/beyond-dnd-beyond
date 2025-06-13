
import { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const FeaturesTraits = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock features and traits data
  const [features] = useState([
    {
      id: 1,
      name: 'Darkvision',
      source: 'Wood Elf',
      description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
    },
    {
      id: 2,
      name: 'Keen Senses',
      source: 'Wood Elf',
      description: 'You have proficiency with the Perception skill.'
    },
    {
      id: 3,
      name: 'Fey Ancestry',
      source: 'Wood Elf',
      description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.'
    },
    {
      id: 4,
      name: 'Mask of the Wild',
      source: 'Wood Elf',
      description: 'You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena.'
    },
    {
      id: 5,
      name: 'Druidcraft',
      source: 'Druid',
      description: 'You know the Druidcraft cantrip. This doesn\'t count against your number of cantrips known.'
    },
    {
      id: 6,
      name: 'Wild Shape',
      source: 'Druid',
      description: 'You can use your action to magically assume the shape of a beast that you have seen before. You can use this feature twice. You regain expended uses when you finish a short or long rest.'
    },
    {
      id: 7,
      name: 'Timeless Body',
      source: 'Druid',
      description: 'The primal magic that you wield causes you to age more slowly. For every 10 years that pass, your body ages only 1 year.'
    },
    {
      id: 8,
      name: 'Beast Spells',
      source: 'Druid',
      description: 'You can cast many of your druid spells in any shape you assume using Wild Shape.'
    }
  ]);

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'wood elf':
        return 'bg-green-100 text-green-800';
      case 'druid':
        return 'bg-brown-100 text-brown-800';
      case 'background':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-lg font-semibold">Features & Traits</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-3">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-yellow-600">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getSourceColor(feature.source)}`}>
                        {feature.source}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed ml-7">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default FeaturesTraits;
