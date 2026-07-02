/* ===== nav ===== */
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{const go=navTo(b.dataset.go);
  if(go==='profiles'){pView={mode:'list',uid:null};renderProfiles();}
  if(go==='prog'){renderProg();renderE1();}if(go==='load')renderLoad();if(go==='users')renderUsers();});

/* ===== init (no stored session — login required each visit) ===== */
(async()=>{
  const s=loadStoredSession();
  if(s&&s.token){
    try{ const r=await rpc('app_session',{p_token:s.token});
      if(r&&r.length){ session={id:r[0].id,username:r[0].username,role:r[0].role,token:s.token}; await loadAll(); applyAuth(); }
      else clearStoredSession();
    }catch(e){}
  }
  renderLoad(); renderProg(); renderE1();
})();
