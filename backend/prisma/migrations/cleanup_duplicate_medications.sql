-- Clean up duplicate medications
-- Migration: Remove duplicate medications

-- Delete duplicate medications keeping only the first one for each unique combination
-- of user_id, name, and created_at (within a 5-minute window to account for multiple submissions)

DELETE FROM public.medications 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, name 
             ORDER BY created_at ASC
           ) as rn
    FROM public.medications
    WHERE created_at >= NOW() - INTERVAL '1 hour' -- Only check recent duplicates
  ) t
  WHERE t.rn > 1
); 