
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export type CreationStep = 'setup' | 'species' | 'class' | 'abilities' | 'background' | 'spells' | 'equipment' | 'summary';

const CharacterCreation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCharacterId = searchParams.get('edit');
  const { saveCharacter, getCharacter, updateCharacter } = useCharacters();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CreationStep>('setup');
  const [isLoading, setIsLoading] = useState(!!editCharacterId);
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

  // Load existing character data if editing
  useEffect(() => {
    const loadCharacterForEdit = async () => {
      if (!editCharacterId) return;

      try {
        const existingCharacter = await getCharacter(editCharacterId);
        if (existingCharacter) {
          console.log('Loading character for edit:', existingCharacter);
          
          // Convert database character format to creation format
          const convertedData = {
            name: existingCharacter.name,
            sources: { coreRules: true, expansions: false, homebrew: false }, // Default values
            advancementType: existingCharacter.advancement_type || 'milestone',
            hitPointType: existingCharacter.hit_point_type || 'fixed',
            species: existingCharacter.species_data,
            class: existingCharacter.class_data,
            abilities: existingCharacter.abilities || {
              str: { base: 10, bonus: 0, total: 10 },
              dex: { base: 10, bonus: 0, total: 10 },
              con: { base: 10, bonus: 0, total: 10 },
              int: { base: 10, bonus: 0, total: 10 },
              wis: { base: 10, bonus: 0, total: 10 },
              cha: { base: 10, bonus: 0, total: 10 }
            },
            background: existingCharacter.background_data,
            equipment: existingCharacter.equipment || { startingEquipment: [], inventory: [], currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 } },
            spells: existingCharacter.spells || []
          };
          
          setCharacterData(convertedData);
        } else {
          toast({
            title: "Error",
            description: "Character not found",
            variant: "destructive",
          });
          navigate('/player');
        }
      } catch (error) {
        console.error('Error loading character for edit:', error);
        toast({
          title: "Error",
          description: "Failed to load character",
          variant: "destructive",
        });
        navigate('/player');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacterForEdit();
  }, [editCharacterId, getCharacter, navigate, toast]);

  // Check if current class is a spellcaster
  const isSpellcaster = () => {
    if (!characterData.class) return false;
    return !!characterData.class.spellcastingAbility;
  };

  // Get steps based on whether character is a spellcaster
  const getSteps = () => {
    const steps = [
      { id: 'setup' as CreationStep, label: 'Setup' },
      { id: 'species' as CreationStep, label: 'Species' },
      { id: 'class' as CreationStep, label: 'Class' },
    ];

    // Add spells step right after class for spellcasters
    if (isSpellcaster()) {
      steps.push({ id: 'spells' as CreationStep, label: 'Spells' });
    }

    // Add remaining steps
    steps.push(
      { id: 'abilities' as CreationStep, label: 'Abilities' },
      { id: 'background' as CreationStep, label: 'Background' },
      { id: 'equipment' as CreationStep, label: 'Equipment' },
      { id: 'summary' as CreationStep, label: 'Summary' }
    );

    return steps;
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
      // Save or update character
      try {
        if (editCharacterId) {
          // Update existing character
          await updateCharacter(editCharacterId, {
            name: characterData.name,
            species_name: characterData.species?.name || null,
            species_data: characterData.species,
            class_name: characterData.class?.name || null,
            class_data: characterData.class,
            background_name: characterData.background?.name || null,
            background_data: characterData.background,
            abilities: characterData.abilities,
            equipment: characterData.equipment,
            spells: characterData.spells,
            advancement_type: characterData.advancementType,
            hit_point_type: characterData.hitPointType,
          });
          
          toast({
            title: "Success",
            description: "Character updated successfully!",
          });
          
          navigate(`/character/${editCharacterId}`);
        } else {
          // Create new character
          const savedCharacter = await saveCharacter(characterData);
          if (savedCharacter) {
            navigate(`/character/${savedCharacter.id}`);
          }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#4a4a4a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading character...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-white text-lg font-medium flex-1 text-center pr-11">
          {editCharacterId ? 'Edit Character' : 'Character Creation'}
        </h1>
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
            {currentStepIndex === steps.length - 1 ? (editCharacterId ? 'Update Character' : 'Create Character') : 'Next >'}
          </button>
        </div>
      </div>

      {/* Bottom Navigation - Same as main app */}
      <BottomNavigation activeTab="characters" onTabChange={handleTabChange} />
    </div>
  );
};

export default CharacterCreation;
