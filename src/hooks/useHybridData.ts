
import { useState, useEffect } from 'react';
import { hybridDataService } from '../services/hybridDataService';
import { Open5eSpell, Open5eEquipment, Open5eRace, Open5eClass, Open5eBackground } from '../services/open5eApi';

interface HybridData {
  spells: Open5eSpell[];
  equipment: Open5eEquipment[];
  races: Open5eRace[];
  classes: Open5eClass[];
  backgrounds: Open5eBackground[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useHybridData = (): HybridData => {
  const [data, setData] = useState<Omit<HybridData, 'refresh'>>({
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
      
      console.log('Starting to fetch hybrid data...');
      
      // Fetch each resource individually to better handle failures
      const [spells, races, classes, backgrounds, equipment] = await Promise.allSettled([
        hybridDataService.fetchSpells(),
        hybridDataService.fetchRaces(),
        hybridDataService.fetchClasses(),
        hybridDataService.fetchBackgrounds(),
        hybridDataService.fetchEquipment(),
      ]);

      console.log('Hybrid fetch results:', {
        spells: spells.status === 'fulfilled' ? spells.value.length : 'failed',
        races: races.status === 'fulfilled' ? races.value.length : 'failed',
        classes: classes.status === 'fulfilled' ? classes.value.length : 'failed',
        backgrounds: backgrounds.status === 'fulfilled' ? backgrounds.value.length : 'failed',
        equipment: equipment.status === 'fulfilled' ? equipment.value.length : 'failed'
      });

      setData({
        spells: spells.status === 'fulfilled' ? spells.value : [],
        equipment: equipment.status === 'fulfilled' ? equipment.value : [],
        races: races.status === 'fulfilled' ? races.value : [],
        classes: classes.status === 'fulfilled' ? classes.value : [],
        backgrounds: backgrounds.status === 'fulfilled' ? backgrounds.value : [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch hybrid data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load character data. Please try again.',
      }));
    }
  };

  const refresh = async () => {
    hybridDataService.clearCache();
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
