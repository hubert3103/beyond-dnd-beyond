
-- Add spell_slots column to characters table to store spell slot usage data
ALTER TABLE public.characters 
ADD COLUMN spell_slots jsonb DEFAULT '{}';
