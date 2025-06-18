

import { useState, useEffect } from 'react';
import { open5eApi, Open5eSpell, Open5eEquipment, Open5eRace, Open5eClass, Open5eBackground } from '../services/open5eApi';

interface Open5eData {
  spells: Open5eSpell[];
  equipment: Open5eEquipment[];
  races: Open5eRace[];
  classes: Open5eClass[];
  backgrounds: Open5eBackground[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOpen5eData = (): Open5eData => {
  const [data, setData] = useState<Omit<Open5eData, 'refresh'>>({
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
      
      // Fetch each resource individually to better handle failures
      const [spells, races, classes, backgrounds] = await Promise.allSettled([
        open5eApi.fetchSpells(),
        open5eApi.fetchRaces(),
        open5eApi.fetchClasses(),
        open5eApi.fetchBackgrounds(),
      ]);

      // Try equipment separately since it's failing
      let equipment: Open5eEquipment[] = [];
      try {
        equipment = await open5eApi.fetchEquipment();
      } catch (equipmentError) {
        console.warn('Equipment fetch failed, continuing without equipment data:', equipmentError);
      }

      setData({
        spells: spells.status === 'fulfilled' ? spells.value : [],
        equipment,
        races: races.status === 'fulfilled' ? races.value : [],
        classes: classes.status === 'fulfilled' ? classes.value : [],
        backgrounds: backgrounds.status === 'fulfilled' ? backgrounds.value : [],
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
  };
};

