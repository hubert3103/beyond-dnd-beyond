
import { Open5eClass } from '../../services/open5eApi';

interface ClassProficienciesProps {
  classData: Open5eClass;
}

const ClassProficiencies = ({ classData }: ClassProficienciesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {classData.prof_armor && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
            <span className="text-lg">🛡️</span>
            <span className="ml-2">Armor Proficiency</span>
          </h4>
          <p className="text-amber-800 text-sm">{classData.prof_armor}</p>
        </div>
      )}
      
      {classData.prof_weapons && (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
            <span className="text-lg">⚔️</span>
            <span className="ml-2">Weapon Proficiency</span>
          </h4>
          <p className="text-orange-800 text-sm">{classData.prof_weapons}</p>
        </div>
      )}
      
      {classData.prof_tools && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center">
            <span className="text-lg">🔧</span>
            <span className="ml-2">Tool Proficiency</span>
          </h4>
          <p className="text-green-800 text-sm">{classData.prof_tools}</p>
        </div>
      )}

      {classData.prof_skills && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
            <span className="text-lg">🎯</span>
            <span className="ml-2">Skill Proficiency</span>
          </h4>
          <p className="text-indigo-800 text-sm">{classData.prof_skills}</p>
        </div>
      )}
    </div>
  );
};

export default ClassProficiencies;
