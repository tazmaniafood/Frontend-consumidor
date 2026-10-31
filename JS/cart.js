/* Carrito compartido (pizza, bebidas…). Guarda en localStorage 'taz-cart', el mismo que usan
 las demás páginas, así el pedido se mantiene al cambiar de página.
 Uso: Cart.add({name, lines:[...], unit, q}) */
window.Cart=(()=>{
const $=s=>document.querySelector(s),fmt=n=>'$'+n.toFixed(2);
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
