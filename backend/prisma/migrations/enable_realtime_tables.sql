-- Enable realtime on all necessary tables
-- Migration: Enable realtime subscriptions

-- Enable realtime on medications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;

-- Enable realtime on adherence table
ALTER PUBLICATION supabase_realtime ADD TABLE public.adherence;

-- Enable realtime on reminders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;

-- Enable realtime on users table (for subscription updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Enable realtime on user_settings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;

-- Enable realtime on risk_history table
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_history; 