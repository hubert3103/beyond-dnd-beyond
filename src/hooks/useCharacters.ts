

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
  spell_slots?: any;
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
      
      const mappedData = (data || []).map(character => ({
        ...character,
        spell_slots: (character as any).spell_slots || {}
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
        spell_slots: characterData.spellSlots || {},
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
      // Build the update object more carefully
      const updatePayload: any = {};
      
      // Handle each field explicitly
      if (updates.level !== undefined) {
        updatePayload.level = updates.level;
      }
      
      if (updates.abilities !== undefined) {
        updatePayload.abilities = updates.abilities;
      }
      
      if (updates.hit_points !== undefined) {
        updatePayload.hit_points = updates.hit_points;
      }
      
      if (updates.spells !== undefined) {
        updatePayload.spells = updates.spells;
      }
      
      // Handle spell slots with both possible property names
      if (updates.spell_slots !== undefined) {
        updatePayload.spell_slots = updates.spell_slots;
      } else if ((updates as any).spellSlots !== undefined) {
        updatePayload.spell_slots = (updates as any).spellSlots;
      }
      
      if (updates.equipment !== undefined) {
        updatePayload.equipment = updates.equipment;
      }

      // Always update the timestamp
      updatePayload.updated_at = new Date().toISOString();
      
      // Perform the database update
      const { data, error } = await supabase
        .from('characters')
        .update(updatePayload)
        .eq('id', characterId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state immediately with the returned data
      setCharacters(prev => prev.map(char => 
        char.id === characterId ? { ...char, ...data } : char
      ));
      
      // Show success toast
      toast({
        title: "Success",
        description: "Character updated successfully!",
      });
      
      return data;
    } catch (error) {
      console.error('Error in updateCharacter:', error);
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

