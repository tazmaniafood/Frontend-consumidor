/* Formulario para terminar el pedido (todas las páginas).
   Al tocar "Ir a pagar" en el carrito se abre una ventanita que pide:
   nombre, celular, medio de pago (efectivo o los de Stripe) y si se recoge en el local
   o se lleva a domicilio (en ese caso pide la dirección).
   Luego arma el mensaje y lo envía por WhatsApp.
   Nota: el sitio no cobra en línea (no tiene servidor). Si el cliente elige un medio de
   Stripe, el negocio le envía por WhatsApp el link de pago de Stripe.
   Uso: Checkout.open(cart)  (cart = [{name, lines, unit, q}, ...]) */
window.Checkout=(()=>{
const WA='16506830906';
const fmt=n=>'$'+n.toFixed(2);
const PAGOS=[
  {id:'efectivo',ic:'💵',n:'Efectivo',d:'Pagas al recibir'},
  {id:'tarjeta',ic:'💳',n:'Tarjeta',d:'Crédito o débito'},
  {id:'apple',ic:'🍎',n:'Apple Pay',d:''},
  {id:'google',ic:'🅖',n:'Google Pay',d:''},
  {id:'cashapp',ic:'💲',n:'Cash App Pay',d:''},
  {id:'link',ic:'🔗',n:'Link',d:'Pago rápido de Stripe'},
];
const ENTREGA=[
  {id:'local',ic:'🏪',n:'Recoger en el local',d:'Pasas por tu pedido'},
  {id:'domicilio',ic:'🛵',n:'A domicilio',d:'Te lo llevamos a tu casa'},
];
const KEY='taz-cliente';
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
let cart=[];

const opt=(name,o,i)=>`<label class="ck-op"><input type="radio" name="${name}" value="${o.id}"${i===0?' required':''}><span class="ck-ic" aria-hidden="true">${o.ic}</span><span class="ck-tx"><b>${o.n}</b>${o.d?`<small>${o.d}</small>`:''}</span></label>`;
const dlg=document.createElement('dialog');
dlg.className='ck';dlg.setAttribute('aria-labelledby','ckT');
dlg.innerHTML=`
<form class="ck-f" novalidate>
  <div class="ck-h"><h2 id="ckT">Finalizar pedido</h2><button type="button" class="ck-x" data-ck="close" aria-label="Cerrar">✕</button></div>
  <div class="ck-b">
    <fieldset><legend>Tus datos</legend>
      <label class="ck-in"><span>Nombre</span><input name="nombre" autocomplete="name" placeholder="¿A nombre de quién?" required></label>
      <label class="ck-in"><span>Celular</span><input name="cel" type="tel" inputmode="tel" autocomplete="tel" placeholder="Ej. 650 683 0906" required></label>
    </fieldset>
    <fieldset><legend>¿Cómo pagas?</legend>
      <div class="ck-ops ck-pagos">${PAGOS.map((o,i)=>opt('pago',o,i)).join('')}</div>
      <p class="ck-nota" id="ckStripe" hidden>🔒 Te enviamos por WhatsApp el link de pago seguro de <b>Stripe</b>.</p>
    </fieldset>
    <fieldset><legend>¿Cómo lo recibes?</legend>
      <div class="ck-ops ck-ent">${ENTREGA.map((o,i)=>opt('entrega',o,i)).join('')}</div>
      <div class="ck-dir" id="ckDir" hidden>
        <label class="ck-in"><span>Dirección</span><input name="dir" autocomplete="street-address" placeholder="Calle, número y ciudad"></label>
        <label class="ck-in"><span>Apto / indicaciones <i>(opcional)</i></span><input name="ref" placeholder="Ej. Apto 4, casa azul"></label>
      </div>
    </fieldset>
    <p class="ck-err" id="ckErr" role="alert" hidden></p>
  </div>
  <div class="ck-pie">
    <div class="ck-tot"><small>Total</small><b id="ckTot">$0.00</b></div>
    <button type="submit" class="cta ck-go">Enviar pedido por WhatsApp</button>
  </div>
</form>`;
document.body.append(dlg);
const f=dlg.querySelector('form'),$=s=>dlg.querySelector(s);

function sync(){
  const pago=f.pago.value,ent=f.entrega.value;
  $('#ckStripe').hidden=!pago||pago==='efectivo';
  $('#ckDir').hidden=ent!=='domicilio';
  f.dir.required=ent==='domicilio';
}
f.addEventListener('change',e=>{sync();e.target.closest('fieldset')?.classList.remove('mal');$('#ckErr').hidden=true});
f.addEventListener('input',e=>{e.target.closest('.ck-in')?.classList.remove('mal')});
dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.closest('[data-ck="close"]'))dlg.close()});
dlg.addEventListener('close',()=>document.documentElement.classList.remove('ck-open'));

function check(){
  const bad=[];
  const mal=(el,msg)=>{el.classList.add('mal');bad.push(msg)};
  if(!f.nombre.value.trim())mal(f.nombre.closest('.ck-in'),'tu nombre');
  if(f.cel.value.replace(/\D/g,'').length<7)mal(f.cel.closest('.ck-in'),'un celular válido');
  if(!f.pago.value)mal(f.querySelector('.ck-pagos').closest('fieldset'),'el medio de pago');
  if(!f.entrega.value)mal(f.querySelector('.ck-ent').closest('fieldset'),'cómo lo recibes');
  else if(f.entrega.value==='domicilio'&&!f.dir.value.trim())mal(f.dir.closest('.ck-in'),'la dirección');
  if(bad.length){const e=$('#ckErr');e.textContent='Falta '+bad.join(', ').replace(/, ([^,]*)$/,' y $1')+'.';e.hidden=false;
    dlg.querySelector('.mal input, .mal')?.scrollIntoView({block:'center',behavior:'smooth'});}
  return !bad.length;
}
f.addEventListener('submit',e=>{
  e.preventDefault();
  if(!check())return;
  const v=k=>f[k].value.trim(),pago=PAGOS.find(o=>o.id===f.pago.value),dom=f.entrega.value==='domicilio';
  try{localStorage.setItem(KEY,JSON.stringify({nombre:v('nombre'),cel:v('cel'),dir:v('dir'),ref:v('ref')}))}catch(err){}
  const tot=cart.reduce((t,i)=>t+i.q*i.unit,0);
  const msg=['Hola TAZ, quiero hacer este pedido:',
    ...cart.map(i=>`${i.q}x ${i.name} (${i.lines.join('; ')}) - ${fmt(i.q*i.unit)}`),
    'Total: '+fmt(tot),'',
    'Nombre: '+v('nombre'),
    'Celular: '+v('cel'),
    'Pago: '+pago.n+(pago.id==='efectivo'?'':' (Stripe, envíenme el link de pago)'),
    dom?'Entrega: A domicilio':'Entrega: Recoger en el local',
    ...(dom?['Dirección: '+v('dir')+(v('ref')?' ('+v('ref')+')':'')]:[]),
  ].join('\n');
  window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(msg),'_blank');
  dlg.close();
});

return{open(c){
  cart=c;
  if(!cart.length)return;
  ['nombre','cel','dir','ref'].forEach(k=>{if(!f[k].value&&saved[k])f[k].value=saved[k]});
  $('#ckTot').textContent=fmt(cart.reduce((t,i)=>t+i.q*i.unit,0));
  $('#ckErr').hidden=true;dlg.querySelectorAll('.mal').forEach(x=>x.classList.remove('mal'));
  sync();dlg.showModal();document.documentElement.classList.add('ck-open');
}};
})();
