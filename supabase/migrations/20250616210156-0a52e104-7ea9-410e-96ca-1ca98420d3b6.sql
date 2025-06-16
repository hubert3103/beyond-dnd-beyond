
-- Create table for spells
CREATE TABLE public.open5e_spells (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  school TEXT NOT NULL,
  casting_time TEXT NOT NULL,
  range_value TEXT NOT NULL,
  components TEXT NOT NULL,
  material TEXT,
  duration TEXT NOT NULL,
  concentration BOOLEAN NOT NULL DEFAULT false,
  ritual BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  higher_level TEXT,
  damage_type TEXT,
  save_type TEXT,
  attack_type TEXT,
  document_slug TEXT NOT NULL,
  classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for equipment
CREATE TABLE public.open5e_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  requires_attunement BOOLEAN NOT NULL DEFAULT false,
  cost_quantity INTEGER,
  cost_unit TEXT,
  weight DECIMAL,
  description TEXT NOT NULL,
  document_slug TEXT NOT NULL,
  -- Armor specific properties
  ac INTEGER,
  ac_base INTEGER,
  ac_add_dex BOOLEAN,
  ac_cap_dex INTEGER,
  dex_bonus BOOLEAN,
  max_dex_bonus INTEGER,
  -- Weapon specific properties
  damage_dice TEXT,
  damage_type TEXT,
  category TEXT,
  properties JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for races
CREATE TABLE public.open5e_races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  asi JSONB NOT NULL DEFAULT '[]'::jsonb,
  age TEXT NOT NULL,
  alignment TEXT NOT NULL,
  size TEXT NOT NULL,
  speed JSONB NOT NULL DEFAULT '{}'::jsonb,
  languages TEXT NOT NULL,
  proficiencies TEXT,
  traits TEXT,
  subraces JSONB DEFAULT '[]'::jsonb,
  document_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for classes
CREATE TABLE public.open5e_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  hit_die INTEGER NOT NULL,
  prof_armor TEXT,
  prof_weapons TEXT,
  prof_tools TEXT,
  prof_saving_throws TEXT,
  prof_skills TEXT,
  equipment TEXT,
  spellcasting_ability TEXT,
  subtypes_name TEXT,
  archetypes JSONB DEFAULT '[]'::jsonb,
  document_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for backgrounds
CREATE TABLE public.open5e_backgrounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_proficiencies TEXT,
  languages TEXT,
  equipment TEXT,
  feature TEXT,
  feature_desc TEXT,
  document_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_open5e_spells_name ON public.open5e_spells(name);
CREATE INDEX idx_open5e_spells_level ON public.open5e_spells(level);
CREATE INDEX idx_open5e_spells_school ON public.open5e_spells(school);
CREATE INDEX idx_open5e_spells_document_slug ON public.open5e_spells(document_slug);

CREATE INDEX idx_open5e_equipment_name ON public.open5e_equipment(name);
CREATE INDEX idx_open5e_equipment_type ON public.open5e_equipment(type);
CREATE INDEX idx_open5e_equipment_rarity ON public.open5e_equipment(rarity);
CREATE INDEX idx_open5e_equipment_document_slug ON public.open5e_equipment(document_slug);

CREATE INDEX idx_open5e_races_name ON public.open5e_races(name);
CREATE INDEX idx_open5e_races_document_slug ON public.open5e_races(document_slug);

CREATE INDEX idx_open5e_classes_name ON public.open5e_classes(name);
CREATE INDEX idx_open5e_classes_document_slug ON public.open5e_classes(document_slug);

CREATE INDEX idx_open5e_backgrounds_name ON public.open5e_backgrounds(name);
CREATE INDEX idx_open5e_backgrounds_document_slug ON public.open5e_backgrounds(document_slug);

-- Enable RLS (though we'll make these tables publicly readable)
ALTER TABLE public.open5e_spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open5e_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open5e_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open5e_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open5e_backgrounds ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (since this is reference data)
CREATE POLICY "Allow public read access to spells" ON public.open5e_spells FOR SELECT USING (true);
CREATE POLICY "Allow public read access to equipment" ON public.open5e_equipment FOR SELECT USING (true);
CREATE POLICY "Allow public read access to races" ON public.open5e_races FOR SELECT USING (true);
CREATE POLICY "Allow public read access to classes" ON public.open5e_classes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to backgrounds" ON public.open5e_backgrounds FOR SELECT USING (true);
