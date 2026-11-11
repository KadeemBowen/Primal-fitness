-- ============================================================
-- Primal Fitness - GAPLF Raw (Classic) minimum standards, Open division
-- Men + Women, from the GAPLF minimum standards sheet.
-- Run once in Supabase -> SQL Editor (paste all, Run). Safe to re-run.
-- Sets only qual_total (kg); local records (sq/bp/dl/total) are left untouched.
-- Men 53 kg and Women 43 kg have no Open standard on the sheet, so they are not set.
-- ============================================================

insert into public.standards (sex, wclass, qual_total, updated_at) values
  -- Men
  ('M', '59',   500.0, now()),
  ('M', '66',   540.0, now()),
  ('M', '74',   585.0, now()),
  ('M', '83',   625.0, now()),
  ('M', '93',   650.0, now()),
  ('M', '105',  685.0, now()),
  ('M', '120',  710.0, now()),
  ('M', '120+', 750.0, now()),
  -- Women
  ('F', '47',   285.0, now()),
  ('F', '52',   307.5, now()),
  ('F', '57',   345.0, now()),
  ('F', '63',   365.0, now()),
  ('F', '69',   370.0, now()),
  ('F', '76',   407.5, now()),
  ('F', '84',   425.0, now()),
  ('F', '84+',  445.0, now())
on conflict (sex, wclass) do update
   set qual_total = excluded.qual_total,
       updated_at = now();

-- Check: should list all 16 rows above with their qualifying totals.
select sex, wclass, qual_total from public.standards
 where qual_total is not null
 order by sex desc, nullif(regexp_replace(wclass,'\D','','g'),'')::int, wclass;
