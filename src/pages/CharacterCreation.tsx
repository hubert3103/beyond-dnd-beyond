
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { TabType } from './PlayerDashboard';
import SetupScreen from '../components/character-creation/SetupScreen';
import SpeciesScreen from '../components/character-creation/SpeciesScreen';
import ClassScreen from '../components/character-creation/ClassScreen';
import AbilitiesScreen from '../components/character-creation/AbilitiesScreen';
import BackgroundScreen from '../components/character-creation/BackgroundScreen';
import SpellSelectionScreen from '../components/character-creation/SpellSelectionScreen';
import EquipmentScreen from '../components/character-creation/EquipmentScreen';
import SummaryScreen from '../components/character-creation/SummaryScreen';
import { useCharacters } from '@/hooks/useCharacters';

export type CreationStep = 'setup' | 'species' | 'class' | 'abilities' | 'background' | 'spells' | 'equipment' | 'summary';

const CharacterCreation = () => {
  const navigate = useNavigate();
  const { saveCharacter } = useCharacters();
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
    equipment: { startingEquipment: [], inventory: [], currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 } },
    spells: []
  });

  // Check if current class is a spellcaster
  const isSpellcaster = () => {
    if (!characterData.class) return false;
    return !!characterData.class.spellcastingAbility;
  };

  // Get steps based on whether character is a spellcaster
  const getSteps = () => {
    const baseSteps = [
      { id: 'setup' as CreationStep, label: 'Setup' },
      { id: 'species' as CreationStep, label: 'Species' },
      { id: 'class' as CreationStep, label: 'Class' },
      { id: 'abilities' as CreationStep, label: 'Abilities' },
      { id: 'background' as CreationStep, label: 'Background' },
    ];

    // Add spells step only for spellcasters
    if (isSpellcaster()) {
      baseSteps.push({ id: 'spells' as CreationStep, label: 'Spells' });
    }

    baseSteps.push(
      { id: 'equipment' as CreationStep, label: 'Equipment' },
      { id: 'summary' as CreationStep, label: 'Summary' }
    );

    return baseSteps;
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const goToStep = (step: CreationStep) => {
    // Only allow going to steps that exist in current flow
    if (steps.some(s => s.id === step)) {
      setCurrentStep(step);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const goToNextStep = async () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    } else {
      // Save character and navigate to character sheet
      try {
        const savedCharacter = await saveCharacter(characterData);
        if (savedCharacter) {
          navigate(`/character/${savedCharacter.id}`);
        }
      } catch (error) {
        console.error('Failed to save character:', error);
      }
    }
  };

  const updateCharacterData = (updates: any) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  };

  const handleTabChange = (tab: TabType) => {
    // Navigate to player dashboard with state to set the active tab
    navigate('/player', { state: { activeTab: tab } });
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
      case 'spells':
        return <SpellSelectionScreen data={characterData} onUpdate={updateCharacterData} />;
      case 'equipment':
        return <EquipmentScreen data={characterData} onUpdate={updateCharacterData} />;
      case 'summary':
        return <SummaryScreen data={characterData} onUpdate={updateCharacterData} />;
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
          <span className="text-white font-bold text-sm">&larr;</span>
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
      <main className="flex-1 bg-white overflow-y-auto pb-32">
        {renderCurrentScreen()}
      </main>

      {/* Navigation Controls - Fixed above bottom navigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#4a4a4a] px-4 py-3 flex justify-end border-t border-gray-600 z-10">
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className="text-white px-4 py-2 disabled:text-gray-500 font-medium"
          >
            &lt; Prev
          </button>
          <button
            onClick={goToNextStep}
            className="text-white px-4 py-2 font-medium"
          >
            {currentStepIndex === steps.length - 1 ? 'Create Character' : 'Next >'}
          </button>
        </div>
      </div>

      {/* Bottom Navigation - Same as main app */}
      <BottomNavigation activeTab="characters" onTabChange={handleTabChange} />
    </div>
  );
};

export default CharacterCreation;
