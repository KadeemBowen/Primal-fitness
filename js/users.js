/* ===== users ===== */
function adminCount(){return users.filter(u=>u.role==='Admin').length;}
let mgrOpen=null;   // user id whose manage panel is expanded
function notifFor(uid){ return allNotifications.find(n=>n.user_id===uid)||{message:'',active:false,dismissed:false}; }
function paidMonths(uid){ return new Set(allPayments.filter(p=>p.user_id===uid&&p.paid).map(p=>p.month)); }
function renderUsers(){
  $('usersOut').innerHTML=users.map(u=>{
    const open=mgrOpen===u.id;
    let h='<div class="urow"><div class="uinfo"><span class="nm">'+esc(u.u)+'</span>'+(u.id===session.id?'<span class="tag">you</span>':'')+'</div>'+
      '<select class="field rolesel" data-role="'+u.id+'">'+['Admin','Lifter','Spectate'].map(r=>'<option '+(r===u.role?'selected':'')+'>'+r+'</option>').join('')+'</select>'+
      '<button class="btn sm ghost" data-mgr="'+u.id+'">'+(open?'Close':'Manage')+'</button>'+
      '<button class="xbtn" data-udel="'+u.id+'">✕</button></div>';
    if(open){
      const n=notifFor(u.id), ps=paidMonths(u.id);
      h+='<div class="mgrpanel">'+
        '<label class="lbl">Notification message</label>'+
        '<textarea class="field" id="ntf_'+u.id+'" rows="2" placeholder="Message to pop up for this user…">'+esc(n.message||'')+'</textarea>'+
        '<label class="mgrtoggle"><input type="checkbox" id="ntfon_'+u.id+'"'+(n.active?' checked':'')+'> Show this notification to the user'+(n.active&&n.dismissed?' <span class="tag">dismissed</span>':'')+'</label>'+
        '<button class="btn sm" data-ntsave="'+u.id+'">Save notification</button>'+
        '<label class="lbl" style="margin-top:16px">Payments '+PAY_YEAR+'</label>'+
        '<div class="paygrid">'+MON.map((mm,i)=>'<button class="paycell'+(ps.has(i+1)?' on':'')+'" data-pay="'+u.id+'|'+(i+1)+'">'+mm+'</button>').join('')+'</div>'+
        '<div class="note">Tap a month to mark it paid / unpaid.</div>'+
        '<button class="btn sm ghost" data-reset="'+u.id+'" style="margin-top:12px">Reset password</button>'+
      '</div>';
    }
    return h;
  }).join('');
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
  const mg=e.target.closest('[data-mgr]');
  if(mg){ mgrOpen=(mgrOpen===mg.dataset.mgr)?null:mg.dataset.mgr; renderUsers(); return; }
  const nt=e.target.closest('[data-ntsave]');
  if(nt){ const uid=nt.dataset.ntsave, msg=$('ntf_'+uid).value.trim(), on=$('ntfon_'+uid).checked;
    nt.disabled=true;
    try{ await rpc('app_set_notification',{p_token:session.token,p_user:uid,p_message:msg,p_active:on});
      await loadAdminAlerts(); renderUsers(); toast('Notification saved'); }
    catch(err){ toast(err.message); nt.disabled=false; } return; }
  const pay=e.target.closest('[data-pay]');
  if(pay){ const pr=pay.dataset.pay.split('|'), uid=pr[0], month=+pr[1];
    const now=paidMonths(uid).has(month);
    pay.disabled=true;
    try{ await rpc('app_set_payment',{p_token:session.token,p_user:uid,p_year:PAY_YEAR,p_month:month,p_paid:!now});
      await loadAdminAlerts(); renderUsers(); }
    catch(err){ toast(err.message); pay.disabled=false; } return; }
  const rs=e.target.closest('[data-reset]'), dl=e.target.closest('[data-udel]');
  if(rs){const u=users.find(x=>x.id===rs.dataset.reset);if(!u)return;
    const np=prompt('New password for '+u.u);if(np===null||np==='')return;
    try{await rpc('app_set_password',{p_token:session.token,p_user:u.id,p_password:np});toast('Password updated');}catch(err){toast(err.message);}return;}
  if(dl){const u=users.find(x=>x.id===dl.dataset.udel);if(!u)return;
    if(confirm('Delete user '+u.u+'?')){try{await rpc('app_delete_user',{p_token:session.token,p_user:u.id});await loadUsers();renderUsers();toast('User deleted');}catch(err){toast(err.message);}}}
});

