
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SetupScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const SetupScreen = ({ data, onUpdate }: SetupScreenProps) => {
  const handleSourceToggle = (source: string) => {
    onUpdate({
      sources: {
        ...data.sources,
        [source]: !data.sources[source]
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Character Name */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <img 
              src="/avatarPlaceholder.svg" 
              alt="Character avatar"
              className="w-10 h-10"
              style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="characterName" className="text-sm font-medium text-gray-900">
              Character Name
            </Label>
            <Input
              id="characterName"
              value={data.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="My Character's name"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Character Preferences */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Character Preferences</h2>
        
        {/* Sources */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sources</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose if you want to build your character with core rules only or if you want to include 
              expansions, if you're not sure contact your DM for information.
            </p>
          </div>
          
          {/* Core Rules Toggle */}
          <button
            onClick={() => handleSourceToggle('coreRules')}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
              data.sources.coreRules
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Core rules</div>
                <div className={`text-sm ${data.sources.coreRules ? 'text-red-100' : 'text-gray-600'}`}>
                  Character options from the Player's Handbook, Dungeon Master's Guide and Monster Manual.
                </div>
              </div>
              {data.sources.coreRules && (
                <div className="text-white">✓</div>
              )}
            </div>
          </button>

          {/* Expansions Toggle */}
          <button
            onClick={() => handleSourceToggle('expansions')}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
              data.sources.expansions
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Expansions</div>
                <div className={`text-sm ${data.sources.expansions ? 'text-red-100' : 'text-gray-600'}`}>
                  Character options from official expansion books.
                </div>
              </div>
              {data.sources.expansions && (
                <div className="text-white">✓</div>
              )}
            </div>
          </button>

          {/* Homebrew Toggle */}
          <button
            onClick={() => handleSourceToggle('homebrew')}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
              data.sources.homebrew
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Homebrew</div>
                <div className={`text-sm ${data.sources.homebrew ? 'text-red-100' : 'text-gray-600'}`}>
                  Character options designed by other players, always talk to your dm to review if those are allowed.
                </div>
              </div>
              {data.sources.homebrew && (
                <div className="text-white">✓</div>
              )}
            </div>
          </button>
        </div>

        {/* Advancement Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">Advancement Type</Label>
          <Select value={data.advancementType} onValueChange={(value) => onUpdate({ advancementType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="xp">XP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hit Point Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">Hit Point Type</Label>
          <Select value={data.hitPointType} onValueChange={(value) => onUpdate({ hitPointType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
