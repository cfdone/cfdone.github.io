-- Supabase Schema for Timetable Management
-- Run this SQL in your Supabase SQL Editor

-- Create user_timetables table
CREATE TABLE IF NOT EXISTS user_timetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timetable_data JSONB NOT NULL,
  onboarding_mode TEXT NOT NULL CHECK (onboarding_mode IN ('custom', 'regular', 'lagger')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_timetables_user_id ON user_timetables(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_timetables_updated_at ON user_timetables;
CREATE TRIGGER update_user_timetables_updated_at
    BEFORE UPDATE ON user_timetables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_timetables ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only see and modify their own timetables
CREATE POLICY "Users can view own timetables" ON user_timetables
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timetables" ON user_timetables
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timetables" ON user_timetables
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timetables" ON user_timetables
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON user_timetables TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
