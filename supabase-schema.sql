-- Create custom_locations table
CREATE TABLE IF NOT EXISTS custom_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  city TEXT DEFAULT 'Custom',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_outfits table
CREATE TABLE IF NOT EXISTS custom_outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT DEFAULT 'Custom',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE custom_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_outfits ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on custom_locations"
  ON custom_locations FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on custom_locations"
  ON custom_locations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on custom_locations"
  ON custom_locations FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on custom_outfits"
  ON custom_outfits FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on custom_outfits"
  ON custom_outfits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on custom_outfits"
  ON custom_outfits FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS custom_locations_created_at_idx ON custom_locations(created_at DESC);
CREATE INDEX IF NOT EXISTS custom_outfits_created_at_idx ON custom_outfits(created_at DESC);
