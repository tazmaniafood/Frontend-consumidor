/* Bebidas: cada tarjeta tiene 3 tamaños (Personal/lata, 1.5 L y 2 L) como botones .tam
   con su precio (data-p), su foto (data-img) y el nombre para el carrito (data-l).
   Si una foto aún no existe se ve el vaso 🥤 dentro del marco. */
(()=>{
const fmt=n=>'$'+n.toFixed(2);
document.querySelectorAll('.bb').forEach(c=>{
  const name=c.dataset.n,img=c.querySelector('.marco img'),qn=c.querySelector('.qn'),add=c.querySelector('.add'),pr=c.querySelector('.pr');
  const T=[...c.querySelectorAll('.tam')].map(el=>({el,p:+el.dataset.p,img:el.dataset.img||'',l:el.dataset.l,ok:null}));
  let q=1,t=0;
  /* precarga las fotos para que el cambio de tamaño sea instantáneo */
  T.forEach(o=>{if(!o.img)return o.ok=false;const im=new Image();im.onload=()=>{o.ok=true;if(T[t]===o)show()};im.onerror=()=>{o.ok=false;if(T[t]===o)show()};im.src=o.img});
  const show=()=>{
    const o=T[t];
    c.classList.toggle('has-img',!!o.ok);
    c.dataset.tam=t;
    if(o.ok&&img.getAttribute('src')!==o.img){img.src=o.img;img.alt=name+' '+o.l;img.classList.remove('pop');void img.offsetWidth;img.classList.add('pop')}
  };
  const paint=()=>{
    T.forEach((o,i)=>{o.el.classList.toggle('on',i===t);o.el.setAttribute('aria-pressed',i===t)});
    pr.textContent=fmt(T[t].p);qn.textContent=q;add.textContent='Agregar · '+fmt(T[t].p*q);show();
  };
  c.addEventListener('click',e=>{
    const tb=e.target.closest('.tam');
    if(tb){t=T.findIndex(o=>o.el===tb);return paint()}
    const b=e.target.closest('[data-q]');
    if(b){q=Math.max(1,Math.min(20,q+ +b.dataset.q));return paint()}
    if(e.target===add){Cart.add({name:name+' '+T[t].l,lines:['Bebida'],unit:T[t].p,q});q=1;paint()}
  });
  paint();
});
})();
