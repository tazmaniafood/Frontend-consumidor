/* Telón entre páginas: al ir a otra página de Pa'l Filo la carpa baja hasta cubrir la
   pantalla; la página nueva arranca con el telón abajo (lo marca el script del <head>)
   y lo sube. Sin movimiento si la persona lo pidió así. */
(() => {
  const html = document.documentElement;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const subir = () => {
    if (!html.classList.contains('telon')) return;
    requestAnimationFrame(() => html.classList.add('telon-sube'));
    setTimeout(() => html.classList.remove('telon', 'telon-sube'), 700);
  };
  if (document.readyState === 'complete') setTimeout(subir, 60); else addEventListener('load', () => setTimeout(subir, 60));
  setTimeout(subir, 1800); /* por si alguna imagen tarda */
  addEventListener('pageshow', e => { if (e.persisted) html.classList.remove('telon', 'telon-sube', 'telon-baja'); });
  if (quieto) return;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    if (url.href === location.href) return;
    e.preventDefault();
    try { sessionStorage.setItem('palfilo-telon', '1'); } catch (_) {}
    html.classList.add('telon-baja');
    setTimeout(() => { location.href = url.href; }, 480);
  });
})();
