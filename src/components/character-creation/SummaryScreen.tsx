
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryScreenProps {
  data: any;
  onUpdate: (updates: any) => void;
}

const SummaryScreen = ({ data }: SummaryScreenProps) => {
  const getModifier = (score: number) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Character Summary</h1>
        <p className="text-gray-600">Review your character before finishing creation</p>
      </div>

      <div className="grid gap-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{data.name || 'Unnamed Character'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Species:</span>
              <span>{data.species?.name || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Class:</span>
              <span>{data.class?.name || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Background:</span>
              <span>{data.background?.name || 'Not selected'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Advancement Type:</span>
              <span className="capitalize">{data.advancementType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Hit Point Type:</span>
              <span className="capitalize">{data.hitPointType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sources:</span>
              <span>
                {Object.entries(data.sources)
                  .filter(([_, enabled]) => enabled)
                  .map(([source, _]) => source === 'coreRules' ? 'Core Rules' : 
                                       source === 'expansions' ? 'Expansions' : 'Homebrew')
                  .join(', ')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Abilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ability Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-medium text-sm text-gray-600">STR</div>
                <div className="text-lg font-bold">{data.abilities.str.total}</div>
                <div className="text-sm text-gray-500">{getModifier(data.abilities.str.total)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm text-gray-600">DEX</div>
                <div className="text-lg font-bold">{data.abilities.dex.total}</div>
                <div className="text-sm text-gray-500">{getModifier(data.abilities.dex.total)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm text-gray-600">CON</div>
                <div className="text-lg font-bold">{data.abilities.con.total}</div>
                <div className="text-sm text-gray-500">{getModifier(data.abilities.con.total)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm text-gray-600">INT</div>
                <div className="text-lg font-bold">{data.abilities.int.total}</div>
                <div className="text-sm text-gray-500">{getModifier(data.abilities.int.total)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm text-gray-600">WIS</div>
                <div className="text-lg font-bold">{data.abilities.wis.total}</div>
                <div className="text-sm text-gray-500">{getModifier(data.abilities.wis.total)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm text-gray-600">CHA</div>
                <div className="text-lg font-bold">{data.abilities.cha.total}</div>
                <div className="text-sm text-gray-500">{getModifier(data.abilities.cha.total)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.equipment.startingEquipment.length > 0 ? (
              <div>
                <div className="font-medium mb-2">Starting Equipment:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {data.equipment.startingEquipment.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-500">No equipment selected</div>
            )}
            
            {Object.values(data.equipment.currency).some(amount => amount > 0) && (
              <div>
                <div className="font-medium mb-2">Starting Currency:</div>
                <div className="text-sm">
                  {Object.entries(data.equipment.currency)
                    .filter(([_, amount]) => amount > 0)
                    .map(([type, amount]) => `${amount} ${type.toUpperCase()}`)
                    .join(', ')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Species Details */}
        {data.species && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Species Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{data.species.description}</p>
                {data.species.traits && data.species.traits.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Traits:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {data.species.traits.map((trait: string, index: number) => (
                        <li key={index}>{trait}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Class Details */}
        {data.class && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Class Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{data.class.description}</p>
                {data.class.features && data.class.features.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Level 1 Features:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {data.class.features.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Background Details */}
        {data.background && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Background Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{data.background.description}</p>
                {data.background.skillProficiencies && data.background.skillProficiencies.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Skill Proficiencies:</div>
                    <div className="text-sm">{data.background.skillProficiencies.join(', ')}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SummaryScreen;
