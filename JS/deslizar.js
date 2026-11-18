/* Toppings y salsas en fila que se arrastra (no infinita).
   - La primera vez que una fila aparece en pantalla se asoma sola un poquito y vuelve,
     para que se note que se puede correr.
   - Al poner un ingrediente, si la pizza no está a la vista, la muestra después de un
     tiempo de gracia; si la persona sigue tocando o arrastrando las filas, espera. */
(() => {
  /* las especialidades (.opts-base) también se arrastran en celular: se les pone su pista */
  document.querySelectorAll('.opts-base').forEach(f => {
    if (f.nextElementSibling && f.nextElementSibling.classList.contains('pista-desliza')) return;
    const p = document.createElement('p'); p.className = 'pista-desliza'; p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '<span class="es">Desliza para ver más</span><span class="en">Swipe for more</span>';
    f.after(p);
  });
  const filas = [...document.querySelectorAll('.opts-ex, .opts-base')];
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
  /* se asoma una vez */
  if (!quieto && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      const f = en.target; estado(f);
      if (!en.isIntersecting || f.dataset.asomo || !f.classList.contains('desliza')) return;
      f.dataset.asomo = '1'; io.unobserve(f);
      setTimeout(() => { f.scrollTo({ left: Math.min(90, f.scrollWidth), behavior: 'smooth' }); setTimeout(() => f.scrollTo({ left: 0, behavior: 'smooth' }), 650); }, 350);
    }), { threshold: 0.6 });
    const vigilar = () => filas.forEach(f => { if (f.offsetParent && !f.dataset.asomo) io.observe(f); });
    vigilar(); document.addEventListener('click', () => setTimeout(vigilar, 350));
  }
  /* mostrar la pizza con tiempo de gracia */
  const stage = document.getElementById('stage');
  if (!stage) return;
  let t = null;
  const visible = () => { const r = stage.getBoundingClientRect(); return r.bottom > 80 && r.top < innerHeight - 120; };
  const esperar = () => { if (t) { clearTimeout(t); t = setTimeout(mostrar, 2200); } };
  const mostrar = () => { t = null; if (!visible()) stage.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'center' }); };
  document.addEventListener('click', e => {
    const op = e.target.closest('.opts-ex .op');
    if (!op || (e.target.closest('[data-step="-1"]'))) return esperar();
    clearTimeout(t); t = setTimeout(mostrar, 2200);
  });
  filas.forEach(f => { f.addEventListener('scroll', esperar, { passive: true }); f.addEventListener('pointerdown', esperar); });
  addEventListener('wheel', esperar, { passive: true });
  addEventListener('touchmove', esperar, { passive: true });
})();
