/* ===== Off-season + classic-method programs =====
   Loaded after programs.js. Every one is pct:true - each main-lift number is a
   PERCENT of the 1RM entered on the assignment, so assign with current maxes
   and the whole block prices itself. Lifts with no 1RM on the assignment
   (overhead press, rows, arms...) are logged by RPE.

   These are Primal versions written in the style of each method, not copies of
   the published programs - tuned for raw powerlifters training squat / bench /
   deadlift in lb, with the app's one-row-per-exercise-per-week format.

   Row format (per week): [sets, reps, % of 1RM, RPE]  or null = not this week.
   variant:true keeps a lift out of Athlete bests even if its name looks like a
   competition lift (e.g. overhead press priced off bench). */
(function(){
  const R=(n,f)=>Array.from({length:n},(_,i)=>f(i));
  const at=(n,wks,row)=>R(n,i=>wks.indexOf(i+1)>=0?row.slice():null);           // wks are 1-based
  const pick=(v,i)=>Array.isArray(v)?v[i]:v;
  // Build per-week rows from per-week arrays (any arg may be a scalar). A null % (or sets) = week off.
  const W=(s,r,p,e)=>p.map((pc,i)=>(pc==null||pick(s,i)==null)?null:[pick(s,i),pick(r,i),pc,e==null?null:pick(e,i)]);
  const L=(k,name,lift,wk,o)=>Object.assign({k,name,lift,t:'w',wk},o||{});
  const off=(skip,i)=>!!skip&&skip.indexOf(i+1)>=0;
  const A=(k,name,n,s,r,rpe,skip)=>({k,name,lift:null,t:'rpe',wk:R(n,i=>off(skip,i)?null:[s,r,null,rpe])});   // weighted, by RPE
  const C=(k,name,n,s,r,skip)=>({k,name,lift:null,t:'acc',wk:R(n,i=>off(skip,i)?null:[s,r,null,null])});      // reps only
  const B=(k,name,n,s,r,rpe,skip)=>({k,name,lift:null,t:'bw',wk:R(n,i=>off(skip,i)?null:[s,r,'BW',rpe])});    // bodyweight
  const AR=(k,name,rows)=>({k,name,lift:null,t:'rpe',wk:rows});                                              // RPE rows given per week
  const I=(k,name,n,wks)=>({k,name,lift:null,t:'info',wk:at(n,wks,[1,1,null,null])});
  // One exercise per step of a ladder. steps[week] = [[reps, pct, sets?, rpe?], ...] or null.
  const ladder=(pfx,name,lift,steps,o)=>{ const n=steps.length, m=Math.max.apply(null,steps.map(s=>s?s.length:0));
    return R(m,j=>Object.assign({k:pfx+(j+1),name:name+' · step '+(j+1),lift,t:'w',
      wk:R(n,i=>{ const s=steps[i]&&steps[i][j]; return s?[s[2]||1,s[0],s[1],s[3]==null?null:s[3]]:null; })},o||{})); };
  // Max-test run for one lift in the given weeks: enter today's goal, warm-ups scale off it.
  const test=(pfx,lift,label,n,wks)=>[
    {k:pfx+'g',name:label+' goal (today’s max)',lift,t:'goal',wk:at(n,wks,[1,1,null,null])}]
    .concat([[0.40,5],[0.60,3],[0.75,2],[0.85,1],[0.92,1]].map((p,j)=>({k:pfx+'w'+(j+1),name:label+' warm-up '+(j+1)+' ('+Math.round(p[0]*100)+'%)',
      lift,t:'warmup',goalK:pfx+'g',pct:p[0],wk:at(n,wks,[1,p[1],p[0],null])})))
    .concat([{k:pfx+'top',name:label+' max attempt',lift,t:'warmup',goalK:pfx+'g',pct:1,wk:at(n,wks,[1,1,1,null])}]);
  const P=o=>Object.assign({deload:0,test:0,pct:true,refTM:{squat:100,bench:100,deadlift:100}},o);
  const NEW={};

  /* ---------- 1. Off-Season Bench (8 wk, 4 days) ----------
     Bench 3x/week (heavy, volume + variations, speed). Squat and deadlift held
     with moderate work. Two 3-week waves, deload wk 4, bench test wk 8. */
  (function(){ const n=8;
    NEW['os-bench']=P({ name:'Off-Season Bench (8-wk)', weeks:n, deload:4, test:8,
      note:'Off-season bench specialisation. Bench 3x a week: heavy top sets (Day 1), volume + Larsen press (Day 3), speed bench (Day 4). Squat and deadlift are held at moderate volume so they do not slide. Wk 1-3 wave, wk 4 deload, wk 5-7 heavier wave, wk 8 bench test (enter a goal, the app prices warm-ups) - squat and deadlift stay light that week. Assign with current maxes.',
      days:[
        {d:'1',title:'Heavy Bench',ex:[
          L('obbn','Competition Bench (top sets)','bench',W([4,4,5,3,4,5,4,null],[5,4,3,5,4,3,2,null],[75,78,82,65,80,84,88,null],[7,7.5,8,5,7.5,8,8.5,null])),
          L('obbnbo','Competition Bench back-off','bench',W([3,3,3,2,3,3,3,null],[8,7,6,6,6,5,4,null],[65,68,72,58,70,74,77,null],7)),
          L('obcg','Close-grip Bench','bench',W(3,[10,8,8,8,8,6,6,null],[60,63,66,55,64,67,70,null],[7,7.5,8,6,7.5,8,8,null])),
          A('obrow','Barbell / Pendlay Row',n,4,8,'7-8',[8]),
          A('obtri','Overhead Tricep Extension',n,3,12,'8-9',[8]),
          C('obrd','Rear delts + face pulls',n,3,15,[8]),
          I('obi8','TEST WEEK - work up to a new bench max. Squat and deadlift stay light this week.',n,[8])
        ].concat(test('obt','bench','Bench',n,[8]))},
        {d:'2',title:'Lower A (Squat)',ex:[
          L('obsq','Competition Squat','squat',W([4,4,4,3,4,4,3,2],[6,5,4,5,5,4,3,3],[70,72,76,60,74,78,82,65],[7,7,7.5,5,7,7.5,8,5])),
          L('obrdl','Romanian Deadlift','deadlift',W(3,[10,8,8,8,8,8,6,null],[50,53,56,45,55,58,60,null],7)),
          A('oblp','Leg Press',n,3,'12-15','8',[8]),
          A('oblc','Leg Curl',n,3,12,'8',[8]),
          A('obcalf','Standing Calf Raise',n,4,12,'8-9',[8]),
          C('obabs','Weighted core',n,3,12,[8])
        ]},
        {d:'3',title:'Bench Volume + Variations',ex:[
          L('oblar','Larsen Press (feet up)','bench',W([4,4,4,3,4,4,3,null],[8,7,6,6,6,5,5,null],[65,68,71,58,70,73,75,null],7)),
          L('obbnv','Competition Bench 0-1-0 (volume, commands)','bench',W([5,5,5,3,5,5,4,3],[6,6,5,5,5,4,4,3],[68,70,73,60,72,75,78,60],[7,7,7.5,5,7,7.5,8,5])),
          A('obinc','Incline DB Press',n,3,'10-12','8',[8]),
          A('oblat','Lat Pulldown',n,4,10,'8',[8]),
          A('obfly','Cable / Machine Fly',n,3,15,'8-9',[4,8]),
          A('obcurl','Bicep Curl',n,3,12,'8-9',[8])
        ]},
        {d:'4',title:'Lower B (Deadlift) + Speed Bench',ex:[
          L('obdl','Competition Deadlift','deadlift',W([3,4,4,2,4,4,3,2],[5,4,4,5,4,3,3,3],[72,75,78,60,77,81,85,65],[7,7,7.5,5,7.5,8,8,5])),
          L('obsp','Speed Bench (explosive, 60s rest)','bench',W([8,8,8,5,8,8,6,null],3,[55,58,60,50,58,60,62,null],null),{variant:true}),
          L('obpsq','Pause Squat (2 sec)','squat',W(3,[5,4,4,4,4,3,3,null],[62,65,67,55,66,68,70,null],7)),
          B('obpull','Pull-ups',n,3,'AMRAP',8,[8]),
          A('oblatr','Lateral Raise',n,3,15,'9',[8]),
          C('obham','Back Extension',n,3,15,[8])
        ]}
      ]});
  })();

  /* ---------- 2. Off-Season Overall (8 wk, 4 days) ----------
     Wk 1-3 hypertrophy (8-6 reps), wk 4 deload, wk 5-7 strength (5-3 reps),
     wk 8 rep-out: one all-out set at 85% to estimate new maxes. */
  (function(){ const n=8;
    NEW['os-overall']=P({ name:'Off-Season Overall (8-wk)', weeks:n, deload:4, test:8, testLabel:'Rep-out Week',
      note:'All-round off-season block: build muscle first, then turn it into strength. Wk 1-3 hypertrophy (sets of 8-6), wk 4 deload, wk 5-7 strength (sets of 5-3), wk 8 REP-OUT week: one all-out set at 85% on each comp lift - log the reps and the Athlete bests e1RM (or the Estimated 1RM calculator) gives the maxes for the next block. Squat, bench and deadlift each get one heavy and one variation day.',
      days:[
        {d:'1',title:'Squat + Bench',ex:[
          I('ooi8','REP-OUT WEEK - one set at 85%, as many clean reps as possible (stop at 1 in the tank). Log the reps.',n,[8]),
          L('oosq','Competition Squat','squat',W([4,4,4,3,4,4,4,1],[8,7,6,5,5,4,3,'AMRAP'],[67,70,73,60,77,80,83,85],[7,7.5,8,5,7.5,8,8.5,null])),
          L('oosqbo','Competition Squat back-off','squat',W([null,null,null,null,2,2,2,null],[null,null,null,null,6,5,5,null],[null,null,null,null,70,72,74,null],7)),
          L('oobn','Competition Bench','bench',W([4,4,4,3,4,4,4,1],[8,7,6,6,5,4,3,'AMRAP'],[67,70,73,60,77,80,83,85],[7,7.5,8,5,7.5,8,8.5,null])),
          A('oorow','Chest-supported Row',n,4,10,'8',[8]),
          A('ooquad','Leg Extension',n,3,15,'9',[8]),
          C('oocore','Core',n,3,12,[8])
        ]},
        {d:'2',title:'Deadlift + Upper',ex:[
          L('oodl','Competition Deadlift','deadlift',W([3,3,3,2,3,3,3,1],[8,6,6,5,5,4,3,'AMRAP'],[65,68,72,60,76,80,83,85],[7,7.5,8,5,7.5,8,8.5,null])),
          AR('ooohp','Overhead Press',[[4,8,null,'7-8'],[4,8,null,'7-8'],[4,8,null,'8'],[3,8,null,'6'],[4,6,null,'8'],[4,6,null,'8'],[4,5,null,'8-9'],null]),
          B('oopull','Pull-ups / Pulldown',n,4,'AMRAP',8,[8]),
          A('oohip','Hip Thrust / Back Extension',n,3,10,'8',[8]),
          A('ooarms','Arms (curl + triceps superset)',n,3,12,'8-9',[8])
        ]},
        {d:'3',title:'Bench Volume + Squat Variation',ex:[
          L('oobnv','Competition Bench 0-1-0 (volume)','bench',W([4,4,4,3,4,4,4,null],[10,8,8,6,6,6,5,null],[62,65,68,55,70,72,75,null],7)),
          L('oopsq','Pause Squat (2 sec)','squat',W(3,[6,6,5,5,4,4,3,null],[60,62,65,55,68,70,72,null],7)),
          L('oocg','Close-grip Bench','bench',W(3,[10,10,8,8,8,6,6,null],[58,60,63,53,65,67,70,null],7.5)),
          A('oobss','Bulgarian Split Squat',n,3,10,'8',[8]),
          A('oolat','Lat Pulldown',n,3,12,'8',[8])
        ]},
        {d:'4',title:'Weak Points & Hypertrophy',ex:[
          L('oodef','Deficit Deadlift (1 in)','deadlift',W(3,[6,6,5,5,4,4,3,null],[60,62,65,55,68,70,72,null],7)),
          A('ooinc','Incline Press (barbell or DB)',n,4,10,'8',[8]),
          A('oolc','Leg Curl',n,4,12,'8-9',[8]),
          A('oolatr','Lateral Raise',n,4,15,'9',[8]),
          A('oocalf','Calf Raise',n,4,15,'9',[8]),
          C('oorear','Rear delts + face pulls',n,3,20,[8])
        ]}
      ]});
  })();

  /* ---------- 3. 5-5-3-3-1 Hybrid (6 wk, 4 days) ----------
     5/3/1-style ramp + AMRAP top set, stretched to 5s, 5s, 3s, 3s, 1s, deload.
     Back-off volume after the top set; arms and calves every session. */
  (function(){ const n=6;
    const r1=[65,68,72,75,80,55], r2=[70,73,77,80,86,62], tp=[75,78,82,85,91,68];
    const main=(p,name,lift)=>[
      L(p+'1',name+' ramp set 1',lift,W(1,[5,5,3,3,3,5],r1)),
      L(p+'2',name+' ramp set 2',lift,W(1,[5,5,3,3,2,5],r2)),
      L(p+'t',name+' TOP SET (as many as possible)',lift,W(1,['5+','5+','3+','3+','1+',5],tp)),
      L(p+'b',name+' back-off',lift,W([5,5,4,4,3,null],[5,5,5,4,3,null],[65,68,70,72,80,null],7))
    ];
    NEW['hybrid-531']=P({ name:'5-5-3-3-1 Hybrid (6-wk)', weeks:n, deload:6,
      note:'5/3/1-style hybrid: two ramp sets then a TOP SET for max reps (the + sets), followed by back-off volume. Wk 1 5s · wk 2 heavier 5s · wk 3 3s · wk 4 heavier 3s · wk 5 heavy single (1+) · wk 6 deload. Leave 1 rep in the tank on + sets - no grinders. If a top set beats its target by 4+ reps, raise that lift\'s 1RM 5-10 lb when you re-assign. Arms and calves are trained every session: calves heavy on Day 1/3, high-rep on Day 2/4; arms go heavy-to-pump across the week.',
      days:[
        {d:'1',title:'Squat + Arms + Calves',ex:main('h5sq','Competition Squat','squat').concat([
          A('h5lp','Leg Press',n,3,12,'8',[6]),
          A('h5calf1','Standing Calf Raise (heavy, 2s pause at bottom)',n,5,'8-10','9',[6]),
          A('h5ez','EZ-bar Curl',n,4,'8-10','9',[6]),
          A('h5skull','Skull Crusher',n,3,'10-12','9',[6]),
          C('h5hlr','Hanging Leg Raise',n,3,12,[6])])},
        {d:'2',title:'Bench + Arms + Calves',ex:main('h5bn','Competition Bench','bench').concat([
          A('h5db','DB Bench / Incline DB Press',n,4,10,'8',[6]),
          A('h5row','Chest-supported Row',n,4,10,'8',[6]),
          A('h5push','Cable Pushdown',n,4,'12-15','9',[6]),
          A('h5ham','Hammer Curl',n,3,12,'9',[6]),
          A('h5calf2','Seated Calf Raise',n,4,'15-20','9',[6])])},
        {d:'3',title:'Deadlift + Arms + Calves',ex:main('h5dl','Competition Deadlift','deadlift').concat([
          L('h5psq','Pause Squat (2 sec)','squat',W(3,5,[60,62,65,67,70,null],7)),
          A('h5lc','Leg Curl',n,4,12,'8',[6]),
          B('h5pull','Pull-ups',n,4,'AMRAP',8,[6]),
          A('h5bb','Barbell Curl',n,4,'8-10','9',[6]),
          A('h5calf3','Standing Calf Raise (heavy)',n,4,'10-12','9',[6])])},
        {d:'4',title:'Bench Volume + Arms Pump + Calves',ex:[
          L('h5cg','Close-grip Bench','bench',W([5,5,4,4,3,3],[8,8,6,6,5,5],[62,64,68,70,72,55],[7,7.5,7.5,8,8,5])),
          AR('h5ohp','Overhead Press',[[3,8,null,'7-8'],[3,8,null,'8'],[3,6,null,'8'],[3,6,null,'8'],[3,5,null,'8'],null]),
          A('h5inc','Incline DB Curl',n,3,12,'9',[6]),
          A('h5ohe','Overhead Cable Tricep Extension',n,4,15,'9',[6]),
          A('h5slc','Single-leg Calf Raise',n,3,15,'9',[6]),
          A('h5lat','Lateral Raise',n,4,15,'9',[6])
        ]}
      ]});
  })();

  /* ---------- 4. Candito-style 6 wk (squat focus) ----------
     Wk 1 conditioning, wk 2 hypertrophy, wk 3 linear strength, wk 4 heavy
     acclimation, wk 5 peak, wk 6 test. Bench and deadlift built alongside. */
  (function(){ const n=6;
    NEW['candito-6']=P({ name:'Candito-style Squat (6-wk)', weeks:n, test:6,
      note:'Squat-focused 6 weeks in the Candito style: wk 1 muscular conditioning · wk 2 hypertrophy · wk 3 linear strength · wk 4 heavy-weight acclimation · wk 5 peak (top single at 95%) · wk 6 TEST. Squat 2x a week; bench 2x and deadlift 1-2x a week are still progressed so they move up too, just with less volume. Wk 1-3 are 4 days, wk 4-5 drop to 3 days. Wk 6 tests squat (Day 1), bench (Day 2), deadlift (Day 3).',
      days:[
        {d:'1',title:'Heavy Squat + Deadlift',ex:[
          L('cdsq','Competition Squat','squat',W([4,4,3,3,2,null],[6,5,4,3,2,null],[77,80,85,88,90,null],[7.5,8,8,8.5,8,null])),
          L('cdsqx','Competition Squat top single','squat',W([null,null,null,null,1,null],1,[null,null,null,null,95,null],9)),
          L('cddl','Competition Deadlift','deadlift',W([3,3,3,2,1,null],[5,4,3,2,1,null],[72,77,82,87,92,null],[7,7.5,8,8,8.5,null])),
          A('cdlc','Leg Curl',n,3,10,'8',[4,5,6]),
          C('cdcore','Core',n,3,12,[5,6])
        ].concat(test('cdts','squat','Squat',n,[6]))},
        {d:'2',title:'Upper (Bench)',ex:[
          L('cdbn','Competition Bench','bench',W([4,4,4,3,3,null],[6,5,4,3,2,null],[75,78,82,86,90,null],[7.5,8,8,8,8.5,null])),
          A('cdrow','Barbell Row',n,4,8,'8',[5,6]),
          A('cdohp','Overhead Press',n,3,8,'7-8',[4,5,6]),
          B('cdpull','Pull-ups',n,3,'AMRAP',8,[5,6])
        ].concat(test('cdtb','bench','Bench',n,[6]))},
        {d:'3',title:'Squat Volume + Explosive',ex:[
          L('cdsqv','Competition Squat (volume)','squat',W([3,4,4,2,null,null],[8,6,5,3,null,null],[70,73,77,80,null,null],7)),
          L('cdpsq','Pause Squat (3 sec)','squat',W([3,3,3,null,null,null],[4,4,3,null,null,null],[63,66,68,null,null,null],7)),
          L('cdsqs','Competition Squat speed singles','squat',W([null,null,null,null,3,null],1,[null,null,null,null,85,null],6)),
          A('cdlp','Leg Press',n,3,12,'8',[4,5,6])
        ].concat(test('cdtd','deadlift','Deadlift',n,[6]))},
        {d:'4',title:'Upper Volume + Deadlift Build',ex:[
          L('cdbnv','Competition Bench (volume)','bench',W([4,4,4,null,null,null],[8,7,6,null,null,null],[67,70,73,null,null,null],7)),
          L('cdrdl','Romanian Deadlift','deadlift',W([3,3,3,null,null,null],[8,8,6,null,null,null],[50,53,56,null,null,null],7)),
          A('cdinc','Incline DB Press',n,3,10,'8',[4,5,6]),
          A('cdlat','Lat Pulldown',n,3,10,'8',[4,5,6]),
          A('cdarms','Arms (curl + triceps)',n,3,12,'8-9',[4,5,6])
        ]}
      ]});
  })();

  /* ---------- 5. Bullmastiff-style (9 wk, 4 days) ----------
     Three 3-week blocks: 8s -> 6s -> 4s. Main lift = 4 work sets + an AMRAP
     set; a secondary variation of another lift every day. */
  (function(){ const n=9;
    const mp=[65,67.5,70,72.5,75,77.5,80,82.5,85], mr=[8,8,8,6,6,6,4,4,4];
    const sp=[55,57.5,60,62.5,65,67.5,70,72.5,75], sr=[10,10,10,8,8,8,6,6,6];
    const main=(p,name,lift)=>[
      L(p,name+' work sets',lift,W(4,mr,mp,[7,7,7.5,7,7.5,8,7.5,8,8.5])),
      L(p+'x',name+' AMRAP set',lift,W(1,mr.map(r=>r+'+'),mp))];
    const sec=(p,name,lift)=>L(p,name,lift,W(4,sr,sp,7));
    NEW['bullmastiff']=P({ name:'Bullmastiff-style (9-wk)', weeks:n,
      note:'Three 3-week blocks: wk 1-3 sets of 8 · wk 4-6 sets of 6 · wk 7-9 sets of 4. Each main lift is 4 work sets then one AMRAP set at the same weight - log the reps. Every day also has a secondary variation of another lift. AMRAP guide: hit the target +2 or more and you are on track; +5 or more, raise that 1RM 5-10 lb on the assignment for the next block; fall short twice, lower it 5%. Take a light week after wk 9 before testing or re-running.',
      days:[
        {d:'1',title:'Squat Main + Bench Secondary',ex:main('bmsq','Competition Squat','squat').concat([
          sec('bmlar','Larsen Press','bench'),
          A('bmlp','Leg Press',n,3,12,'8'),
          A('bmlc','Leg Curl',n,3,12,'8'),
          C('bmcore','Core',n,3,12)])},
        {d:'2',title:'Bench Main + Deadlift Secondary',ex:main('bmbn','Competition Bench','bench').concat([
          sec('bmdef','Deficit Deadlift (1 in)','deadlift'),
          A('bmrow','Barbell Row',n,4,10,'8'),
          A('bmtri','Tricep Extension',n,3,12,'8-9'),
          C('bmrd','Rear delts + face pulls',n,3,15)])},
        {d:'3',title:'Deadlift Main + Squat Secondary',ex:main('bmdl','Competition Deadlift','deadlift').concat([
          sec('bmpsq','Pause Squat (2 sec)','squat'),
          B('bmpull','Pull-ups',n,4,'AMRAP',8),
          A('bmhip','Back Extension / Hip Thrust',n,3,10,'8'),
          A('bmcalf','Calf Raise',n,4,15,'9')])},
        {d:'4',title:'Bench Secondary + Upper Hypertrophy',ex:[
          sec('bmcg','Close-grip Bench','bench'),
          A('bmohp','Overhead Press',n,3,8,'8'),
          A('bminc','Incline DB Press',n,3,10,'8'),
          A('bmlat','Lat Pulldown',n,4,10,'8'),
          A('bmarms','Arms (curl + triceps)',n,3,12,'9'),
          A('bmlatr','Lateral Raise',n,3,15,'9')
        ]}
      ]});
  })();

  /* ---------- 6. Sheiko-style (8 wk, 3 days) ----------
     Classic Sheiko ladders: many sub-maximal sets in the 70-85% range,
     bench twice in a session on Day 1. Wk 4 lighter, wk 8 test. */
  (function(){ const n=8;
    const sq1=[[[5,50],[4,60],[3,70,2],[2,80,5]], [[5,50],[4,60],[3,70],[3,75,2],[3,80,4]], [[5,50],[4,60],[3,70],[2,80,2],[2,85,4]], [[5,50],[4,60],[3,70,4]],
               [[5,50],[4,60],[3,70],[2,80],[2,85,2],[1,90,2],[2,80,3]], [[5,50],[4,60],[3,70],[3,80,2],[2,85,4]], [[5,50],[3,60],[3,70],[2,80],[1,90,3],[2,85,2]], null];
    const bn1=[[[5,50],[4,60],[3,70],[3,75,5]], [[5,50],[4,60],[3,70],[2,80,2],[3,75,4]], [[5,50],[4,60],[3,70],[2,80],[2,85,4]], [[5,50],[4,60],[4,70,3]],
               [[5,50],[4,60],[3,70],[2,80],[1,90,2],[3,80,3]], [[5,50],[4,60],[3,70],[3,80,2],[2,85,4]], [[5,50],[3,60],[3,70],[2,80],[1,90,2],[2,85,3]], null];
    const bn1b=[[[6,50],[6,60,4]], [[5,55],[5,65,4]], [[4,60],[4,70,4]], [[5,55,3]], [[5,60],[5,70,4]], [[4,60],[4,72,4]], [[3,60],[3,75,4]], null];
    const dl=[[[3,50],[3,60],[3,70,2],[3,75,4]], [[3,55],[3,65],[3,75],[2,80,4]], [[3,55],[3,65],[2,75],[2,85,3]], [[3,50],[3,60],[3,70,2]],
              [[3,55],[3,65],[3,75],[2,85,2],[1,90,2]], [[3,55],[3,65],[2,75],[2,85,4]], [[3,55],[3,65],[2,75],[1,85],[1,92,2]], null];
    const bn2=[[[5,50],[4,60],[4,70,4]], [[5,50],[4,60],[3,70],[3,75,4]], [[5,50],[4,60],[3,70],[3,78,4]], [[5,50],[4,60,3]],
               [[5,50],[4,60],[3,70],[3,80,4]], [[5,50],[4,60],[3,70],[2,82,4]], [[5,50],[4,60],[3,70],[2,80,3]], null];
    const sq3=[[[5,50],[5,60],[4,70,4]], [[5,50],[4,60],[4,70],[4,75,3]], [[5,50],[4,60],[3,70],[3,78,4]], [[5,50],[4,60,3]],
               [[5,50],[4,60],[3,70],[3,80,4]], [[5,50],[4,60],[3,70],[2,82,4]], [[5,50],[4,60],[3,70],[2,80,2]], null];
    const bn3=[[[5,50],[4,60],[3,70],[3,77,4]], [[5,50],[4,60],[3,70],[2,82,4]], [[5,50],[4,60],[3,70],[2,80],[1,88,3]], [[5,50],[4,60],[3,70,3]],
               [[5,50],[4,60],[3,70],[2,80],[2,85,3]], [[5,50],[4,60],[3,70],[2,80],[1,90,2],[2,82,2]], [[5,50],[4,60],[3,70],[2,80,2]], null];
    NEW['sheiko']=P({ name:'Sheiko-style (8-wk)', weeks:n, deload:4, test:8,
      note:'Sheiko-style high-frequency, sub-maximal volume: lots of clean sets at 70-85% with perfect technique, almost nothing to failure. Each lift is a ladder - the steps are the warm-up climb then the work sets (e.g. step 4 = 5 sets of 2 at 80%). Bench is trained twice in the Day 1 session, as in the original. Wk 4 is lighter, wk 5-6 are the heaviest, wk 7 cuts volume, wk 8 TEST: squat Day 1, bench Day 2, deadlift Day 3. Rest 3-5 min on work sets.',
      days:[
        {d:'1',title:'Squat + Bench x2',ex:ladder('shsq1','Competition Squat','squat',sq1)
          .concat(ladder('shbn1','Competition Bench','bench',bn1))
          .concat([A('shfly','DB Fly',n,4,10,'8',[8])])
          .concat(ladder('shbn1b','Competition Bench (2nd bench of the day)','bench',bn1b))
          .concat([A('shgm','Good Morning',n,4,5,'7',[7,8])])
          .concat(test('shts','squat','Squat',n,[8]))},
        {d:'2',title:'Deadlift + Bench',ex:ladder('shdl','Competition Deadlift','deadlift',dl)
          .concat([L('shdlk','Deadlift to Knees (pause at knee)','deadlift',W([4,4,4,3,4,4,null,null],3,[60,65,70,55,70,72,null,null],7),{variant:true})])
          .concat(ladder('shbn2','Competition Bench','bench',bn2))
          .concat([B('shdip','Dips',n,4,'8-10',8,[8]), A('shlat','Lat Pulldown',n,4,10,'8',[8]), C('shabs','Abs',n,3,15,[8])])
          .concat(test('shtb','bench','Bench',n,[8]))},
        {d:'3',title:'Squat + Bench',ex:ladder('shsq3','Competition Squat','squat',sq3)
          .concat(ladder('shbn3','Competition Bench','bench',bn3))
          .concat([A('shinc','Incline DB Press',n,4,8,'8',[8]), C('shhyp','Hyperextensions',n,4,10,[8])])
          .concat(test('shtd','deadlift','Deadlift',n,[8]))}
      ]});
  })();

  /* ---------- 7. GZCLP-style (12 wk, 4 days) ----------
     T1 heavy (5x3+ -> 6x2+ -> 10x1+), T2 volume (3x10 -> 3x8 -> 3x6),
     T3 pump work. Wk 12 test. */
  (function(){ const n=12;
    const t1p=[75,77.5,80,82.5,85,85,87.5,90,88,90,92,null];
    const t1s=[4,4,4,4,4,5,5,5,9,9,9,null], t1r=[3,3,3,3,3,2,2,2,1,1,1,null];
    const t1x=['3+','3+','3+','3+','3+','2+','2+','2+','1+','1+','1+',null];
    const t2p=[55,57.5,60,62.5,65,65,67.5,70,70,72.5,75,null], t2r=[10,10,10,10,10,8,8,8,6,6,6,null];
    const T1=(p,name,lift,adj)=>{ const pp=t1p.map(v=>v==null?null:v-(adj||0));
      return [L(p,'T1 '+name,lift,W(t1s,t1r,pp,8)), L(p+'x','T1 '+name+' last set (AMRAP)',lift,W(1,t1x,pp))]; };
    const T2=(p,name,lift,o)=>L(p,'T2 '+name,lift,W(3,t2r,t2p,8),o);
    const T3=(k,name)=>A(k,'T3 '+name,n,3,'15+','9',[12]);
    NEW['gzclp']=P({ name:'GZCLP-style (12-wk)', weeks:n, test:12,
      note:'GZCLP tiers on a fixed 12-week ramp. T1 = heavy main lift: wk 1-5 5x3 (last set AMRAP), wk 6-8 6x2, wk 9-11 10x1 - the classic stage changes, pre-planned. T2 = volume: 3x10 -> 3x8 -> 3x6. T3 = pump work, 3 sets of 15+; when the last set hits 25 reps, add weight. Bench is the T1 twice a week (Day 4 slightly lighter). If a T1 AMRAP falls short of the target reps, repeat that week\'s weight next session before moving on. Wk 12 TEST: squat Day 1, bench Day 2, deadlift Day 3.',
      days:[
        {d:'1',title:'A1 · Squat T1 / Bench T2',ex:T1('gzsq','Competition Squat','squat').concat([
          T2('gzbn2','Competition Bench','bench'), T3('gzlat','Lat Pulldown'), T3('gzlc','Leg Curl')])
          .concat(test('gzts','squat','Squat',n,[12]))},
        {d:'2',title:'B1 · Bench T1 / Deadlift T2',ex:T1('gzbn','Competition Bench','bench').concat([
          T2('gzdl2','Competition Deadlift','deadlift'), T3('gzrow','Cable Row'), T3('gztri','Tricep Pushdown')])
          .concat(test('gztb','bench','Bench',n,[12]))},
        {d:'3',title:'A2 · Deadlift T1 / Squat T2',ex:T1('gzdl','Competition Deadlift','deadlift').concat([
          T2('gzpsq','Pause Squat (2 sec)','squat'), T3('gzlat2','Lat Pulldown'), C('gzabs','T3 Abs',n,3,15,[12])])
          .concat(test('gztd','deadlift','Deadlift',n,[12]))},
        {d:'4',title:'B2 · Bench T1 (light) / Overhead Press T2',ex:T1('gzbnb','Competition Bench (light day)','bench',5).concat([
          AR('gzohp','T2 Overhead Press',R(n,i=>i===11?null:[3,t2r[i],null,'8'])), T3('gzcurl','Bicep Curl'), T3('gzlatr','Lateral Raise')])}
      ]});
  })();

  /* ---------- 8. nSuns-style 4-day (6 wk) ----------
     9-set T1 pyramids with a 1+ / 5+ / 8+ AMRAP, 8-set T2 at a fixed %.
     Built off a training max of 90% of the entered 1RM, nudged up each week. */
  (function(){ const n=6;
    const sq=[[75,5],[85,3],[95,'1+'],[90,3],[85,3],[80,3],[75,5],[70,5],[65,'5+']];
    const dl=[[75,5],[85,3],[95,'1+'],[90,3],[85,3],[80,3],[75,3],[70,3],[65,'3+']];
    const bv=[[65,8],[75,6],[85,4],[85,4],[85,4],[80,5],[75,6],[70,7],[65,'8+']];
    const bh=[[75,5],[85,3],[95,'1+'],[90,3],[85,5],[80,3],[75,5],[70,3],[65,'5+']];
    const t2=b=>[[b-20,6],[b-10,5],[b,3],[b,5],[b,7],[b,4],[b,6],[b,8]];
    const dT1=[[65,5],[75,5],[85,3]], dT2=b=>[[b-20,5],[b-10,5],[b,5]];
    // pct of 1RM = TM% x 0.90 x (1 + weekly bump); wk 6 = deload at the wk 1 TM.
    const price=(scheme,deload,inc,ratio)=>R(n,i=>(i===n-1?deload:scheme).map(([tm,r])=>{
      const bump=i===n-1?0:inc*i; return [r,Math.round(tm*0.9*(1+bump)*(ratio||1)*2)/2]; }));
    const T1=(p,name,lift,scheme,inc)=>ladder(p,'T1 '+name,lift,price(scheme,dT1,inc));
    const T2=(p,name,lift,base,inc,ratio)=>ladder(p,'T2 '+name,lift,price(t2(base),dT2(base),inc,ratio),{variant:true});
    NEW['nsuns']=P({ name:'nSuns-style 4-day (6-wk)', weeks:n, deload:6,
      note:'nSuns-style linear progression, 4 days. T1 = 9-set pyramid with an AMRAP (the + sets): hit the reps and push the 1+ set hard but clean. T2 = 8 sets at a fixed weight. Built off a training max of 90% of the 1RM you enter, and the app raises it each week (bench ~1%, squat/deadlift ~1.5%). Wk 6 deload. Re-test guide: if the 1+ sets gave 4+ reps in wk 5, raise that 1RM 10 lb on the assignment; 2-3 reps, +5 lb; 0-1, keep it. Overhead press is priced at ~62% of your bench - if that is off for you, log the weight you actually use.',
      days:[
        {d:'1',title:'Bench Volume T1 / Overhead Press T2',ex:T1('nsbv','Competition Bench (volume)','bench',bv,0.01)
          .concat(T2('nsohp','Overhead Press','bench',70,0.01,0.62))
          .concat([A('nsrow','Chest-supported Row',n,4,10,'8',[6]), A('nslatr','Lateral Raise',n,3,15,'9',[6]), A('nstri','Tricep Extension',n,3,12,'9',[6])])},
        {d:'2',title:'Squat T1 / Sumo Deadlift T2',ex:T1('nssq','Competition Squat','squat',sq,0.015)
          .concat(T2('nssdl','Sumo Deadlift','deadlift',70,0.015))
          .concat([A('nslc','Leg Curl',n,3,12,'8',[6]), C('nsabs','Abs',n,3,15,[6])])},
        {d:'3',title:'Bench Heavy T1 / Close-grip Bench T2',ex:T1('nsbh','Competition Bench (heavy)','bench',bh,0.01)
          .concat(T2('nscg','Close-grip Bench','bench',60,0.01))
          .concat([B('nspull','Pull-ups',n,4,'AMRAP',8,[6]), C('nsrd','Rear delts + face pulls',n,3,15,[6]), A('nscurl','Bicep Curl',n,3,12,'9',[6])])},
        {d:'4',title:'Deadlift T1 / Front Squat T2',ex:T1('nsdl','Competition Deadlift','deadlift',dl,0.015)
          .concat(T2('nsfs','Front Squat','squat',55,0.015))
          .concat([C('nshyp','Back Extension',n,3,12,[6]), A('nscalf','Calf Raise',n,4,15,'9',[6])])}
      ]});
  })();

  /* ---------- 9. TSA-style 9-week Intermediate (4 days) ----------
     RPE-capped top set + back-offs for each comp lift, bench 3x/week,
     intensity climbs weekly, wk 8 lighter volume, wk 9 test. */
  (function(){ const n=9;
    NEW['tsa-9']=P({ name:'TSA-style Intermediate (9-wk)', weeks:n, test:9,
      note:'Intermediate block in the TSA style: one top set at a target RPE, then back-off sets, with intensity climbing each week and volume coming down. The % gives the planned weight; the RPE is the cap - if the top set is moving slower than the RPE says, take 5-10 lb off the back-offs. Squat 2x, bench 3x, deadlift 2x a week. Wk 8 cuts volume to sharpen up, wk 9 TEST: squat Day 1, bench Day 2, deadlift Day 3.',
      days:[
        {d:'1',title:'Squat + Bench',ex:[
          L('tssq','Competition Squat top set','squat',W(1,[5,5,4,4,3,3,2,1,null],[75,77.5,80,82.5,85,87.5,90,93,null],[7,7,7.5,7.5,8,8,8.5,8.5,null])),
          L('tssqb','Competition Squat back-off','squat',W([3,3,3,3,3,2,2,2,null],[5,5,4,4,3,3,2,2,null],[70,72,75,77,80,82,85,85,null],7)),
          L('tsbn','Competition Bench top set','bench',W(1,[6,5,5,4,4,3,3,2,null],[74,77,79,81,83,85,87,90,null],[7,7,7.5,7.5,8,8,8.5,8.5,null])),
          L('tsbnb','Competition Bench back-off','bench',W(3,[6,6,5,5,4,4,3,3,null],[68,70,72,74,76,78,80,82,null],7)),
          A('tsrow','Barbell Row',n,4,8,'8',[9]),
          C('tscore','Core',n,3,12,[9])
        ].concat(test('tsts','squat','Squat',n,[9]))},
        {d:'2',title:'Deadlift + Bench Variation',ex:[
          L('tsdl','Competition Deadlift top set','deadlift',W(1,[5,4,4,3,3,2,2,1,null],[75,78,80,83,85,88,90,93,null],[7,7,7.5,7.5,8,8,8.5,8.5,null])),
          L('tsdlb','Competition Deadlift back-off','deadlift',W([2,2,2,2,2,2,1,1,null],[5,4,4,3,3,2,2,2,null],[70,72,75,77,80,82,85,85,null],7)),
          L('tsspo','Spoto Press','bench',W(3,[6,6,5,5,4,4,3,3,null],[65,67,70,72,74,76,78,78,null],7.5)),
          A('tslc','Leg Curl',n,3,10,'8',[9]),
          A('tslat','Lat Pulldown',n,3,10,'8',[9])
        ].concat(test('tstb','bench','Bench',n,[9]))},
        {d:'3',title:'Squat Variation + Bench Volume',ex:[
          L('tspsq','Pause Squat (3 sec)','squat',W(3,[5,5,4,4,3,3,null,null,null],[63,65,68,70,72,74,null,null,null],7)),
          L('tsbnv','Competition Bench (volume)','bench',W([4,4,4,4,3,3,3,2,null],[8,7,6,6,5,5,4,3,null],[65,68,70,72,74,76,78,75,null],7)),
          A('tsdbr','DB Row',n,3,10,'8',[9]),
          A('tstri','Tricep Extension',n,3,12,'8-9',[9])
        ].concat(test('tstd','deadlift','Deadlift',n,[9]))},
        {d:'4',title:'Deadlift Variation + Bench Volume 2',ex:[
          L('tsdef','Deficit Deadlift (1 in)','deadlift',W(3,[5,5,4,4,3,3,null,null,null],[62,64,67,69,72,74,null,null,null],7)),
          L('tscg','Close-grip Bench','bench',W(3,[8,8,6,6,5,5,4,null,null],[62,64,67,69,72,74,76,null,null],7.5)),
          A('tslp','Leg Press',n,3,12,'8',[8,9]),
          A('tscalf','Calf Raise',n,3,15,'9',[8,9]),
          A('tslatr','Lateral Raise',n,3,15,'9',[8,9])
        ]}
      ]});
  })();

  /* ---------- 10. Texas Method-style (8 wk, 3 days) ----------
     Volume day (5x5 at ~90% of Friday), light recovery day, intensity day
     (a 5-rep PR each week). Wk 8 switches intensity day to triples. */
  (function(){ const n=8;
    const fri=[80,81.5,83,84.5,86,87.5,89,92], bfri=[80,81,82,83,84,85,86,90];
    const vol=fri.map(v=>Math.round(v*0.9*2)/2), bvol=bfri.map(v=>Math.round(v*0.9*2)/2);
    const rec=vol.map(v=>Math.round(v*0.8*2)/2);
    NEW['texas-method']=P({ name:'Texas Method-style (8-wk)', weeks:n,
      note:'Texas Method, 3 days. Day 1 VOLUME: 5x5 at ~90% of Friday\'s weight. Day 2 RECOVERY: light squats (80% of Monday) plus press and back work - it should feel easy. Day 3 INTENSITY: one heavy set of 5, a small PR every week. Deadlift is one heavy 5 on Day 1. Wk 8 switches intensity day to a triple. If a Friday 5 is missed, repeat it next week; missing twice means it is time for a new block. Rest 3-5 min on main sets.',
      days:[
        {d:'1',title:'Volume Day',ex:[
          L('txsqv','Competition Squat 5x5','squat',W(5,5,vol,[7,7,7.5,7.5,8,8,8,8])),
          L('txbnv','Competition Bench 5x5','bench',W(5,5,bvol,[7,7,7.5,7.5,8,8,8,8])),
          L('txdl','Competition Deadlift 1x5','deadlift',W(1,5,[78,80,82,84,86,88,90,85],[7.5,8,8,8.5,8.5,9,9,7])),
          B('txchin','Chin-ups',n,3,'AMRAP',8)
        ]},
        {d:'2',title:'Recovery Day',ex:[
          L('txsqr','Competition Squat (light)','squat',W(2,5,rec,5)),
          AR('txohp','Overhead Press',R(n,()=>[3,5,null,'7-8'])),
          L('txcg','Close-grip Bench (light)','bench',W(3,5,bvol.map(v=>Math.round(v*0.85*2)/2),6)),
          C('txhyp','Back Extension',n,3,10),
          B('txchin2','Chin-ups',n,3,'AMRAP',7)
        ]},
        {d:'3',title:'Intensity Day',ex:[
          L('txsqi','Competition Squat - intensity set','squat',W(1,[5,5,5,5,5,5,5,3],fri,[8,8,8.5,8.5,9,9,9,9])),
          L('txbni','Competition Bench - intensity set','bench',W(1,[5,5,5,5,5,5,5,3],bfri,[8,8,8.5,8.5,9,9,9,9])),
          L('txbnb','Competition Bench back-off','bench',W(2,8,bfri.map(v=>v-15),7)),
          A('txrow','Pendlay Row',n,3,5,'8'),
          A('txglute','Glute-ham Raise / Leg Curl',n,3,8,'8'),
          C('txabs','Abs',n,3,12)
        ]}
      ]});
  })();

  /* ---------- 11. PRS Powerlifting 15 wk (4 days) ----------
     Hypertrophy (wk 1-4) -> deload -> Strength (wk 6-9) -> deload ->
     Peak (wk 11-13) -> taper/openers (wk 14) -> test (wk 15). */
  (function(){ const n=15;
    const X=null;
    NEW['prs-15']=P({ name:'PRS Powerlifting (15-wk)', weeks:n, deload:[5,10], test:15,
      note:'15-week periodised block. HYPERTROPHY wk 1-4 (sets of 8-6) · deload wk 5 · STRENGTH wk 6-9 (sets of 6-4 plus back-offs) · deload wk 10 · PEAK wk 11-13 (triples to heavy singles) · wk 14 taper + opener singles (Day 3) · wk 15 TEST: squat Day 1, bench Day 2, deadlift Day 3 - or use it as a meet week. Variations rotate by block (RDL -> deficit -> paused deadlift). Accessories drop out in the peak so the comp lifts get the energy.',
      days:[
        {d:'1',title:'Squat + Bench',ex:[
          L('prsq','Competition Squat','squat',W([5,5,5,4,3, 5,5,4,4,3, 3,3,2,2,X],[8,8,7,6,5, 5,5,4,4,4, 3,2,1,2,X],[65,67.5,70,72.5,60, 75,77.5,80,82.5,65, 85,88,92,75,X],[7,7,7.5,8,5, 7,7.5,8,8,5, 8,8.5,8.5,6,X])),
          L('prsqb','Competition Squat back-off','squat',W([X,X,X,X,X, 2,2,2,2,X, 2,2,2,X,X],[X,X,X,X,X, 6,6,5,5,X, 3,3,2,X,X],[X,X,X,X,X, 68,70,72,74,X, 78,80,82,X,X],7)),
          L('prbn','Competition Bench','bench',W([5,5,5,4,3, 5,5,5,4,3, 4,4,3,2,X],[8,8,7,6,5, 6,5,5,4,4, 3,3,2,2,X],[65,67.5,70,72.5,60, 74,76,79,82,65, 85,87,90,72,X],[7,7,7.5,8,5, 7,7.5,8,8,5, 8,8.5,8.5,6,X])),
          A('prrow','Barbell Row',n,4,8,'8',[5,10,13,14,15]),
          C('prcore','Core',n,3,12,[13,14,15])
        ].concat(test('prts','squat','Squat',n,[15]))},
        {d:'2',title:'Deadlift + Bench Variation',ex:[
          L('prdl','Competition Deadlift','deadlift',W([4,4,4,3,2, 4,4,3,3,2, 3,3,2,2,X],[6,6,5,5,5, 5,4,4,3,3, 3,2,1,2,X],[65,68,71,74,60, 75,78,81,84,65, 86,89,93,70,X],[7,7,7.5,8,5, 7,7.5,8,8,5, 8,8.5,8.5,6,X])),
          L('prlar','Larsen Press','bench',W([4,4,4,4,X, 4,4,3,3,X, 3,3,X,X,X],[8,8,7,6,X, 6,5,5,4,X, 4,3,X,X,X],[62,64,66,68,X, 70,72,74,76,X, 77,79,X,X,X],7.5)),
          A('prlc','Leg Curl',n,3,12,'8',[5,10,13,14,15]),
          B('prpull','Pull-ups',n,4,'AMRAP',8,[5,10,13,14,15])
        ].concat(test('prtb','bench','Bench',n,[15]))},
        {d:'3',title:'Squat Variation + Bench Volume',ex:[
          I('pro14','TAPER WEEK - opener singles only. Pick weights you could triple; if one is slow, lower the opener.',n,[14]),
          L('prpsq','Pause Squat (2 sec)','squat',W([4,4,4,4,X, 3,3,3,3,X, 3,3,X,X,X],[5,5,5,5,X, 4,4,4,4,X, 3,3,X,X,X],[60,62,64,66,X, 66,68,70,72,X, 72,74,X,X,X],7)),
          L('prbnv','Competition Bench (volume)','bench',W([4,4,4,4,3, 4,4,4,4,3, 3,3,3,X,X],[10,10,9,8,8, 6,6,6,6,5, 4,4,3,X,X],[60,62,64,66,55, 70,72,74,76,60, 78,80,75,X,X],7)),
          L('prosq','Squat opener single','squat',W([X,X,X,X,X,X,X,X,X,X,X,X,X,1,X],1,[X,X,X,X,X,X,X,X,X,X,X,X,X,90,X],7)),
          L('probn','Bench opener single','bench',W([X,X,X,X,X,X,X,X,X,X,X,X,X,1,X],1,[X,X,X,X,X,X,X,X,X,X,X,X,X,90,X],7)),
          L('prodl','Deadlift opener single','deadlift',W([X,X,X,X,X,X,X,X,X,X,X,X,X,1,X],1,[X,X,X,X,X,X,X,X,X,X,X,X,X,90,X],7)),
          A('prdbr','DB Row',n,3,10,'8',[5,10,13,14,15]),
          A('prtri','Tricep Extension',n,3,12,'8-9',[5,10,13,14,15])
        ].concat(test('prtd','deadlift','Deadlift',n,[15]))},
        {d:'4',title:'Deadlift Variation + Hypertrophy',ex:[
          L('prrdl','Romanian Deadlift','deadlift',W([3,3,3,3,X,X,X,X,X,X,X,X,X,X,X],8,[50,52,54,56,X,X,X,X,X,X,X,X,X,X,X],7)),
          L('prdef','Deficit Deadlift (1 in)','deadlift',W([X,X,X,X,X,3,3,3,3,X,X,X,X,X,X],4,[X,X,X,X,X,66,68,70,72,X,X,X,X,X,X],7.5)),
          L('prpdl','Paused Deadlift (2 sec below knee)','deadlift',W([X,X,X,X,X,X,X,X,X,X,3,3,X,X,X],2,[X,X,X,X,X,X,X,X,X,X,70,72,X,X,X],7.5)),
          L('prcg','Close-grip Bench','bench',W([3,3,3,3,X, 3,3,3,3,X, 3,X,X,X,X],[10,10,8,8,X, 6,6,6,6,X, 5,X,X,X,X],[60,62,64,66,X, 68,70,72,74,X, 75,X,X,X,X],7.5)),
          A('prlatr','Lateral Raise',n,3,15,'9',[5,10,12,13,14,15]),
          A('prcalf','Calf Raise',n,3,15,'9',[5,10,12,13,14,15]),
          A('prarms','Arms (curl + triceps)',n,3,12,'9',[5,10,12,13,14,15])
        ]}
      ]});
  })();

  Object.keys(NEW).forEach(k=>{ PROGRAMS[k]=NEW[k]; if(HARDCODED_KEYS.indexOf(k)<0) HARDCODED_KEYS.push(k); });
  PROG_KEYS=Object.keys(PROGRAMS);
})();
