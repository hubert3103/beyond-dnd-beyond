
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  damage?: { damage_type: string };
  save?: string;
  attack_type?: string;
  document__slug: string;
  classes: Array<{ name: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type } = await req.json();

    if (type === 'spells') {
      console.log('Starting spell data population...');
      
      // Fetch all spells from Open5e API
      const allSpells: Open5eSpell[] = [];
      let url = 'https://api.open5e.com/spells?limit=1000';
      
      while (url) {
        console.log('Fetching:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch spells: ${response.status} ${response.statusText}`);
        }
        
        const data: Open5eResponse<Open5eSpell> = await response.json();
        allSpells.push(...data.results);
        url = data.next;
      }

      console.log(`Fetched ${allSpells.length} spells from API`);

      // Transform and insert spells
      const spellsToInsert = allSpells.map(spell => ({
        slug: spell.slug,
        name: spell.name,
        level: spell.level,
        school: spell.school,
        casting_time: spell.casting_time,
        range_value: spell.range,
        components: spell.components,
        material: spell.material,
        duration: spell.duration,
        concentration: spell.concentration,
        ritual: spell.ritual,
        description: spell.desc,
        higher_level: spell.higher_level,
        damage_type: spell.damage?.damage_type,
        save_type: spell.save,
        attack_type: spell.attack_type,
        document_slug: spell.document__slug,
        classes: spell.classes || []
      }));

      // Insert in batches to avoid timeout
      const batchSize = 100;
      let insertedCount = 0;
      
      for (let i = 0; i < spellsToInsert.length; i += batchSize) {
        const batch = spellsToInsert.slice(i, i + batchSize);
        const { error } = await supabase
          .from('open5e_spells')
          .upsert(batch, { onConflict: 'slug' });
        
        if (error) {
          console.error('Error inserting spell batch:', error);
          throw error;
        }
        
        insertedCount += batch.length;
        console.log(`Inserted ${insertedCount}/${spellsToInsert.length} spells`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully populated ${insertedCount} spells` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'equipment') {
      console.log('Starting equipment data population...');
      
      // Fetch magic items, weapons, and armor
      const [magicItemsResponse, weaponsResponse, armorResponse] = await Promise.allSettled([
        fetch('https://api.open5e.com/magicitems?limit=1000'),
        fetch('https://api.open5e.com/weapons?limit=1000'),
        fetch('https://api.open5e.com/armor?limit=1000')
      ]);

      const allEquipment: any[] = [];

      // Process magic items
      if (magicItemsResponse.status === 'fulfilled' && magicItemsResponse.value.ok) {
        const magicData = await magicItemsResponse.value.json();
        allEquipment.push(...magicData.results.map((item: any) => ({
          slug: item.slug,
          name: item.name,
          type: 'magic item',
          rarity: item.rarity || 'common',
          requires_attunement: item.requires_attunement || false,
          cost_quantity: item.cost?.quantity,
          cost_unit: item.cost?.unit,
          weight: item.weight,
          description: item.desc,
          document_slug: item.document__slug
        })));
      }

      // Process weapons
      if (weaponsResponse.status === 'fulfilled' && weaponsResponse.value.ok) {
        const weaponsData = await weaponsResponse.value.json();
        allEquipment.push(...weaponsData.results.map((weapon: any) => ({
          slug: weapon.slug,
          name: weapon.name,
          type: 'weapon',
          rarity: 'common',
          requires_attunement: false,
          cost_quantity: weapon.cost?.quantity,
          cost_unit: weapon.cost?.unit,
          weight: weapon.weight,
          description: weapon.desc,
          document_slug: weapon.document__slug,
          damage_dice: weapon.damage?.damage_dice,
          damage_type: weapon.damage?.damage_type,
          category: weapon.category,
          properties: weapon.properties || []
        })));
      }

      // Process armor
      if (armorResponse.status === 'fulfilled' && armorResponse.value.ok) {
        const armorData = await armorResponse.value.json();
        allEquipment.push(...armorData.results.map((armor: any) => ({
          slug: armor.slug,
          name: armor.name,
          type: 'armor',
          rarity: 'common',
          requires_attunement: false,
          cost_quantity: armor.cost?.quantity,
          cost_unit: armor.cost?.unit,
          weight: armor.weight,
          description: armor.desc,
          document_slug: armor.document__slug,
          ac: armor.ac_base,
          ac_base: armor.ac_base,
          ac_add_dex: armor.ac_add_dex !== false,
          ac_cap_dex: armor.ac_cap_dex,
          dex_bonus: armor.ac_add_dex !== false,
          max_dex_bonus: armor.ac_cap_dex || 999,
          category: 'armor'
        })));
      }

      console.log(`Fetched ${allEquipment.length} equipment items from API`);

      // Insert in batches
      const batchSize = 100;
      let insertedCount = 0;
      
      for (let i = 0; i < allEquipment.length; i += batchSize) {
        const batch = allEquipment.slice(i, i + batchSize);
        const { error } = await supabase
          .from('open5e_equipment')
          .upsert(batch, { onConflict: 'slug' });
        
        if (error) {
          console.error('Error inserting equipment batch:', error);
          throw error;
        }
        
        insertedCount += batch.length;
        console.log(`Inserted ${insertedCount}/${allEquipment.length} equipment items`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully populated ${insertedCount} equipment items` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'races') {
      console.log('Starting races data population...');
      
      const allRaces: any[] = [];
      let url = 'https://api.open5e.com/races?limit=1000';
      
      while (url) {
        console.log('Fetching:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch races: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        allRaces.push(...data.results);
        url = data.next;
      }

      console.log(`Fetched ${allRaces.length} races from API`);

      const racesToInsert = allRaces.map(race => ({
        slug: race.slug,
        name: race.name,
        description: race.desc,
        asi: race.asi || [],
        age: race.age,
        alignment: race.alignment,
        size: race.size,
        speed: race.speed || { walk: 30 },
        languages: race.languages,
        proficiencies: race.proficiencies,
        traits: race.traits,
        subraces: race.subraces || [],
        document_slug: race.document__slug
      }));

      const { error } = await supabase
        .from('open5e_races')
        .upsert(racesToInsert, { onConflict: 'slug' });
      
      if (error) {
        console.error('Error inserting races:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully populated ${racesToInsert.length} races` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'classes') {
      console.log('Starting classes data population...');
      
      const allClasses: any[] = [];
      let url = 'https://api.open5e.com/classes?limit=1000';
      
      while (url) {
        console.log('Fetching:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch classes: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        allClasses.push(...data.results);
        url = data.next;
      }

      console.log(`Fetched ${allClasses.length} classes from API`);

      const classesToInsert = allClasses.map(cls => ({
        slug: cls.slug,
        name: cls.name,
        description: cls.desc,
        hit_die: cls.hit_die,
        prof_armor: cls.prof_armor,
        prof_weapons: cls.prof_weapons,
        prof_tools: cls.prof_tools,
        prof_saving_throws: cls.prof_saving_throws,
        prof_skills: cls.prof_skills,
        equipment: cls.equipment,
        spellcasting_ability: cls.spellcasting_ability,
        subtypes_name: cls.subtypes_name,
        archetypes: cls.archetypes || [],
        document_slug: cls.document__slug
      }));

      const { error } = await supabase
        .from('open5e_classes')
        .upsert(classesToInsert, { onConflict: 'slug' });
      
      if (error) {
        console.error('Error inserting classes:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully populated ${classesToInsert.length} classes` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'backgrounds') {
      console.log('Starting backgrounds data population...');
      
      const allBackgrounds: any[] = [];
      let url = 'https://api.open5e.com/backgrounds?limit=1000';
      
      while (url) {
        console.log('Fetching:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch backgrounds: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        allBackgrounds.push(...data.results);
        url = data.next;
      }

      console.log(`Fetched ${allBackgrounds.length} backgrounds from API`);

      const backgroundsToInsert = allBackgrounds.map(bg => ({
        slug: bg.slug,
        name: bg.name,
        description: bg.desc,
        skill_proficiencies: bg.skill_proficiencies,
        languages: bg.languages,
        equipment: bg.equipment,
        feature: bg.feature,
        feature_desc: bg.feature_desc,
        document_slug: bg.document__slug
      }));

      const { error } = await supabase
        .from('open5e_backgrounds')
        .upsert(backgroundsToInsert, { onConflict: 'slug' });
      
      if (error) {
        console.error('Error inserting backgrounds:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully populated ${backgroundsToInsert.length} backgrounds` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid type specified' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-open5e-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
