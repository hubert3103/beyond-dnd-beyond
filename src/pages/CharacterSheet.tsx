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

const CharacterSheet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCharacter, deleteCharacter, updateCharacter } = useCharacters();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to handle character updates and sync with database
  const handleCharacterUpdate = async (updatedCharacter: any) => {
    setCharacter(updatedCharacter);
    
    // Update the database with the updated character data
    if (id) {
      try {
        const updateData: any = {};
        
        // Always update hit points if they exist
        if (updatedCharacter.hit_points) {
          updateData.hit_points = updatedCharacter.hit_points;
        }
        
        // Update equipment if it exists
        if (updatedCharacter.equipment) {
          updateData.equipment = updatedCharacter.equipment;
        }
        
        // Update abilities if they exist
        if (updatedCharacter.abilities) {
          updateData.abilities = updatedCharacter.abilities;
        }
        
        // Update spells if they exist
        if (updatedCharacter.spells) {
          updateData.spells = updatedCharacter.spells;
        }
        
        // Update spell slots if they exist
        if (updatedCharacter.spellSlots) {
          updateData.spell_slots = updatedCharacter.spellSlots;
        }

        // Update level if it changed
        if (updatedCharacter.level !== character?.level) {
          updateData.level = updatedCharacter.level;
        }

        // Handle inspiration separately - it's stored in abilities
        if ('inspiration' in updatedCharacter) {
          updateData.abilities = {
            ...updatedCharacter.abilities,
            inspiration: updatedCharacter.inspiration
          };
        }
        
        console.log('Updating character in database with data:', updateData);
        
        await updateCharacter(id, updateData);
        console.log('Character updated successfully in database');
      } catch (error) {
        console.error('Failed to update character in database:', error);
        toast({
          title: "Error",
          description: "Failed to save character changes",
          variant: "destructive",
        });
      }
    }
  };

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
          
          // Helper function to ensure proper abilities structure
          const formatAbilities = (abilities: any) => {
            // Default abilities structure
            const defaultAbilities = {
              strength: { score: 10, modifier: 0, proficient: false },
              dexterity: { score: 10, modifier: 0, proficient: false },
              constitution: { score: 10, modifier: 0, proficient: false },
              intelligence: { score: 10, modifier: 0, proficient: false },
              wisdom: { score: 10, modifier: 0, proficient: false },
              charisma: { score: 10, modifier: 0, proficient: false }
            };

            if (!abilities) return defaultAbilities;

            // If abilities are stored in different format (like str, dex, con, int, wis, cha)
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

            // If abilities are already in the correct format, ensure all properties exist
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

          // Helper functions to calculate derived stats
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
            
            console.log('Calculating AC with equipment:', characterData.equipment);
            
            // Check for armor in equipment - look in both starting_equipment and inventory
            let equippedArmor = null;
            
            // Check starting equipment first
            if (characterData.equipment?.starting_equipment) {
              equippedArmor = characterData.equipment.starting_equipment.find((item: any) => 
                item.category === 'armor' && item.equipped
              );
            }
            
            // If no equipped armor found in starting equipment, check inventory
            if (!equippedArmor && characterData.equipment?.inventory) {
              equippedArmor = characterData.equipment.inventory.find((item: any) => 
                item.category === 'armor' && item.equipped
              );
            }
            
            console.log('Found equipped armor:', equippedArmor);
            
            if (equippedArmor && equippedArmor.ac) {
              if (equippedArmor.dex_bonus !== false) {
                const maxDexBonus = equippedArmor.max_dex_bonus || 999;
                baseAC = equippedArmor.ac + Math.min(dexModifier, maxDexBonus);
              } else {
                baseAC = equippedArmor.ac;
              }
              console.log('Calculated AC with armor:', baseAC);
            }
            
            return baseAC;
          };

          const calculateSpeed = (characterData: any) => {
            console.log('Calculating speed for character:', characterData);
            
            // Check multiple possible locations for speed data
            let speed = 30; // Default speed
            
            // Check species data first
            if (characterData.species?.speed) {
              console.log('Found speed in species:', characterData.species.speed);
              speed = characterData.species.speed;
            } else if (characterData.species_data?.speed) {
              console.log('Found speed in species_data:', characterData.species_data.speed);
              if (typeof characterData.species_data.speed === 'object' && characterData.species_data.speed.walk) {
                speed = characterData.species_data.speed.walk;
              } else {
                speed = characterData.species_data.speed;
              }
            } else if (characterData.species?.apiData?.speed) {
              console.log('Found speed in species apiData:', characterData.species.apiData.speed);
              if (typeof characterData.species.apiData.speed === 'object' && characterData.species.apiData.speed.walk) {
                speed = characterData.species.apiData.speed.walk;
              } else {
                speed = characterData.species.apiData.speed;
              }
            }
            
            console.log('Final calculated speed:', speed);
            return speed;
          };

          // Format abilities first
          const formattedAbilities = formatAbilities(characterData.abilities);
          console.log('Formatted abilities:', formattedAbilities);

          // Calculate speed
          const calculatedSpeed = calculateSpeed(characterData);
          console.log('Calculated speed:', calculatedSpeed);

          // Calculate max HP if not stored
          const maxHP = characterData.hit_points?.max || calculateInitialHP(characterData, formattedAbilities);
          const currentHP = characterData.hit_points?.current !== undefined ? characterData.hit_points.current : maxHP;

          // Calculate armor class with equipment
          const calculatedAC = calculateArmorClass(characterData, formattedAbilities);
          console.log('Final calculated AC:', calculatedAC);

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
            inspiration: characterData.abilities?.inspiration || false // Add inspiration field
          };
          
          console.log('Final formatted character with spell slots:', formattedCharacter.spellSlots);
          setCharacter(formattedCharacter);
          console.log('Character formatted and set:', formattedCharacter);
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

    loadCharacter();
  }, [id, getCharacter, navigate, toast]);

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
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default CharacterSheet;
