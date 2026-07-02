/* ===== users ===== */
function adminCount(){return users.filter(u=>u.role==='Admin').length;}
function renderUsers(){
  $('usersOut').innerHTML=users.map(u=>
    '<div class="urow"><div class="uinfo"><span class="nm">'+esc(u.u)+'</span>'+(u.id===session.id?'<span class="tag">you</span>':'')+'</div>'+
    '<select class="field rolesel" data-role="'+u.id+'">'+['Admin','Lifter','Spectate'].map(r=>'<option '+(r===u.role?'selected':'')+'>'+r+'</option>').join('')+'</select>'+
    '<button class="btn sm ghost" data-reset="'+u.id+'">Reset PW</button>'+
    '<button class="xbtn" data-udel="'+u.id+'">✕</button></div>').join('');
}
$('addUserBtn').onclick=async()=>{
  const name=$('nuName').value.trim(),pass=$('nuPass').value,role=$('nuRole').value;
  if(!name||!pass){toast('Username and password required');return;}
  const btn=$('addUserBtn'); btn.disabled=true;
  try{ await rpc('app_create_user',{p_token:session.token,p_username:name,p_password:pass,p_role:role});
    $('nuName').value='';$('nuPass').value=''; await loadUsers(); renderUsers(); toast('User created'); }
  catch(e){ toast(e.message); } finally{ btn.disabled=false; }
};
$('usersOut').addEventListener('change',async e=>{
  const sel=e.target.closest('[data-role]'); if(!sel)return;
  const u=users.find(x=>x.id===sel.dataset.role); if(!u)return;
  try{ await rpc('app_set_role',{p_token:session.token,p_user:u.id,p_role:sel.value});
    await loadUsers();
    if(u.id===session.id){ session.role=sel.value; saveSession(session); applyAuth(); navTo('users'); } else renderUsers();
    toast('Role updated');
  }catch(err){ toast(err.message); sel.value=u.role; }
});
$('usersOut').addEventListener('click',async e=>{
  const rs=e.target.closest('[data-reset]'), dl=e.target.closest('[data-udel]');
  if(rs){const u=users.find(x=>x.id===rs.dataset.reset);if(!u)return;
    const np=prompt('New password for '+u.u);if(np===null||np==='')return;
    try{await rpc('app_set_password',{p_token:session.token,p_user:u.id,p_password:np});toast('Password updated');}catch(err){toast(err.message);}return;}
  if(dl){const u=users.find(x=>x.id===dl.dataset.udel);if(!u)return;
    if(confirm('Delete user '+u.u+'?')){try{await rpc('app_delete_user',{p_token:session.token,p_user:u.id});await loadUsers();renderUsers();toast('User deleted');}catch(err){toast(err.message);}}}
});

