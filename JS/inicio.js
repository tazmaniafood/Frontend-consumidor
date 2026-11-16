/* Inicio:
   - Los combos se agregan directo al carrito y van en un riel que se desliza (flechas en escritorio).
   - Los recomendados son una vitrina: una pizza grande y las demás en miniatura para escoger.
   - Los chorros de salsa se dibujan cuando entran en pantalla.
   - En celular, la barra para el pulgar aparece cuando el botón de la portada sale de vista. */
(() => {
  /* ---- Cantidad de cada combo: − n + y el total se recalcula ---- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cq]'); if (!b) return;
    const panel = b.closest('.combo-panel'), n = panel.querySelector('[data-cq-n]');
    const q = Math.max(1, Math.min(20, +n.textContent + +b.dataset.cq)); n.textContent = q;
    panel.querySelectorAll('[data-total]').forEach(t => { t.textContent = '$' + (q * +panel.dataset.precio).toFixed(2); });
  });

  /* ---- Combos al carrito ---- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-combo]');
    if (!b || !window.Cart) return;
    const panel = b.closest('.combo-panel'), q = panel ? +panel.querySelector('[data-cq-n]').textContent : 1;
    Cart.add({ name: b.dataset.combo, lines: b.dataset.lineas.split('|'), unit: +b.dataset.precio, q });
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
      /* mueve solo la fila de miniaturas, nunca la página */
      const fila = minis[i]?.closest('.vitrina__minis'); if (fila) fila.scrollTo({ left: minis[i].offsetLeft - fila.clientWidth / 2 + minis[i].offsetWidth / 2, behavior: 'smooth' });
    };
    let ultimo = Date.now();
    v.addEventListener('click', e => {
      const m = e.target.closest('[data-slide]'); if (m) { ultimo = Date.now(); return mostrar(+m.dataset.slide); }
      const f = e.target.closest('[data-paso]'); if (f) { ultimo = Date.now(); mostrar(i + +f.dataset.paso); }
    });
    /* data-auto: pasa solo y sin fin, despacio; se detiene con el mouse encima o tras tocarlo */
    const cada = +v.dataset.auto;
    if (cada && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let encima = false;
      v.addEventListener('mouseenter', () => { encima = true; });
      v.addEventListener('mouseleave', () => { encima = false; });
      v.addEventListener('focusin', () => { encima = true; });
      v.addEventListener('focusout', () => { encima = false; });
      setInterval(() => { if (!encima && Date.now() - ultimo > cada) mostrar(i + 1); }, cada);
    }
  });

  /* ---- Te recomendamos: media luna que gira sola y sin fin.
     Mouse: se detiene sobre una carta. Dedo (cel/iPad): se arrastra de lado y al soltar
     cae en la carta más cercana; un toque a una carta de lado la trae al centro y un toque
     a la del centro abre la pizza. Tras unos segundos sin tocar, vuelve a girar sola. ---- */
  document.querySelectorAll('[data-arco]').forEach(arco => {
    const baraja = arco.querySelector('.baraja'), cartas = [...arco.querySelectorAll('.carta')], N = cartas.length;
    if (!N) return;
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let p = 0, meta = null, encima = false, quietoHasta = 0, antes = performance.now();
    const VEL = 0.22, ESPERA = 5000;
    const offDe = i => { let o = ((i - p) % N + N) % N; if (o > N / 2) o -= N; return o; };
    const pintar = () => cartas.forEach((c, i) => {
      const off = offDe(i);
      c.style.setProperty('--off', off.toFixed(3));
      c.style.zIndex = 100 - Math.round(Math.abs(off) * 10);
      c.classList.toggle('centro', Math.abs(off) < 0.5);
    });
    let arrastre = null;
    const cuadro = t => {
      const dt = Math.min(0.05, (t - antes) / 1000); antes = t;
      if (arrastre) { /* lo mueve el dedo */ }
      else if (meta !== null) { p += (meta - p) * Math.min(1, dt * 8); if (Math.abs(meta - p) < 0.002) { p = meta; meta = null; } }
      else if (!encima && !quieto && t > quietoHasta) p += dt * VEL;
      pintar(); requestAnimationFrame(cuadro);
    };
    const esperar = () => { quietoHasta = performance.now() + ESPERA; };
    cartas.forEach(c => {
      c.addEventListener('mouseenter', () => { encima = true; });
      c.addEventListener('mouseleave', () => { encima = false; });
      c.addEventListener('focusin', () => { encima = true; });
      c.addEventListener('focusout', () => { encima = false; });
    });
    /* arrastre con el dedo */
    const paso = () => parseFloat(getComputedStyle(arco).getPropertyValue('--paso')) || 150;
    baraja.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      arrastre = { x: e.clientX, p0: p, movio: false }; meta = null; esperar();
    });
    baraja.addEventListener('pointermove', e => {
      if (!arrastre) return;
      const dx = e.clientX - arrastre.x;
      if (Math.abs(dx) > 8) arrastre.movio = true;
      if (arrastre.movio) p = arrastre.p0 - dx / paso();
    });
    const soltar = () => { if (!arrastre) return; if (arrastre.movio) { meta = Math.round(p); arco.dataset.arrastro = '1'; setTimeout(() => delete arco.dataset.arrastro, 60); } arrastre = null; esperar(); };
    baraja.addEventListener('pointerup', soltar);
    baraja.addEventListener('pointercancel', soltar);
    /* toque a una carta */
    baraja.addEventListener('click', e => {
      const c = e.target.closest('.carta'); if (!c) return;
      if (arco.dataset.arrastro) { e.preventDefault(); return; }
      const off = offDe(cartas.indexOf(c));
      if (Math.abs(off) >= 0.5) { e.preventDefault(); meta = Math.round(p + off); esperar(); }
    });
    arco.addEventListener('click', e => {
      const b = e.target.closest('[data-arco-paso]');
      if (b) { meta = Math.round(meta ?? p) + +b.dataset.arcoPaso; esperar(); }
    });
    pintar(); requestAnimationFrame(cuadro);
  });

  /* ---- Chorros y barra para el pulgar ---- */
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const cta = document.getElementById('pedirPortada'), barra = document.getElementById('barraPulgar');
  if (cta && barra) {
    new IntersectionObserver(([en]) => barra.classList.toggle('on', !en.isIntersecting && en.boundingClientRect.top < 0)).observe(cta);
  }
})();
