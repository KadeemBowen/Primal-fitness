-- ============================================================
-- Primal Fitness - GAPLF Raw (Classic) minimum standards, Men, Open division
-- Run once in Supabase -> SQL Editor (paste all, Run). Safe to re-run.
-- Sets only qual_total; local records (sq/bp/dl/total) are left untouched.
-- 53 kg has no Open standard on the GAPLF sheet, so it is not set here.
-- ============================================================

insert into public.standards (sex, wclass, qual_total, updated_at) values
  ('M', '59',   500.0, now()),
  ('M', '66',   540.0, now()),
  ('M', '74',   585.0, now()),
  ('M', '83',   625.0, now()),
  ('M', '93',   650.0, now()),
  ('M', '105',  685.0, now()),
  ('M', '120',  710.0, now()),
  ('M', '120+', 750.0, now())
on conflict (sex, wclass) do update
   set qual_total = excluded.qual_total,
       updated_at = now();
