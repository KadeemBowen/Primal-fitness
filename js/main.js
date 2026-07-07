/* ===== collapsible sections ===== */
document.addEventListener('click',e=>{const hd=e.target.closest('.fold-hd');if(hd){const f=hd.closest('.fold');if(f)f.classList.toggle('collapsed');}});

/* ===== nav ===== */
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{const go=navTo(b.dataset.go);
  if(go==='profiles'){pView={mode:'list',uid:null};renderProfiles();}
  if(go==='prog'){renderProg();renderE1();}if(go==='load')renderLoad();if(go==='users')renderUsers();if(go==='build')renderBuild();});

/* ===== init (no stored session — login required each visit) ===== */
(async()=>{
  const s=loadStoredSession();
  if(s&&s.token){
    try{ const r=await rpc('app_session',{p_token:s.token});
      if(r&&r.length){ session={id:r[0].id,username:r[0].username,role:r[0].role,token:s.token}; await loadAll(); applyAuth(); if(typeof runAlerts==='function') runAlerts(); }
      else clearStoredSession();
    }catch(e){}
  }
  renderLoad(); renderProg(); renderE1();
})();
