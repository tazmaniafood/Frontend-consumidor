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
    p:+d.p||0,pz:d.pz?d.pz.split(',').map(Number):null,img:d.img||'',ok:false});
});

const fresh=()=>({size:0,base:0,edge:0,ex:[],q:1});
let s=fresh();
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
  z.className='pz s'+s.size+(s.edge?' bocadillo':'')+(b.ok?' has-img':'');
  if(b.ok&&shown!==b.img){
    img.src=b.img;img.alt='Pizza '+b.n;shown=b.img;
    img.classList.remove('swap');void img.offsetWidth;img.classList.add('swap');
  }
  if(!b.ok){img.removeAttribute('src');img.alt='';shown=''}
  G.size.forEach(o=>o.el.querySelector('em').replaceChildren(b.ok?thumb(b.img):'🍕'));
}
function paint(){
  G.size.forEach((o,i)=>mark(o,s.size===i));
  G.base.forEach((o,i)=>{mark(o,s.base===i);o.pr.textContent=fmt(o.pz[s.size])});
  G.edge.forEach((o,i)=>{mark(o,s.edge===i);o.pr.textContent=o.p?'+'+fmt(o.p):''});
  G.ex.forEach((o,i)=>{mark(o,s.ex.includes(i));o.pr.textContent='+'+fmt(o.p)});
  drawPizza();
  const t=price();
  $('#tot').textContent=fmt(t);
  $('#pvSub').textContent=[G.base[s.base].n,G.size[s.size].n,s.edge?G.edge[s.edge].n:'',s.ex.length?'Extra: '+s.ex.map(i=>G.ex[i].n).join(', '):''].filter(Boolean).join(' · ');
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

/* Carrito (compartido con las demás páginas por localStorage 'taz-cart') */
if(!window.Cart)window.Cart=(()=>{
  let cart=[];
  try{cart=JSON.parse(localStorage.getItem('taz-cart')||'[]')}catch(e){}
  const save=()=>{try{localStorage.setItem('taz-cart',JSON.stringify(cart))}catch(e){}};
  const tpl=$('#tpl-item'),items=$('#items'),empty=$('#empty');
  function draw(){
    const n=cart.reduce((t,i)=>t+i.q,0),tot=cart.reduce((t,i)=>t+i.q*i.unit,0);
    $('#cnt').textContent=n;$('#ctot').textContent=fmt(tot);$('#send').disabled=!n;
    items.replaceChildren(...(n?cart.map((it,i)=>{
      const c=tpl.content.firstElementChild.cloneNode(true);
      c.querySelector('.nm').textContent=it.name;c.querySelector('.pt').textContent=fmt(it.unit*it.q);
      c.querySelector('.ln').textContent=it.lines.join(' · ');c.querySelector('.qn').textContent=it.q;
      c.querySelectorAll('[data-c]').forEach(b=>b.dataset.i=i);
      return c;
    }):[empty]));
  }
  const open=o=>{$('#cart').classList.toggle('on',o);$('#ov').classList.toggle('on',o)};
  $('#openCart').onclick=()=>open(true);$('#closeCart').onclick=$('#ov').onclick=()=>open(false);
  items.addEventListener('click',e=>{
    const c=e.target.closest('[data-c]');if(!c)return;
    const i=+c.dataset.i;
    if(c.dataset.c==='del')cart.splice(i,1);else{cart[i].q+=+c.dataset.c;if(cart[i].q<1)cart.splice(i,1)}
    save();draw();
  });
  $('#send').onclick=()=>{
    const tot=cart.reduce((t,i)=>t+i.q*i.unit,0);
    const msg='Hola TAZ, quiero hacer este pedido:\n'+cart.map(i=>`${i.q}x ${i.name} (${i.lines.join('; ')}) - ${fmt(i.q*i.unit)}`).join('\n')+'\nTotal: '+fmt(tot);
    window.open('https://wa.me/16506830906?text='+encodeURIComponent(msg),'_blank');
  };
  draw();
  return{add(it){cart.push(it);save();draw();const t=$('#toast');t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),1600)}};
})();
paint();
})();
