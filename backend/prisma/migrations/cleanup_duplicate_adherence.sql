-- Clean up duplicate adherence records
-- Migration: Remove duplicate adherence records

-- Delete duplicate adherence records keeping only the first one for each unique combination
-- of user_id, medication_id, and scheduled_datetime

DELETE FROM public.adherence 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, medication_id, scheduled_datetime 
             ORDER BY created_at ASC
           ) as rn
    FROM public.adherence
  ) t
  WHERE t.rn > 1
);

-- Also clean up any orphaned reminders that might be pointing to deleted adherence records
DELETE FROM public.reminders 
WHERE adherence_id IS NOT NULL 
  AND adherence_id NOT IN (SELECT id FROM public.adherence); 