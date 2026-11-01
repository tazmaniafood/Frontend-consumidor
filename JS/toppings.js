/* Compartido por pizza, burguer, perro, salchipapas y mazorcada.
   1) Toppings por categoría: primero se elige Proteínas o Vegetales, luego los toppings,
      y "‹ Volver" regresa a las categorías. Cada categoría muestra cuántos van elegidos.
   2) Ventana sutil con los ingredientes al pasar sobre una especialidad
      (en celular aparece un momento al tocarla). */
(()=>{
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ---------- 1) Categorías de toppings ---------- */
const tp=document.querySelector('.tp');
if(tp){
  const cats=tp.querySelector('.cats'),panels=$$('.catpanel',tp),single=panels.length===1;
  const show=c=>{
    cats.hidden=!!c||single;
    panels.forEach(p=>{const on=single||p.dataset.cat===c;p.hidden=!on;if(on&&c&&!single)p.querySelector('.back').focus({preventScroll:true})});
    if(!c&&!single)cats.querySelector(`[data-cat="${tp.dataset.last||''}"]`)?.focus({preventScroll:true});
  };
  if(single){panels[0].querySelector('.back').hidden=true;const sm=tp.closest('.step')?.querySelector('h3 small');if(sm)sm.textContent='Se agregan a tu pedido'}
  tp.addEventListener('click',e=>{
    const c=e.target.closest('.cat');if(c){tp.dataset.last=c.dataset.cat;return show(c.dataset.cat)}
    if(e.target.closest('.back'))show(null);
  });
  const count=()=>$$('.cat',tp).forEach(c=>{
    const on=$$(`.catpanel[data-cat="${c.dataset.cat}"] .op.on b`,tp).map(b=>b.textContent);
    c.querySelector('.cnt').textContent=on.length?on.length:'';
    c.classList.toggle('has',on.length>0);
    const sel=c.querySelector('.sel');sel.dataset.def??=sel.textContent;
    sel.textContent=on.length?on.join(', '):sel.dataset.def;
  });
  /* corre después del script de la página, cuando ya se marcaron las opciones */
  document.addEventListener('click',e=>{setTimeout(count);if(e.target.id==='addBtn')setTimeout(()=>show(null))});
  show(null);count();
}

/* ---------- 2) Ventana de ingredientes de cada especialidad ---------- */
const EM=[['piña','🍍'],['queso','🧀'],['jamón','🍖'],['pepperoni','🔴'],['cereza','🍒'],['durazno','🍑'],['pollo','🍗'],['champiñon','🍄'],['camaron','🦐'],
  ['pimentón','🫑'],['pimiento','🫑'],['carne','🥩'],['chorizo','🌭'],['maíz','🌽'],['tocin','🥓'],['papas','🍟'],['lechuga','🥬'],['salchicha','🌭'],['cebolla','🧅'],['salsa','🥫'],['pan','🍞']];
const icon=t=>(EM.find(([k])=>t.toLowerCase().includes(k))||[,'•'])[1];
$$('.opts-base .op:not(.cartel)').forEach(op=>{
  const sm=op.querySelector('.tx small');if(!sm)return;
  const parts=sm.textContent.split(',').map(t=>t.trim()).filter(Boolean),last=parts.pop()||'';
  /* solo la última "y" separa ingredientes ("pimentón rojo y verde" queda junto) */
  const items=[...parts,...last.split(/\s+y\s+(?!.*\s+y\s+)/)].filter(Boolean);
  const tip=document.createElement('span');tip.className='tip';tip.setAttribute('aria-hidden','true');
  tip.innerHTML='<b>Ingredientes</b><ul></ul>';
  tip.querySelector('ul').append(...items.map(t=>{const li=document.createElement('li');li.textContent=icon(t)+' '+t[0].toUpperCase()+t.slice(1);return li}));
  op.append(tip);
  op.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')return;$$('.op.peek').forEach(o=>o.classList.remove('peek'));op.classList.add('peek');clearTimeout(op._t);op._t=setTimeout(()=>op.classList.remove('peek'),2600)});
});
})();
