
import { Open5eClass } from '../../services/open5eApi';

interface ClassBasicInfoProps {
  classData: Open5eClass;
}

const ClassBasicInfo = ({ classData }: ClassBasicInfoProps) => {
  const cleanDescription = (desc: string) => {
    return desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  };

  return (
    <div className="space-y-6">
      {/* Class Image Placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
        <img 
          src="/avatarPlaceholder.svg" 
          alt={classData.name}
          className="w-20 h-20 opacity-60"
          style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
        />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 text-sm">Hit Die</h4>
          <p className="text-red-700 font-medium">d{classData.hit_die}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 text-sm">Primary Ability</h4>
          <p className="text-purple-700 font-medium">{classData.spellcasting_ability || 'Varies'}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 col-span-2">
          <h4 className="font-semibold text-blue-900 text-sm">Saving Throws</h4>
          <p className="text-blue-700 font-medium">{classData.prof_saving_throws || 'None specified'}</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-3 text-lg">About {classData.name}</h4>
        <p className="text-gray-700 leading-relaxed">{cleanDescription(classData.desc)}</p>
      </div>
    </div>
  );
};

export default ClassBasicInfo;
