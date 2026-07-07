/* ===== Supabase config ===== */
const SB_URL='https://uqzrgipbojgfaussrzxx.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxenJnaXBib2pnZmF1c3Nyenh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjMxOTksImV4cCI6MjA5ODMzOTE5OX0.Da0UbA3EZ3k4NlUAE3suGsqpJnCZnDP4FpFIAqFiR1Q';
async function sb(path,opts){ opts=opts||{};
  const r=await fetch(SB_URL+'/rest/v1/'+path,{method:opts.method||'GET',body:opts.body,
    headers:Object.assign({apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json'},opts.headers||{})});
  const txt=await r.text();
  if(!r.ok){ let m=txt; try{m=JSON.parse(txt).message||m;}catch(e){} throw new Error(m||('HTTP '+r.status)); }
  return txt?JSON.parse(txt):null;
}
const rpc=(fn,args)=>sb('rpc/'+fn,{method:'POST',body:JSON.stringify(args||{})});

const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id);
let toastT=null;
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200);}

/* ===== state (in-memory; no local persistence) ===== */
let session=null;              // {id, username, role, pw}
let lifters=[], users=[], profiles={}, assignments=[];
let form={sex:'M',eq:'Classic'}, sortBy='gl', fSex='all', fEq='all', editId=null, rankMode='comp';

/* ===== data loading ===== */
async function loadLifters(){ const lf=await sb('lifters?select=*');
  lifters=(lf||[]).map(l=>({id:l.id,name:l.name,sex:l.sex,eq:l.equip,bw:Number(l.bw)||0,age:l.age_cat||'',sq:Number(l.sq)||0,bp:Number(l.bp)||0,dl:Number(l.dl)||0,gsq:Number(l.gsq)||0,gbp:Number(l.gbp)||0,gdl:Number(l.gdl)||0})); }
async function loadUsers(){ const us=await rpc('app_list_users',{}); users=(us||[]).map(u=>({id:u.id,u:u.username,role:u.role})); }
async function loadProfiles(){ const pf=await sb('profiles?select=*'); profiles={}; (pf||[]).forEach(p=>profiles[p.user_id]={bio:p.bio,video:p.video,img:p.img}); }
async function loadAll(){ if(typeof loadCustomPrograms==='function') await loadCustomPrograms();   // merge custom programs before assignments filter
  await Promise.all([loadLifters(),loadUsers(),loadProfiles(),loadAssignments(),loadMyAlerts(),loadAdminAlerts()]); }

/* ===== auth ===== */
$('liBtn').onclick=doLogin;
$('liPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
$('pwToggle').onclick=()=>{const i=$('liPass');const sh=i.type==='password';i.type=sh?'text':'password';$('pwToggle').textContent=sh?'Hide':'Show';};
function saveSession(s){try{localStorage.setItem('primal:session',JSON.stringify(s));}catch(e){}}
function loadStoredSession(){try{return JSON.parse(localStorage.getItem('primal:session'));}catch(e){return null;}}
function clearStoredSession(){try{localStorage.removeItem('primal:session');}catch(e){}}
async function doLogin(){
  const u=$('liUser').value.trim(), p=$('liPass').value, err=$('liErr'); err.textContent='';
  const btn=$('liBtn'); btn.disabled=true; btn.textContent='Signing in…';
  try{
    const res=await rpc('app_login',{p_username:u,p_password:p});
    if(!res||!res.length){ err.textContent='Wrong username or password.'; return; }
    session={id:res[0].id,username:res[0].username,role:res[0].role,token:res[0].token};saveSession(session);
    $('liPass').value='';
    await loadAll(); applyAuth(); if(typeof runAlerts==='function') runAlerts();
  }catch(e){ err.textContent='Could not reach the server — check your connection.'; }
  finally{ btn.disabled=false; btn.textContent='Sign in'; }
}
$('logoutBtn').onclick=async()=>{ try{ if(session&&session.token) await rpc('app_logout',{p_token:session.token}); }catch(e){}
  session=null; clearStoredSession(); lifters=[];users=[];profiles={};
  document.body.classList.remove('authed','role-Admin','role-Lifter','role-Spectate');
  $('liUser').value=''; };

function roleLabel(r){ return r==='Spectate'?'Spectator':r; }   // display name; stored value stays 'Spectate'
function applyAuth(){
  document.body.classList.add('authed');
  document.body.classList.remove('role-Admin','role-Lifter','role-Spectate');
  document.body.classList.add('role-'+session.role);
  const admin=session.role==='Admin', spec=session.role==='Spectate';
  $('whoName').textContent=session.username+' · '+roleLabel(session.role);
  document.querySelector('nav [data-go="users"]').style.display=admin?'':'none';
  document.querySelector('nav [data-go="build"]').style.display=admin?'':'none';
  document.querySelector('nav [data-go="prog"]').style.display=spec?'none':'';
  $('addCard').style.display=admin?'':'none';
  navTo('rank'); renderRank(); if(admin) renderUsers(); if(admin&&typeof renderBuild==='function') renderBuild(); renderProg();
}
const ROLE_SCREENS={Admin:['rank','profiles','prog','load','users','build'],Lifter:['rank','profiles','prog','load'],Spectate:['rank','profiles','load']};
function navTo(go){
  if(!session) return 'rank';
  const allowed=ROLE_SCREENS[session.role]||['rank'];
  if(allowed.indexOf(go)<0) go='rank';
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.go===go));
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===go));
  return go;
}

/* ===== GL points ===== */
const GLC={'M-Classic':[1199.72839,1025.18162,0.00921],'F-Classic':[610.32796,1045.59282,0.03048],
  'M-Equipped':[1236.25115,1449.21864,0.01644],'F-Equipped':[758.63878,949.31382,0.02435]};
function gl(total,bw,sex,eq){ if(!total||!bw)return 0; const c=GLC[sex+'-'+eq]; if(!c)return 0;
  const d=c[0]-c[1]*Math.exp(-c[2]*bw); return d<=0?0:total*100/d; }
const MC=[53,59,66,74,83,93,105,120],WC=[43,47,52,57,63,69,76,84];
function wclass(bw,sex){ const a=sex==='M'?MC:WC; if(!bw)return '–'; for(const c of a) if(bw<=c)return c+''; return a[a.length-1]+'+'; }
