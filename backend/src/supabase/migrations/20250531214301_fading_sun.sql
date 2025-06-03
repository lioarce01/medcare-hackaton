-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer not to say')),
  allergies TEXT[],
  conditions TEXT[],
  is_admin BOOLEAN DEFAULT false,
  preferred_reminder_time TEXT[] DEFAULT ARRAY['08:00', '12:00', '18:00'],
  email_notifications_enabled BOOLEAN DEFAULT true,
  phone_number TEXT,
  emergency_contact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create medications table
CREATE TABLE medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage JSONB NOT NULL,
  frequency JSONB NOT NULL,
  scheduled_times TEXT[] NOT NULL,
  instructions TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  end_date TIMESTAMP WITH TIME ZONE,
  refill_reminder JSONB,
  side_effects_to_watch TEXT[],
  active BOOLEAN DEFAULT true,
  medication_type TEXT CHECK (medication_type IN ('prescription', 'over-the-counter', 'vitamin', 'supplement', 'other')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create adherence table
CREATE TABLE adherence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  taken_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'taken', 'missed', 'skipped')) DEFAULT 'pending',
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  side_effects_reported TEXT[],
  dosage_taken JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create reminders table
CREATE TABLE reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  channels JSONB NOT NULL DEFAULT '{"email": {"enabled": true, "sent": false}, "sms": {"enabled": false, "sent": false}}',
  message TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry TIMESTAMP WITH TIME ZONE,
  adherence_id UUID REFERENCES adherence(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view and edit their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own medications" ON medications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own adherence records" ON adherence
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adherence_updated_at
  BEFORE UPDATE ON adherence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();