import { supabase } from '@/integrations/supabase/client';

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
  private cache: Map<string, any> = new Map();

  // Transform database spell to API format
  private transformSpellFromDb(dbSpell: any): Open5eSpell {
    return {
      slug: dbSpell.slug,
      name: dbSpell.name,
      level: dbSpell.level,
      school: dbSpell.school,
      casting_time: dbSpell.casting_time,
      range: dbSpell.range_value,
      components: dbSpell.components,
      material: dbSpell.material,
      duration: dbSpell.duration,
      concentration: dbSpell.concentration,
      ritual: dbSpell.ritual,
      desc: dbSpell.description,
      higher_level: dbSpell.higher_level,
      damage: dbSpell.damage_type ? { damage_type: dbSpell.damage_type } : undefined,
      save: dbSpell.save_type,
      attack_type: dbSpell.attack_type,
      document__slug: dbSpell.document_slug,
      classes: Array.isArray(dbSpell.classes) ? dbSpell.classes : []
    };
  }

  // Transform database equipment to API format
  private transformEquipmentFromDb(dbEquipment: any): Open5eEquipment {
    return {
      slug: dbEquipment.slug,
      name: dbEquipment.name,
      type: dbEquipment.type,
      rarity: dbEquipment.rarity,
      requires_attunement: dbEquipment.requires_attunement,
      cost: dbEquipment.cost_quantity && dbEquipment.cost_unit ? {
        quantity: dbEquipment.cost_quantity,
        unit: dbEquipment.cost_unit
      } : undefined,
      weight: dbEquipment.weight,
      desc: dbEquipment.description,
      document__slug: dbEquipment.document_slug,
      ac: dbEquipment.ac,
      ac_base: dbEquipment.ac_base,
      ac_add_dex: dbEquipment.ac_add_dex,
      ac_cap_dex: dbEquipment.ac_cap_dex,
      dex_bonus: dbEquipment.dex_bonus,
      max_dex_bonus: dbEquipment.max_dex_bonus,
      damage_dice: dbEquipment.damage_dice,
      damage_type: dbEquipment.damage_type,
      category: dbEquipment.category,
      properties: Array.isArray(dbEquipment.properties) ? dbEquipment.properties : []
    };
  }

  // Transform database race to API format
  private transformRaceFromDb(dbRace: any): Open5eRace {
    return {
      slug: dbRace.slug,
      name: dbRace.name,
      desc: dbRace.description,
      asi: Array.isArray(dbRace.asi) ? dbRace.asi : [],
      age: dbRace.age,
      alignment: dbRace.alignment,
      size: dbRace.size,
      speed: typeof dbRace.speed === 'object' ? dbRace.speed : { walk: 30 },
      languages: dbRace.languages,
      proficiencies: dbRace.proficiencies || '',
      traits: dbRace.traits || '',
      document__slug: dbRace.document_slug
    };
  }

  // Transform database class to API format
  private transformClassFromDb(dbClass: any): Open5eClass {
    return {
      slug: dbClass.slug,
      name: dbClass.name,
      desc: dbClass.description,
      hit_die: dbClass.hit_die,
      prof_armor: dbClass.prof_armor || '',
      prof_weapons: dbClass.prof_weapons || '',
      prof_tools: dbClass.prof_tools || '',
      prof_saving_throws: dbClass.prof_saving_throws || '',
      prof_skills: dbClass.prof_skills || '',
      equipment: dbClass.equipment || '',
      spellcasting_ability: dbClass.spellcasting_ability,
      subtypes_name: dbClass.subtypes_name,
      document__slug: dbClass.document_slug
    };
  }

  // Transform database background to API format
  private transformBackgroundFromDb(dbBackground: any): Open5eBackground {
    return {
      slug: dbBackground.slug,
      name: dbBackground.name,
      desc: dbBackground.description,
      skill_proficiencies: dbBackground.skill_proficiencies || '',
      languages: dbBackground.languages || '',
      equipment: dbBackground.equipment || '',
      feature: dbBackground.feature || '',
      feature_desc: dbBackground.feature_desc || '',
      document__slug: dbBackground.document_slug
    };
  }

  async fetchSpells(): Promise<Open5eSpell[]> {
    const cacheKey = 'spells';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log('Fetching spells from local database...');
      const { data, error } = await supabase
        .from('open5e_spells')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching spells from database:', error);
        throw error;
      }

      const transformedSpells = (data || []).map(spell => this.transformSpellFromDb(spell));
      
      // Deduplicate spells by name, keeping the first occurrence
      const uniqueSpells = transformedSpells.reduce((acc: Open5eSpell[], spell: Open5eSpell) => {
        const existingSpell = acc.find(s => s.name.toLowerCase() === spell.name.toLowerCase());
        if (!existingSpell) {
          acc.push(spell);
        }
        return acc;
      }, []);

      console.log(`Fetched ${transformedSpells.length} spells from database, deduplicated to ${uniqueSpells.length}`);
      this.cache.set(cacheKey, uniqueSpells);
      return uniqueSpells;
    } catch (error) {
      console.error('Error fetching spells:', error);
      return [];
    }
  }

  async fetchEquipment(): Promise<Open5eEquipment[]> {
    const cacheKey = 'equipment';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log('Fetching equipment from local database...');
      const { data, error } = await supabase
        .from('open5e_equipment')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching equipment from database:', error);
        throw error;
      }

      const transformedEquipment = (data || []).map(item => this.transformEquipmentFromDb(item));
      
      console.log(`Fetched ${transformedEquipment.length} equipment items from database`);
      this.cache.set(cacheKey, transformedEquipment);
      return transformedEquipment;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }
  }

  async fetchWeapons(): Promise<Open5eWeapon[]> {
    // Weapons are stored in the equipment table with type 'weapon'
    const equipment = await this.fetchEquipment();
    return equipment
      .filter(item => item.type === 'weapon')
      .map(item => ({
        slug: item.slug,
        name: item.name,
        type: item.type,
        category: item.category || 'simple',
        cost: item.cost,
        damage: item.damage_dice && item.damage_type ? {
          damage_dice: item.damage_dice,
          damage_type: item.damage_type
        } : undefined,
        weight: item.weight,
        properties: item.properties || [],
        desc: item.desc,
        document__slug: item.document__slug
      }));
  }

  async fetchArmor(): Promise<Open5eArmor[]> {
    // Armor is stored in the equipment table with type 'armor'
    const equipment = await this.fetchEquipment();
    return equipment
      .filter(item => item.type === 'armor')
      .map(item => ({
        slug: item.slug,
        name: item.name,
        type: item.type,
        category: 'armor',
        cost: item.cost,
        ac_base: item.ac_base,
        ac_add_dex: item.ac_add_dex,
        ac_cap_dex: item.ac_cap_dex,
        weight: item.weight,
        stealth_disadvantage: false, // Not stored in our simplified schema
        desc: item.desc,
        document__slug: item.document__slug
      }));
  }

  async fetchRaces(): Promise<Open5eRace[]> {
    const cacheKey = 'races';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log('Fetching races from local database...');
      const { data, error } = await supabase
        .from('open5e_races')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching races from database:', error);
        throw error;
      }

      const transformedRaces = (data || []).map(race => this.transformRaceFromDb(race));
      
      console.log(`Fetched ${transformedRaces.length} races from database`);
      this.cache.set(cacheKey, transformedRaces);
      return transformedRaces;
    } catch (error) {
      console.error('Error fetching races:', error);
      return [];
    }
  }

  async fetchClasses(): Promise<Open5eClass[]> {
    const cacheKey = 'classes';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log('Fetching classes from local database...');
      const { data, error } = await supabase
        .from('open5e_classes')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching classes from database:', error);
        throw error;
      }

      const transformedClasses = (data || []).map(cls => this.transformClassFromDb(cls));
      
      console.log(`Fetched ${transformedClasses.length} classes from database`);
      this.cache.set(cacheKey, transformedClasses);
      return transformedClasses;
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  }

  async fetchBackgrounds(): Promise<Open5eBackground[]> {
    const cacheKey = 'backgrounds';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log('Fetching backgrounds from local database...');
      const { data, error } = await supabase
        .from('open5e_backgrounds')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching backgrounds from database:', error);
        throw error;
      }

      const transformedBackgrounds = (data || []).map(bg => this.transformBackgroundFromDb(bg));
      
      console.log(`Fetched ${transformedBackgrounds.length} backgrounds from database`);
      this.cache.set(cacheKey, transformedBackgrounds);
      return transformedBackgrounds;
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
      return [];
    }
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
