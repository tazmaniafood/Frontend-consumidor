/* Constructor de pizza. Las opciones (nombres, precios, toppings) viven en pizza.html como data-*;
   aquí solo se lee, se calcula el total, se dibuja la pizza y se envía al carrito (cart.js). */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],fmt=n=>'$'+n.toFixed(2);

/* Lee las opciones del HTML: G.size, G.base, G.edge, G.ex */
const G={};
$$('.op').forEach(el=>{
  const d=el.dataset;
  (G[d.g]=G[d.g]||[]).push({el,n:el.querySelector('b').textContent,e:el.querySelector('em').textContent,pr:el.querySelector('.pr'),
    p:+d.p||0,pz:d.pz?d.pz.split(',').map(Number):null,tp:d.tp?d.tp.split(' '):[]});
});

const fresh=()=>({size:0,base:0,edge:0,ex:[],q:1});
let s=fresh();
const price=()=>G.base[s.base].pz[s.size]+G.edge[s.edge].p+s.ex.reduce((t,i)=>t+G.ex[i].p,0);
const mark=(o,v)=>{o.el.classList.toggle('on',v);o.el.setAttribute('aria-pressed',v)};

/* Pizza con toppings repartidos en espiral */
function drawPizza(){
  const z=$('#pz'),b=G.base[s.base],ex=s.ex.map(i=>G.ex[i].e),list=[];
  z.className='pz s'+s.size+(s.edge?' bocadillo':'');
  [...b.tp,...ex].forEach(e=>{for(let r=0;r<(ex.includes(e)&&!b.tp.includes(e)?4:5);r++)list.push(e)});
  list.sort((a,c)=>((a.codePointAt(0)*7)%11)-((c.codePointAt(0)*7)%11));
  z.replaceChildren(...list.map((e,i)=>{
    const t=document.createElement('i'),a=i*2.399,r=Math.sqrt((i+.6)/list.length)*40;
    t.textContent=e;t.style.left=(50+r*Math.cos(a))+'%';t.style.top=(50+r*Math.sin(a))+'%';
    return t;
  }));
}
function paint(){
  G.size.forEach((o,i)=>mark(o,s.size===i));
  G.base.forEach((o,i)=>{mark(o,s.base===i);o.pr.textContent=fmt(o.pz[s.size])});
  G.edge.forEach((o,i)=>{mark(o,s.edge===i);o.pr.textContent=o.p?'+'+fmt(o.p):''});
  G.ex.forEach((o,i)=>{mark(o,s.ex.includes(i));o.pr.textContent='+'+fmt(o.p)});
  drawPizza();
  const t=price();
  $('#tot').textContent=fmt(t);
  $('#pvSub').textContent=G.base[s.base].n+' · '+G.size[s.size].n;
  $('#q').textContent=s.q;
  $('#addBtn').textContent='Agregar al carrito · '+fmt(t*s.q);
}
function add(){
  const b=G.base[s.base],lines=[G.size[s.size].n,b.n];
  if(s.edge)lines.push(G.edge[s.edge].n);
  if(s.ex.length)lines.push('Extra: '+s.ex.map(i=>G.ex[i].n).join(', '));
  Cart.add({name:'Pizza '+b.n,lines,unit:price(),q:s.q});
  s=fresh();paint();
}
document.addEventListener('click',e=>{
  const op=e.target.closest('.op');
  if(op){
    const g=op.dataset.g,i=+op.dataset.i;
    if(g==='ex'){const j=s.ex.indexOf(i);j<0?s.ex.push(i):s.ex.splice(j,1)}else s[g]=i;
    return paint();
  }
  const q=e.target.closest('[data-q]');
  if(q){s.q=Math.max(1,Math.min(20,s.q+ +q.dataset.q));return paint()}
  if(e.target.id==='addBtn')add();
});
paint();
})();
