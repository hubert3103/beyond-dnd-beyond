
import { useState } from 'react';
import { ChevronDown, ChevronRight, User, Eye, Palette, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface BackgroundAppearanceProps {
  character: any;
}

const BackgroundAppearance = ({ character }: BackgroundAppearanceProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const backgroundData = character?.background_data || {};
  const backgroundName = character?.background_name || 'Unknown Background';

  // Extract appearance data
  const appearance = {
    age: backgroundData.age || 'Unknown',
    gender: backgroundData.gender || 'Unknown',
    height: backgroundData.height || 'Unknown',
    weight: backgroundData.weight || 'Unknown',
    eyes: backgroundData.eyes || 'Unknown',
    skin: backgroundData.skin || 'Unknown',
    hair: backgroundData.hair || 'Unknown'
  };

  // Extract personality data
  const personality = {
    alignment: backgroundData.alignment || 'Unknown',
    ideals: backgroundData.ideals || 'Unknown',
    bonds: backgroundData.bonds || 'Unknown',
    flaws: backgroundData.flaws || 'Unknown',
    faith: backgroundData.faith || 'Unknown',
    lifestyle: backgroundData.lifestyle || 'Unknown'
  };

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-600 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-sm text-gray-900">{value}</div>
      </div>
    </div>
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-lg font-semibold">Background & Appearance</span>
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {/* Background Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <h3 className="font-medium text-gray-700">Background</h3>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-purple-800">{backgroundName}</div>
              {backgroundData.feature_desc && (
                <div className="text-sm text-purple-700 mt-1">{backgroundData.feature_desc}</div>
              )}
            </div>
          </div>

          {/* Physical Appearance */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium text-gray-700">Physical Appearance</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Age" 
                value={appearance.age}
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Gender" 
                value={appearance.gender}
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Height" 
                value={appearance.height}
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Weight" 
                value={appearance.weight}
              />
              <InfoItem 
                icon={<Eye className="h-4 w-4" />}
                label="Eyes" 
                value={appearance.eyes}
              />
              <InfoItem 
                icon={<Palette className="h-4 w-4" />}
                label="Skin" 
                value={appearance.skin}
              />
            </div>
            
            <InfoItem 
              icon={<Palette className="h-4 w-4" />}
              label="Hair" 
              value={appearance.hair}
            />
          </div>

          {/* Personality & Beliefs */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-gray-700">Personality & Beliefs</h3>
            </div>
            
            <div className="space-y-2">
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Alignment" 
                value={personality.alignment}
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Ideals" 
                value={personality.ideals}
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Bonds" 
                value={personality.bonds}
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Flaws" 
                value={personality.flaws}
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Faith" 
                value={personality.faith}
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Lifestyle" 
                value={personality.lifestyle}
              />
            </div>
          </div>

          {/* Skills from Background */}
          {backgroundData.selectedSkills && backgroundData.selectedSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-orange-600" />
                <h3 className="font-medium text-gray-700">Background Skills</h3>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-orange-800">
                  {backgroundData.selectedSkills.join(', ')}
                </div>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default BackgroundAppearance;
