
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BottomNavigation from '../components/BottomNavigation';
import CharacterSummary from '../components/character-sheet/CharacterSummary';
import AbilitiesSection from '../components/character-sheet/AbilitiesSection';
import SavingThrowsSkills from '../components/character-sheet/SavingThrowsSkills';
import PassiveScoresDefenses from '../components/character-sheet/PassiveScoresDefenses';
import HitPointsHitDice from '../components/character-sheet/HitPointsHitDice';
import AttacksSpellcasting from '../components/character-sheet/AttacksSpellcasting';
import EquipmentSection from '../components/character-sheet/EquipmentSection';
import SpellsSection from '../components/character-sheet/SpellsSection';
import FeaturesTraits from '../components/character-sheet/FeaturesTraits';
import CurrencyNotes from '../components/character-sheet/CurrencyNotes';
import { TabType } from './PlayerDashboard';
import { useCharacters } from '@/hooks/useCharacters';
import { useToast } from '@/hooks/use-toast';

const CharacterSheet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCharacter, deleteCharacter } = useCharacters();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCharacter = async () => {
      if (!id) {
        navigate('/player');
        return;
      }

      console.log('Loading character with ID:', id);
      
      try {
        const characterData = await getCharacter(id);
        
        if (characterData) {
          console.log('Character data loaded:', characterData);
          // Convert database character to the format expected by the character sheet
          const formattedCharacter = {
            id: characterData.id,
            name: characterData.name,
            level: characterData.level,
            class_name: characterData.class_name,
            class_data: characterData.class_data,
            species_name: characterData.species_name,
            species_data: characterData.species_data,
            background_name: characterData.background_name,
            background_data: characterData.background_data,
            avatar: '/avatarPlaceholder.svg',
            // Use stored hit points or calculate them
            currentHP: characterData.hit_points?.current || this.calculateInitialHP(characterData),
            maxHP: characterData.hit_points?.max || this.calculateInitialHP(characterData),
            tempHP: characterData.hit_points?.temporary || 0,
            hit_points: characterData.hit_points,
            hit_point_type: characterData.hit_point_type,
            proficiencyBonus: Math.ceil(characterData.level / 4) + 1,
            abilities: characterData.abilities,
            equipment: characterData.equipment,
            spells: characterData.spells || [],
            armorClass: this.calculateArmorClass(characterData),
            initiative: Math.floor((characterData.abilities?.dex?.total || 10 - 10) / 2),
            speed: this.calculateSpeed(characterData)
          };
          
          setCharacter(formattedCharacter);
          console.log('Character formatted and set');
        } else {
          console.log('Character not found');
          toast({
            title: "Error",
            description: "Character not found",
            variant: "destructive",
          });
          navigate('/player');
        }
      } catch (error) {
        console.error('Error loading character:', error);
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

    // Helper functions to calculate derived stats
    const calculateInitialHP = (characterData: any) => {
      if (!characterData.class_data) return 1;
      const conModifier = Math.floor((characterData.abilities?.con?.total || 10 - 10) / 2);
      if (characterData.hit_point_type === 'fixed') {
        return (characterData.class_data.hit_die || 8) + conModifier;
      }
      return characterData.hit_points?.max || ((characterData.class_data.hit_die || 8) + conModifier);
    };

    const calculateArmorClass = (characterData: any) => {
      const dexModifier = Math.floor((characterData.abilities?.dex?.total || 10 - 10) / 2);
      let baseAC = 10 + dexModifier;
      
      // Check for armor in equipment
      if (characterData.equipment?.starting_equipment) {
        const armor = characterData.equipment.starting_equipment.find((item: any) => 
          item.category === 'armor' && item.equipped
        );
        if (armor && armor.ac) {
          baseAC = armor.ac + (armor.dex_bonus ? Math.min(dexModifier, armor.max_dex_bonus || dexModifier) : 0);
        }
      }
      
      return baseAC;
    };

    const calculateSpeed = (characterData: any) => {
      // Default speed, could be modified by species
      let speed = 30;
      if (characterData.species_data?.speed) {
        speed = characterData.species_data.speed;
      }
      return speed;
    };

    loadCharacter();
  }, [id]); // Removed getCharacter, navigate, toast from dependencies to prevent infinite loops

  const handleBack = () => {
    navigate('/player');
  };

  const handleOverflowAction = async (action: string) => {
    switch (action) {
      case 'share':
        console.log('Share character');
        break;
      case 'delete':
        if (character?.id) {
          try {
            await deleteCharacter(character.id);
            navigate('/player');
          } catch (error) {
            console.error('Error deleting character:', error);
          }
        }
        break;
      case 'export':
        console.log('Export PDF');
        break;
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

  if (!character) {
    return (
      <div className="min-h-screen bg-[#4a4a4a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Character not found</p>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4a4a4a] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#3a3a3a] p-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <img 
              src={character.avatar} 
              alt="Character avatar"
              className="w-6 h-6"
              style={{
                filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
              }}
            />
          </div>
        </div>

        <h1 className="text-white font-bold text-lg flex-1 text-center">{character.name}</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-600"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            <DropdownMenuItem onClick={() => handleOverflowAction('share')}>
              Share Character
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOverflowAction('export')}>
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleOverflowAction('delete')}
              className="text-red-600"
            >
              Delete Character
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 space-y-4">
        <CharacterSummary character={character} setCharacter={setCharacter} />
        <AbilitiesSection character={character} setCharacter={setCharacter} />
        <SavingThrowsSkills character={character} />
        <PassiveScoresDefenses character={character} setCharacter={setCharacter} />
        <HitPointsHitDice character={character} setCharacter={setCharacter} />
        <AttacksSpellcasting character={character} />
        <EquipmentSection character={character} />
        <SpellsSection character={character} />
        <FeaturesTraits character={character} />
        <CurrencyNotes />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default CharacterSheet;
