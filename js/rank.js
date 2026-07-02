/* ===== rankings ===== */
function seg(id,key){document.querySelectorAll('#'+id+' button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b)); form[key]=b.dataset.v;});}
seg('fSex','sex'); seg('fEq','eq');
function readForm(){const num=id=>parseFloat($(id).value)||0;
  return {name:$('fName').value.trim(),sex:form.sex,eq:form.eq,bw:num('fBw'),age:$('fAge').value.trim(),sq:num('fSq'),bp:num('fBp'),dl:num('fDl'),gsq:num('fGsq'),gbp:num('fGbp'),gdl:num('fGdl')};}
function clearForm(){['fName','fBw','fAge','fSq','fBp','fDl','fGsq','fGbp','fGdl'].forEach(id=>$(id).value='');
  editId=null;$('saveBtn').textContent='Add to rankings';$('cancelEdit').style.display='none';}
$('saveBtn').onclick=async()=>{
  const d=readForm(); if(!d.name){toast('Enter a name');return;} if(!d.bw){toast('Bodyweight is needed for GL points');return;}
  const btn=$('saveBtn'); btn.disabled=true;
  try{
    await rpc('app_upsert_lifter',{p_token:session.token,p_id:editId||null,p_name:d.name,p_sex:d.sex,p_equip:d.eq,p_bw:d.bw,p_age:d.age||null,p_sq:d.sq,p_bp:d.bp,p_dl:d.dl,p_gsq:d.gsq,p_gbp:d.gbp,p_gdl:d.gdl});
    await loadLifters(); clearForm(); renderRank(); toast('Saved');
  }catch(e){ toast(e.message); } finally{ btn.disabled=false; }
};
$('cancelEdit').onclick=clearForm;

function rows(){return lifters.map(l=>{
    const ct=(l.sq||0)+(l.bp||0)+(l.dl||0), gt=(l.gsq||0)+(l.gbp||0)+(l.gdl||0), gym=rankMode==='gym';
    const total=gym?gt:ct, tkg=gym?total/2.20462:total;
    return Object.assign({},l,{sqd:gym?l.gsq:l.sq,bpd:gym?l.gbp:l.bp,dld:gym?l.gdl:l.dl,total:total,gl:gl(tkg,l.bw,l.sex,l.eq),cls:wclass(l.bw,l.sex)});})
  .filter(l=>(fSex==='all'||l.sex===fSex)&&(fEq==='all'||l.eq===fEq))
  .sort((a,b)=>sortBy==='gl'?b.gl-a.gl:b.total-a.total);}
function renderRank(){
  const out=$('rankOut'),data=rows(),gym=rankMode==='gym';
  const meName=session?session.username.trim().toLowerCase():'';
  if(!data.length){out.innerHTML='<div class="empty">No '+(gym?'Gym Maxes':'lifters')+' yet.</div>';return;}
  const head='<thead><tr><th>#</th><th class="l">Lifter</th><th>BW</th><th>Cls</th><th>SQ</th><th>BP</th><th>DL</th><th>Total</th><th>GL</th><th></th></tr></thead>';
  const body=data.map((l,i)=>{const rk=i===0?'g1':i===1?'g2':i===2?'g3':'';
    const me=l.name&&l.name.trim().toLowerCase()===meName;
    const tot=gym?(l.total?(l.total+'<span style="color:var(--muted);font-weight:500;font-size:10px"> '+Math.round(l.total/2.20462)+'kg</span>'):'\u2013'):(l.total||'\u2013');
    return '<tr data-id="'+l.id+'" class="'+(l.id===editId?'editing':'')+(me?' me':'')+'">'+
      '<td class="rk '+rk+'">'+(i+1)+'</td>'+
      '<td class="l"><span class="nm">'+esc(l.name)+'</span>'+(me?'<span class="tag" style="border-color:var(--teal);color:var(--teal)">you</span>':'')+'<span class="tag">'+(l.sex==='M'?'M':'W')+'\u00b7'+(l.eq==='Classic'?'CL':'EQ')+'</span>'+(l.age?'<span class="tag">'+esc(l.age)+'</span>':'')+'</td>'+
      '<td class="mono">'+(l.bw||'\u2013')+'</td><td class="mono">'+l.cls+'</td>'+
      '<td class="mono">'+(l.sqd||'\u2013')+'</td><td class="mono">'+(l.bpd||'\u2013')+'</td><td class="mono">'+(l.dld||'\u2013')+'</td>'+
      '<td class="totcell">'+tot+'</td><td class="glcell">'+(l.gl?l.gl.toFixed(2):'\u2013')+'</td>'+
      '<td><button class="xbtn" data-del="'+l.id+'">\u2715</button></td></tr>';}).join('');
  out.innerHTML='<div class="tablewrap"><table>'+head+'<tbody>'+body+'</tbody></table></div>'+
    '<div class="note">'+data.length+' '+(data.length>1?'lifters':'lifter')+' \u00b7 '+(gym?'Gym Maxes in lb (kg shown on total); GL Points use the kg equivalent.':'competition bests in kg.')+(session&&session.role==='Admin'?' Tap a row to edit.':'')+'</div>';
}
$('rankOut').addEventListener('click',async e=>{
  if(!session)return;
  const tr=e.target.closest('tr[data-id]'); if(!tr)return;
  const l=lifters.find(x=>x.id===tr.dataset.id); if(!l)return;
  if(session.role!=='Admin'){
    const usr=users.find(x=>x.u&&l.name&&x.u.trim().toLowerCase()===l.name.trim().toLowerCase());
    if(usr){navTo('profiles');pView={mode:'view',uid:usr.id};renderProfiles();}
    else toast('No profile for this athlete yet');
    return;
  }
  const del=e.target.closest('[data-del]');
  if(del){e.stopPropagation(); if(confirm('Remove this lifter?')){try{await rpc('app_delete_lifter',{p_token:session.token,p_id:del.dataset.del});await loadLifters();if(editId===del.dataset.del)clearForm();renderRank();toast('Removed');}catch(err){toast(err.message);}} return;}
  editId=l.id; form.sex=l.sex; form.eq=l.eq;
  document.querySelectorAll('#fSex button').forEach(b=>b.classList.toggle('on',b.dataset.v===l.sex));
  document.querySelectorAll('#fEq button').forEach(b=>b.classList.toggle('on',b.dataset.v===l.eq));
  const set=(id,v)=>$(id).value=(v||v===0)?v:'';
  set('fName',l.name);set('fBw',l.bw);set('fAge',l.age);set('fSq',l.sq);set('fBp',l.bp);set('fDl',l.dl);set('fGsq',l.gsq);set('fGbp',l.gbp);set('fGdl',l.gdl);
  $('saveBtn').textContent='Update lifter';$('cancelEdit').style.display='block';
  window.scrollTo({top:0,behavior:'smooth'}); renderRank();
});
document.querySelectorAll('[data-sort]').forEach(p=>p.onclick=()=>{sortBy=p.dataset.sort;document.querySelectorAll('[data-sort]').forEach(x=>x.classList.toggle('on',x===p));renderRank();});
document.querySelectorAll('#rankMode button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#rankMode button').forEach(x=>x.classList.toggle('on',x===b));rankMode=b.dataset.v;renderRank();});
document.querySelector('[data-fsex]').onclick=function(){fSex=fSex==='all'?'M':fSex==='M'?'F':'all';this.textContent=fSex==='all'?'All':fSex==='M'?'Men':'Women';this.classList.toggle('on',fSex!=='all');renderRank();};
document.querySelector('[data-feq]').onclick=function(){fEq=fEq==='all'?'Classic':fEq==='Classic'?'Equipped':'all';this.textContent=fEq==='all'?'All gear':fEq;this.classList.toggle('on',fEq!=='all');renderRank();};

$('expCsv').onclick=()=>{const data=rows();if(!data.length)return;
  const head=['Rank','Name','Sex','Equip','BW','Class','Squat','Bench','Deadlift','Total','GLPoints'];
  const lines=data.map((l,i)=>[i+1,l.name,l.sex,l.eq,l.bw,l.cls,l.sq,l.bp,l.dl,l.total,l.gl.toFixed(2)].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(','));
  const b=new Blob([[head.join(','),...lines].join('\n')],{type:'text/csv'});const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download='primal-fitness-rankings.csv';a.click();URL.revokeObjectURL(u);};

$('migrateBtn').onclick=async()=>{
  let local=[]; try{local=JSON.parse(localStorage.getItem('gaplf:lifters')||'[]');}catch(e){}
  if(!local.length){toast('No local lifters found on this device.');return;}
  if(!confirm('Upload '+local.length+' lifter(s) saved on this device to the cloud?'))return;
  const btn=$('migrateBtn'); btn.disabled=true; let ok=0;
  for(const l of local){ try{ await rpc('app_upsert_lifter',{p_token:session.token,p_id:null,p_name:l.name,p_sex:l.sex,p_equip:l.eq,p_bw:l.bw,p_age:l.age||null,p_sq:l.sq||0,p_bp:l.bp||0,p_dl:l.dl||0,p_gsq:0,p_gbp:0,p_gdl:0}); ok++; }catch(e){} }
  await loadLifters(); renderRank(); btn.disabled=false; toast('Uploaded '+ok+' of '+local.length+' lifters');
};

