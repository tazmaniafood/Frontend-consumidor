/* Horario de Pa'l Filo: miércoles a domingo, de 6 a 11 pm, hora de San José (California).
   - Llena los avisos [data-horario] con "Abierto hasta las 11 pm" o cuándo abrimos.
   - Si está cerrado, saca una vez por visita el cartel de Cerrado / Closed con las redes
     y el botón Explorar.
   Para probar: ?abierto=1 o ?cerrado=1 en la dirección. */
(() => {
  const HORARIO = { dias: [3, 4, 5, 6, 0], abre: 18, cierra: 23, zona: 'America/Los_Angeles' };
  const IG = 'https://www.instagram.com/tazmaniafoodoficial/';
  const FB = 'https://www.facebook.com/p/Tazmania-Food-61559588588174/';
  const raiz = new URL('..', document.currentScript ? document.currentScript.src : location.href).href;
  const en = document.documentElement.lang === 'en';
  const DIAS = {
    es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };

  /* Día y hora en San José, sin importar dónde esté el cliente */
  function ahora() {
    const partes = new Intl.DateTimeFormat('en-US', { timeZone: HORARIO.zona, weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.find(p => p.type === 'weekday').value);
    const hora = +partes.find(p => p.type === 'hour').value % 24;
    return { dia, hora };
  }

  function estado() {
    const q = new URLSearchParams(location.search);
    const { dia, hora } = ahora();
    let abierto = HORARIO.dias.includes(dia) && hora >= HORARIO.abre && hora < HORARIO.cierra;
    if (q.has('abierto')) abierto = true;
    if (q.has('cerrado')) abierto = false;
    if (abierto) return { abierto, texto: en ? 'Open until 11 pm' : 'Abierto hasta las 11 pm' };
    /* Próxima apertura */
    if (HORARIO.dias.includes(dia) && hora < HORARIO.abre) return { abierto, texto: en ? 'Closed · we open today at 6 pm' : 'Cerrado · abrimos hoy a las 6 pm', cuando: en ? 'today at 6 pm' : 'hoy a las 6 pm' };
    for (let i = 1; i <= 7; i++) {
      const d = (dia + i) % 7;
      if (!HORARIO.dias.includes(d)) continue;
      const cuando = i === 1 ? (en ? 'tomorrow at 6 pm' : 'mañana a las 6 pm') : (en ? `${DIAS.en[d]} at 6 pm` : `el ${DIAS.es[d]} a las 6 pm`);
      return { abierto, texto: (en ? 'Closed · we open ' : 'Cerrado · abrimos ') + cuando, cuando };
    }
    return { abierto, texto: '' };
  }

  const e = estado();
  document.documentElement.dataset.abierto = e.abierto ? 'si' : 'no';
  document.querySelectorAll('[data-horario]').forEach(el => { el.textContent = e.texto; });
  document.querySelectorAll('[data-horario-corto]').forEach(el => { el.textContent = e.abierto ? (en ? 'Open' : 'Abierto') : (en ? 'Closed' : 'Cerrado'); });
  /* El aviso de la carpa: se abre con el mouse o el foco (CSS) y con un toque en celular */
  const hoy = ahora().dia;
  document.querySelectorAll('.horario__dia[data-dia="' + hoy + '"]').forEach(d => d.classList.add('hoy'));
  document.querySelectorAll('.cartelito__caja').forEach(b => {
    b.addEventListener('click', () => b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'));
    b.addEventListener('blur', () => b.setAttribute('aria-expanded', 'false'));
  });

  if (e.abierto) return;
  try { if (sessionStorage.getItem('palfilo-cartel') && !new URLSearchParams(location.search).has('cerrado')) return; } catch (_) {}

  const dlg = document.createElement('dialog');
  dlg.className = 'cartel-cerrado';
  dlg.setAttribute('aria-labelledby', 'cartel-titulo');
  dlg.innerHTML = `
    <div class="cartel-cerrado__letrero">
      <h2 class="letrero" id="cartel-titulo">${en ? 'Closed' : 'Cerrado'}</h2>
      <p class="cartel-cerrado__cuando plana">${en ? 'We open ' : 'Abrimos '}${e.cuando}</p>
      <p class="cartel-cerrado__horario">${en ? 'Wednesday to Sunday, 6 to 11 pm (San José time). You can look around the menu and order when we open.' : 'Miércoles a domingo, de 6 a 11 pm (hora de San José). Mientras tanto, mira el menú y antójate.'}</p>
      <ul class="cartel-cerrado__redes">
        <li><a class="btn btn--secundario btn--chico" href="${IG}" target="_blank" rel="noopener"><img src="${raiz}IMG/Redes/instagram.png" alt="" width="22" height="22">Instagram</a></li>
        <li><a class="btn btn--secundario btn--chico" href="${FB}" target="_blank" rel="noopener"><img src="${raiz}IMG/Redes/facebook.png" alt="" width="22" height="22">Facebook</a></li>
      </ul>
      <button class="btn btn--primario btn--grande cartel-cerrado__ir" type="button" data-action="explorar" autofocus>${en ? 'Explore the menu' : 'Explorar el menú'}</button>
    </div>`;
  document.body.append(dlg);
  dlg.addEventListener('click', ev => {
    if (ev.target === dlg || ev.target.closest('[data-action="explorar"]')) dlg.close();
  });
  dlg.addEventListener('close', () => { try { sessionStorage.setItem('palfilo-cartel', '1'); } catch (_) {} });
  const abrir = () => { if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); };
  /* si el telón está subiendo, el cartel sale cuando termine */
  if (document.documentElement.classList.contains('telon')) setTimeout(abrir, 900); else abrir();
})();
