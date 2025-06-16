
import { useState, useEffect } from 'react';
import { open5eApi, Open5eSpell, Open5eEquipment, Open5eRace, Open5eClass, Open5eBackground } from '../services/open5eApi';
import { supabase } from '@/integrations/supabase/client';

interface Open5eData {
  spells: Open5eSpell[];
  equipment: Open5eEquipment[];
  races: Open5eRace[];
  classes: Open5eClass[];
  backgrounds: Open5eBackground[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  populateData: (type: string) => Promise<void>;
}

export const useOpen5eData = (): Open5eData => {
  const [data, setData] = useState<Omit<Open5eData, 'refresh' | 'populateData'>>({
    spells: [],
    equipment: [],
    races: [],
    classes: [],
    backgrounds: [],
    isLoading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Starting to fetch Open5e data from local database...');
      
      // Fetch all data in parallel since it's now from our local database
      const [spells, equipment, races, classes, backgrounds] = await Promise.all([
        open5eApi.fetchSpells(),
        open5eApi.fetchEquipment(),
        open5eApi.fetchRaces(),
        open5eApi.fetchClasses(),
        open5eApi.fetchBackgrounds(),
      ]);

      console.log('Fetch results:', {
        spells: spells.length,
        equipment: equipment.length,
        races: races.length,
        classes: classes.length,
        backgrounds: backgrounds.length
      });

      setData({
        spells,
        equipment,
        races,
        classes,
        backgrounds,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch Open5e data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load character data. Please try again.',
      }));
    }
  };

  const populateData = async (type: string) => {
    try {
      console.log(`Starting data population for: ${type}`);
      
      const { data: functionData, error } = await supabase.functions.invoke('populate-open5e-data', {
        body: { type }
      });

      if (error) {
        console.error('Error calling populate function:', error);
        throw error;
      }

      console.log('Population result:', functionData);
      
      // Refresh data after population
      await refresh();
    } catch (error) {
      console.error('Error populating data:', error);
      throw error;
    }
  };

  const refresh = async () => {
    open5eApi.clearCache();
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...data,
    refresh,
    populateData,
  };
};
