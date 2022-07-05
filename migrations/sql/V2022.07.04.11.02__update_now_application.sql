ALTER TABLE IF EXISTS public.now_application
ADD COLUMN IF NOT EXISTS gate_latitude numeric(9, 7),
ADD COLUMN IF NOT EXISTS gate_longitude numeric(11, 7);