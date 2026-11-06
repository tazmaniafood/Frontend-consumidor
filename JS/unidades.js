/* Unidades para toppings extra y salsas (todas las páginas de comida).
   Una lista como [3,3,7] quiere decir: 2 unidades del topping 3 y 1 del topping 7.
   El contador está siempre visible (0 = no elegido). Tocar la tarjeta o "+" lo pone en 1;
   "+" suma sin máximo y "−" resta (en 0 se quita). El precio se muestra por unidad (c/u). Uso desde pizza.js y plato.js:
     Uds.cnt(lista,i)  Uds.uniq(lista)  Uds.names(lista,G.ex)  Uds.toggle(lista,i)
     Uds.step(lista,i,±1)  Uds.paint(el,cantidad) */
window.Uds=(()=>{
const cnt=(a,i)=>a.reduce((t,x)=>t+(x===i),0);
const uniq=a=>[...new Set(a)];
const names=(a,G)=>uniq(a).map(i=>{const c=cnt(a,i);return G[i].n+(c>1?' x'+c:'')});
const toggle=(a,i)=>{if(cnt(a,i)){for(let j=a.length-1;j>=0;j--)if(a[j]===i)a.splice(j,1)}else a.push(i)};
const step=(a,i,d)=>{if(d>0)a.push(i);else{const j=a.lastIndexOf(i);if(j>=0)a.splice(j,1)}};
/* precio por unidad y contador − n + siempre visibles en cada topping y salsa */
const cu=el=>{const pr=el.querySelector('.pr');if(pr&&!/c\/u$/.test(pr.textContent))pr.textContent=pr.textContent.trim()+' c/u'};
document.querySelectorAll('.op[data-g="ex"],.op[data-g="sa"]').forEach(el=>{
  const w=document.createElement('span');w.className='prud';
  const pr=el.querySelector('.pr');if(pr)w.append(pr);
  const u=document.createElement('span');u.className='uds';
  u.innerHTML='<span class="ud" data-step="-1" role="button" aria-label="Una unidad menos">−</span><i class="udn">0</i><span class="ud" data-step="1" role="button" aria-label="Una unidad más">+</span>';
  w.append(u);el.append(w);cu(el);
});
const paint=(el,c)=>{const n=el.querySelector('.udn');if(n)n.textContent=c;el.classList.toggle('varias',c>1);cu(el)};
return{cnt,uniq,names,toggle,step,paint};
})();
