
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
      // Ensure we're updating the database with the correct field names
      const dbUpdates: any = { ...updates };
      
      // Handle inspiration field specifically
      if ('inspiration' in updates) {
        // Store inspiration as part of the character data
        dbUpdates.abilities = {
          ...updates.abilities,
          inspiration: updates.inspiration
        };
        delete dbUpdates.inspiration;
      }

      const { error } = await supabase
        .from('characters')
        .update(dbUpdates)
        .eq('id', characterId);

      if (error) throw error;

      console.log('Character updated successfully');
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
