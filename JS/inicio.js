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

  /* ---- Riel de combos: infinito. Se clonan las tarjetas a cada lado y, al llegar a una
     copia, el riel salta sin que se note a la tarjeta original equivalente. ---- */
  document.querySelectorAll('[data-riel]').forEach(riel => {
    const pista = riel.querySelector('.riel__pista');
    if (!pista || !pista.children.length) return;
    const reales = [...pista.children];
    const copia = li => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true'); c.dataset.copia = '';
      c.querySelectorAll('a, button').forEach(x => x.setAttribute('tabindex', '-1'));
      return c;
    };
    pista.prepend(...reales.map(copia));
    pista.append(...reales.map(copia));
    const inicio = () => reales[0].offsetLeft - pista.firstElementChild.offsetLeft;
    const vuelta = () => reales[reales.length - 1].offsetLeft + reales[reales.length - 1].offsetWidth - reales[0].offsetLeft + parseFloat(getComputedStyle(pista).columnGap || 0);
    const saltar = x => { pista.style.scrollBehavior = 'auto'; pista.scrollLeft = x; requestAnimationFrame(() => { pista.style.scrollBehavior = ''; }); };
    const ubicar = () => saltar(inicio());
    let t;
    pista.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const a = inicio(), w = vuelta(), x = pista.scrollLeft;
        if (x < a - w / 2) saltar(x + w);
        else if (x > a + w / 2) saltar(x - w);
      }, 140);
    }, { passive: true });
    const paso = () => reales[0].getBoundingClientRect().width + parseFloat(getComputedStyle(pista).columnGap || 0);
    riel.addEventListener('click', e => {
      const b = e.target.closest('[data-riel-paso]');
      if (b) pista.scrollBy({ left: paso() * +b.dataset.rielPaso, behavior: 'smooth' });
    });
    addEventListener('resize', ubicar);
    ubicar();
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
