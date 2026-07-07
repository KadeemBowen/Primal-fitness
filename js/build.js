/* ===== Build: create/edit custom programs + rename/video built-in exercises ===== */
let buildMode='list';   // 'list' | 'edit'
let draft=null;         // program being edited
let draftIdSeq=0;       // id counter for days/exercises within the draft
let metaOpen=null;      // built-in program key whose exercise editor is expanded

const LIFTS=[['','Accessory'],['squat','Squat'],['bench','Bench'],['deadlift','Deadlift']];
function newEx(){ return {id:++draftIdSeq,name:'',lift:'',video:'',sets:3,reps:'',pcts:[],rpe:''}; }
function newDay(){ return {id:++draftIdSeq,title:'',ex:[newEx()]}; }
function newDraft(){ draftIdSeq=0; return {id:null,name:'',weeks:4,days:[newDay()]}; }
function rowToDraft(row){ const data=row.data||{}, days=data.days||[]; let maxId=0;
  days.forEach(day=>{ if(day.id>maxId)maxId=day.id; (day.ex||[]).forEach(e=>{ if(e.id>maxId)maxId=e.id; }); });
  draftIdSeq=maxId;
  return { id:row.id, name:row.name||'', weeks:Math.max(1,+row.weeks||1),
    days: days.map(day=>({ id:day.id!=null?day.id:(++draftIdSeq), title:day.title||'',
      ex:(day.ex||[]).map(e=>({ id:e.id!=null?e.id:(++draftIdSeq), name:e.name||'', lift:e.lift||'', video:e.video||'',
        sets:e.sets!=null?e.sets:3, reps:e.reps!=null?e.reps:'', pcts:(e.pcts||[]).map(v=>v==null?'':v), rpe:e.rpe!=null?e.rpe:'' })) })) };
}

/* ---- render ---- */
function renderBuild(){
  const out=$('buildOut'); if(!out) return;
  if(!session||session.role!=='Admin'){ out.innerHTML=''; return; }
  out.innerHTML=(buildMode==='edit'&&draft)?editorHTML():listHTML();
}
function listHTML(){
  let h='<button class="btn primary full" id="bNew" style="margin-bottom:14px">+ New program</button>';
  h+='<h2 class="title">Your programs</h2>';
  if(!customPrograms.length) h+='<div class="empty">No custom programs yet.</div>';
  else h+=customPrograms.map(r=>{ const wk=r.weeks, days=(r.data&&r.data.days)?r.data.days.length:0;
    return '<div class="urow"><div class="uinfo"><span class="nm">'+esc(r.name)+'</span>'
      +'<div class="note" style="margin:2px 0 0">'+wk+' week'+(wk>1?'s':'')+' · '+days+' day'+(days===1?'':'s')+'/week</div></div>'
      +'<button class="btn sm ghost" data-bedit="'+r.id+'">Edit</button>'
      +'<button class="xbtn" data-bdel="'+r.id+'">✕</button></div>'; }).join('');
  h+='<h2 class="title" style="margin-top:22px">Built-in programs — names &amp; videos</h2>';
  h+='<div class="note" style="margin:-6px 0 10px">Rename an exercise or add a video link. The workout structure stays the same.</div>';
  h+=HARDCODED_KEYS.map(k=>{ const prog=PROGRAMS[k], open=metaOpen===k;
    let b='<div class="urow" data-bmeta="'+k+'" style="cursor:pointer"><div class="uinfo"><span class="nm">'+esc(prog.name)+'</span></div>'
      +'<span class="wkchev" style="'+(open?'':'transform:rotate(-90deg);')+'margin-right:6px">▾</span></div>';
    if(open) b+='<div class="mgrpanel">'+metaExercisesHTML(k)+'</div>';
    return b; }).join('');
  return h;
}
function metaExercisesHTML(k){ const prog=PROGRAMS[k];
  return prog.days.map(d=>'<div class="lbl" style="margin-top:10px">'+esc(d.title)+'</div>'+
    d.ex.filter(e=>e.t!=='info').map(e=>'<div class="bexmeta">'
      +'<input class="field" id="mn_'+k+'_'+e.k+'" value="'+esc(e.name)+'" placeholder="Exercise name" />'
      +'<input class="field" id="mv_'+k+'_'+e.k+'" value="'+esc(e.video||'')+'" placeholder="Video link (optional)" />'
      +'<button class="btn sm" data-metasave="'+k+'|'+e.k+'">Save</button></div>').join('')
  ).join('');
}
function editorHTML(){ const d=draft;
  let h='<div class="row" style="margin-bottom:10px;align-items:center"><button class="btn sm ghost" id="bBack" style="flex:0 0 auto">‹ Back</button><span class="grow"></span><button class="btn primary sm" id="bSave" style="flex:0 0 auto">Save program</button></div>';
  h+='<div class="card"><label class="lbl">Program name</label>'
    +'<input class="field" id="bName" value="'+esc(d.name||'')+'" placeholder="e.g. Off-season Hypertrophy" />'
    +'<label class="lbl" style="margin-top:10px">Weeks</label>'
    +'<input class="field mono" id="bWeeks" type="number" inputmode="numeric" min="1" max="16" value="'+d.weeks+'" style="max-width:110px" /></div>';
  d.days.forEach((day,di)=>{
    h+='<div class="card"><div class="row" style="align-items:center;margin-bottom:8px">'
      +'<input class="field" data-daytitle="'+di+'" value="'+esc(day.title||'')+'" placeholder="Day '+(di+1)+' name (e.g. Squat Focus)" />'
      +'<button class="btn sm ghost" data-dayrm="'+di+'" style="flex:0 0 auto">✕ Day</button></div>';
    day.ex.forEach((e,ei)=>{ h+=exEditorHTML(di,ei,e); });
    h+='<button class="btn sm" data-exadd="'+di+'" style="margin-top:4px">+ Add exercise</button></div>';
  });
  h+='<button class="btn full" id="bDayAdd" style="margin-bottom:14px">+ Add day</button>';
  return h;
}
function exEditorHTML(di,ei,e){ const isLift=!!e.lift;
  let h='<div class="bex"><div class="row" style="margin-bottom:6px">'
    +'<input class="field" data-ex="'+di+'|'+ei+'|name" value="'+esc(e.name||'')+'" placeholder="Exercise name" style="flex:2" />'
    +'<select class="field" data-ex="'+di+'|'+ei+'|lift" style="flex:1">'+LIFTS.map(l=>'<option value="'+l[0]+'"'+(l[0]===(e.lift||'')?' selected':'')+'>'+l[1]+'</option>').join('')+'</select></div>'
    +'<input class="field" data-ex="'+di+'|'+ei+'|video" value="'+esc(e.video||'')+'" placeholder="Video link (optional)" style="margin-bottom:6px" />'
    +'<div class="row" style="margin-bottom:6px"><div><label class="lbl">Sets</label><input class="field mono" data-ex="'+di+'|'+ei+'|sets" type="number" inputmode="numeric" value="'+esc(e.sets!=null?e.sets:'')+'" /></div>'
    +'<div><label class="lbl">Reps</label><input class="field mono" data-ex="'+di+'|'+ei+'|reps" value="'+esc(e.reps!=null?e.reps:'')+'" placeholder="5 or 8-10" /></div></div>';
  if(isLift){ h+='<label class="lbl">Weight % of 1RM per week</label><div class="pctgrid">'+
    Array.from({length:draft.weeks},(_,wi)=>'<div class="pctcell"><span>W'+(wi+1)+'</span>'
      +'<input class="field mono" data-pct="'+di+'|'+ei+'|'+wi+'" type="number" inputmode="numeric" value="'+esc(e.pcts&&e.pcts[wi]!=null?e.pcts[wi]:'')+'" placeholder="%" /></div>').join('')+'</div>';
  } else { h+='<label class="lbl">RPE (optional)</label><input class="field mono" data-ex="'+di+'|'+ei+'|rpe" value="'+esc(e.rpe!=null?e.rpe:'')+'" placeholder="e.g. 8" style="max-width:130px" />'; }
  h+='<button class="btn sm ghost" data-exrm="'+di+'|'+ei+'" style="margin-top:8px">✕ Remove exercise</button></div>';
  return h;
}

/* ---- draft <-> DOM ---- */
function syncDraft(){ if(!draft) return;
  const nm=$('bName'); if(nm) draft.name=nm.value;
  const wk=$('bWeeks'); if(wk) draft.weeks=Math.max(1,Math.min(16,+wk.value||1));
  document.querySelectorAll('[data-daytitle]').forEach(el=>{ const di=+el.dataset.daytitle; if(draft.days[di]) draft.days[di].title=el.value; });
  document.querySelectorAll('#buildOut [data-ex]').forEach(el=>{ const p=el.dataset.ex.split('|'),e=draft.days[+p[0]]&&draft.days[+p[0]].ex[+p[1]]; if(!e) return;
    e[p[2]]=el.value; });
  document.querySelectorAll('[data-pct]').forEach(el=>{ const p=el.dataset.pct.split('|'),e=draft.days[+p[0]]&&draft.days[+p[0]].ex[+p[1]]; if(!e) return; if(!e.pcts) e.pcts=[]; e.pcts[+p[2]]=el.value; });
}
function draftToData(){ return { days: draft.days.map(day=>({ id:day.id, title:day.title||'',
  ex: day.ex.map(e=>{ const lift=e.lift||'', o={id:e.id,name:e.name||'',lift:lift,video:e.video||'',sets:+e.sets||1,reps:(e.reps||'')};
    if(lift) o.pcts=(e.pcts||[]).slice(0,draft.weeks).map(v=>(v===''||v==null)?null:+v);
    else o.rpe=e.rpe||''; return o; }) })) }; }

/* ---- events ---- */
$('buildOut').addEventListener('change',e=>{
  const ex=e.target.closest('[data-ex]');
  if(ex&&ex.dataset.ex.split('|')[2]==='lift'){ syncDraft(); renderBuild(); return; }
  if(e.target.id==='bWeeks'){ syncDraft(); renderBuild(); return; }
});
$('buildOut').addEventListener('click',async e=>{
  const t=e.target;
  if(t.closest('#bNew')){ draft=newDraft(); buildMode='edit'; renderBuild(); return; }
  const bedit=t.closest('[data-bedit]');
  if(bedit){ const row=customPrograms.find(r=>r.id===bedit.dataset.bedit); if(row){ draft=rowToDraft(row); buildMode='edit'; renderBuild(); } return; }
  const bdel=t.closest('[data-bdel]');
  if(bdel){ const row=customPrograms.find(r=>r.id===bdel.dataset.bdel); if(!row) return;
    if(!confirm('Delete program "'+row.name+'"? Athletes assigned to it will lose it.')) return;
    try{ await rpc('app_delete_program',{p_token:session.token,p_id:row.id}); await loadCustomPrograms(); renderBuild(); toast('Program deleted'); }catch(err){ toast(err.message); } return; }
  const bmeta=t.closest('[data-bmeta]');
  if(bmeta){ metaOpen=(metaOpen===bmeta.dataset.bmeta)?null:bmeta.dataset.bmeta; renderBuild(); return; }
  const ms=t.closest('[data-metasave]');
  if(ms){ const pr=ms.dataset.metasave.split('|'), k=pr[0], exk=pr[1];
    const name=$('mn_'+k+'_'+exk).value.trim(), video=$('mv_'+k+'_'+exk).value.trim(); ms.disabled=true;
    try{ await rpc('app_set_exercise_meta',{p_token:session.token,p_program:k,p_ex_key:exk,p_name:name,p_video:video});
      await loadCustomPrograms(); toast('Saved'); }catch(err){ toast(err.message); } ms.disabled=false; return; }
  // editor
  if(t.closest('#bBack')){ buildMode='list'; draft=null; renderBuild(); return; }
  if(t.closest('#bDayAdd')){ syncDraft(); draft.days.push(newDay()); renderBuild(); return; }
  const dayrm=t.closest('[data-dayrm]');
  if(dayrm){ syncDraft(); draft.days.splice(+dayrm.dataset.dayrm,1); renderBuild(); return; }
  const exadd=t.closest('[data-exadd]');
  if(exadd){ syncDraft(); draft.days[+exadd.dataset.exadd].ex.push(newEx()); renderBuild(); return; }
  const exrm=t.closest('[data-exrm]');
  if(exrm){ syncDraft(); const p=exrm.dataset.exrm.split('|'); draft.days[+p[0]].ex.splice(+p[1],1); renderBuild(); return; }
  if(t.closest('#bSave')){ syncDraft();
    if(!draft.name.trim()){ toast('Give the program a name'); return; }
    if(!draft.days.some(d=>d.ex.some(x=>(x.name||'').trim()))){ toast('Add at least one exercise'); return; }
    const btn=t.closest('#bSave'); btn.disabled=true;
    try{ await rpc('app_save_program',{p_token:session.token,p_id:draft.id||null,p_name:draft.name.trim(),p_weeks:draft.weeks,p_data:draftToData()});
      await loadCustomPrograms(); buildMode='list'; draft=null; renderBuild(); toast('Program saved'); }
    catch(err){ toast(err.message); btn.disabled=false; } return; }
});
