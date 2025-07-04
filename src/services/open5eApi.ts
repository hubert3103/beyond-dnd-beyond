interface Open5eResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface Open5eSpell {
  slug: string;
  name: string;
  level: string;
  school: string;
  casting_time: string;
  range: string;
  components: string;
  material?: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  desc: string;
  higher_level?: string;
  damage?: {
    damage_type: string;
  };
  save?: string;
  attack_type?: string;
  document__slug: string;
  classes: Array<{ name: string }>;
}

interface Open5eEquipment {
  slug: string;
  name: string;
  type: string;
  rarity: string;
  requires_attunement: boolean;
  cost?: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  desc: string;
  document__slug: string;
  // Add armor-specific properties
  ac?: number;
  ac_base?: number;
  ac_add_dex?: boolean;
  ac_cap_dex?: number;
  dex_bonus?: boolean;
  max_dex_bonus?: number;
  // Add weapon-specific properties
  damage_dice?: string;
  damage_type?: string;
  category?: string;
  properties?: string[];
}

interface Open5eWeapon {
  slug: string;
  name: string;
  type: string;
  category: string;
  cost?: {
    quantity: number;
    unit: string;
  };
  damage?: {
    damage_dice: string;
    damage_type: string;
  };
  weight?: number;
  properties?: string[];
  desc: string;
  document__slug: string;
}

interface Open5eArmor {
  slug: string;
  name: string;
  type: string;
  category: string;
  cost?: {
    quantity: number;
    unit: string;
  };
  ac_base?: number;
  ac_add_dex?: boolean;
  ac_cap_dex?: number;
  weight?: number;
  stealth_disadvantage?: boolean;
  desc: string;
  document__slug: string;
}

interface Open5eRace {
  slug: string;
  name: string;
  desc: string;
  asi: Array<{
    attributes: string[];
    value: number;
  }>;
  age: string;
  alignment: string;
  size: string;
  speed: {
    walk: number;
  };
  languages: string;
  proficiencies: string;
  traits: string;
  document__slug: string;
}

interface Open5eClass {
  slug: string;
  name: string;
  desc: string;
  hit_die: number;
  prof_armor: string;
  prof_weapons: string;
  prof_tools: string;
  prof_saving_throws: string;
  prof_skills: string;
  equipment: string;
  spellcasting_ability?: string;
  subtypes_name?: string;
  document__slug: string;
}

interface Open5eBackground {
  slug: string;
  name: string;
  desc: string;
  skill_proficiencies: string;
  languages: string;
  equipment: string;
  feature: string;
  feature_desc: string;
  document__slug: string;
}

class Open5eApiService {
  private baseUrl = 'https://api.open5e.com';
  private cache: Map<string, any> = new Map();

  async fetchWithCache<T>(endpoint: string): Promise<T[]> {
    if (this.cache.has(endpoint)) {
      return this.cache.get(endpoint);
    }

    try {
      const allResults: T[] = [];
      let url = `${this.baseUrl}${endpoint}?limit=1000`;
      
      while (url) {
        console.log('Fetching:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
        }
        
        const data: Open5eResponse<T> = await response.json();
        allResults.push(...data.results);
        url = data.next;
      }

      console.log(`Fetched ${allResults.length} items from ${endpoint}`);
      this.cache.set(endpoint, allResults);
      return allResults;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async fetchSpells(): Promise<Open5eSpell[]> {
    const allSpells = await this.fetchWithCache<Open5eSpell>('/spells');
    
    // Deduplicate spells by name, keeping the first occurrence
    const uniqueSpells = allSpells.reduce((acc: Open5eSpell[], spell: Open5eSpell) => {
      const existingSpell = acc.find(s => s.name.toLowerCase() === spell.name.toLowerCase());
      if (!existingSpell) {
        acc.push(spell);
      }
      return acc;
    }, []);
    
    console.log(`Deduplicated spells: ${allSpells.length} → ${uniqueSpells.length}`);
    return uniqueSpells;
  }

  async fetchEquipment(): Promise<Open5eEquipment[]> {
    try {
      // Try to fetch from multiple endpoints and combine results
      const [magicItems, weapons, armor] = await Promise.allSettled([
        this.fetchWithCache<Open5eEquipment>('/magicitems'),
        this.fetchWithCache<Open5eWeapon>('/weapons'),
        this.fetchWithCache<Open5eArmor>('/armor')
      ]);

      let combinedEquipment: Open5eEquipment[] = [];

      // Add magic items
      if (magicItems.status === 'fulfilled') {
        combinedEquipment.push(...magicItems.value);
      }

      // Add weapons (convert to equipment format with proper properties)
      if (weapons.status === 'fulfilled') {
        const weaponEquipment: Open5eEquipment[] = weapons.value.map(weapon => ({
          slug: weapon.slug,
          name: weapon.name,
          type: 'weapon',
          rarity: 'common',
          requires_attunement: false,
          cost: weapon.cost,
          weight: weapon.weight,
          desc: weapon.desc,
          document__slug: weapon.document__slug,
          category: weapon.category,
          damage_dice: weapon.damage?.damage_dice,
          damage_type: weapon.damage?.damage_type,
          properties: weapon.properties
        }));
        combinedEquipment.push(...weaponEquipment);
      }

      // Add armor (convert to equipment format with proper AC properties)
      if (armor.status === 'fulfilled') {
        console.log('=== ARMOR API PROCESSING ===');
        console.log('Raw armor data sample:', armor.value.slice(0, 3));
        
        const armorEquipment: Open5eEquipment[] = armor.value.map(armorItem => {
          console.log('Processing armor item:', {
            name: armorItem.name,
            type: armorItem.type,
            category: armorItem.category,
            ac_base: armorItem.ac_base,
            weight: armorItem.weight,
            ac_add_dex: armorItem.ac_add_dex,
            ac_cap_dex: armorItem.ac_cap_dex
          });
          
          const mappedArmor = {
            slug: armorItem.slug,
            name: armorItem.name,
            type: armorItem.type || 'armor',
            rarity: 'common',
            requires_attunement: false,
            cost: armorItem.cost,
            weight: armorItem.weight || 0, // Ensure weight is preserved
            desc: armorItem.desc,
            document__slug: armorItem.document__slug,
            // Preserve armor-specific properties with better mapping
            ac: armorItem.ac_base || 10, // Ensure AC is always set
            ac_base: armorItem.ac_base || 10,
            dex_bonus: armorItem.ac_add_dex !== false, // Convert to boolean, default true
            max_dex_bonus: armorItem.ac_cap_dex || 999, // Default to no limit
            category: 'armor' // Ensure all armor has 'armor' category
          };
          
          console.log('Mapped armor result:', mappedArmor);
          return mappedArmor;
        });
        combinedEquipment.push(...armorEquipment);
        console.log('=== END ARMOR PROCESSING ===');
      }

      // Deduplicate equipment by name, keeping the first occurrence
      const uniqueEquipment = combinedEquipment.reduce((acc: Open5eEquipment[], item: Open5eEquipment) => {
        const existingItem = acc.find(e => e.name.toLowerCase() === item.name.toLowerCase());
        if (!existingItem) {
          acc.push(item);
        }
        return acc;
      }, []);

      console.log(`Combined equipment: ${combinedEquipment.length} items`);
      console.log(`Deduplicated equipment: ${combinedEquipment.length} → ${uniqueEquipment.length}`);
      const sampleArmor = uniqueEquipment.find(item => item.type.includes('armor'));
      console.log('Sample armor item after processing:', sampleArmor);
      this.cache.set('/equipment-combined', uniqueEquipment);
      return uniqueEquipment;
    } catch (error) {
      console.warn('Equipment fetch failed, returning empty array:', error);
      return [];
    }
  }

  async fetchWeapons(): Promise<Open5eWeapon[]> {
    return this.fetchWithCache<Open5eWeapon>('/weapons');
  }

  async fetchArmor(): Promise<Open5eArmor[]> {
    return this.fetchWithCache<Open5eArmor>('/armor');
  }

  async fetchRaces(): Promise<Open5eRace[]> {
    return this.fetchWithCache<Open5eRace>('/races');
  }

  async fetchClasses(): Promise<Open5eClass[]> {
    return this.fetchWithCache<Open5eClass>('/classes');
  }

  async fetchBackgrounds(): Promise<Open5eBackground[]> {
    return this.fetchWithCache<Open5eBackground>('/backgrounds');
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Filter by source
  filterBySource<T extends { document__slug: string }>(items: T[], sources: string[]): T[] {
    return items.filter(item => sources.includes(item.document__slug));
  }

  // Get available sources from data
  getAvailableSources<T extends { document__slug: string }>(items: T[]): string[] {
    const sources = new Set(items.map(item => item.document__slug));
    return Array.from(sources);
  }
}

export const open5eApi = new Open5eApiService();
export type {
  Open5eSpell,
  Open5eEquipment,
  Open5eWeapon,
  Open5eArmor,
  Open5eRace,
  Open5eClass,
  Open5eBackground
};
