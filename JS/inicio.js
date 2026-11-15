/* Inicio: los combos se agregan directo al carrito con su precio y lo que llevan. */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-combo]');if(!b||!window.Cart)return;
  Cart.add({name:b.dataset.combo,lines:b.dataset.lineas.split('|'),unit:+b.dataset.precio,q:1});
  b.classList.remove('rebota');void b.offsetWidth;b.classList.add('rebota');
});
