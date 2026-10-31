/* Constructor genérico (burguer, perro, salchipapas, mazorcada): especialidad + toppings extra.
   Todo vive en el HTML como data-*: precio (data-p), nombre en el carrito (data-name)
   y foto (data-img). Si la foto no existe todavía se muestra el plato con el emoji. */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],fmt=n=>'$'+n.toFixed(2);
const G={base:[],ex:[]};
$$('.op').forEach(el=>{const d=el.dataset;G[d.g].push({el,n:el.querySelector('b').textContent,full:d.name||el.querySelector('b').textContent,p:+d.p||0,img:d.img||'',ok:false})});
const fresh=()=>({base:0,ex:[],q:1});
let s=fresh(),shown='';
const price=()=>G.base[s.base].p+s.ex.reduce((t,i)=>t+G.ex[i].p,0);
const mark=(o,v)=>{o.el.classList.toggle('on',v);o.el.setAttribute('aria-pressed',v)};
const thumb=src=>{const i=new Image();i.src=src;i.alt='';return i};
G.base.forEach(o=>{if(!o.img)return;const im=new Image();im.onload=()=>{o.ok=true;o.el.querySelector('em').replaceChildren(thumb(o.img));if(G.base[s.base]===o)paint()};im.src=o.img});
function paint(){
  const b=G.base[s.base],z=$('#pz'),img=$('#pzImg');
  G.base.forEach((o,i)=>mark(o,s.base===i));
  G.ex.forEach((o,i)=>mark(o,s.ex.includes(i)));
  z.classList.toggle('has-img',b.ok);
  if(b.ok&&shown!==b.img){img.src=b.img;img.alt=b.full;shown=b.img;img.classList.remove('swap');void img.offsetWidth;img.classList.add('swap')}
  if(!b.ok){img.removeAttribute('src');img.alt='';shown=''}
  const t=price();
  $('#tot').textContent=fmt(t);
  $('#pvSub').textContent=[b.full,s.ex.length?'Extra: '+s.ex.map(i=>G.ex[i].n).join(', '):''].filter(Boolean).join(' · ');
  $('#q').textContent=s.q;
  $('#addBtn').textContent='Agregar al carrito · '+fmt(t*s.q);
}
document.addEventListener('click',e=>{
  const op=e.target.closest('.op');
  if(op){const g=op.dataset.g,i=+op.dataset.i;if(g==='ex'){const j=s.ex.indexOf(i);j<0?s.ex.push(i):s.ex.splice(j,1)}else s.base=i;return paint()}
  const q=e.target.closest('[data-q]');
  if(q){s.q=Math.max(1,Math.min(20,s.q+ +q.dataset.q));return paint()}
  if(e.target.id==='addBtn'){
    const b=G.base[s.base],lines=[];
    if(s.ex.length)lines.push('Extra: '+s.ex.map(i=>G.ex[i].n).join(', '));
    Cart.add({name:b.full,lines:lines.length?lines:['Sin extras'],unit:price(),q:s.q});
    s=fresh();paint();
  }
});
paint();
})();
