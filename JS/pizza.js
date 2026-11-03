/* Constructor de pizza. Las opciones (nombres, precios, foto) viven en pizza.html como data-*;
   aquí solo se lee, se calcula el total, se muestra la pizza y se envía al carrito.
   Foto de cada especialidad: data-img="../IMG/Pizzas/<nombre>.webp". Si la foto no existe
   todavía, se muestra la plantilla base (sin toppings). */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],fmt=n=>'$'+n.toFixed(2);

/* Lee las opciones del HTML: G.size, G.base, G.edge, G.ex */
const G={};
$$('.op').forEach(el=>{
  const d=el.dataset;
  (G[d.g]=G[d.g]||[]).push({el,n:el.querySelector('b').textContent,e:el.querySelector('em').textContent,pr:el.querySelector('.pr'),
    p:+d.p||0,pz:d.pz?d.pz.split(',').map(Number):null,img:d.img||'',custom:d.custom==='1',ok:false});
});

const fresh=()=>({size:0,base:0,edge:0,ex:[],q:1});
let s=fresh(),lastBase=0;
const price=()=>G.base[s.base].pz[s.size]+G.edge[s.edge].p+s.ex.reduce((t,i)=>t+G.ex[i].p,0);
const mark=(o,v)=>{o.el.classList.toggle('on',v);o.el.setAttribute('aria-pressed',v)};

/* Precarga las fotos: la que exista se marca ok y aparece como miniatura en su botón */
const thumb=src=>{const i=new Image();i.src=src;i.alt='';return i};
G.base.forEach(o=>{
  if(!o.img)return;
  const im=new Image();
  im.onload=()=>{o.ok=true;o.el.querySelector('em').replaceChildren(thumb(o.img));if(G.base[s.base]===o)drawPizza()};
  im.src=o.img;
});

/* Muestra la foto de la especialidad (o la plantilla base) con el tamaño y el borde elegidos */
let shown='';
function drawPizza(){
  const z=$('#pz'),img=$('#pzImg'),b=G.base[s.base];
  z.className='pz'+['',' bocadillo',' queso'][s.edge]+(b.ok?' has-img':'')+(b.custom?' custom':'');
  drawTops(b.custom?s.ex.map(i=>G.ex[i].e):[]);
  if(b.ok&&shown!==b.img){
    img.src=b.img;img.alt='Pizza '+b.n;shown=b.img;
    img.classList.remove('swap');void img.offsetWidth;img.classList.add('swap');
  }
  if(!b.ok){img.removeAttribute('src');img.alt='';shown=''}
  G.size.forEach(o=>o.el.querySelector('em').replaceChildren(b.ok?thumb(b.img):'🍕'));
}
/* Pizza a tu gusto: los ingredientes elegidos se reparten en espiral sobre la pizza en blanco */
function drawTops(list){
  const box=$('#tops'),all=[];
  list.forEach(e=>{for(let r=0;r<6;r++)all.push(e)});
  all.sort((a,c)=>((a.codePointAt(0)*7)%11)-((c.codePointAt(0)*7)%11));
  box.replaceChildren(...all.map((e,i)=>{
    const t=document.createElement('i'),a=i*2.399,r=Math.sqrt((i+.6)/all.length)*36;
    t.textContent=e;t.style.left=(50+r*Math.cos(a))+'%';t.style.top=(50+r*Math.sin(a))+'%';
    return t;
  }));
}
function drawPicked(custom){
  const box=$('#picked');
  if(!custom)return box.replaceChildren();
  const lab=document.createElement('span');lab.className='pk-lab';lab.textContent='Tu pizza lleva:';
  if(!s.ex.length){const e=document.createElement('span');e.className='pk-empty';e.textContent='Solo salsa y queso. Toca los ingredientes para ponérselos 👇';return box.replaceChildren(lab,e)}
  const chips=s.ex.map(i=>{const b=document.createElement('button');b.type='button';b.className='pk';b.dataset.pick=i;
    b.setAttribute('aria-label','Quitar '+G.ex[i].n);b.textContent=G.ex[i].e+' '+G.ex[i].n+' ✕';return b});
  const clr=document.createElement('button');clr.type='button';clr.className='pk-clear';clr.dataset.clear='1';clr.textContent='Limpiar todo';
  box.replaceChildren(lab,...chips,clr);
}
function paint(){
  G.size.forEach((o,i)=>mark(o,s.size===i));
  G.base.forEach((o,i)=>{mark(o,s.base===i);o.pr.textContent=fmt(o.pz[s.size])});
  G.edge.forEach((o,i)=>{mark(o,s.edge===i);o.pr.textContent=o.p?'+'+fmt(o.p):''});
  G.ex.forEach((o,i)=>{mark(o,s.ex.includes(i));o.pr.textContent='+'+fmt(o.p)});
  drawPizza();
  const t=price();
  $('#tot').textContent=fmt(t);
  const custom=G.base[s.base].custom;
  /* Pizza a tu gusto: interfaz especial "A la mano" con todos los ingredientes por categoría */
  /* Pizza personalizada: se oculta la especialidad y queda: 1. A la mano, 2. Tamaño y borde */
  $('.steps').classList.toggle('custom',custom);$('#customBar').hidden=!custom;
  $('.step:has(.tp) h3 i').textContent=custom?1:2;
  const tp=$('.tp');tp.classList.toggle('all',custom);tp.closest('.step').classList.toggle('taller',custom);
  $('#exTitle').textContent=custom?'A la mano':'Toppings extra';
  $('#exSub').textContent=custom?'Todos los ingredientes, listos para tu pizza':'Elige una categoría';
  drawPicked(custom);
  $('#pvSub').textContent=[G.base[s.base].n,G.size[s.size].n,s.edge?'Borde de '+G.edge[s.edge].n.toLowerCase():'',s.ex.length?(custom?'Con: ':'Extra: ')+s.ex.map(i=>G.ex[i].n).join(', '):''].filter(Boolean).join(' · ');
  $('#q').textContent=s.q;
  $('#addBtn').textContent='Agregar al carrito · '+fmt(t*s.q);
}
function add(){
  const b=G.base[s.base],lines=b.custom?[G.size[s.size].n]:[G.size[s.size].n,b.n];
  if(s.edge)lines.push('Borde de '+G.edge[s.edge].n.toLowerCase());
  if(s.ex.length)lines.push((b.custom?'Ingredientes: ':'Extra: ')+s.ex.map(i=>G.ex[i].n).join(', '));
  else if(b.custom)lines.push('Solo salsa y queso');
  Cart.add({name:b.custom?b.n:'Pizza '+b.n,lines,unit:price(),q:s.q});
  s=fresh();paint();
}
document.addEventListener('click',e=>{
  const pk=e.target.closest('[data-pick]');
  if(pk){const j=s.ex.indexOf(+pk.dataset.pick);if(j>=0)s.ex.splice(j,1);return paint()}
  if(e.target.closest('[data-clear]')){s.ex=[];return paint()}
  if(e.target.id==='backEsp'){s.base=lastBase;s.ex=[];paint();return $('.opts-base').scrollIntoView({behavior:'smooth',block:'start'})}
  const op=e.target.closest('.op');
  if(op){
    const g=op.dataset.g,i=+op.dataset.i;
    if(g==='ex'){const j=s.ex.indexOf(i);j<0?s.ex.push(i):s.ex.splice(j,1)}else s[g]=i;
    if(g==='base'&&!G.base[i].custom)lastBase=i;
    return paint();
  }
  const q=e.target.closest('[data-q]');
  if(q){s.q=Math.max(1,Math.min(20,s.q+ +q.dataset.q));return paint()}
  if(e.target.id==='addBtn')add();
});

/* ===================== Pizza por mitades =====================
   Botón #openMit abre la ventana #mit: se divide la pizza en 2 o 4 partes y cada parte
   lleva su especialidad. Se cobra la especialidad más cara (según el tamaño) + el borde.
   En tamaño Personal solo se permite por mitades. */
const dlg=$('#mit');
if(dlg){
const ESP=G.base.map((o,i)=>({o,i})).filter(x=>!x.o.custom);
const FR={1:'¼',2:'½',3:'¾'};
let m=null;
const SVGNS='http://www.w3.org/2000/svg';
const ang=(k,n)=>-90+360*k/n;
const pt=(a,r)=>[50+r*Math.cos(a*Math.PI/180),50+r*Math.sin(a*Math.PI/180)];
const clip=(k,n)=>{const a0=ang(k,n),a1=ang(k+1,n),p=['50% 50%'];for(let a=a0;a<=a1+.01;a+=5){const[x,y]=pt(a,75);p.push(x.toFixed(2)+'% '+y.toFixed(2)+'%')}return'polygon('+p.join(',')+')'};
const mprice=()=>m.parts.some(v=>v==null)?null:Math.max(...m.parts.map(i=>G.base[i].pz[m.size]))+G.edge[m.edge].p;
function seg(box,list,cur,key,dis){
  box.replaceChildren(...list.map((t,i)=>{const b=document.createElement('button');b.type='button';b.className='mseg'+(i===cur?' on':'');
    b.dataset[key]=i;b.setAttribute('aria-pressed',i===cur);b.innerHTML=t;if(dis&&dis(i)){b.disabled=true}return b}));
}
function drawPie(){
  const pz=$('#mpz'),n=m.n;
  pz.className='mpz'+['',' bocadillo',' queso'][m.edge];
  const secs=m.parts.map((v,k)=>{
    const d=document.createElement('div');d.className='msec'+(v==null?' vacia':'')+(k===m.act?' act':'');d.style.clipPath=clip(k,n);
    if(v!=null){const b=G.base[v];
      if(b.ok){const im=new Image();im.src=b.img;im.alt='';d.append(im)}
      else{d.classList.add('base');const tp=(b.el.dataset.tp||'').split(' ').filter(Boolean);
        for(let j=0;j<12;j++){const t=document.createElement('i');const a=ang(k,n)+(360/n)*(.1+.8*((j*.618+.3)%1)),r=10+32*Math.sqrt((j+.5)/12);const[x,y]=pt(a,r);t.style.left=x+'%';t.style.top=y+'%';t.textContent=tp[j%tp.length]||'🍕';d.append(t)}}
    }
    return d;
  });
  /* contorno de cada parte (se puede tocar) */
  const svg=document.createElementNS(SVGNS,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('class','mlines');
  m.parts.forEach((v,k)=>{
    const[x0,y0]=pt(ang(k,n),49),[x1,y1]=pt(ang(k+1,n),49),p=document.createElementNS(SVGNS,'path');
    p.setAttribute('d',`M50 50L${x0} ${y0}A49 49 0 0 1 ${x1} ${y1}Z`);p.dataset.part=k;p.setAttribute('class',k===m.act?'act':'');
    const t=document.createElementNS(SVGNS,'title');t.textContent='Parte '+(k+1);p.append(t);svg.append(p);
  });
  const labs=m.parts.map((v,k)=>{
    const a=ang(k+.5,n),[x,y]=pt(a,n===2?28:30),l=document.createElement('span');
    l.className='mlab'+(k===m.act?' act':'');l.style.left=x+'%';l.style.top=y+'%';
    l.innerHTML='<i>'+(k+1)+'</i>';const nm=document.createElement('b');nm.textContent=v==null?'Elige':G.base[v].n;l.append(nm);return l;
  });
  pz.replaceChildren(...secs,svg,...labs);
}
function mpaint(){
  seg($('#mitN'),['<b>2</b> mitades','<b>4</b> cuartos'],m.n===2?0:1,'mn',i=>i===1&&m.size===0);
  seg($('#mitSize'),G.size.map(o=>o.n),m.size,'msize');
  seg($('#mitEdge'),G.edge.map(o=>o.n+(o.p?' <small>+'+fmt(o.p)+'</small>':'')),m.edge,'medge');
  $('#mitNote4').hidden=m.size!==0;
  drawPie();
  /* lista de partes */
  $('#mitParts').replaceChildren(...m.parts.map((v,k)=>{
    const b=document.createElement('button');b.type='button';b.className='mpart'+(k===m.act?' on':'')+(v==null?' vacia':'');b.dataset.part=k;
    b.innerHTML='<i>'+(k+1)+'</i>';const t=document.createElement('span');t.textContent=v==null?'Sin elegir':G.base[v].n;b.append(t);
    if(v!=null){const pr=document.createElement('small');pr.textContent=fmt(G.base[v].pz[m.size]);b.append(pr)}
    return b;
  }));
  $('#mitPickT').textContent='Especialidad para la '+(m.n===2?'mitad ':'parte ')+(m.act+1);
  $('#mitEsp').replaceChildren(...ESP.map(({o,i})=>{
    const b=document.createElement('button');b.type='button';b.className='mesp'+(m.parts[m.act]===i?' on':'');b.dataset.esp=i;b.setAttribute('aria-pressed',m.parts[m.act]===i);
    const em=document.createElement('em');if(o.ok){const im=new Image();im.src=o.img;im.alt='';em.append(im)}else em.textContent='🍕';
    const nm=document.createElement('b');nm.textContent=o.n;const pr=document.createElement('small');pr.textContent=fmt(o.pz[m.size]);
    b.append(em,nm,pr);return b;
  }));
  const p=mprice(),falta=m.parts.filter(v=>v==null).length;
  $('#mitTot').textContent=p==null?'—':fmt(p*m.q);
  $('#mitQ').textContent=m.q;
  const add=$('#mitAdd');add.disabled=p==null;
  add.textContent=p==null?(falta===1?'Falta 1 parte por elegir':'Faltan '+falta+' partes por elegir'):'Agregar al carrito · '+fmt(p*m.q);
}
const setN=n=>{const old=m.parts;m.n=n;m.parts=Array.from({length:n},(_,k)=>n===4?(old[Math.floor(k/2)]??null):(old[k*2]??null));m.act=Math.min(m.act,n-1)};
function open(){
  const b=G.base[s.base];
  m={n:2,size:s.size,edge:s.edge,q:1,act:b.custom?0:1,parts:[b.custom?null:s.base,null]};
  mpaint();dlg.showModal();document.documentElement.classList.add('mit-open');
}
function close(){dlg.close()}
dlg.addEventListener('close',()=>document.documentElement.classList.remove('mit-open'));
dlg.addEventListener('click',e=>{
  if(e.target===dlg||e.target.closest('[data-mit="close"]'))return close();
  const t=e.target.closest('[data-mn],[data-msize],[data-medge],[data-part],[data-esp],[data-mq]');if(!t)return;
  const d=t.dataset;
  if(d.mn!=null)setN(+d.mn?4:2);
  else if(d.msize!=null){m.size=+d.msize;if(m.size===0&&m.n===4)setN(2)}
  else if(d.medge!=null)m.edge=+d.medge;
  else if(d.part!=null)m.act=+d.part;
  else if(d.esp!=null){m.parts[m.act]=+d.esp;const nx=m.parts.findIndex(v=>v==null);if(nx>=0)m.act=nx;
    /* en celular la pizza queda arriba: se vuelve a ella para ver cómo quedó */
    const bd=dlg.querySelector('.mit-body');if(bd.scrollTop>0&&matchMedia('(max-width:760px)').matches)bd.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
  else if(d.mq!=null)m.q=Math.max(1,Math.min(20,m.q+ +d.mq));
  mpaint();
});
$('#openMit').addEventListener('click',open);
$('#mitAdd').addEventListener('click',()=>{
  const p=mprice();if(p==null)return;
  const cnt=new Map();m.parts.forEach(v=>cnt.set(v,(cnt.get(v)||0)+1));
  const lines=[G.size[m.size].n,...[...cnt].map(([v,c])=>(m.n===2?(c===2?'Completa':'½'):(c===4?'Completa':FR[c]))+' '+G.base[v].n)];
  if(m.edge)lines.push('Borde de '+G.edge[m.edge].n.toLowerCase());
  Cart.add({name:m.n===2?'Pizza por mitades':'Pizza en cuartos',lines,unit:p,q:m.q});
  close();
});
}

paint();
})();
