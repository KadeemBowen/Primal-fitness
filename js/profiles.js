/* ===== profiles ===== */
let pView={mode:'list',uid:null}, pendingImg=null;
function initials(n){return (n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();}
function avatarHTML(p,name){return (p&&p.img)?'<img class="avatar" src="'+p.img+'" alt="">':'<div class="avatar ph">'+initials(name)+'</div>';}
function ytId(u){if(!u)return null;const m=u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);return m?m[1]:null;}
function videoHTML(url){if(!url)return '';const id=ytId(url);
  return id?'<iframe class="videoembed" src="https://www.youtube.com/embed/'+id+'" allowfullscreen></iframe>'
           :'<a class="btn full" style="margin-top:14px" href="'+esc(url)+'" target="_blank" rel="noopener">Watch video ↗</a>';}
function lifterFor(u){ return lifters.find(x=>x.name&&x.name.trim().toLowerCase()===u.u.trim().toLowerCase()); }
function compTotal(u){ const lf=lifterFor(u); return lf?((lf.sq||0)+(lf.bp||0)+(lf.dl||0)):-1; }
function spotHTML(uid){ const u=users.find(x=>x.id===uid); if(!u) return ''; const p=profiles[u.id]||{}, lf=lifterFor(u);
  let stats;
  if(lf){ const ct=(lf.sq||0)+(lf.bp||0)+(lf.dl||0), cgl=gl(ct,lf.bw,lf.sex,lf.eq);
    const tile=(l,v)=>'<div class="pstat"><span>'+l+'</span><b>'+v+'</b></div>';
    stats='<div class="note" style="text-align:center;margin:14px 0 4px">Competition Best (kg)</div><div class="pstats">'
      +tile('Squat',lf.sq||'-')+tile('Bench',lf.bp||'-')+tile('Deadlift',lf.dl||'-')+tile('Total',ct||'-')
      +'<div class="pstat"><span>GL Points</span><b style="color:var(--teal)">'+(cgl?cgl.toFixed(2):'-')+'</b></div>'
      +tile('Class',wclass(lf.bw,lf.sex))+'</div>';
  } else stats='<div class="note" style="text-align:center;margin-top:14px">No competition data yet.</div>';
  return '<div class="spotname">'+esc(u.u)+'</div><div class="spotrole">'+u.role+'</div>'+stats
    +(p.bio?'<div class="pbio spotbio">'+esc(p.bio)+'</div>':'<div class="note" style="text-align:center;margin-top:12px">No bio yet.</div>')
    +'<button class="btn full" style="margin-top:14px" data-open="'+u.id+'">View full profile</button>';
}
function initCarousel(){
  const car=$('pcar'); if(!car) return;
  const items=[].slice.call(car.querySelectorAll('.phero')); if(!items.length) return;
  let lastActive=null;
  function update(){ const cc=car.scrollLeft+car.clientWidth/2; let best=items[0],bd=1e9;
    items.forEach(it=>{ const ic=it.offsetLeft+it.offsetWidth/2, d=Math.abs(ic-cc); if(d<bd){bd=d;best=it;} });
    items.forEach(it=>it.classList.toggle('active',it===best));
    const uid=best.dataset.open; if(uid!==lastActive){ lastActive=uid; const sp=$('pspot'); if(sp) sp.innerHTML=spotHTML(uid); } }
  car._u=update;
  if(!car._wired){ car.addEventListener('scroll',()=>requestAnimationFrame(car._u),{passive:true}); car._wired=true; }
  car.scrollLeft=0;  // top-ranked sits far-left and centered via padding
  update();
}
function carGo(dir){  // move to prev/next hero, looping past the ends
  const car=$('pcar'); if(!car) return;
  const items=[].slice.call(car.querySelectorAll('.phero')); if(!items.length) return;
  let idx=items.findIndex(it=>it.classList.contains('active')); if(idx<0) idx=0;
  const t=items[(idx+dir+items.length)%items.length];
  const left=t.offsetLeft-(car.clientWidth-t.offsetWidth)/2;
  car.scrollTo({left:Math.max(0,left),behavior:'smooth'});
}
function renderProfiles(){
  const out=$('profilesOut'),title=$('profTitle');
  if(pView.mode==='list'){ title.textContent='Athlete profiles';
    const ranked=users.slice().sort((a,b)=>compTotal(b)-compTotal(a));
    out.innerHTML=users.length?'<div class="pcarwrap"><button class="carnav prev" data-scroll="-1">‹</button><div class="pcarousel" id="pcar">'+ranked.map(u=>{const p=profiles[u.id],lf=lifterFor(u),ct=lf?((lf.sq||0)+(lf.bp||0)+(lf.dl||0)):0;
      return '<div class="phero" data-open="'+u.id+'">'+avatarHTML(p,u.u)+'<div class="pn">'+esc(u.u)+'</div><div class="pr">'+u.role+'</div><div class="pmeta">'+(lf?ct+' kg · '+wclass(lf.bw,lf.sex):'—')+'</div></div>';}).join('')+'</div><button class="carnav next" data-scroll="1">›</button></div><div id="pspot" class="pspot"></div>'
      :'<div class="empty">No athletes yet.</div>';
    if(users.length) requestAnimationFrame(initCarousel);
    return; }
  const u=users.find(x=>x.id===pView.uid); if(!u){pView={mode:'list',uid:null};return renderProfiles();}
  const p=profiles[u.id]||{}; const canEdit=session&&(session.role==='Admin'||session.id===u.id);
  if(pView.mode==='edit'&&canEdit){ title.textContent='Edit profile';
    out.innerHTML='<button class="btn sm ghost backbtn" data-back="view">‹ Cancel</button>'+
      '<div class="card pdetail"><div id="editAvatar">'+avatarHTML(p,u.u)+'</div>'+
      '<label class="btn sm" style="margin-top:10px;cursor:pointer">Change photo<input type="file" id="pImgFile" accept="image/*" style="display:none"></label>'+
      '<div style="width:100%;margin-top:14px;text-align:left">'+
        '<label class="lbl">Bio</label><textarea id="pBio" class="field" rows="4" placeholder="Tell us about your lifting, goals, achievements...">'+esc(p.bio||'')+'</textarea>'+
        '<label class="lbl" style="margin-top:10px">Video link (YouTube or any URL)</label><input id="pVideo" class="field" placeholder="https://youtube.com/..." value="'+esc(p.video||'')+'"></div>'+
      '<button class="btn primary full" style="margin-top:14px" data-save="'+u.id+'">Save profile</button></div>';
    return; }
  const lf=lifters.find(x=>x.name&&x.name.trim().toLowerCase()===u.u.trim().toLowerCase());
  let stats='';
  if(lf){
    const ct=(lf.sq||0)+(lf.bp||0)+(lf.dl||0),gt=(lf.gsq||0)+(lf.gbp||0)+(lf.gdl||0);
    const cgl=gl(ct,lf.bw,lf.sex,lf.eq),ggl=gl(gt/2.20462,lf.bw,lf.sex,lf.eq);
    const tile=(l,v)=>'<div class="pstat"><span>'+l+'</span><b>'+v+'</b></div>';
    const gtile=(l,v)=>'<div class="pstat"><span>'+l+'</span><b style="color:var(--teal)">'+v+'</b></div>';
    const hd=t=>'<div class="note" style="margin-top:14px;align-self:flex-start">'+t+'</div>';
    stats=hd('Competition Best (kg)')+'<div class="pstats">'
      +tile('Squat',(lf.sq||'-'))+tile('Bench',(lf.bp||'-'))+tile('Deadlift',(lf.dl||'-'))
      +tile('Total',(ct||'-'))+gtile('GL Points',(cgl?cgl.toFixed(2):'-'))+tile('Class',wclass(lf.bw,lf.sex))+'</div>'
      +hd('Gym Best (lb)')+'<div class="pstats">'
      +tile('Squat',(lf.gsq||'-'))+tile('Bench',(lf.gbp||'-'))+tile('Deadlift',(lf.gdl||'-'))
      +tile('Total',(gt||'-'))+gtile('GL Points',(gt?ggl.toFixed(2):'-'))+tile('Total kg',(gt?Math.round(gt/2.20462):'-'))+'</div>';
  }
  title.textContent='Profile';
  out.innerHTML='<button class="btn sm ghost backbtn" data-back="list">‹ All profiles</button>'+
    '<div class="card pdetail">'+avatarHTML(p,u.u)+'<div class="dn">'+esc(u.u)+'</div>'+
    '<div class="pr" style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">'+u.role+'</div>'+stats+
    (p.bio?'<div class="pbio">'+esc(p.bio)+'</div>':'<div class="note" style="margin-top:12px">No bio yet.</div>')+
    videoHTML(p.video)+
    (canEdit?'<button class="btn full" style="margin-top:16px" data-edit="'+u.id+'">Edit profile</button>':'')+
    (session&&session.role==='Admin'?'<button class="btn full ghost" style="margin-top:8px;color:var(--no);border-color:var(--no)" data-clear="'+u.id+'">Clear profile</button>':'')+
    '</div>';
}
function resizeImg(file,max,cb){const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{URL.revokeObjectURL(url);const sc=Math.min(1,max/Math.max(img.width,img.height));
    const w=Math.round(img.width*sc),h=Math.round(img.height*sc);
    const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);
    cb(c.toDataURL('image/jpeg',0.82));};
  img.onerror=()=>toast('Could not read that image');img.src=url;}
$('profilesOut').addEventListener('change',e=>{
  const f=e.target.closest('#pImgFile'); if(!f||!f.files[0])return;
  resizeImg(f.files[0],480,d=>{pendingImg=d;const ea=$('editAvatar');if(ea)ea.innerHTML='<img class="avatar" src="'+d+'" alt="">';});
});
$('profilesOut').addEventListener('click',async e=>{
  const open=e.target.closest('[data-open]'),back=e.target.closest('[data-back]'),
        ed=e.target.closest('[data-edit]'),sv=e.target.closest('[data-save]'),cl=e.target.closest('[data-clear]');
  const scr=e.target.closest('[data-scroll]'); if(scr){ carGo(+scr.dataset.scroll); return; }
  if(open){pView={mode:'view',uid:open.dataset.open};renderProfiles();return;}
  if(back){pView=back.dataset.back==='view'?{mode:'view',uid:pView.uid}:{mode:'list',uid:null};pendingImg=null;renderProfiles();return;}
  if(ed){pendingImg=null;pView={mode:'edit',uid:ed.dataset.edit};renderProfiles();return;}
  if(cl){ if(!confirm('Clear this profile (photo, bio, video)?'))return;
    try{await rpc('app_clear_profile',{p_token:session.token,p_user:cl.dataset.clear});await loadProfiles();renderProfiles();toast('Profile cleared');}catch(err){toast(err.message);} return; }
  if(sv){ const uid=sv.dataset.save; const cur=profiles[uid]||{};
    const bio=$('pBio').value.trim(), video=$('pVideo').value.trim(), img=(pendingImg!==null)?pendingImg:(cur.img||null);
    const btn=sv; btn.disabled=true;
    try{ await rpc('app_save_profile',{p_token:session.token,p_user:uid,p_bio:bio||null,p_video:video||null,p_img:img});
      await loadProfiles(); pendingImg=null; pView={mode:'view',uid:uid}; renderProfiles(); toast('Profile saved'); }
    catch(err){ toast(err.message); btn.disabled=false; } }
});

