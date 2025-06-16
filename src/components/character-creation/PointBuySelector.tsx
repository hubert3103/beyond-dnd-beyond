
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus } from 'lucide-react';
import { POINT_BUY_CONFIG, ABILITY_NAMES, ABILITY_DESCRIPTIONS } from '../../data/standardArrayData';

interface PointBuySelectorProps {
  abilities: any;
  onUpdate: (abilities: any) => void;
}

const PointBuySelector = ({ abilities, onUpdate }: PointBuySelectorProps) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [pointsUsed, setPointsUsed] = useState(0);

  useEffect(() => {
    // Initialize with base scores
    const initialScores: Record<string, number> = {};
    Object.keys(ABILITY_NAMES).forEach(key => {
      initialScores[key] = POINT_BUY_CONFIG.BASE_SCORE;
    });
    setScores(initialScores);
  }, []);

  useEffect(() => {
    // Calculate points used
    const used = Object.values(scores).reduce((total, score) => {
      return total + (POINT_BUY_CONFIG.COST_TABLE[score as keyof typeof POINT_BUY_CONFIG.COST_TABLE] || 0);
    }, 0);
    setPointsUsed(used);

    // Update abilities
    const newAbilities = { ...abilities };
    Object.keys(ABILITY_NAMES).forEach(key => {
      const base = scores[key] || POINT_BUY_CONFIG.BASE_SCORE;
      newAbilities[key] = {
        ...newAbilities[key],
        base,
        total: base + newAbilities[key].bonus
      };
    });
    
    onUpdate(newAbilities);
  }, [scores, abilities, onUpdate]);

  const getCost = (score: number) => {
    return POINT_BUY_CONFIG.COST_TABLE[score as keyof typeof POINT_BUY_CONFIG.COST_TABLE] || 0;
  };

  const canIncrease = (abilityKey: string) => {
    const currentScore = scores[abilityKey] || POINT_BUY_CONFIG.BASE_SCORE;
    if (currentScore >= POINT_BUY_CONFIG.MAX_SCORE) return false;
    
    const nextScore = currentScore + 1;
    const currentCost = getCost(currentScore);
    const nextCost = getCost(nextScore);
    const additionalCost = nextCost - currentCost;
    
    return pointsUsed + additionalCost <= POINT_BUY_CONFIG.TOTAL_POINTS;
  };

  const canDecrease = (abilityKey: string) => {
    const currentScore = scores[abilityKey] || POINT_BUY_CONFIG.BASE_SCORE;
    return currentScore > POINT_BUY_CONFIG.BASE_SCORE;
  };

  const adjustScore = (abilityKey: string, direction: 'increase' | 'decrease') => {
    const currentScore = scores[abilityKey] || POINT_BUY_CONFIG.BASE_SCORE;
    const newScore = direction === 'increase' ? currentScore + 1 : currentScore - 1;
    
    setScores(prev => ({
      ...prev,
      [abilityKey]: newScore
    }));
  };

  const remainingPoints = POINT_BUY_CONFIG.TOTAL_POINTS - pointsUsed;

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">Point Buy System</h3>
        <p className="text-sm text-green-700 mb-3">
          You have {POINT_BUY_CONFIG.TOTAL_POINTS} points to spend on ability scores. All abilities start at {POINT_BUY_CONFIG.BASE_SCORE}.
        </p>
        <div className="flex items-center justify-between">
          <Badge variant={remainingPoints === 0 ? "default" : "outline"}>
            Points Remaining: {remainingPoints}
          </Badge>
          <Badge variant="secondary">
            Points Used: {pointsUsed}/{POINT_BUY_CONFIG.TOTAL_POINTS}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(ABILITY_NAMES).map(([key, name]) => {
          const score = scores[key] || POINT_BUY_CONFIG.BASE_SCORE;
          const cost = getCost(score);
          
          return (
            <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{name}</h4>
                <p className="text-sm text-gray-600">{ABILITY_DESCRIPTIONS[key as keyof typeof ABILITY_DESCRIPTIONS]}</p>
                <p className="text-xs text-gray-500">Cost: {cost} points</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustScore(key, 'decrease')}
                  disabled={!canDecrease(key)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center font-semibold">
                  {score}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustScore(key, 'increase')}
                  disabled={!canIncrease(key)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PointBuySelector;
