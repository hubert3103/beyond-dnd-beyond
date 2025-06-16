
-- Create a table for storing created characters
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  species_name TEXT,
  species_data JSONB,
  class_name TEXT,
  class_data JSONB,
  subclass_name TEXT,
  background_name TEXT,
  background_data JSONB,
  abilities JSONB NOT NULL,
  hit_points JSONB,
  equipment JSONB,
  spells JSONB,
  sources JSONB,
  advancement_type TEXT,
  hit_point_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Create policies for character access
CREATE POLICY "Users can view their own characters" 
  ON public.characters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters" 
  ON public.characters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" 
  ON public.characters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters" 
  ON public.characters 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for faster queries
CREATE INDEX idx_characters_user_id ON public.characters(user_id);
