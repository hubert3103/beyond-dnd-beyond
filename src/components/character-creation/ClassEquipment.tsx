
import { Open5eClass } from '../../services/open5eApi';

interface ClassEquipmentProps {
  classData: Open5eClass;
}

const ClassEquipment = ({ classData }: ClassEquipmentProps) => {
  const cleanDescription = (desc: string) => {
    return desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  };

  if (!classData.equipment) return null;

  return (
    <div className="bg-white border rounded-lg">
      <div className="bg-gray-100 px-6 py-4 border-b">
        <h4 className="font-semibold text-gray-900 text-lg flex items-center">
          <span className="text-lg">🎒</span>
          <span className="ml-2">Starting Equipment</span>
        </h4>
      </div>
      <div className="p-6">
        <p className="text-gray-700 leading-relaxed">{cleanDescription(classData.equipment)}</p>
      </div>
    </div>
  );
};

export default ClassEquipment;
