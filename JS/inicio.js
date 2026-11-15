/* Inicio:
   - Los combos se agregan directo al carrito con su precio y lo que llevan.
   - Los chorros de salsa se dibujan cuando entran en pantalla.
   - En celular, la barra para el pulgar aparece cuando el botón de la portada sale de vista. */
(() => {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-combo]');
    if (!b || !window.Cart) return;
    Cart.add({ name: b.dataset.combo, lines: b.dataset.lineas.split('|'), unit: +b.dataset.precio, q: 1 });
    b.classList.remove('rebota'); void b.offsetWidth; b.classList.add('rebota');
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.chorro').forEach(c => c.classList.add('visto'));
    return;
  }
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); }
  }), { threshold: 0.6 });
  document.querySelectorAll('.chorro').forEach(c => io.observe(c));

  const cta = document.getElementById('pedirPortada'), barra = document.getElementById('barraPulgar');
  if (cta && barra) {
    new IntersectionObserver(([en]) => barra.classList.toggle('on', !en.isIntersecting && en.boundingClientRect.top < 0)).observe(cta);
  }
})();
