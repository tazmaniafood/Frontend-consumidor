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
  $('.step:has(.tp) h3 i').textContent=custom?1:3;$('.step-duo h3 i').textContent=2;
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

paint();
})();
