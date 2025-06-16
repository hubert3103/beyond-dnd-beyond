
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
    return this.fetchWithCache<Open5eSpell>('/spells');
  }

  async fetchEquipment(): Promise<Open5eEquipment[]> {
    return this.fetchWithCache<Open5eEquipment>('/magicitems');
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
  Open5eRace,
  Open5eClass,
  Open5eBackground
};
