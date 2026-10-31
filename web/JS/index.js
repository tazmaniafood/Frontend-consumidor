const $=s=>document.querySelector(s), fmt=n=>'$'+n.toFixed(2), T=s=>s.split(' ');
let cart=[],cur=null,st=null;
try{cart=JSON.parse(localStorage.getItem('taz-cart')||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem('taz-cart',JSON.stringify(cart))}catch(e){}};


document.addEventListener('click',e=>{
  const op=e.target.closest('.op');
  if(op&&st){
    const g=PR[st.k].groups.find(x=>x.k===op.dataset.g),i=+op.dataset.i;
    if(g.type==='one')st.ch[g.k]=i;else{const a=st.ch[g.k],j=a.indexOf(i);j>=0?a.splice(j,1):a.push(i)}
    const y=scrollY;builder();scrollTo(0,y);return;
  }
  const q=e.target.closest('[data-q]');
  if(q&&st){st.q=Math.max(1,Math.min(20,st.q+ +q.dataset.q));$('#q').textContent=st.q;$('#addBtn').textContent='Agregar al carrito · '+fmt(price()*st.q);return}
  if(e.target.id==='addBtn')addCart();
  const c=e.target.closest('[data-c]');
  if(c){const it=cart[+c.dataset.i];if(c.dataset.c==='del')cart.splice(+c.dataset.i,1);else{it.q+=+c.dataset.c;if(it.q<1)cart.splice(+c.dataset.i,1)}save();drawCart()}
});
function drawCart(){
  const n=cart.reduce((s,i)=>s+i.q,0),tot=cart.reduce((s,i)=>s+i.q*i.unit,0);
  $('#cnt').textContent=n;$('#ctot').textContent=fmt(tot);$('#send').disabled=!n;
  $('#items').innerHTML=n?cart.map((it,i)=>`<div class="it"><div class="row"><b>${it.name}</b><span>${fmt(it.unit*it.q)}</span></div><p>${it.lines.join(' · ')}</p><div class="row"><div class="qty"><button data-c="-1" data-i="${i}" aria-label="Menos">−</button><span>${it.q}</span><button data-c="1" data-i="${i}" aria-label="Más">+</button></div><button class="x" data-c="del" data-i="${i}">Quitar</button></div></div>`).join(''):'<div class="empty">Tu carrito está vacío. Arma tu primer plato y aparecerá aquí.</div>';
}
const cartOpen=o=>{$('#cart').classList.toggle('on',o);$('#ov').classList.toggle('on',o)};
$('#openCart').onclick=()=>cartOpen(true);$('#closeCart').onclick=$('#ov').onclick=()=>cartOpen(false);
$('#send').onclick=()=>{
  const tot=cart.reduce((s,i)=>s+i.q*i.unit,0);
  const msg='Hola TAZ, quiero hacer este pedido:\n'+cart.map(i=>`${i.q}x ${i.name} (${i.lines.join('; ')}) - ${fmt(i.q*i.unit)}`).join('\n')+'\nTotal: '+fmt(tot);
  window.open('https://wa.me/16506830906?text='+encodeURIComponent(msg),'_blank');
};
drawCart();