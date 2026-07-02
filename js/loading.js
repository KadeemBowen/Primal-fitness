/* ===== loading ===== */
let loadMode='comp';
function renderLoad(){
  if(loadMode==='comp'){
    const w=parseFloat($('loadW').value)||0,cp=$('loadCollar').checked?5:0;
    $('loadLb').textContent=w?('\u2248 '+Math.round(w*2.20462)+' lb'):'\u2014';
    $('loadOut').innerHTML=loadRender(w,20,cp,PLATES,'kg');
  }else{
    const w=parseFloat($('gymW').value)||0;
    $('gymKg').textContent=w?('\u2248 '+(w/2.20462).toFixed(1)+' kg'):'\u2014';
    $('loadOut').innerHTML=loadRender(w,45,0,GYM,'lb');
  }
}
['loadW','loadCollar','gymW'].forEach(id=>$(id).addEventListener('input',renderLoad));
document.querySelectorAll('#loadMode button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#loadMode button').forEach(x=>x.classList.toggle('on',x===b));
  loadMode=b.dataset.v;
  $('compCard').style.display=loadMode==='comp'?'':'none';
  $('gymCard').style.display=loadMode==='gym'?'':'none';
  $('loadTitle').textContent=loadMode==='comp'?'Competition loading':'Gym loading';
  renderLoad();
});

