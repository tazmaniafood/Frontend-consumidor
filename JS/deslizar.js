/* Toppings y salsas en fila que se arrastra (no infinita).
   - La pista "Desliza para ver más" avisa que se puede correr (sin animar la fila).
   - Al poner un ingrediente, si la pizza no está a la vista, la muestra después de un
     tiempo de gracia; si la persona sigue tocando o arrastrando las filas, espera. */
(() => {
  /* las especialidades (.opts-base) también se arrastran en celular: se les pone su pista */
  document.querySelectorAll('.opts-base:not(.opts-cartel)').forEach(f => {
    if (f.nextElementSibling && f.nextElementSibling.classList.contains('pista-desliza')) return;
    const p = document.createElement('p'); p.className = 'pista-desliza'; p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '<span class="es">Desliza para ver más</span><span class="en">Swipe for more</span>';
    f.after(p);
  });
  const filas = [...document.querySelectorAll('.opts-ex, .opts-base:not(.opts-cartel)')];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* marca de "se puede correr" y estado de los bordes */
  const estado = f => {
    const max = f.scrollWidth - f.clientWidth;
    f.classList.toggle('desliza', max > 4);
    f.classList.toggle('al-inicio', f.scrollLeft <= 4);
    f.classList.toggle('al-final', f.scrollLeft >= max - 4);
  };
  filas.forEach(f => { estado(f); f.addEventListener('scroll', () => estado(f), { passive: true }); });
  addEventListener('resize', () => filas.forEach(estado));
  /* mostrar la pizza con tiempo de gracia */
  const stage = document.getElementById('stage');
  if (!stage) return;
  const GRACIA = 1540; /* 30 % menos que antes (2200 ms) */
  let t = null;
  const visible = () => { const r = stage.getBoundingClientRect(); return r.bottom > 80 && r.top < innerHeight - 120; };
  const esperar = () => { if (t) { clearTimeout(t); t = setTimeout(mostrar, GRACIA); } };
  const mostrar = () => { t = null; if (!visible()) stage.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'center' }); };
  document.addEventListener('click', e => {
    const op = e.target.closest('.opts-ex .op');
    if (!op || (e.target.closest('[data-step="-1"]'))) return esperar();
    clearTimeout(t); t = setTimeout(mostrar, GRACIA);
  });
  filas.forEach(f => { f.addEventListener('scroll', esperar, { passive: true }); f.addEventListener('pointerdown', esperar); });
  addEventListener('wheel', esperar, { passive: true });
  addEventListener('touchmove', esperar, { passive: true });
})();
