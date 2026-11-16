/* Telón: la carpa baja despacio al ir a otra página de Pa'l Filo; la página nueva
   arranca con el telón abajo (lo marca el script del <head>, y en el inicio siempre) y lo
   sube cuando ya tiene el logo, la baldosa y su contenido listos, y nunca antes de que
   se alcance a ver. Sin movimiento si la persona lo pidió así. */
(() => {
  const html = document.documentElement;
  const BAJA = 900, SUBE = 1100, MIN = 700, MAX = 3500;
  const raiz = new URL('..', document.currentScript ? document.currentScript.src : location.href).href;
  const t0 = performance.now();
  let subiendo = false;
  const subir = () => {
    if (subiendo || !html.classList.contains('telon')) return;
    subiendo = true;
    html.classList.add('telon-sube');
    setTimeout(() => html.classList.remove('telon', 'telon-sube'), SUBE + 80);
  };
  if (html.classList.contains('telon')) {
    const carga = src => new Promise(r => { const im = new Image(); im.onload = im.onerror = () => r(); im.src = src; (im.decode ? im.decode().then(r, r) : 0); });
    const dom = new Promise(r => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', r) : r());
    Promise.all([dom, carga(raiz + 'IMG/Marca/logo-principal.png'), carga(raiz + 'IMG/Marca/azulejos-costenos.svg')])
      .then(() => setTimeout(subir, Math.max(0, MIN - (performance.now() - t0))));
    setTimeout(subir, MAX);
  }
  addEventListener('pageshow', e => { if (e.persisted) html.classList.remove('telon', 'telon-sube', 'telon-baja'); });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash) || url.href === location.href) return;
    e.preventDefault();
    try { sessionStorage.setItem('palfilo-telon', '1'); } catch (_) {}
    html.classList.add('telon-baja');
    setTimeout(() => { location.href = url.href; }, BAJA + 60);
  });
})();
