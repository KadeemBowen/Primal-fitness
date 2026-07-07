/* ===== notifications & payments (popups + reminders) ===== */
const PAY_YEAR=new Date().getFullYear();
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let myNotification=null;   // {message,active,dismissed}
let myPayments=[];         // [{year,month,paid}]  (current user)
let paymentsLive=false;    // did the payments backend respond? (avoids false nags pre-migration)
let allNotifications=[];   // admin: [{user_id,message,active,dismissed}]
let allPayments=[];        // admin: [{user_id,year,month,paid}]

async function loadMyAlerts(){
  try{ const n=await rpc('app_my_notification',{p_token:session.token}); myNotification=(n&&n[0])||null; }catch(e){ myNotification=null; }
  try{ myPayments=await rpc('app_my_payments',{p_token:session.token,p_year:PAY_YEAR})||[]; paymentsLive=true; }catch(e){ myPayments=[]; paymentsLive=false; }
}
async function loadAdminAlerts(){
  if(!session||session.role!=='Admin'){ allNotifications=[]; allPayments=[]; return; }
  try{ allNotifications=await rpc('app_list_notifications',{p_token:session.token})||[]; }catch(e){ allNotifications=[]; }
  try{ allPayments=await rpc('app_list_payments',{p_token:session.token,p_year:PAY_YEAR})||[]; }catch(e){ allPayments=[]; }
}

/* ---- popup queue (shown one at a time) ---- */
let popupQueue=[], popupShowing=false;
function queuePopup(p){ popupQueue.push(p); if(!popupShowing) nextPopup(); }
function nextPopup(){
  if(!popupQueue.length){ popupShowing=false; return; }
  popupShowing=true; const p=popupQueue.shift();
  const wrap=document.createElement('div'); wrap.className='popupwrap';
  wrap.innerHTML='<div class="popupcard '+(p.tone||'')+'">'+(p.icon?'<div class="popupicon">'+p.icon+'</div>':'')
    +'<div class="popuptitle">'+esc(p.title||'')+'</div><div class="popupbody">'+esc(p.body||'')+'</div>'
    +'<button class="btn primary full popupok">'+esc(p.ok||'OK')+'</button></div>';
  document.body.appendChild(wrap);
  wrap.querySelector('.popupok').onclick=async()=>{
    const b=wrap.querySelector('.popupok'); b.disabled=true;
    if(p.onOk){ try{ await p.onOk(); }catch(e){} }
    wrap.remove(); nextPopup();
  };
}

/* ---- run on app open (login / session restore) ---- */
function runAlerts(){
  if(!session) return;
  if(myNotification && myNotification.active && !myNotification.dismissed && (myNotification.message||'').trim()){
    queuePopup({title:'Message from your coach', body:myNotification.message, tone:'info', icon:'💬', ok:'Dismiss',
      onOk:async()=>{ try{ await rpc('app_dismiss_notification',{p_token:session.token}); if(myNotification) myNotification.dismissed=true; }catch(e){} }});
  }
  if(session.role==='Lifter' && paymentsLive){
    const now=new Date(), day=now.getDate(), m=now.getMonth()+1, y=now.getFullYear();
    const paidFor=(yy,mm)=>myPayments.some(p=>p.year===yy&&p.month===mm&&p.paid);
    let nm=m+1, ny=y; if(nm>12){ nm=1; ny=y+1; }
    if(day>=28 && !paidFor(ny,nm)){
      queuePopup({title:'Payment due', tone:'danger', icon:'⚠️',
        body:MONTHS[nm-1]+' payment is due. Please reach out to your coach, as you are at risk of having your program suspended or cancelled.', ok:'OK'});
    } else if(day>=5 && !paidFor(y,m)){
      queuePopup({title:'Payment reminder', tone:'warn', icon:'💳',
        body:'Your '+MONTHS[m-1]+' payment hasn’t been recorded yet. Please make your payment to keep your program active.', ok:'OK'});
    }
  }
}
