
import { supabase } from '@/integrations/supabase/client';
import { open5eApi, Open5eSpell, Open5eEquipment, Open5eRace, Open5eClass, Open5eBackground } from './open5eApi';

interface CachedData {
  races: Open5eRace[];
  classes: Open5eClass[];
  backgrounds: Open5eBackground[];
  spells: Open5eSpell[];
  equipment: Open5eEquipment[];
  lastFetch: number;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

class HybridDataService {
  private cache: Partial<CachedData> = {};

  // Transform Supabase race data to Open5e format
  private transformSupabaseRace(dbRace: any): Open5eRace {
    const race: Open5eRace = {
      slug: dbRace.slug,
      name: dbRace.name,
      desc: dbRace.description,
      asi: Array.isArray(dbRace.asi) ? dbRace.asi : [],
      age: dbRace.age || '',
      alignment: dbRace.alignment || '',
      size: dbRace.size || 'Medium',
      speed: typeof dbRace.speed === 'object' ? dbRace.speed : { walk: 30 },
      languages: dbRace.languages || '',
      proficiencies: dbRace.proficiencies || '',
      traits: dbRace.traits || '',
      document__slug: dbRace.document_slug || 'wotc-srd'
    };

    // Only add subraces if they exist in the data
    if (dbRace.subraces && Array.isArray(dbRace.subraces)) {
      (race as any).subraces = dbRace.subraces;
    }

    return race;
  }

  // Transform Supabase class data to Open5e format
  private transformSupabaseClass(dbClass: any): Open5eClass {
    const classData: Open5eClass = {
      slug: dbClass.slug,
      name: dbClass.name,
      desc: dbClass.description,
      hit_die: dbClass.hit_die || 8,
      prof_armor: dbClass.prof_armor || '',
      prof_weapons: dbClass.prof_weapons || '',
      prof_tools: dbClass.prof_tools || '',
      prof_saving_throws: dbClass.prof_saving_throws || '',
      prof_skills: dbClass.prof_skills || '',
      equipment: dbClass.equipment || '',
      spellcasting_ability: dbClass.spellcasting_ability || '',
      subtypes_name: dbClass.subtypes_name || '',
      document__slug: dbClass.document_slug || 'wotc-srd'
    };

    // Only add archetypes if they exist in the data
    if (dbClass.archetypes && Array.isArray(dbClass.archetypes)) {
      (classData as any).archetypes = dbClass.archetypes;
    }

    return classData;
  }

  // Transform Supabase background data to Open5e format
  private transformSupabaseBackground(dbBackground: any): Open5eBackground {
    return {
      slug: dbBackground.slug,
      name: dbBackground.name,
      desc: dbBackground.description,
      skill_proficiencies: dbBackground.skill_proficiencies || '',
      languages: dbBackground.languages || '',
      equipment: dbBackground.equipment || '',
      feature: dbBackground.feature || '',
      feature_desc: dbBackground.feature_desc || '',
      document__slug: dbBackground.document_slug || 'wotc-srd'
    };
  }

  // Transform Supabase spell data to Open5e format
  private transformSupabaseSpell(dbSpell: any): Open5eSpell {
    const spell: Open5eSpell = {
      slug: dbSpell.slug,
      name: dbSpell.name,
      desc: dbSpell.description,
      level: dbSpell.level || '0',
      school: dbSpell.school || 'evocation',
      casting_time: dbSpell.casting_time || '1 action',
      range: dbSpell.range_value || 'self',
      components: dbSpell.components || '',
      material: dbSpell.material || '',
      duration: dbSpell.duration || 'instantaneous',
      ritual: dbSpell.ritual || false,
      concentration: dbSpell.concentration || false,
      classes: Array.isArray(dbSpell.classes) ? dbSpell.classes : [],
      higher_level: dbSpell.higher_level || '',
      attack_type: dbSpell.attack_type || '',
      document__slug: dbSpell.document_slug || 'wotc-srd'
    };

    // Only add damage_type and save_type if they exist in the data
    if (dbSpell.damage_type) {
      (spell as any).damage_type = dbSpell.damage_type;
    }

    if (dbSpell.save_type) {
      (spell as any).save = dbSpell.save_type;
    }

    return spell;
  }

  private transformSupabaseEquipment(dbEquipment: any): Open5eEquipment {
    return {
      slug: dbEquipment.slug,
      name: dbEquipment.name,
      desc: dbEquipment.description,
      type: dbEquipment.type || 'adventuring-gear',
      rarity: dbEquipment.rarity || 'common',
      cost: dbEquipment.cost_quantity && dbEquipment.cost_unit ? {
        quantity: dbEquipment.cost_quantity,
        unit: dbEquipment.cost_unit
      } : undefined,
      weight: dbEquipment.weight || '',
      ac: dbEquipment.ac,
      ac_add_dex: dbEquipment.ac_add_dex,
      ac_cap_dex: dbEquipment.ac_cap_dex,
      damage_dice: dbEquipment.damage_dice || '',
      damage_type: dbEquipment.damage_type || '',
      properties: Array.isArray(dbEquipment.properties) ? dbEquipment.properties : [],
      requires_attunement: dbEquipment.requires_attunement === 'true' || dbEquipment.requires_attunement === true,
      document__slug: dbEquipment.document_slug || 'wotc-srd',
      category: dbEquipment.category || dbEquipment.type || 'adventuring-gear',
      ac_base: dbEquipment.ac_base
    };
  }

  private isCacheValid(type: keyof CachedData): boolean {
    if (!this.cache[type] || !this.cache.lastFetch) {
      return false;
    }
    return Date.now() - this.cache.lastFetch < CACHE_DURATION;
  }

  async fetchSpells(): Promise<Open5eSpell[]> {
    if (this.isCacheValid('spells') && this.cache.spells) {
      return this.cache.spells;
    }

    try {
      // Always try API first for spells since database seems to be empty
      const apiSpells = await open5eApi.fetchSpells();
      
      if (apiSpells && apiSpells.length > 0) {
        this.cache.spells = apiSpells;
        this.cache.lastFetch = Date.now();
        return apiSpells;
      }

      // Only fallback to database if API fails
      const { data: dbSpells, error } = await supabase
        .from('open5e_spells')
        .select('*');

      if (error) {
        console.warn('Error fetching spells from database:', error);
        // Return empty array if both sources fail
        this.cache.spells = [];
        this.cache.lastFetch = Date.now();
        return [];
      }

      const transformedSpells = (dbSpells || []).map(this.transformSupabaseSpell);
      this.cache.spells = transformedSpells;
      this.cache.lastFetch = Date.now();
      return transformedSpells;
      
    } catch (error) {
      console.error('Error in fetchSpells:', error);
      // Return empty array on error
      this.cache.spells = [];
      this.cache.lastFetch = Date.now();
      return [];
    }
  }

  async fetchRaces(): Promise<Open5eRace[]> {
    if (this.isCacheValid('races') && this.cache.races) {
      return this.cache.races;
    }

    try {
      // First, try to get data from local database
      const { data: dbRaces, error } = await supabase
        .from('open5e_races')
        .select('*');

      if (error) {
        console.warn('Error fetching races from database:', error);
        // Fallback to API
        const apiRaces = await open5eApi.fetchRaces();
        this.cache.races = apiRaces;
        this.cache.lastFetch = Date.now();
        return apiRaces;
      }

      // Transform database data to API format
      const transformedRaces = (dbRaces || []).map(this.transformSupabaseRace);

      // If we have data from database, use it
      if (transformedRaces.length > 0) {
        this.cache.races = transformedRaces;
        this.cache.lastFetch = Date.now();
        return transformedRaces;
      } else {
        // Fallback to API if no database data
        const apiRaces = await open5eApi.fetchRaces();
        this.cache.races = apiRaces;
        this.cache.lastFetch = Date.now();
        return apiRaces;
      }
    } catch (error) {
      console.error('Error in fetchRaces:', error);
      // Last resort: try API
      const apiRaces = await open5eApi.fetchRaces();
      this.cache.races = apiRaces;
      this.cache.lastFetch = Date.now();
      return apiRaces;
    }
  }

  async fetchClasses(): Promise<Open5eClass[]> {
    if (this.isCacheValid('classes') && this.cache.classes) {
      return this.cache.classes;
    }

    try {
      const { data: dbClasses, error } = await supabase
        .from('open5e_classes')
        .select('*');

      if (error) {
        console.warn('Error fetching classes from database:', error);
        const apiClasses = await open5eApi.fetchClasses();
        this.cache.classes = apiClasses;
        this.cache.lastFetch = Date.now();
        return apiClasses;
      }

      const transformedClasses = (dbClasses || []).map(this.transformSupabaseClass);

      if (transformedClasses.length > 0) {
        this.cache.classes = transformedClasses;
        this.cache.lastFetch = Date.now();
        return transformedClasses;
      } else {
        const apiClasses = await open5eApi.fetchClasses();
        this.cache.classes = apiClasses;
        this.cache.lastFetch = Date.now();
        return apiClasses;
      }
    } catch (error) {
      console.error('Error in fetchClasses:', error);
      const apiClasses = await open5eApi.fetchClasses();
      this.cache.classes = apiClasses;
      this.cache.lastFetch = Date.now();
      return apiClasses;
    }
  }

  async fetchBackgrounds(): Promise<Open5eBackground[]> {
    if (this.isCacheValid('backgrounds') && this.cache.backgrounds) {
      return this.cache.backgrounds;
    }

    try {
      const { data: dbBackgrounds, error } = await supabase
        .from('open5e_backgrounds')
        .select('*');

      if (error) {
        console.warn('Error fetching backgrounds from database:', error);
        const apiBackgrounds = await open5eApi.fetchBackgrounds();
        this.cache.backgrounds = apiBackgrounds;
        this.cache.lastFetch = Date.now();
        return apiBackgrounds;
      }

      const transformedBackgrounds = (dbBackgrounds || []).map(this.transformSupabaseBackground);

      if (transformedBackgrounds.length > 0) {
        this.cache.backgrounds = transformedBackgrounds;
        this.cache.lastFetch = Date.now();
        return transformedBackgrounds;
      } else {
        const apiBackgrounds = await open5eApi.fetchBackgrounds();
        this.cache.backgrounds = apiBackgrounds;
        this.cache.lastFetch = Date.now();
        return apiBackgrounds;
      }
    } catch (error) {
      console.error('Error in fetchBackgrounds:', error);
      const apiBackgrounds = await open5eApi.fetchBackgrounds();
      this.cache.backgrounds = apiBackgrounds;
      this.cache.lastFetch = Date.now();
      return apiBackgrounds;
    }
  }

  async fetchEquipment(): Promise<Open5eEquipment[]> {
    if (this.isCacheValid('equipment') && this.cache.equipment) {
      return this.cache.equipment;
    }

    try {
      const { data: dbEquipment, error } = await supabase
        .from('open5e_equipment')
        .select('*');

      if (error) {
        console.warn('Error fetching equipment from database:', error);
        const apiEquipment = await open5eApi.fetchEquipment();
        this.cache.equipment = apiEquipment;
        this.cache.lastFetch = Date.now();
        return apiEquipment;
      }

      const transformedEquipment = (dbEquipment || []).map(this.transformSupabaseEquipment);

      if (transformedEquipment.length > 0) {
        this.cache.equipment = transformedEquipment;
        this.cache.lastFetch = Date.now();
        return transformedEquipment;
      } else {
        const apiEquipment = await open5eApi.fetchEquipment();
        this.cache.equipment = apiEquipment;
        this.cache.lastFetch = Date.now();
        return apiEquipment;
      }
    } catch (error) {
      console.error('Error in fetchEquipment:', error);
      const apiEquipment = await open5eApi.fetchEquipment();
      this.cache.equipment = apiEquipment;
      this.cache.lastFetch = Date.now();
      return apiEquipment;
    }
  }

  clearCache(): void {
    this.cache = {};
  }

  getAvailableSources(items: any[]): string[] {
    const sources = new Set<string>();
    items.forEach(item => {
      if (item.document__slug) {
        sources.add(item.document__slug);
      }
    });
    return Array.from(sources);
  }
}

export const hybridDataService = new HybridDataService();
