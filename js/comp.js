/* ===== Competition day: attempt planner (Admin + Comp Coach) =====
   Pick a lifter, see their competition and gym bests, type a goal per lift and
   the warm-up ramp plus all three attempts price themselves off it. Any single
   attempt can be typed over when the platform says otherwise.

   Nothing here is stored: goals and overrides live in memory for the session,
   so a refresh starts clean. */

let compLifter=null;                 // lifters[].id
const compGoal={}, compOver={};      // "<lifterId>|<lift>" -> goal kg ; "...|<lift>|<a1|a2|a3>" -> kg

const COMP_LIFTS=[['sq','Squat'],['bp','Bench'],['dl','Deadlift']];   // not LIFTS: build.js owns that global
const COMP_GYMKEY={sq:'gsq',bp:'gbp',dl:'gdl'};
// Warm-ups and attempts as a fraction of the goal - the same ramp the peak
// blocks rehearse, so meet day feels like the mock.
const COMP_WARM=[[0.40,5],[0.55,3],[0.68,2],[0.78,1]];
// Short labels: the table has to fit a phone without sideways scrolling.
const COMP_ATT=[['a1','Opener',0.90],['a2','2nd',0.96],['a3','3rd',1.00]];

const r2_5=v=>Math.round(v/2.5)*2.5;                 // meet-legal kg increment
const kgTxt=v=>(v==null?'-':(Math.round(v*10)/10).toString());
const kg2lb=v=>Math.round(v*2.20462);

function compKey(lift){ return compLifter+'|'+lift; }
function goalOf(lift){ const v=compGoal[compKey(lift)]; return (v==null||v==='')?null:Number(v); }
function attemptOf(lift,id,pct){
  const o=compOver[compKey(lift)+'|'+id];
  if(o!=null&&o!=='') return {kg:Number(o),over:true};
  const g=goalOf(lift); return g?{kg:r2_5(g*pct),over:false}:null;
}

function renderComp(){
  const out=$('compOut'); if(!out) return;
  if(!session||!(session.role==='Admin'||session.role==='CompCoach')){ out.innerHTML=''; return; }
  const list=lifters.slice().sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  if(!list.length){ out.innerHTML='<div class="empty">No lifters yet. Add them on the Rankings tab.</div>'; return; }
  if(!compLifter||!list.some(l=>l.id===compLifter)) compLifter=list[0].id;
  const lf=list.find(l=>l.id===compLifter);

  let h='<div class="card">'
    +'<label class="lbl">Lifter</label>'
    +'<select id="compWho" class="field">'+list.map(l=>'<option value="'+l.id+'"'+(l.id===compLifter?' selected':'')+'>'+esc(l.name||'(unnamed)')+'</option>').join('')+'</select>'
    +'<div class="note" style="margin-top:8px">'+esc(lf.sex==='M'?'Men':'Women')+' · '+(lf.bw?lf.bw+' kg · '+wclass(lf.bw,lf.sex)+' class':'no bodyweight on file')+' · '+esc(lf.eq||'Classic')+'</div>'
    +'</div>';

  COMP_LIFTS.forEach(([k,label])=>{
    const comp=lf[k]||0, gymLb=lf[COMP_GYMKEY[k]]||0, gymKg=gymLb?gymLb/2.20462:0;
    const g=goalOf(k);
    h+='<div class="card compcard"><div class="comphd">'+label+'</div>'
      +'<div class="pstats compbests">'
        +'<div class="pstat"><span>Comp best</span><b>'+(comp?kgTxt(comp)+' kg':'-')+'</b></div>'
        +'<div class="pstat"><span>Gym best</span><b>'+(gymLb?gymLb+' lb':'-')+'</b></div>'
        +'<div class="pstat"><span>Gym best kg</span><b>'+(gymKg?kgTxt(r2_5(gymKg))+' kg':'-')+'</b></div>'
      +'</div>'
      +'<label class="lbl" style="margin-top:12px">Goal / 3rd attempt (kg)</label>'
      +'<input class="field mono compgoal" data-lift="'+k+'" type="number" inputmode="decimal" step="2.5" '
        +'value="'+(g==null?'':g)+'" placeholder="'+(comp?kgTxt(comp):'kg')+'" />';

    if(g){
      // Four fixed-width columns with lb tucked under kg, so the whole ramp
      // fits a phone - no sideways scrolling to read a weight.
      h+='<table class="stdtbl comptbl"><tbody>';
      COMP_WARM.forEach(([pct,reps],i)=>{
        const w=r2_5(g*pct);
        h+='<tr><td class="cls">Warm '+(i+1)+'</td><td class="cmreps">×'+reps+'</td>'
          +'<td class="cmw"><b>'+kgTxt(w)+'</b> kg<span class="cmlb">'+kg2lb(w)+' lb</span></td>'
          +'<td class="cmpct">'+Math.round(pct*100)+'%</td></tr>';
      });
      COMP_ATT.forEach(([id,nm,pct])=>{
        const a=attemptOf(k,id,pct);
        h+='<tr class="cmatt'+(a.over?' cmover':'')+'"><td class="cls">'+nm+'</td>'
          +'<td class="cmreps">×1</td>'
          +'<td class="cmw"><input class="field mono compatt" data-lift="'+k+'" data-att="'+id+'" type="number" inputmode="decimal" step="2.5" value="'+kgTxt(a.kg)+'" />'
            +'<span class="cmlb">'+kg2lb(a.kg)+' lb</span></td>'
          +'<td class="cmpct">'+(a.over?'<button class="btn sm ghost cmreset" data-reset="'+k+'|'+id+'">undo</button>':Math.round(pct*100)+'%')+'</td></tr>';
      });
      h+='</tbody></table>';
    } else h+='<div class="note" style="margin-top:8px">Enter a goal to build the ramp.</div>';
    h+='</div>';
  });

  // Projected totals off whatever each attempt column currently says.
  const sum=(id,pct)=>COMP_LIFTS.map(([k])=>{ const a=attemptOf(k,id,pct); return a?a.kg:0; }).reduce((x,y)=>x+y,0);
  const openers=sum('a1',0.90), seconds=sum('a2',0.96), tot=sum('a3',1.00);
  if(tot){
    h+='<div class="card"><div class="comphd">Projected total</div><div class="pstats compproj">'
      +'<div class="pstat"><span>If all openers</span><b>'+kgTxt(openers)+' kg</b></div>'
      +'<div class="pstat"><span>If all 2nds</span><b style="color:var(--gold)">'+kgTxt(seconds)+' kg</b></div>'
      +'<div class="pstat"><span>If all 3rds</span><b style="color:var(--teal)">'+kgTxt(tot)+' kg</b></div>'
      +'<div class="pstat"><span>Comp best</span><b>'+kgTxt((lf.sq||0)+(lf.bp||0)+(lf.dl||0))+' kg</b></div>'
      +'</div>'+compQualHTML(lf,seconds,tot)+'</div>';
  }
  h+='<div class="note" style="margin-top:10px">Nothing on this screen is saved - goals and edited attempts clear on refresh.</div>';
  out.innerHTML=h;

  $('compWho').onchange=e=>{ compLifter=e.target.value; renderComp(); };
}

// Reuse the qualifying total already stored per weight class, when there is one.
function compQualHTML(lf,seconds,thirds){
  if(typeof standards!=='object'||!lf.bw) return '';
  const s=standards[lf.sex+'|'+wclass(lf.bw,lf.sex)];
  if(!s||s.qual==null) return '';
  // Whether the 2nds already clear it is the more useful question - it says
  // whether the lifter needs a risky third to qualify at all.
  const d2=seconds-s.qual, d3=thirds-s.qual;
  let msg, col;
  if(d2>=0){ col='teal'; msg='2nds already clear it by '+kgTxt(d2)+' kg.'; }
  else if(d3>=0){ col='gold'; msg='needs the 3rds - they clear it by '+kgTxt(d3)+' kg, 2nds fall '+kgTxt(-d2)+' kg short.'; }
  else { col='muted'; msg='3rds still fall '+kgTxt(-d3)+' kg short.'; }
  return '<div class="note" style="margin-top:10px;color:var(--'+col+')">'
    +'Qualifying total '+kgTxt(s.qual)+' kg · '+msg+'</div>';
}

document.addEventListener('input',e=>{
  const g=e.target.closest('.compgoal');
  if(g){ compGoal[compLifter+'|'+g.dataset.lift]=g.value;
    // Changing the goal re-derives every attempt that has not been typed over.
    renderComp(); const el=document.querySelector('.compgoal[data-lift="'+g.dataset.lift+'"]');
    if(el){ el.focus(); el.setSelectionRange(el.value.length,el.value.length); } return; }
  const a=e.target.closest('.compatt');
  if(a){ compOver[compLifter+'|'+a.dataset.lift+'|'+a.dataset.att]=a.value;
    const row=a.closest('tr'); if(row){ row.classList.add('cmover');
      const lb=row.querySelector('.cmlb'); if(lb) lb.textContent=kg2lb(Number(a.value)||0)+' lb'; } }
});
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-reset]'); if(!r) return;
  const [lift,att]=r.dataset.reset.split('|');
  delete compOver[compLifter+'|'+lift+'|'+att];
  renderComp();
});
