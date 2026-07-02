
/* ===== plates ===== */
const PLATES=[{kg:25,c:'#e23b3b',h:92,w:17,dia:150,th:30},{kg:20,c:'#2f6fed',h:88,w:16,dia:150,th:25},{kg:15,c:'#f3c000',h:84,w:15,light:1,dia:150,th:21},
  {kg:10,c:'#1f9d4d',h:74,w:13,dia:150,th:16},{kg:5,c:'#eef1f5',h:60,w:12,light:1,dia:122,th:14},{kg:2.5,c:'#16191f',h:46,w:10,blk:1,dia:98,th:11},
  {kg:2,c:'#2f6fed',h:40,w:9,dia:86,th:10},{kg:1.5,c:'#f3c000',h:36,w:8,light:1,dia:78,th:9},{kg:1,c:'#1f9d4d',h:32,w:7,dia:68,th:8},{kg:0.5,c:'#eef1f5',h:28,w:6,light:1,dia:58,th:7}];
const GYM=[{kg:45,c:'#2f6fed',dia:150,th:28},{kg:35,c:'#f3c000',light:1,dia:140,th:24},{kg:25,c:'#1f9d4d',dia:122,th:18},{kg:10,c:'#eef1f5',light:1,dia:104,th:13},{kg:5,c:'#e23b3b',dia:88,th:11},{kg:2.5,c:'#16191f',blk:1,dia:74,th:9}];
const round=(x,s)=>{s=s||2.5;return Math.round(x/s)*s;};
function perSide(t,bar,cp,pset){pset=pset||PLATES; let s=(t-bar-cp)/2; if(s<0)return{plates:[],left:s*2};
  const out=[];let r=s; for(const p of pset){while(r+1e-6>=p.kg){out.push(p);r-=p.kg;}} return{plates:out,left:round(r*2,0.01)}; }
function plateTxt(p){return p.light?'rgba(0,0,0,.62)':'rgba(255,255,255,.88)';}
function plateBorder(p){return p.light?'rgba(0,0,0,.22)':(p.blk?'rgba(255,255,255,.35)':'rgba(0,0,0,.35)');}
function chipStyle(p){const t=p.light?'var(--text)':(p.blk?'#cfd5dd':p.c);const b=p.light?'var(--muted)':(p.blk?'#5b626d':p.c);return 'border-color:'+b+';color:'+t;}
function barSVG(plates,cp){
  const H=172,cy=86,grip=54,shoulderW=7,gap=1.6,collarW=14,endcap=9,sleeveH=30,shaftH=9;
  let d=grip+shoulderW,pSVG='';const lab=[];
  for(const p of plates){const y=cy-p.dia/2;
    pSVG+='<rect x="'+d.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+p.th+'" height="'+p.dia+'" rx="4" fill="'+p.c+'"/>'
        +'<rect x="'+d.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+p.th+'" height="'+p.dia+'" rx="4" fill="url(#sheen)"/>'
        +'<rect x="'+d.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+p.th+'" height="'+p.dia+'" rx="4" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1"/>';
    if(p.th>=14){lab.push({xc:d+p.th/2,kg:p.kg,fill:plateTxt(p)});}
    d+=p.th+gap;}
  let collarSVG='',outerD=d;
  if(cp>0){const cxl=d+2,ch=64,yy=cy-ch/2;
    collarSVG='<rect x="'+cxl.toFixed(1)+'" y="'+yy.toFixed(1)+'" width="'+collarW+'" height="'+ch+'" rx="4" fill="url(#metal)" stroke="rgba(0,0,0,.4)" stroke-width="1"/>'
      +'<rect x="'+(cxl+collarW/2-2.5).toFixed(1)+'" y="'+(yy-15).toFixed(1)+'" width="5" height="17" rx="2" fill="url(#metal)" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>'
      +'<circle cx="'+(cxl+collarW/2).toFixed(1)+'" cy="'+(yy-15).toFixed(1)+'" r="4.5" fill="url(#metal)" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>'
      +'<rect x="'+(cxl+2).toFixed(1)+'" y="'+(cy-1.5).toFixed(1)+'" width="'+(collarW-4)+'" height="3" fill="rgba(0,0,0,.22)"/>';
    outerD=cxl+collarW;}
  const sleeveEndD=outerD+endcap,cx=sleeveEndD+8,W=2*cx;
  const sleeve='<rect x="'+grip+'" y="'+(cy-sleeveH/2)+'" width="'+(sleeveEndD-grip).toFixed(1)+'" height="'+sleeveH+'" rx="5" fill="url(#metal)" stroke="rgba(0,0,0,.35)" stroke-width="1"/>';
  const shoulder='<rect x="'+grip+'" y="'+(cy-(sleeveH+8)/2)+'" width="'+shoulderW+'" height="'+(sleeveH+8)+'" rx="3" fill="url(#metal)" stroke="rgba(0,0,0,.35)" stroke-width="1"/>';
  const right=sleeve+shoulder+pSVG+collarSVG;
  let knurl='';for(let kx=cx-grip+8;kx<=cx+grip-8;kx+=7){knurl+='<line x1="'+kx.toFixed(1)+'" y1="'+(cy-shaftH/2+1)+'" x2="'+kx.toFixed(1)+'" y2="'+(cy+shaftH/2-1)+'" stroke="rgba(0,0,0,.25)" stroke-width="1"/>';}
  const shaft='<rect x="'+(cx-grip).toFixed(1)+'" y="'+(cy-shaftH/2)+'" width="'+(2*grip).toFixed(1)+'" height="'+shaftH+'" rx="3" fill="url(#metal)" stroke="rgba(0,0,0,.3)" stroke-width="1"/>'+knurl;
  let labels='';for(const l of lab){const t='<text y="'+cy+'" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono,monospace" font-size="11" font-weight="700" fill="'+l.fill+'">'+l.kg+'</text>';
    labels+=t.replace('<text ','<text x="'+(cx+l.xc).toFixed(1)+'" ')+t.replace('<text ','<text x="'+(cx-l.xc).toFixed(1)+'" ');}
  const defs='<defs><linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaedf1"/><stop offset=".25" stop-color="#bcc2cb"/><stop offset=".5" stop-color="#9197a1"/><stop offset=".75" stop-color="#747a84"/><stop offset="1" stop-color="#595f68"/></linearGradient>'
    +'<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".16" stop-color="#fff" stop-opacity=".14"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/><stop offset=".84" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient></defs>';
  return '<svg viewBox="0 0 '+W.toFixed(1)+' '+H+'" xmlns="http://www.w3.org/2000/svg">'+defs+shaft+'<g transform="translate('+cx.toFixed(1)+',0)">'+right+'</g><g transform="translate('+cx.toFixed(1)+',0) scale(-1,1)">'+right+'</g>'+labels+'</svg>';
}
function loadRender(t,bar,cp,pset,unit){
  const r=perSide(t,bar,cp,pset),plates=r.plates,left=r.left;
  const bv='<div class="barview">'+barSVG(plates,cp)+'</div>';
  const counts={};plates.forEach(p=>counts[p.kg]=(counts[p.kg]||0)+1);
  const chips=Object.keys(counts).map(k=>{const p=pset.find(x=>x.kg==k);return '<span class="chip" style="'+chipStyle(p)+'">'+counts[k]+' × '+k+'</span>';}).join('');
  const ps=plates.reduce((a,p)=>a+p.kg,0), total=bar+cp+ps*2;
  const conv=unit==='kg'?('(\u2248 '+Math.round(total*2.20462)+' lb)'):('(\u2248 '+(total/2.20462).toFixed(1)+' kg)');
  const warn=left>0?'<div class="leftover">'+left+' '+unit+' short of a clean load</div>':'';
  return bv+'<div class="perside">'+(chips||'<span class="chip" style="border-color:var(--line);color:var(--muted)">bar only</span>')+'</div>'+
    '<div class="note">Per side '+ps+' '+unit+' \u00b7 Bar '+bar+(cp>0?(' + collars '+cp):'')+' + plates '+(ps*2)+' = <b style="color:var(--text)">'+total+' '+unit+'</b> <span style="color:var(--muted)">'+conv+'</span></div>'+warn;
}
function miniBar(t,bar,cp){const plates=perSide(t,bar,cp).plates;
  return '<div style="display:flex;gap:2px;height:16px;align-items:flex-end;margin-top:4px">'+plates.map(p=>'<i style="display:block;height:'+(Math.round(p.h*0.15)+4)+'px;width:5px;border-radius:1px;background:'+p.c+';outline:'+(p.blk?'1px solid rgba(255,255,255,.3)':'none')+'"></i>').join('')+'</div>';}

/* ===== meet meta (admin) ===== */

