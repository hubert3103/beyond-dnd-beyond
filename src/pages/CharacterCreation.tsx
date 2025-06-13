
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SetupScreen from '../components/character-creation/SetupScreen';
import SpeciesScreen from '../components/character-creation/SpeciesScreen';
import ClassScreen from '../components/character-creation/ClassScreen';
import AbilitiesScreen from '../components/character-creation/AbilitiesScreen';
import BackgroundScreen from '../components/character-creation/BackgroundScreen';
import EquipmentScreen from '../components/character-creation/EquipmentScreen';

export type CreationStep = 'setup' | 'species' | 'class' | 'abilities' | 'background' | 'equipment' | 'character-sheet';

const CharacterCreation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CreationStep>('setup');
  const [characterData, setCharacterData] = useState({
    name: '',
    sources: { coreRules: true, expansions: false, homebrew: false },
    advancementType: 'milestone',
    hitPointType: 'fixed',
    species: null,
    class: null,
    abilities: {
      str: { base: 10, bonus: 0, total: 10 },
      dex: { base: 10, bonus: 0, total: 10 },
      con: { base: 10, bonus: 0, total: 10 },
      int: { base: 10, bonus: 0, total: 10 },
      wis: { base: 10, bonus: 0, total: 10 },
      cha: { base: 10, bonus: 0, total: 10 }
    },
    background: null,
    equipment: { startingEquipment: [], inventory: [], currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 } }
  });

  const steps: { id: CreationStep; label: string }[] = [
    { id: 'setup', label: 'Setup' },
    { id: 'species', label: 'Species' },
    { id: 'class', label: 'Class' },
    { id: 'abilities', label: 'Abilities' },
    { id: 'background', label: 'Background' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'character-sheet', label: 'Character Sheet' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const goToStep = (step: CreationStep) => {
    setCurrentStep(step);
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    } else {
      // Save character and go back to characters list
      navigate('/player');
    }
  };

  const updateCharacterData = (updates: any) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  };

  const renderCurrentScreen = () => {
    switch (currentStep) {
      case 'setup':
        return <SetupScreen data={characterData} onUpdate={updateCharacterData} />;
      case 'species':
        return <SpeciesScreen data={characterData} onUpdate={updateCharacterData} />;
      case 'class':
        return <ClassScreen data={characterData} onUpdate={updateCharacterData} />;
      case 'abilities':
        return <AbilitiesScreen data={characterData} onUpdate={updateCharacterData} />;
      case 'background':
        return <BackgroundScreen data={characterData} onUpdate={updateCharacterData} />;
      case 'equipment':
        return <EquipmentScreen data={characterData} onUpdate={updateCharacterData} />;
      default:
        return <SetupScreen data={characterData} onUpdate={updateCharacterData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex flex-col">
      {/* Top Navigation */}
      <header className="bg-[#4a4a4a] px-4 py-3 flex items-center">
        <button
          onClick={() => navigate('/player')}
          className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3"
        >
          <span className="text-white font-bold text-sm">&</span>
        </button>
        <h1 className="text-white text-lg font-medium flex-1 text-center pr-11">Character Creation</h1>
      </header>

      {/* Breadcrumb Progress */}
      <div className="bg-[#4a4a4a] px-4 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => goToStep(step.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  step.id === currentStep
                    ? 'bg-red-600 text-white'
                    : index <= currentStepIndex
                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step.label}
              </button>
              {index < steps.length - 1 && (
                <span className="text-gray-400 mx-2">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-white overflow-y-auto pb-24">
        {renderCurrentScreen()}
      </main>

      {/* Navigation Controls */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#4a4a4a] px-4 py-2 flex justify-between">
        <button
          onClick={goToPreviousStep}
          disabled={currentStepIndex === 0}
          className="text-white px-4 py-2 disabled:text-gray-500"
        >
          &lt; Prev
        </button>
        <button
          onClick={goToNextStep}
          className="text-white px-4 py-2"
        >
          {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next >'}
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex">
          {[
            { id: 'characters', label: 'Characters', icon: '/characterIcon.svg' },
            { id: 'spells', label: 'Spells', icon: '/spellsIcon.svg' },
            { id: 'items', label: 'Items', icon: '/itemsIcon.svg' },
            { id: 'manuals', label: 'Manuals', icon: '/manualsIcon.svg' },
          ].map((tab) => (
            <button
              key={tab.id}
              className="flex-1 flex flex-col items-center py-3 px-2 text-gray-400"
            >
              <img src={tab.icon} alt={tab.label} className="w-6 h-6 mb-1 opacity-60" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CharacterCreation;
