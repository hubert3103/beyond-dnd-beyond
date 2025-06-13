
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BackgroundScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const BackgroundScreen = ({ data, onUpdate }: BackgroundScreenProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    characterDetails: false,
    physicalCharacteristics: false,
    personalCharacteristics: false,
    notes: false
  });

  const [backgroundData, setBackgroundData] = useState({
    alignment: '',
    faith: '',
    lifestyle: '',
    hair: '',
    skin: '',
    eyes: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    ideals: '',
    bonds: '',
    flaws: '',
    notes: ''
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateBackgroundData = (field: string, value: string) => {
    const newData = { ...backgroundData, [field]: value };
    setBackgroundData(newData);
    onUpdate({ background: newData });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Choose Origin: Background</h1>
      
      {/* Character Details */}
      <Collapsible open={expandedSections.characterDetails} onOpenChange={() => toggleSection('characterDetails')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Character Details</div>
                <div className="text-sm text-gray-600">Alignment - Faith - Lifestyle</div>
              </div>
              <div className="text-gray-400">
                {expandedSections.characterDetails ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div>
                <Label className="text-sm text-gray-600">Alignment</Label>
                <Select value={backgroundData.alignment} onValueChange={(value) => updateBackgroundData('alignment', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lawful-good">Lawful Good</SelectItem>
                    <SelectItem value="neutral-good">Neutral Good</SelectItem>
                    <SelectItem value="chaotic-good">Chaotic Good</SelectItem>
                    <SelectItem value="lawful-neutral">Lawful Neutral</SelectItem>
                    <SelectItem value="true-neutral">True Neutral</SelectItem>
                    <SelectItem value="chaotic-neutral">Chaotic Neutral</SelectItem>
                    <SelectItem value="lawful-evil">Lawful Evil</SelectItem>
                    <SelectItem value="neutral-evil">Neutral Evil</SelectItem>
                    <SelectItem value="chaotic-evil">Chaotic Evil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Faith</Label>
                <Input
                  value={backgroundData.faith}
                  onChange={(e) => updateBackgroundData('faith', e.target.value)}
                  placeholder="Enter faith or deity"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Lifestyle</Label>
                <Select value={backgroundData.lifestyle} onValueChange={(value) => updateBackgroundData('lifestyle', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select lifestyle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wretched">Wretched</SelectItem>
                    <SelectItem value="squalid">Squalid</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="modest">Modest</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="wealthy">Wealthy</SelectItem>
                    <SelectItem value="aristocratic">Aristocratic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Physical Characteristics */}
      <Collapsible open={expandedSections.physicalCharacteristics} onOpenChange={() => toggleSection('physicalCharacteristics')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Physical Characteristics</div>
                <div className="text-sm text-gray-600">Hair - Skin - Eyes - Height - Weight - Age - Gender</div>
              </div>
              <div className="text-gray-400">
                {expandedSections.physicalCharacteristics ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Hair</Label>
                  <Input
                    value={backgroundData.hair}
                    onChange={(e) => updateBackgroundData('hair', e.target.value)}
                    placeholder="Hair color/style"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Skin</Label>
                  <Input
                    value={backgroundData.skin}
                    onChange={(e) => updateBackgroundData('skin', e.target.value)}
                    placeholder="Skin color/type"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Eyes</Label>
                  <Input
                    value={backgroundData.eyes}
                    onChange={(e) => updateBackgroundData('eyes', e.target.value)}
                    placeholder="Eye color"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Height</Label>
                  <Input
                    value={backgroundData.height}
                    onChange={(e) => updateBackgroundData('height', e.target.value)}
                    placeholder="Height"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Weight</Label>
                  <Input
                    value={backgroundData.weight}
                    onChange={(e) => updateBackgroundData('weight', e.target.value)}
                    placeholder="Weight"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Age</Label>
                  <Input
                    value={backgroundData.age}
                    onChange={(e) => updateBackgroundData('age', e.target.value)}
                    placeholder="Age"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Gender</Label>
                <Input
                  value={backgroundData.gender}
                  onChange={(e) => updateBackgroundData('gender', e.target.value)}
                  placeholder="Gender"
                  className="mt-1"
                />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Personal Characteristics */}
      <Collapsible open={expandedSections.personalCharacteristics} onOpenChange={() => toggleSection('personalCharacteristics')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Personal Characteristics</div>
                <div className="text-sm text-gray-600">Ideals - Bonds - Flaws</div>
              </div>
              <div className="text-gray-400">
                {expandedSections.personalCharacteristics ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div>
                <Label className="text-sm text-gray-600">Ideals</Label>
                <Textarea
                  value={backgroundData.ideals}
                  onChange={(e) => updateBackgroundData('ideals', e.target.value)}
                  placeholder="What drives your character..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Bonds</Label>
                <Textarea
                  value={backgroundData.bonds}
                  onChange={(e) => updateBackgroundData('bonds', e.target.value)}
                  placeholder="Important people, places, or things..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Flaws</Label>
                <Textarea
                  value={backgroundData.flaws}
                  onChange={(e) => updateBackgroundData('flaws', e.target.value)}
                  placeholder="Character weaknesses or quirks..."
                  className="mt-1"
                />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Notes */}
      <Collapsible open={expandedSections.notes} onOpenChange={() => toggleSection('notes')}>
        <div className="border border-gray-200 rounded-lg">
          <CollapsibleTrigger className="w-full p-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Notes</div>
                <div className="text-sm text-gray-600">Additional character information</div>
              </div>
              <div className="text-gray-400">
                {expandedSections.notes ? '▲' : '▼'}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-gray-100">
              <Textarea
                value={backgroundData.notes}
                onChange={(e) => updateBackgroundData('notes', e.target.value)}
                placeholder="Additional notes about your character..."
                className="mt-2"
                rows={4}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

export default BackgroundScreen;
