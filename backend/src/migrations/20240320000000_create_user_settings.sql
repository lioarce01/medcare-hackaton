-- Drop existing table if it exists
DROP TABLE IF EXISTS user_settings;

-- Create user_settings table
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    preferred_times TEXT[] DEFAULT ARRAY['08:00', '14:00', '20:00'],
    timezone TEXT DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own settings
CREATE POLICY "Users can view their own settings"
    ON user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to update their own settings
CREATE POLICY "Users can update their own settings"
    ON user_settings
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy for users to insert their own settings
CREATE POLICY "Users can insert their own settings"
    ON user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at(); 