/* ===== programs ===== */
/* ===== Training programs (multi-program engine) ===== */
function mainTriple(prefix,name,lift){
  const s1=[70,72.5,77.5,60], s2=[75,77.5,82.5,65], tp=[80,82.5,87.5,70];
  const rA=[5,5,3,5], rT=['5+','5+','3+',5];
  const e1=['4-5','4-5','4-5','5'], e2=['7','7','7','6'], e3=[8,8,9,'6'];
  return [
    {k:prefix+'1',name:name+' \u2014 set 1',lift:lift,t:'w',wk:[0,1,2,3].map(i=>[1,rA[i],s1[i],e1[i]])},
    {k:prefix+'2',name:name+' \u2014 set 2',lift:lift,t:'w',wk:[0,1,2,3].map(i=>[1,rA[i],s2[i],e2[i]])},
    {k:prefix+'3',name:name+' \u2014 top set',lift:lift,t:'w',drive:true,wk:[0,1,2,3].map(i=>[1,rT[i],tp[i],e3[i]])}
  ];
}
const a3=(s,r,rpe)=>[[s,r,null,rpe],[s,r,null,rpe],[s,r,null,rpe],null];          // accessory, same 3 wks then deload-out
const a3v=(s,r,s3,r3,rpe)=>[[s,r,null,rpe],[s,r,null,rpe],[s3,r3,null,rpe],null];  // accessory with a wk-3 variation

const PROGRAMS={
  'primal-foundation':{
    name:'Primal Foundation (4-wk base)',
    weeks:4, deload:4, refTM:{squat:100,bench:100,deadlift:100},
    note:'Base block. Mains run off training max (90% of 1RM). Week 4 is a deload \u2014 light mains only. Best AMRAP from Week 3 sets the maxes for Primal Infant.',
    days:[
      {d:'1',title:'Bench Focus',ex:[
        ...mainTriple('fbp','Bench Press','bench'),
        {k:'incdb',name:'Incline DB Press',lift:null,t:'rpe',wk:a3(3,8,'7-8')},
        {k:'rowA',name:'Row of choice',lift:null,t:'rpe',wk:a3v(3,10,4,8,'7-8')},
        {k:'pulldown',name:'Pulldown of choice',lift:null,t:'rpe',wk:a3(3,8,'7-8')},
        {k:'tricepA',name:'Tricep extension',lift:null,t:'rpe',wk:a3(3,12,'7-8')},
        {k:'latraise',name:'Side lateral',lift:null,t:'rpe',wk:a3(3,12,'8-9')},
        {k:'bicepA',name:'Bicep curl',lift:null,t:'rpe',wk:a3(4,10,'8-9')}
      ]},
      {d:'2',title:'Squat Focus',ex:[
        ...mainTriple('fsq','Competition Squat','squat'),
        {k:'machdb',name:'Machine / DB Bench',lift:null,t:'rpe',wk:a3v(4,'8-10',4,'10-12','8-9')},
        {k:'legpress',name:'Leg Press',lift:null,t:'rpe',wk:a3v(4,'10-12',4,12,'8-9')},
        {k:'legcurl',name:'Leg Curl',lift:null,t:'rpe',wk:a3(4,10,'7-8')},
        {k:'legext',name:'Leg Extension',lift:null,t:'rpe',wk:a3(3,8,'8-9')},
        {k:'calf',name:'Calf Raise',lift:null,t:'rpe',wk:a3v(4,'12-15',3,'12-15','9')}
      ]},
      {d:'3',title:'Deadlift Focus',ex:[
        ...mainTriple('fdl','Competition Deadlift','deadlift'),
        {k:'ohptop',name:'Overhead Press (strict)',lift:null,t:'rpe',wk:a3(1,5,'7')},
        {k:'ohpbo',name:'Overhead Press (back-off)',lift:null,t:'rpe',wk:a3(2,8,'7-8')},
        {k:'fly',name:'Machine / Cable Fly',lift:null,t:'rpe',wk:a3(3,12,'7-8')},
        {k:'rowC',name:'Row of choice',lift:null,t:'rpe',wk:a3(4,8,'7-8')},
        {k:'tricepC',name:'Tricep extension',lift:null,t:'rpe',wk:a3(3,8,'8-9')},
        {k:'bicepC',name:'Bicep curl',lift:null,t:'rpe',wk:a3(4,'8-10','8-9')}
      ]},
      {d:'4',title:'Variation & Weak Points',ex:[
        {k:'pausesqF',name:'Comp Pause Squat (0-1-0)',lift:null,t:'rpe',wk:a3(3,5,'7')},
        {k:'benchvol',name:'Comp Bench (volume)',lift:null,t:'rpe',wk:a3(3,3,'7')},
        {k:'rdlF',name:'RDL / 45\u00b0 Hyperextension',lift:null,t:'rpe',wk:a3(3,'8-10','7-8')},
        {k:'pullupF',name:'Pull-ups (superset)',lift:null,t:'bw',wk:[[3,'5+','BW',null],[3,'5+','BW',null],[3,'5+','BW',null],null]},
        {k:'shrugs',name:'Shrugs (superset)',lift:null,t:'rpe',wk:a3(3,'15-20','9')},
        {k:'cablerow',name:'Machine / Cable Row',lift:null,t:'rpe',wk:a3(3,12,'7-8')}
      ]}
    ]
  },
  'primal-infant':{
    name:'Primal Infant (8-wk peak)',
    weeks:8, deload:4, refTM:{squat:390,bench:250,deadlift:524},
    note:'Peak block. Working weights scale off training max (90% of 1RM), rounded to 5 lb. Week 4 is a deload.',
    days:[
      {d:'A',title:'Squat Heavy + Bench Volume',ex:[
        {k:'compsq',name:'Competition Squat',lift:'squat',t:'w',drive:true,wk:[[4,4,315,7],[4,4,325,7.5],[4,4,335,7.5],[3,3,305,6],[4,3,345,8],[4,3,355,8],[3,2,365,8.5],[3,2,345,7]]},
        {k:'compsq_bo',name:'Comp Squat (back-off)',lift:'squat',t:'w',wk:[null,null,null,null,[3,2,315,7],[2,2,325,7.5],[2,2,315,7],[2,2,295,6.5]]},
        {k:'pbench',name:'Pause Bench (1 sec)',lift:'bench',t:'w',wk:[[4,5,180,7],[4,5,185,7.5],[4,4,195,8],[3,3,175,6],[4,3,200,7.5],[4,3,205,8],[3,2,210,8],[3,3,165,6]]},
        {k:'pbench_bo',name:'Pause Bench (back-off)',lift:'bench',t:'w',wk:[[3,6,160,7],[3,6,165,7],[3,5,175,7],[2,4,155,6],[3,4,180,7],[3,4,185,7],[2,3,190,7.5],[2,3,155,6]]},
        {k:'cgbench',name:'Close-grip Bench',lift:'bench',t:'w',wk:[[3,8,155,7],[3,8,160,7],[3,8,165,7.5],[2,8,145,6],[3,6,170,7.5],[3,6,175,7.5],null,null]},
        {k:'rowsA',name:'Rows',lift:null,t:'bw',wk:[[4,8,'BW',7],[4,8,'BW',7],[4,8,'BW',7],[2,8,'BW',6],[3,8,'BW',7],[3,8,'BW',7],null,null]}
      ]},
      {d:'B',title:'Sumo Deadlift Heavy + Larsen Press',ex:[
        {k:'sumodl',name:'Sumo Deadlift',lift:'deadlift',t:'w',drive:true,wk:[[4,4,405,7],[4,3,420,7.5],[4,3,430,8],[3,3,385,6],[3,2,450,8],[3,2,465,8],[1,1,490,8.5],[3,3,350,6]]},
        {k:'sumodl_bo',name:'Sumo DL (back-off)',lift:'deadlift',t:'w',wk:[null,null,null,null,[2,2,415,7],[2,2,425,7],[1,2,455,7.5],null]},
        {k:'blockpull',name:'Sumo Block Pulls (2 in)',lift:'deadlift',t:'w',wk:[[3,3,415,7],[3,3,430,7.5],[3,3,440,8],[2,3,385,6],[3,2,460,8],[3,2,475,8],null,null]},
        {k:'larsen',name:'Larsen Press',lift:'bench',t:'w',wk:[[3,5,165,7],[3,5,170,7],[3,5,175,7],[2,4,155,6],[3,5,180,7],[3,5,185,7],[2,4,175,7],null]},
        {k:'ohp',name:'OHP',lift:'bench',t:'w',wk:[[4,6,95,7],[4,6,100,7],[4,6,105,7],[3,6,85,6],[3,6,110,7],[3,6,115,7],[2,6,95,6],null]},
        {k:'pullupB',name:'Pull-ups',lift:null,t:'bw',wk:[[4,'AMRAP','BW',7],[4,'AMRAP','BW',7],[4,'AMRAP','BW',7],[2,'AMRAP','BW',6],[3,'AMRAP','BW',7],[3,'AMRAP','BW',7],[2,'AMRAP','BW',6],null]}
      ]},
      {d:'C',title:'Bench Heavy + Squat Volume',ex:[
        {k:'compbench',name:'Comp Bench (pause + command)',lift:'bench',t:'w',drive:true,wk:[[4,4,195,7],[4,4,200,7.5],[4,3,210,8],[3,3,190,6],[4,3,215,7.5],[4,3,220,8],[3,2,235,8],[1,1,220,7]]},
        {k:'compbench_bo',name:'Comp Bench (back-off)',lift:'bench',t:'w',wk:[[3,6,175,7],[3,5,185,7],[3,4,190,7],[2,3,175,6],[3,3,200,7],[3,3,205,7],[2,2,225,7.5],[2,3,195,6.5]]},
        {k:'spoto',name:'Spoto Press',lift:'bench',t:'w',wk:[[3,5,165,7],[3,5,170,7],[3,5,175,7],[2,4,155,6],[3,5,180,7.5],[3,5,185,7.5],[2,4,175,7],null]},
        {k:'compsq_vol',name:'Comp Squat (volume)',lift:'squat',t:'w',wk:[[3,5,285,7],[3,5,295,7],[3,5,305,7.5],[2,4,270,6],[3,4,315,7.5],[3,4,325,7.5],[2,3,305,7],null]},
        {k:'pausesq',name:'Pause Squat (3 sec)',lift:'squat',t:'w',wk:[[3,4,245,7],[3,4,255,7],[3,4,265,7.5],[2,3,235,6],[3,3,275,7.5],[3,3,280,7.5],[2,3,265,7],null]},
        {k:'tricep',name:'Tricep work',lift:null,t:'acc',wk:[[3,12,null,7],[3,12,null,7],[3,12,null,7],[2,10,null,6],[3,12,null,7],[3,12,null,7],null,null]}
      ]},
      {d:'D',title:'Optional \u2014 Accessories + Weak Points',ex:[
        {k:'pausedsumo',name:'Paused Sumo (2 sec off floor)',lift:'deadlift',t:'w',wk:[[3,3,320,7],[3,3,330,7],[3,3,340,7],[2,2,305,6],[3,2,350,7],[3,2,360,7],[2,2,370,7.5],null]},
        {k:'rdl',name:'Romanian Deadlift',lift:'deadlift',t:'w',wk:[[3,6,225,7],[3,6,235,7],[3,6,245,7.5],[2,5,205,6],[3,6,255,7.5],[3,6,265,7.5],[2,5,245,7],null]},
        {k:'highbarsq',name:'High-bar Squat',lift:'squat',t:'w',wk:[[4,6,265,7],[4,6,275,7],[4,6,285,7.5],[2,5,245,6],[3,6,295,7.5],[3,6,305,7.5],[2,5,275,7],null]},
        {k:'pullupD',name:'Pull-ups',lift:null,t:'bw',wk:[[3,'AMRAP','BW',7],[3,'AMRAP','BW',7],[3,'AMRAP','BW',7],[2,'AMRAP','BW',6],[3,'AMRAP','BW',7],[3,'AMRAP','BW',7],[2,'AMRAP','BW',6],null]},
        {k:'reardelt',name:'Rear delts + face pulls',lift:null,t:'acc',wk:[[3,15,null,null],[3,15,null,null],[3,15,null,null],[2,12,null,null],[3,15,null,null],[3,15,null,null],[2,12,null,null],null]},
        {k:'core',name:'Core',lift:null,t:'acc',wk:[[3,12,null,null],[3,12,null,null],[3,12,null,null],[2,10,null,null],[3,12,null,null],[3,12,null,null],[2,10,null,null],null]}
      ]}
    ]
  }
};
PROGRAMS['primal-grown-gorilla']={name:'Primal Grown Gorilla (8-wk)',weeks:8,deload:4,refTM:{squat:390,bench:250,deadlift:524},note:'8-week peak. Working weights scale off training max (90% of 1RM), rounded to 5 lb. Week 4 is a deload.',days:JSON.parse(JSON.stringify(PROGRAMS['primal-infant'].days))};
PROGRAMS['primal-gorilla-fire']=(function(){
  const l4=(s,r,ws)=>[[s,r,ws[0],null],[s,r,ws[1],null],[s,r,ws[2],null],[s,r,ws[3],null],null];
  const w5=(s,r,w)=>[null,null,null,null,[s,r,w,null]];
  const info=(k,name)=>({k,name,lift:null,t:'info',wk:[null,null,null,null,[1,1,null,null]]});
  return {
    name:'Primal Gorilla Through Fire (5-wk)', weeks:5, deload:0,
    refTM:{squat:375,bench:245,deadlift:525},
    note:'Mixed Smolov Jr \u2014 high-frequency squat & bench, deadlift kept light. 4 loading weeks + a peak/test week. Enter each 1RM so the training max equals the block max (e.g. 417 / 272 / 583 lb \u2192 TM 375 / 245 / 525). The source deadlift TM looked high \u2014 enter a realistic deadlift number so the test attempts come out sane.',
    days:[
      {d:'1',title:'Heavy Volume \u00b7 6\u00d76  (Wk5: peak triples)',ex:[
        {k:'gsq6',name:'Competition Squat \u2014 6\u00d76',lift:'squat',t:'w',wk:l4(6,6,[265,275,285,295])},
        {k:'gbn6',name:'Competition Bench 0-1-0 \u2014 6\u00d76',lift:'bench',t:'w',wk:l4(6,6,[170,175,180,185])},
        {k:'gsqpk',name:'Competition Squat \u2014 peak triples',lift:'squat',t:'w',wk:w5(3,3,295)},
        {k:'gbnpk',name:'Competition Bench 0-1-0 \u2014 peak triples',lift:'bench',t:'w',wk:w5(3,3,205)},
        {k:'gdlpk',name:'Sumo Deadlift \u2014 peak',lift:'deadlift',t:'w',wk:w5(2,2,405)}
      ]},
      {d:'2',title:'Bench 7\u00d75 + Sumo  (Wk5: openers)',ex:[
        {k:'gbn7',name:'Competition Bench 0-1-0 \u2014 7\u00d75',lift:'bench',t:'w',wk:l4(7,5,[185,190,195,200])},
        {k:'gdlsumo',name:'Sumo Deadlift \u2014 4\u00d73',lift:'deadlift',t:'w',drive:true,wk:l4(4,3,[315,340,370,380])},
        {k:'gdlpsumo',name:'Paused Sumo Deadlift \u2014 2\u00d73',lift:'deadlift',t:'w',wk:l4(2,3,[270,285,300,310])},
        {k:'gsqo2',name:'Competition Squat \u2014 heavy doubles',lift:'squat',t:'w',wk:w5(3,2,315)},
        {k:'gsqo1',name:'Competition Squat \u2014 top single',lift:'squat',t:'w',wk:w5(1,1,335)},
        {k:'gbno2',name:'Competition Bench 0-1-0 \u2014 heavy doubles',lift:'bench',t:'w',wk:w5(3,2,205)},
        {k:'gbno1',name:'Competition Bench 0-1-0 \u2014 top single',lift:'bench',t:'w',wk:w5(1,1,215)},
        {k:'gdlo2',name:'Sumo Deadlift \u2014 doubles',lift:'deadlift',t:'w',wk:w5(2,2,405)},
        {k:'gdlo1',name:'Sumo Deadlift \u2014 top single',lift:'deadlift',t:'w',wk:w5(1,1,455)}
      ]},
      {d:'3',title:'Squat 8\u00d74 + Bench  (Wk5: SBD TEST)',ex:[
        {k:'gsq8',name:'Competition Squat \u2014 8\u00d74',lift:'squat',t:'w',wk:l4(8,4,[300,310,315,330])},
        {k:'gsqp',name:'Paused Squat \u2014 3\u00d73',lift:'squat',t:'w',wk:l4(3,3,[265,270,280,285])},
        {k:'gbn7b',name:'Competition Bench 0-1-0 \u2014 7\u00d74',lift:'bench',t:'w',wk:l4(7,4,[195,200,205,210])},
        info('gwu','TEST DAY \u2014 warm-ups to opener: bar\u00d75, then 40 / 55 / 70 / 80 / 90% of opener for 5 / 3 / 2 / 1 / 1, then open.'),
        {k:'gsqt1',name:'Squat \u2014 Opener',lift:'squat',t:'w',wk:w5(1,1,355)},
        {k:'gsqt2',name:'Squat \u2014 2nd attempt',lift:'squat',t:'w',wk:w5(1,1,375)},
        {k:'gsqt3',name:'Squat \u2014 3rd attempt',lift:'squat',t:'w',wk:w5(1,1,395)},
        {k:'gbnt1',name:'Bench \u2014 Opener',lift:'bench',t:'w',wk:w5(1,1,235)},
        {k:'gbnt2',name:'Bench \u2014 2nd attempt',lift:'bench',t:'w',wk:w5(1,1,245)},
        {k:'gbnt3',name:'Bench \u2014 3rd attempt',lift:'bench',t:'w',wk:w5(1,1,255)},
        {k:'gdlt1',name:'Deadlift \u2014 Opener',lift:'deadlift',t:'w',wk:w5(1,1,500)},
        {k:'gdlt2',name:'Deadlift \u2014 2nd attempt',lift:'deadlift',t:'w',wk:w5(1,1,525)},
        {k:'gdlt3',name:'Deadlift \u2014 3rd attempt',lift:'deadlift',t:'w',wk:w5(1,1,550)},
        info('gpot','Potential day max \u2248 107\u2013110% of training max \u2014 only chase the 3rd if the opener and 2nd move fast.')
      ]},
      {d:'4',title:'Squat 9\u00d73 + Bench 6\u00d73',ex:[
        {k:'gsq3',name:'Competition Squat \u2014 9\u00d73',lift:'squat',t:'w',drive:true,wk:l4(9,3,[320,330,340,345])},
        {k:'gbn3',name:'Competition Bench 0-1-0 \u2014 6\u00d73',lift:'bench',t:'w',drive:true,wk:l4(6,3,[200,205,210,215])}
      ]}
    ]
  };
})();
const PROG_KEYS=Object.keys(PROGRAMS);
const round5=x=>Math.round(x/5)*5;
let progAthlete=null, progProgram=null, progLogs=[], amUnit='lb';

async function loadAssignments(){ try{ const a=await sb('assignments?select=*');
  assignments=(a||[]).filter(x=>PROGRAMS[x.program]).map(x=>({user_id:x.user_id,program:x.program,sq:Number(x.sq_max)||0,bp:Number(x.bp_max)||0,dl:Number(x.dl_max)||0})); }catch(e){ assignments=[]; } }
async function loadProgLogs(uid,program){ if(!uid||!program){progLogs=[];return;}
  try{ const l=await sb('program_logs?program=eq.'+program+'&user_id=eq.'+uid+'&select=*');
    progLogs=(l||[]).map(x=>({week:x.week,day:x.day,ex:x.ex,weight:x.weight==null?null:Number(x.weight),reps:x.reps==null?null:Number(x.reps),at:x.completed_at})); }
  catch(e){ progLogs=[]; } }

function assignmentsFor(uid){ return PROG_KEYS.map(k=>assignments.find(a=>a.user_id===uid&&a.program===k)).filter(Boolean); }
function asgn(uid,program){ return assignments.find(a=>a.user_id===uid&&a.program===program); }
function activeProg(){ return PROGRAMS[progProgram]; }

function curTMs(a,prog){ const tm={}, lifts=[['squat','sq'],['bench','bp'],['deadlift','dl']];
  lifts.forEach(function(L){ const lift=L[0],key=L[1]; let one=a[key]||0;
    let drive=null; prog.days.forEach(d=>d.ex.forEach(e=>{ if(e.drive&&e.lift===lift) drive=e; }));
    if(drive){ progLogs.filter(l=>l.ex===drive.k&&l.weight!=null).sort((x,y)=>new Date(x.at)-new Date(y.at)).forEach(l=>{
      const row=drive.wk[l.week-1]; if(!row) return; const w=row[2]; if(w==null||w==='BW') return;
      const Wp=round5((w/prog.refTM[lift])*0.9*one);
      if(l.weight<Wp){ const impl=l.weight*0.0333*(l.reps||1)+l.weight; if(impl<one) one=impl; } }); }
    tm[lift]=0.9*one; });
  return tm; }
function presc(ex,wkIdx,tm,prog){ const e=ex.wk[wkIdx]; if(!e) return null;
  const s=e[0],r=e[1],w=e[2],rpe=e[3];
  let type=ex.t||(w===null?'acc':(w==='BW'?'bw':'w')), wt=null;
  if(type==='info') return {type:'info'};
  if(type==='w'){ wt=round5((w/prog.refTM[ex.lift])*(tm[ex.lift]||0)); }
  return {s,r,rpe,type,wt}; }
function logOf(wk,day,k){ return progLogs.find(l=>l.week===wk&&l.day===day&&l.ex===k); }
function dayInfo(wkIdx,day){ const exs=day.ex.filter(e=>e.wk[wkIdx]); const req=exs.filter(e=>e.t!=='info').map(e=>e.k);
  const logs=progLogs.filter(l=>l.week===wkIdx+1&&l.day===day.d); const done=new Set(logs.map(l=>l.ex));
  const allDone=req.length>0&&req.every(k=>done.has(k));
  let started=null; logs.forEach(l=>{const t=new Date(l.at).getTime(); if(started===null||t<started)started=t;});
  const expired=started!==null&&!allDone&&(Date.now()-started)>12*3600*1000;
  return {exs,req,done,allDone,started,expired}; }
function weekUnlocked(prog,wkIdx,bypass){ if(bypass) return true; if(wkIdx===0) return true; let c=0;
  prog.days.forEach(d=>{ if(dayInfo(wkIdx-1,d).allDone) c++; }); return c>=3; }

function renderProg(){
  const admin=session&&session.role==='Admin', aEl=$('asgnAdmin'), bEl=$('progBoard');
  if(!aEl||!bEl) return;
  if(!session){ aEl.innerHTML=''; bEl.innerHTML=''; return; }
  if(admin){
    const pOpts=PROG_KEYS.map(k=>'<option value="'+k+'">'+esc(PROGRAMS[k].name)+'</option>').join('');
    const uOpts=users.map(u=>'<option value="'+u.id+'">'+esc(u.u)+'</option>').join('');
    aEl.innerHTML='<div class="card">'
      +'<div class="seg" id="amUnit" style="margin-bottom:10px"><button data-v="lb" class="'+(amUnit==='lb'?'on':'')+'">lb</button><button data-v="kg" class="'+(amUnit==='kg'?'on':'')+'">kg</button></div>'
      +'<div class="full" style="margin-bottom:8px"><label class="lbl">Program</label><select id="amProg" class="field">'+pOpts+'</select></div>'
      +'<div class="full" style="margin-bottom:8px"><label class="lbl">Athlete</label><select id="amUser" class="field">'+uOpts+'</select></div>'
      +'<div class="fg" style="margin-bottom:10px">'
      +'<div><label class="lbl">Squat 1RM</label><input id="amSq" class="field mono" type="number" inputmode="decimal" /></div>'
      +'<div><label class="lbl">Bench 1RM</label><input id="amBp" class="field mono" type="number" inputmode="decimal" /></div>'
      +'<div><label class="lbl">Deadlift 1RM</label><input id="amDl" class="field mono" type="number" inputmode="decimal" /></div>'
      +'</div>'
      +'<div class="note" id="amNote" style="margin:-4px 0 10px"></div>'
      +'<button class="btn" id="amSave">Assign / Update Program</button>'
      +'<div id="amList" style="margin-top:14px"></div>'
      +'</div>';
    renderAmList(); fillAmFromAssignment(); amNote();
    $('amUser').onchange=fillAmFromAssignment; $('amProg').onchange=()=>{fillAmFromAssignment();amNote();};
    document.querySelectorAll('#amUnit button').forEach(b=>b.onclick=()=>{amUnit=b.dataset.v;document.querySelectorAll('#amUnit button').forEach(x=>x.classList.toggle('on',x===b));fillAmFromAssignment();});
    $('amSave').onclick=saveAssign;
  } else aEl.innerHTML='';
  if(!admin){ progAthlete=session.id; const my=assignmentsFor(session.id); progProgram=my.length?my[0].program:null; }
  loadAndRenderBoard();
}
function amNote(){ const el=$('amNote'),p=$('amProg'); if(el&&p) el.textContent=(PROGRAMS[p.value]||{}).note||''; }
function fillAmFromAssignment(){ const su=$('amUser'),sp=$('amProg'); if(!su||!sp) return; const a=asgn(su.value,sp.value);
  const cv=v=>amUnit==='kg'?Math.round(v/2.20462):v;
  $('amSq').value=a?cv(a.sq):''; $('amBp').value=a?cv(a.bp):''; $('amDl').value=a?cv(a.dl):''; }
function renderAmList(){ const el=$('amList'); if(!el) return;
  if(!assignments.length){ el.innerHTML='<div class="note">No athletes assigned yet.</div>'; return; }
  el.innerHTML=assignments.map(a=>{const u=users.find(x=>x.id===a.user_id),nm=u?u.u:'(unknown)',pn=(PROGRAMS[a.program]||{}).name||a.program;
    return '<div class="asgnrow"><div><b>'+esc(nm)+'</b><div class="note" style="margin:2px 0 0">'+esc(pn)+' \u00b7 SQ '+a.sq+' \u00b7 BP '+a.bp+' \u00b7 DL '+a.dl+' lb</div></div>'
      +'<div style="white-space:nowrap"><button class="btn sm ghost" data-view="'+a.user_id+'|'+a.program+'">View</button> <button class="btn sm ghost" data-unas="'+a.user_id+'|'+a.program+'">Remove</button></div></div>';}).join(''); }
async function saveAssign(){ const uid=$('amUser').value, program=$('amProg').value; if(!uid){toast('Pick an athlete');return;}
  let sq=+$('amSq').value||0,bp=+$('amBp').value||0,dl=+$('amDl').value||0;
  if(amUnit==='kg'){sq*=2.20462;bp*=2.20462;dl*=2.20462;}
  try{ await rpc('app_assign_program',{p_token:session.token,p_user:uid,p_program:program,p_sq:Math.round(sq),p_bp:Math.round(bp),p_dl:Math.round(dl)});
    await loadAssignments(); renderAmList(); progAthlete=uid; progProgram=program; await loadAndRenderBoard(); toast('Program assigned'); }
  catch(e){ toast(e.message); } }

async function loadAndRenderBoard(){ const bEl=$('progBoard'); if(!bEl) return;
  if(!progAthlete){ bEl.innerHTML='<div class="note" style="margin-top:6px">Select an athlete above to view their board.</div>'; return; }
  const my=assignmentsFor(progAthlete);
  if(!my.length){ bEl.innerHTML='<div class="note" style="margin-top:6px">'+(progAthlete===session.id?'No program assigned to you yet \u2014 ask your coach to set it up.':'This athlete has no program.')+'</div>'; return; }
  if(!progProgram||!my.some(a=>a.program===progProgram)) progProgram=my[0].program;
  await loadProgLogs(progAthlete,progProgram);
  const prog=activeProg();
  if(progAthlete===session.id && session.role!=='Admin'){ let reset=false;
    for(let wi=0;wi<prog.weeks;wi++){ for(const d of prog.days){ if(dayInfo(wi,d).expired){ try{ await rpc('app_reset_day',{p_token:session.token,p_program:progProgram,p_week:wi+1,p_day:d.d}); reset=true; }catch(e){} } } }
    if(reset) await loadProgLogs(progAthlete,progProgram);
  }
  renderBoard();
}
function fmtReps(r){ return r==='AMRAP'?'AMRAP':r; }
function renderBoard(){ const bEl=$('progBoard'), prog=activeProg(), a=asgn(progAthlete,progProgram);
  const u=users.find(x=>x.id===progAthlete), nm=u?u.u:'', own=progAthlete===session.id, bypass=own&&session.role==='Admin', tm=curTMs(a,prog);
  const my=assignmentsFor(progAthlete);
  let html='';
  if(my.length>1){ html+='<div class="seg" style="margin:2px 0 10px">'+my.map(x=>'<button data-prog="'+x.program+'" class="'+(x.program===progProgram?'on':'')+'">'+esc(PROGRAMS[x.program].name.split(' (')[0])+'</button>').join('')+'</div>'; }
  html+='<div class="note" style="margin:2px 0 12px">'+esc(nm)+' \u00b7 Training max: SQ '+round5(tm.squat)+' \u00b7 BP '+round5(tm.bench)+' \u00b7 DL '+round5(tm.deadlift)+' lb'+(own?'':' \u00b7 view only')+(bypass?' \u00b7 admin: weeks unlocked':'')+'</div>';
  for(let wi=0;wi<prog.weeks;wi++){
    const unlocked=weekUnlocked(prog,wi,bypass); let dc=0,dt=0; prog.days.forEach(d=>{ if(d.ex.some(e=>e.wk[wi])){ dt++; if(dayInfo(wi,d).allDone) dc++; } });
    const dl=prog.deload===wi+1;
    html+='<div class="pwk"><div class="pwkhd"><span class="wn">Week '+(wi+1)+(dl?' \u00b7 Deload':'')+'</span><span class="focus">'+dc+'/'+dt+' days</span></div>';
    if(!unlocked){ html+='<div class="lockbox">Locked \u2014 complete 3 of 4 days in Week '+wi+' to unlock.</div></div>'; continue; }
    prog.days.forEach(d=>{ html+=dayHTML(wi,d,tm,own,prog,bypass); });
    html+='</div>';
  }
  bEl.innerHTML=html;
}
function dayHTML(wi,day,tm,own,prog,bypass){ const di=dayInfo(wi,day); if(!di.exs.length) return '';
  const badge=di.allDone?'<span class="dbadge done">done</span>':'<span class="dbadge">'+di.done.size+'/'+di.req.length+'</span>';
  let h='<div class="pday"><div class="pdayhd">Day '+day.d+' \u2014 '+esc(day.title)+' '+badge+'</div>';
  if(di.started!==null&&!di.allDone&&!bypass){ const left=12-(Date.now()-di.started)/3600000;
    h+='<div class="note" style="margin:0 0 8px;color:var(--teal)">'+(left>0?left.toFixed(1)+' h left to finish this day':'window expired \u2014 will reset')+'</div>'; }
  day.ex.forEach(ex=>{ const p=presc(ex,wi,tm,prog); if(!p) return;
    if(p.type==='info'){ h+='<div class="pex" style="display:block"><div class="presc" style="font-style:italic">'+esc(ex.name)+'</div></div>'; return; }
    const lg=logOf(wi+1,day.d,ex.k);
    let detail;
    if(p.type==='w') detail=p.wt+' lb ('+Math.round(p.wt/2.20462)+' kg)'+(p.rpe!=null?' \u00b7 RPE '+p.rpe:'');
    else if(p.type==='bw') detail='BW'+(p.rpe!=null?' \u00b7 RPE '+p.rpe:'');
    else detail=(p.rpe!=null?'RPE '+p.rpe:'by feel');
    h+='<div class="pex"><div class="pexname">'+esc(ex.name)+'<div class="presc">'+p.s+' \u00d7 '+fmtReps(p.r)+' \u00b7 '+detail+'</div></div>';
    if(lg){ const act=lg.weight!=null?(lg.weight+' lb \u00d7 '+(lg.reps||0)):((lg.reps||0)+' reps');
      h+='<div class="pexr"><span class="okmark">\u2713 '+act+'</span>'+(own?' <button class="xbtn" data-undo="'+wi+'|'+day.d+'|'+ex.k+'">\u2715</button>':'')+'</div>';
    } else if(own){ const wid='lw_'+wi+'_'+day.d+'_'+ex.k, rid='lr_'+wi+'_'+day.d+'_'+ex.k;
      const showW=(p.type==='w'||p.type==='rpe'); let inp='';
      if(showW) inp='<input id="'+wid+'" class="field mono pin" type="number" inputmode="decimal" value="'+(p.type==='w'?p.wt:'')+'" placeholder="lb" />';
      inp+='<input id="'+rid+'" class="field mono pin" type="number" inputmode="numeric" value="'+(typeof p.r==='number'?p.r:'')+'" placeholder="reps" />';
      h+='<div class="pexr">'+inp+'<button class="btn sm" data-log="'+wi+'|'+day.d+'|'+ex.k+'|'+p.type+'">Done</button></div>';
    } else h+='<div class="pexr"><span class="note">\u2014</span></div>';
    h+='</div>';
  });
  h+='</div>'; return h;
}

document.addEventListener('click',async e=>{
  const pg=e.target.closest('[data-prog]');
  if(pg){ progProgram=pg.dataset.prog; await loadAndRenderBoard(); return; }
  const v=e.target.closest('[data-view]');
  if(v){ const pr=v.dataset.view.split('|'); progAthlete=pr[0]; progProgram=pr[1]; await loadAndRenderBoard(); $('progBoard').scrollIntoView({behavior:'smooth'}); return; }
  const un=e.target.closest('[data-unas]');
  if(un){ if(!confirm("Remove this program and all of the athlete's logs for it?")) return; const pr=un.dataset.unas.split('|');
    try{ await rpc('app_unassign_program',{p_token:session.token,p_user:pr[0],p_program:pr[1]}); await loadAssignments(); renderAmList();
      if(progAthlete===pr[0]&&progProgram===pr[1]) progProgram=null; await loadAndRenderBoard(); toast('Removed'); }catch(err){toast(err.message);} return; }
  const lg=e.target.closest('[data-log]');
  if(lg){ const p=lg.dataset.log.split('|'), wi=p[0], day=p[1], k=p[2], type=p[3];
    const rid=$('lr_'+wi+'_'+day+'_'+k); let weight=null, reps=+rid.value||0;
    if(type==='w'||type==='rpe'){ weight=+$('lw_'+wi+'_'+day+'_'+k).value||0; if(!weight||!reps){toast('Enter weight and reps');return;} }
    else if(!reps){ toast('Enter reps'); return; }
    try{ await rpc('app_log_exercise',{p_token:session.token,p_program:progProgram,p_week:+wi+1,p_day:day,p_ex:k,p_weight:weight,p_reps:reps}); await loadAndRenderBoard(); }
    catch(err){ toast(err.message); } return; }
  const ud=e.target.closest('[data-undo]');
  if(ud){ const p=ud.dataset.undo.split('|'), wi=p[0], day=p[1], k=p[2];
    try{ await rpc('app_unlog_exercise',{p_token:session.token,p_program:progProgram,p_week:+wi+1,p_day:day,p_ex:k}); await loadAndRenderBoard(); }
    catch(err){ toast(err.message); } return; }
});
let e1Unit='kg';
function renderE1(){
  const w=parseFloat($('e1W').value)||0,r=parseFloat($('e1R').value)||0;
  if(!w||!r){$('e1Out').innerHTML='Enter a weight and reps.';return;}
  const e=w*0.0333*r+w;
  const other=e1Unit==='kg'?('\u2248 '+(e*2.20462).toFixed(1)+' lb'):('\u2248 '+(e/2.20462).toFixed(1)+' kg');
  $('e1Out').innerHTML='Estimated 1RM: <b style="color:var(--text);font-family:\'JetBrains Mono\',monospace;font-size:17px">'+e.toFixed(1)+' '+e1Unit+'</b> <span style="color:var(--muted)">('+other+')</span>';
}
['e1W','e1R'].forEach(id=>$(id).addEventListener('input',renderE1));
document.querySelectorAll('#e1Unit button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#e1Unit button').forEach(x=>x.classList.toggle('on',x===b));e1Unit=b.dataset.v;renderE1();});

