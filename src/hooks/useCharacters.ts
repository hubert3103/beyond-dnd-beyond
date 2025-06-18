import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Character {
  id: string;
  name: string;
  level: number;
  species_name: string | null;
  species_data: any;
  class_name: string | null;
  class_data: any;
  subclass_name: string | null;
  background_name: string | null;
  background_data: any;
  abilities: any;
  hit_points: any;
  equipment: any;
  spells: any;
  spell_slots?: any; // Make this optional since it might not exist in all records
  sources: any;
  advancement_type: string | null;
  hit_point_type: string | null;
  created_at: string;
  updated_at: string;
}

export const useCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCharacters = async () => {
    if (!user) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure spell_slots is always defined
      const mappedData = (data || []).map(character => ({
        ...character,
        spell_slots: (character as any).spell_slots || {} // Use type assertion to access spell_slots
      }));
      
      setCharacters(mappedData);
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast({
        title: "Error",
        description: "Failed to fetch characters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCharacter = async (characterData: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const characterToSave = {
        user_id: user.id,
        name: characterData.name || 'Unnamed Character',
        level: 1,
        species_name: characterData.species?.name || null,
        species_data: characterData.species || null,
        class_name: characterData.class?.name || null,
        class_data: characterData.class || null,
        subclass_name: characterData.class?.subclass || null,
        background_name: characterData.background?.name || null,
        background_data: characterData.background || null,
        abilities: characterData.abilities,
        hit_points: characterData.hitPoints || null,
        equipment: characterData.equipment || null,
        spells: characterData.spells || null,
        spell_slots: characterData.spellSlots || {}, // Include spell_slots in new characters
        sources: characterData.sources || null,
        advancement_type: characterData.advancementType || null,
        hit_point_type: characterData.hitPointType || null,
      };

      const { data, error } = await supabase
        .from('characters')
        .insert([characterToSave])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Character created successfully!",
      });

      await fetchCharacters();
      return data;
    } catch (error) {
      console.error('Error saving character:', error);
      toast({
        title: "Error",
        description: "Failed to create character",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCharacter = async (characterId: string, updates: Partial<Character>) => {
    try {
      // Prepare the database updates with explicit mapping
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      
      // Always update these fields if they exist in updates
      if ('level' in updates) {
        dbUpdates.level = updates.level;
        console.log('Updating level to:', updates.level);
      }
      
      if ('abilities' in updates && updates.abilities) {
        dbUpdates.abilities = updates.abilities;
        console.log('Updating abilities to:', JSON.stringify(updates.abilities, null, 2));
      }
      
      if ('hit_points' in updates && updates.hit_points) {
        dbUpdates.hit_points = updates.hit_points;
        console.log('Updating hit_points to:', JSON.stringify(updates.hit_points, null, 2));
      }
      
      if ('equipment' in updates && updates.equipment) {
        dbUpdates.equipment = updates.equipment;
      }
      
      if ('spells' in updates) {
        dbUpdates.spells = updates.spells;
        console.log('Updating spells to:', updates.spells?.length, 'spells');
      }
      
      // Handle both spell_slots and spellSlots property names
      if ('spell_slots' in updates || 'spellSlots' in updates) {
        const spellSlots = updates.spell_slots || (updates as any).spellSlots;
        dbUpdates.spell_slots = spellSlots;
        console.log('Updating spell_slots to:', JSON.stringify(spellSlots, null, 2));
      }

      // Special handling for inspiration - make sure it's included in abilities
      if ('inspiration' in updates) {
        if (!dbUpdates.abilities) {
          dbUpdates.abilities = updates.abilities || {};
        }
        dbUpdates.abilities.inspiration = updates.inspiration;
        console.log('Updating inspiration to:', updates.inspiration);
      }

      console.log('Final database update payload:', JSON.stringify(dbUpdates, null, 2));

      const { data, error } = await supabase
        .from('characters')
        .update(dbUpdates)
        .eq('id', characterId)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Database update successful:', data);

      // Update local state to reflect the changes
      setCharacters(prev => prev.map(char => 
        char.id === characterId 
          ? { ...char, ...dbUpdates }
          : char
      ));
    } catch (error) {
      console.error('Error updating character:', error);
      toast({
        title: "Error",
        description: "Failed to update character",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCharacter = async (characterId: string) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Character deleted successfully",
      });

      await fetchCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive",
      });
    }
  };

  const getCharacter = async (characterId: string): Promise<Character | null> => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single();

      if (error) throw error;
      
      // Ensure spell_slots exists in the returned character using type assertion
      return {
        ...data,
        spell_slots: (data as any).spell_slots || {}
      };
    } catch (error) {
      console.error('Error fetching character:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [user]);

  return {
    characters,
    loading,
    saveCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacter,
    refreshCharacters: fetchCharacters,
  };
};
