/* Bebidas: precio en data-p y foto en data-img de cada tarjeta (pages/bebidas.html).
   Si la foto aún no existe se ve el vaso 🥤 dentro del marco. */
(()=>{
const fmt=n=>'$'+n.toFixed(2);
document.querySelectorAll('.bb').forEach(c=>{
  const d=c.dataset,p=+d.p,img=c.querySelector('.marco img'),qn=c.querySelector('.qn'),add=c.querySelector('.add');
  let q=1;
  const paint=()=>{qn.textContent=q;add.textContent='Agregar · '+fmt(p*q)};
  c.querySelector('.pr').textContent=fmt(p);
  if(d.img){img.onload=()=>c.classList.add('has-img');img.src=d.img}
  c.addEventListener('click',e=>{
    const b=e.target.closest('[data-q]');
    if(b){q=Math.max(1,Math.min(20,q+ +b.dataset.q));paint()}
    else if(e.target===add){Cart.add({name:d.n,lines:['Bebida'],unit:p,q});q=1;paint()}
  });
  paint();
});
})();
