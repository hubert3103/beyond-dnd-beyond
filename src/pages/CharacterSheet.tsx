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
import RestButtons from '../components/character-sheet/RestButtons';
import BackgroundAppearance from '../components/character-sheet/BackgroundAppearance';
import { TabType } from './PlayerDashboard';
import { useCharacters } from '@/hooks/useCharacters';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

const CharacterSheet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCharacter, deleteCharacter, updateCharacter } = useCharacters();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle bottom navigation - navigate to player dashboard with selected tab
  const handleTabChange = (tab: TabType) => {
    navigate('/player', { state: { activeTab: tab } });
  };

  // Enhanced character update handler with better error handling and persistence
  const handleCharacterUpdate = async (updatedCharacter: any) => {
    // Update local state immediately for responsive UI
    setCharacter(updatedCharacter);
    
    // Prepare database update payload
    if (id) {
      try {
        const updateData: any = {};
        
        // Check and update level - CRITICAL for level ups
        if (updatedCharacter.level !== character?.level) {
          updateData.level = updatedCharacter.level;
        }

        // Check and update abilities (including ability score improvements)
        if (updatedCharacter.abilities && JSON.stringify(updatedCharacter.abilities) !== JSON.stringify(character?.abilities)) {
          updateData.abilities = updatedCharacter.abilities;
        }
        
        // Check and update hit points
        if (updatedCharacter.hit_points && JSON.stringify(updatedCharacter.hit_points) !== JSON.stringify(character?.hit_points)) {
          updateData.hit_points = updatedCharacter.hit_points;
        }
        
        // Check and update equipment
        if (updatedCharacter.equipment && JSON.stringify(updatedCharacter.equipment) !== JSON.stringify(character?.equipment)) {
          updateData.equipment = updatedCharacter.equipment;
        }
        
        // CRITICAL: Handle spells - check both array format and content
        if (updatedCharacter.spells !== undefined) {
          const currentSpellsString = JSON.stringify(character?.spells || []);
          const newSpellsString = JSON.stringify(updatedCharacter.spells || []);
          
          if (currentSpellsString !== newSpellsString) {
            updateData.spells = updatedCharacter.spells;
          }
        }
        
        // CRITICAL: Handle spell slots - check both property names and ensure proper update
        const newSpellSlots = updatedCharacter.spellSlots || updatedCharacter.spell_slots;
        const currentSpellSlots = character?.spellSlots || character?.spell_slots;
        
        if (newSpellSlots && JSON.stringify(newSpellSlots) !== JSON.stringify(currentSpellSlots || {})) {
          updateData.spell_slots = newSpellSlots;
        }

        // Handle inspiration separately if it exists
        if ('inspiration' in updatedCharacter && updatedCharacter.inspiration !== character?.inspiration) {
          if (!updateData.abilities) {
            updateData.abilities = updatedCharacter.abilities || character?.abilities || {};
          }
          updateData.abilities.inspiration = updatedCharacter.inspiration;
        }
        
        // Only proceed with database update if there are actual changes
        if (Object.keys(updateData).length > 0) {
          const result = await updateCharacter(id, updateData);
          
          if (result) {
            // Refresh character data from database to ensure consistency
            const refreshedCharacter = await getCharacter(id);
            if (refreshedCharacter) {
              const formattedRefreshedCharacter = formatCharacterData(refreshedCharacter);
              setCharacter(formattedRefreshedCharacter);
            }
          }
        }
        
      } catch (error) {
        console.error('Failed to update character in database:', error);
        toast({
          title: t('error'),
          description: t('failed_to_save'),
          variant: "destructive",
        });
        
        // Revert local state on error by reloading from database
        try {
          const originalCharacter = await getCharacter(id);
          if (originalCharacter) {
            const formattedCharacter = formatCharacterData(originalCharacter);
            setCharacter(formattedCharacter);
          }
        } catch (revertError) {
          console.error('Failed to revert character data:', revertError);
        }
      }
    }
  };

  // Function to refresh character data from database
  const refreshCharacterData = async () => {
    if (!id) return;
    
    try {
      const characterData = await getCharacter(id);
      if (characterData) {
        const formattedCharacter = formatCharacterData(characterData);
        setCharacter(formattedCharacter);
      }
    } catch (error) {
      console.error('Error refreshing character data:', error);
    }
  };

  // Helper function to format character data
  const formatCharacterData = (characterData: any) => {
    const formatAbilities = (abilities: any) => {
      const defaultAbilities = {
        strength: { score: 10, modifier: 0, proficient: false },
        dexterity: { score: 10, modifier: 0, proficient: false },
        constitution: { score: 10, modifier: 0, proficient: false },
        intelligence: { score: 10, modifier: 0, proficient: false },
        wisdom: { score: 10, modifier: 0, proficient: false },
        charisma: { score: 10, modifier: 0, proficient: false }
      };

      if (!abilities) return defaultAbilities;

      if (abilities.str || abilities.dex || abilities.con || abilities.int || abilities.wis || abilities.cha) {
        return {
          strength: {
            score: abilities.str?.total || abilities.str?.score || abilities.str || 10,
            modifier: Math.floor(((abilities.str?.total || abilities.str?.score || abilities.str || 10) - 10) / 2),
            proficient: abilities.str?.proficient || false
          },
          dexterity: {
            score: abilities.dex?.total || abilities.dex?.score || abilities.dex || 10,
            modifier: Math.floor(((abilities.dex?.total || abilities.dex?.score || abilities.dex || 10) - 10) / 2),
            proficient: abilities.dex?.proficient || false
          },
          constitution: {
            score: abilities.con?.total || abilities.con?.score || abilities.con || 10,
            modifier: Math.floor(((abilities.con?.total || abilities.con?.score || abilities.con || 10) - 10) / 2),
            proficient: abilities.con?.proficient || false
          },
          intelligence: {
            score: abilities.int?.total || abilities.int?.score || abilities.int || 10,
            modifier: Math.floor(((abilities.int?.total || abilities.int?.score || abilities.int || 10) - 10) / 2),
            proficient: abilities.int?.proficient || false
          },
          wisdom: {
            score: abilities.wis?.total || abilities.wis?.score || abilities.wis || 10,
            modifier: Math.floor(((abilities.wis?.total || abilities.wis?.score || abilities.wis || 10) - 10) / 2),
            proficient: abilities.wis?.proficient || false
          },
          charisma: {
            score: abilities.cha?.total || abilities.cha?.score || abilities.cha || 10,
            modifier: Math.floor(((abilities.cha?.total || abilities.cha?.score || abilities.cha || 10) - 10) / 2),
            proficient: abilities.cha?.proficient || false
          }
        };
      }

      const formattedAbilities = { ...defaultAbilities };
      Object.keys(defaultAbilities).forEach(key => {
        if (abilities[key]) {
          const score = abilities[key].score || abilities[key].total || abilities[key] || 10;
          formattedAbilities[key] = {
            score: score,
            modifier: Math.floor((score - 10) / 2),
            proficient: abilities[key].proficient || false
          };
        }
      });

      return formattedAbilities;
    };

    const calculateInitialHP = (characterData: any, formattedAbilities: any) => {
      if (!characterData.class_data) return 1;
      const conModifier = formattedAbilities.constitution.modifier;
      if (characterData.hit_point_type === 'fixed') {
        return (characterData.class_data.hit_die || 8) + conModifier;
      }
      return characterData.hit_points?.max || ((characterData.class_data.hit_die || 8) + conModifier);
    };

    const calculateArmorClass = (characterData: any, formattedAbilities: any) => {
      const dexModifier = formattedAbilities.dexterity.modifier;
      let baseAC = 10 + dexModifier;
      
      let equippedArmor = null;
      
      if (characterData.equipment?.starting_equipment) {
        equippedArmor = characterData.equipment.starting_equipment.find((item: any) => 
          item.category === 'armor' && item.equipped
        );
      }
      
      if (!equippedArmor && characterData.equipment?.inventory) {
        equippedArmor = characterData.equipment.inventory.find((item: any) => 
          item.category === 'armor' && item.equipped
        );
      }
      
      if (equippedArmor && equippedArmor.ac) {
        if (equippedArmor.dex_bonus !== false) {
          const maxDexBonus = equippedArmor.max_dex_bonus || 999;
          baseAC = equippedArmor.ac + Math.min(dexModifier, maxDexBonus);
        } else {
          baseAC = equippedArmor.ac;
        }
      }
      
      return baseAC;
    };

    const calculateSpeed = (characterData: any) => {
      let speed = 30;
      
      if (characterData.species?.speed) {
        speed = characterData.species.speed;
      } else if (characterData.species_data?.speed) {
        if (typeof characterData.species_data.speed === 'object' && characterData.species_data.speed.walk) {
          speed = characterData.species_data.speed.walk;
        } else {
          speed = characterData.species_data.speed;
        }
      } else if (characterData.species?.apiData?.speed) {
        if (typeof characterData.species.apiData.speed === 'object' && characterData.species.apiData.speed.walk) {
          speed = characterData.species.apiData.speed.walk;
        } else {
          speed = characterData.species.apiData.speed;
        }
      }
      
      return speed;
    };

    const formattedAbilities = formatAbilities(characterData.abilities);
    const calculatedSpeed = calculateSpeed(characterData);
    const maxHP = characterData.hit_points?.max || calculateInitialHP(characterData, formattedAbilities);
    const currentHP = characterData.hit_points?.current !== undefined ? characterData.hit_points.current : maxHP;
    const calculatedAC = calculateArmorClass(characterData, formattedAbilities);

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
      currentHP: currentHP,
      maxHP: maxHP,
      tempHP: characterData.hit_points?.temporary || 0,
      hit_points: {
        current: currentHP,
        max: maxHP,
        temporary: characterData.hit_points?.temporary || 0,
        hit_dice_remaining: characterData.hit_points?.hit_dice_remaining || characterData.level
      },
      hit_point_type: characterData.hit_point_type,
      proficiencyBonus: Math.ceil(characterData.level / 4) + 1,
      abilities: formattedAbilities,
      equipment: characterData.equipment,
      spells: characterData.spells || [],
      spellSlots: characterData.spell_slots || {},
      armorClass: calculatedAC,
      initiative: formattedAbilities.dexterity.modifier,
      speed: calculatedSpeed,
      inspiration: characterData.abilities?.inspiration || false
    };
    
    return formattedCharacter;
  };

  useEffect(() => {
    const loadCharacter = async () => {
      if (!id) {
        navigate('/player');
        return;
      }
      
      try {
        const characterData = await getCharacter(id);
        
        if (characterData) {
          const formattedCharacter = formatCharacterData(characterData);
          setCharacter(formattedCharacter);
        } else {
          toast({
            title: t('error'),
            description: t('character_not_found'),
            variant: "destructive",
          });
          navigate('/player');
        }
      } catch (error) {
        console.error('Error loading character:', error);
        toast({
          title: t('error'),
          description: t('failed_to_load'),
          variant: "destructive",
        });
        navigate('/player');
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, [id, getCharacter, navigate, toast, t]);

  const handleBack = () => {
    navigate('/player');
  };

  const handleOverflowAction = async (action: string) => {
    switch (action) {
      case 'edit':
        navigate(`/character-creation?edit=${character?.id}`);
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
          <p className="text-white">{t('loading_character')}</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-[#4a4a4a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">{t('character_not_found')}</p>
          <Button onClick={handleBack} variant="outline">
            {t('go_back')}
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
            <DropdownMenuItem onClick={() => handleOverflowAction('edit')}>
              {t('edit_character')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOverflowAction('export')}>
              {t('export_pdf')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleOverflowAction('delete')}
              className="text-red-600"
            >
              {t('delete_character')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 space-y-4">
        <RestButtons character={character} setCharacter={handleCharacterUpdate} />
        <CharacterSummary character={character} setCharacter={handleCharacterUpdate} />
        <AbilitiesSection character={character} setCharacter={handleCharacterUpdate} />
        <SavingThrowsSkills character={character} />
        <PassiveScoresDefenses character={character} setCharacter={handleCharacterUpdate} />
        <HitPointsHitDice character={character} setCharacter={handleCharacterUpdate} />
        <AttacksSpellcasting character={character} />
        <EquipmentSection character={character} setCharacter={handleCharacterUpdate} />
        <SpellsSection character={character} setCharacter={handleCharacterUpdate} />
        <FeaturesTraits character={character} />
        <BackgroundAppearance character={character} />
        <CurrencyNotes character={character} setCharacter={handleCharacterUpdate} />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default CharacterSheet;
