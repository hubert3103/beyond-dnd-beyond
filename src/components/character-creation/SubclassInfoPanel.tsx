
import { Badge } from '@/components/ui/badge';
import { SubclassInfo } from '../../data/subclassData';

interface SubclassInfoPanelProps {
  subclass: SubclassInfo;
}

const SubclassInfoPanel = ({ subclass }: SubclassInfoPanelProps) => {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-3">
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">{subclass.name}</h4>
        <p className="text-sm text-gray-600">{subclass.description}</p>
      </div>
      
      {subclass.keyAbilities.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Key Abilities</h5>
          <div className="flex flex-wrap gap-1">
            {subclass.keyAbilities.map((ability) => (
              <Badge key={ability} variant="outline" className="text-xs">
                {ability}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-1">Key Features</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          {subclass.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SubclassInfoPanel;
