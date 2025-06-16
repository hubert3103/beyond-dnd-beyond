
import { Badge } from '@/components/ui/badge';
import { ClassInfo } from '../../data/subclassData';

interface ClassInfoPanelProps {
  classInfo: ClassInfo;
}

const ClassInfoPanel = ({ classInfo }: ClassInfoPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-gray-600 leading-relaxed">{classInfo.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Hit Die</h4>
          <p className="text-gray-600">d{classInfo.hitDie}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Primary Abilities</h4>
          <div className="flex flex-wrap gap-1">
            {classInfo.primaryAbility.map((ability) => (
              <Badge key={ability} variant="outline" className="text-xs">
                {ability}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
        <div className="flex flex-wrap gap-1">
          {classInfo.keyFeatures.map((feature) => (
            <Badge key={feature} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassInfoPanel;
