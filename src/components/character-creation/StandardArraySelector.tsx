
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { STANDARD_ARRAY_VALUES, ABILITY_NAMES, ABILITY_DESCRIPTIONS } from '../../data/standardArrayData';

interface StandardArraySelectorProps {
  abilities: any;
  onUpdate: (abilities: any) => void;
}

const StandardArraySelector = ({ abilities, onUpdate }: StandardArraySelectorProps) => {
  const [assignedValues, setAssignedValues] = useState<Record<string, number>>({});
  
  // Initialize assigned values based on existing ability scores
  useEffect(() => {
    const initialAssignments: Record<string, number> = {};
    
    // Check if any of the base scores match standard array values and are not the default unassigned value (8)
    Object.entries(abilities).forEach(([key, abilityData]: [string, any]) => {
      const baseScore = abilityData.base;
      if (STANDARD_ARRAY_VALUES.includes(baseScore) && baseScore !== 8) {
        initialAssignments[key] = baseScore;
      }
    });
    
    console.log('Initializing standard array assignments:', initialAssignments);
    setAssignedValues(initialAssignments);
  }, [abilities]);
  
  const availableValues = STANDARD_ARRAY_VALUES.filter(value => 
    !Object.values(assignedValues).includes(value)
  );

  const handleAssignment = (abilityKey: string, value: string) => {
    const newAssignedValues = { ...assignedValues };
    
    // Remove old assignment if exists
    if (assignedValues[abilityKey]) {
      delete newAssignedValues[abilityKey];
    }
    
    // Add new assignment only if it's not the unassigned value
    if (value !== 'unassigned') {
      const numValue = parseInt(value);
      newAssignedValues[abilityKey] = numValue;
    }
    
    setAssignedValues(newAssignedValues);
    
    // Update abilities
    const newAbilities = { ...abilities };
    Object.keys(ABILITY_NAMES).forEach(key => {
      const base = newAssignedValues[key] || 8;
      newAbilities[key] = {
        ...newAbilities[key],
        base,
        total: base + newAbilities[key].bonus
      };
    });
    
    onUpdate(newAbilities);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Standard Array</h3>
        <p className="text-sm text-blue-700 mb-3">
          Assign these values to your abilities: {STANDARD_ARRAY_VALUES.join(', ')}
        </p>
        <div className="flex flex-wrap gap-1">
          {availableValues.map(value => (
            <Badge key={value} variant="outline" className="bg-white">
              {value}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(ABILITY_NAMES).map(([key, name]) => (
          <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{name}</h4>
              <p className="text-sm text-gray-600">{ABILITY_DESCRIPTIONS[key as keyof typeof ABILITY_DESCRIPTIONS]}</p>
            </div>
            <div className="ml-4 w-24">
              <Select 
                value={assignedValues[key]?.toString() || 'unassigned'} 
                onValueChange={(value) => handleAssignment(key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {STANDARD_ARRAY_VALUES.map(value => (
                    <SelectItem 
                      key={value} 
                      value={value.toString()}
                      disabled={Object.values(assignedValues).includes(value) && assignedValues[key] !== value}
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StandardArraySelector;
