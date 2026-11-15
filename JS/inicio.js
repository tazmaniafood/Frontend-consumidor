/* Inicio:
   - Los combos se agregan directo al carrito y van en un riel que se desliza (flechas en escritorio).
   - Los recomendados son una vitrina: una pizza grande y las demás en miniatura para escoger.
   - Los chorros de salsa se dibujan cuando entran en pantalla.
   - En celular, la barra para el pulgar aparece cuando el botón de la portada sale de vista. */
(() => {
  /* ---- Combos al carrito ---- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-combo]');
    if (!b || !window.Cart) return;
    Cart.add({ name: b.dataset.combo, lines: b.dataset.lineas.split('|'), unit: +b.dataset.precio, q: 1 });
    b.classList.remove('rebota'); void b.offsetWidth; b.classList.add('rebota');
  });

  /* ---- Riel de combos ---- */
  document.querySelectorAll('[data-riel]').forEach(riel => {
    const pista = riel.querySelector('.riel__pista');
    const prev = riel.querySelector('[data-riel-paso="-1"]'), next = riel.querySelector('[data-riel-paso="1"]');
    if (!pista) return;
    const paso = () => (pista.querySelector('li')?.getBoundingClientRect().width || 300) + 24;
    const estado = () => {
      const max = pista.scrollWidth - pista.clientWidth - 4;
      if (prev) prev.disabled = pista.scrollLeft <= 4;
      if (next) next.disabled = pista.scrollLeft >= max;
    };
    riel.addEventListener('click', e => {
      const b = e.target.closest('[data-riel-paso]');
      if (b) pista.scrollBy({ left: paso() * +b.dataset.rielPaso, behavior: 'smooth' });
    });
    pista.addEventListener('scroll', estado, { passive: true });
    addEventListener('resize', estado);
    estado();
  });

  /* ---- Vitrina de recomendados ---- */
  document.querySelectorAll('[data-vitrina]').forEach(v => {
    const slides = [...v.querySelectorAll('.vitrina__slide')], minis = [...v.querySelectorAll('.vitrina__mini')];
    let i = 0;
    const mostrar = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.hidden = k !== i; s.classList.remove('entra'); });
      void slides[i].offsetWidth; slides[i].classList.add('entra');
      minis.forEach((m, k) => m.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
      minis[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    };
    v.addEventListener('click', e => {
      const m = e.target.closest('[data-slide]'); if (m) return mostrar(+m.dataset.slide);
      const f = e.target.closest('[data-paso]'); if (f) mostrar(i + +f.dataset.paso);
    });
  });

  /* ---- Chorros y barra para el pulgar ---- */
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
