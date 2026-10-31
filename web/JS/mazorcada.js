const $=s=>document.querySelector(s), fmt=n=>'$'+n.toFixed(2), T=s=>s.split(' ');
const ING=a=>a.map(([n,e])=>({n,e,p:0,d:1})), EX=a=>a.map(([n,e,p])=>({n,e,p}));
const SAUCE=[['Salsa de la casa','🥫']];
const PZ=(n,pz,tp,d)=>({n,e:'🍕',pz,tp:T(tp),d});
const PR={};
const PAGES={pizza:['Pizza','🍕','pizza.html'],burger:['Burguer','🍔','burger.html'],perro:['Perro caliente','🌭','perro.html'],salchi:['Salchipapas','🍟','salchipapas.html'],mazo:['Mazorcada','🌽','mazorcada.html']};
const KEYS=Object.keys(PAGES);
const LOGO_SRC="assets/logo.webp";
function logo(){return `<img src="${LOGO_SRC}" alt="TAZ Fast Food, hecho en Colombia" style="width:100%;height:100%;object-fit:contain;display:block">`}
let cart=[],cur=null,st=null;
try{cart=JSON.parse(localStorage.getItem('taz-cart')||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem('taz-cart',JSON.stringify(cart))}catch(e){}};

function init(k){
  const ch={};
  PR[k].groups.forEach(g=>{ch[g.k]=g.type==='one'?0:g.opts.map((o,i)=>o.d&&!o.pz&&!o.tp&&g.k==='ing'?i:-1).filter(i=>i>=0)});
  return {k,ch,q:1};
}
function sel(g){const v=st.ch[g.k];return g.type==='one'?[g.opts[v]]:v.map(i=>g.opts[i])}
function price(){
  const P=PR[st.k];let t=0;const si=st.ch.size||0;
  P.groups.forEach(g=>sel(g).forEach(o=>{t+=o.pz?o.pz[si]:(o.p||0)}));
  return t;
}
PR.mazo={name:'Mazorcada',e:'🌽',tag:'Maíz con todo, servida en plato',groups:[
 {k:'base',t:'Tu mazorcada',type:'one',opts:[{n:'Mazorcada TAZ',e:'🌽',p:16,d:'Maíz, carne, pollo, queso'}]},
 {k:'ing',t:'Ingredientes',sub:'Quita lo que no quieras',type:'many',opts:ING([['Maíz','🌽'],['Carne picada','🥩'],['Pollo picado','🍗'],['Lechuga','🥬'],['Queso rayado','🧀'],['Chorizo','🌶️'],...SAUCE])},
 {k:'ex',t:'Extras',type:'many',opts:EX([['Queso extra','🧀',1.5],['Tocineta','🥓',2],['Camarones','🦐',3.5]])}]};
function previewHTML(){
  const P=PR[st.k],items=[];
  if(st.k==='pizza'){
    const b=P.groups[1].opts[st.ch.base],ex=sel(P.groups[3]).map(o=>o.e),em=[...b.tp,...ex];
    const pct=[62,80,100][st.ch.size],list=[];
    em.forEach(e=>{for(let r=0;r<(ex.includes(e)&&!b.tp.includes(e)?4:5);r++)list.push(e)});
    list.sort((a,b)=>a.localeCompare(b)*0+((a.codePointAt(0)*7)%11)-((b.codePointAt(0)*7)%11));
    const N=list.length,dots=list.map((e,i)=>{const a=i*2.399,r=Math.sqrt((i+.6)/N)*40;return`<i style="left:${50+r*Math.cos(a)}%;top:${50+r*Math.sin(a)}%;font-size:${pct>70?26:20}px">${e}</i>`}).join('');
    const edge=st.ch.edge?'border-color:#d4406a;':'';
    return`<div class="pz" style="width:${pct*.92}%;height:${pct*.92}%;${edge}">${dots}</div>`;
  }
  const lay=[];P.groups.forEach(g=>{if(g.k!=='base')sel(g).forEach(o=>lay.push(o))});
  const bs=sel(P.groups[0])[0];
  return`<div class="stk"><div class="bun"></div><div class="ly">${bs.e}<span>${bs.n}</span></div>${lay.map(o=>`<div class="ly">${o.e}<span>${o.n}</span></div>`).join('')}<div class="bun b"></div></div>`;
}
function builder(){
  const P=PR[st.k];
  $('#app').innerHTML=`<button class="back" onclick="location.href='index.html'">‹ Volver al inicio</button><div class="bld"><div class="pv"><h2>${P.name}</h2><div class="stage" id="stage">${previewHTML()}</div><div class="tot" id="tot">${fmt(price())}</div></div><div>
  ${P.groups.map((g,gi)=>`<div class="step"><h3>${gi+1}. ${g.t}<small>${g.sub||''}</small></h3><div class="opts">${g.opts.map((o,i)=>{const on=g.type==='one'?st.ch[g.k]===i:st.ch[g.k].includes(i);
   const pr=g.k==='size'?'':o.pz?fmt(o.pz[st.ch.size]):o.p?(g.type==='many'?'+':'')+fmt(o.p):'';
   return`<button class="op${on?' on':''}" data-g="${g.k}" data-i="${i}" aria-pressed="${on}"><em>${o.e}</em><span>${o.n}${o.d?`<small>${o.d}</small>`:''}${pr?`<span class="pr">${pr}</span>`:''}</span></button>`}).join('')}</div></div>`).join('')}
  <div class="add"><div class="qty"><button data-q="-1" aria-label="Menos">−</button><span id="q">${st.q}</span><button data-q="1" aria-label="Más">+</button></div><button class="cta" id="addBtn">Agregar al carrito · ${fmt(price()*st.q)}</button></div></div></div>`;
}

function lines(){
  const P=PR[st.k],out=[];
  P.groups.forEach(g=>{
    if(g.k==='base'&&P.groups[0].opts.length===1)return;
    if(g.k==='ing'){const off=g.opts.filter((o,i)=>!st.ch.ing.includes(i)).map(o=>o.n);if(off.length)out.push('Sin '+off.join(', '));return}
    if(g.k==='ex'){const s=sel(g).map(o=>o.n);if(s.length)out.push('Extra: '+s.join(', '));return}
    if(g.k==='edge'&&!st.ch.edge)return;
    out.push(sel(g)[0].n);
  });
  return out;
}
function addCart(){
  const P=PR[st.k],b=sel(P.groups[st.k==='pizza'?1:0])[0];
  cart.push({name:(st.k==='pizza'?'Pizza ':'')+b.n,lines:lines(),unit:price(),q:st.q});
  save();drawCart();
  const t=$('#toast');t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1600);
  st=init(st.k);builder();
}
document.addEventListener('click',e=>{
  const op=e.target.closest('.op');
  if(op&&st){
    const g=PR[st.k].groups.find(x=>x.k===op.dataset.g),i=+op.dataset.i;
    if(g.type==='one')st.ch[g.k]=i;else{const a=st.ch[g.k],j=a.indexOf(i);j>=0?a.splice(j,1):a.push(i)}
    const y=scrollY;builder();scrollTo(0,y);return;
  }
  const q=e.target.closest('[data-q]');
  if(q&&st){st.q=Math.max(1,Math.min(20,st.q+ +q.dataset.q));$('#q').textContent=st.q;$('#addBtn').textContent='Agregar al carrito · '+fmt(price()*st.q);return}
  if(e.target.id==='addBtn')addCart();
  const c=e.target.closest('[data-c]');
  if(c){const it=cart[+c.dataset.i];if(c.dataset.c==='del')cart.splice(+c.dataset.i,1);else{it.q+=+c.dataset.c;if(it.q<1)cart.splice(+c.dataset.i,1)}save();drawCart()}
});
function drawCart(){
  const n=cart.reduce((s,i)=>s+i.q,0),tot=cart.reduce((s,i)=>s+i.q*i.unit,0);
  $('#cnt').textContent=n;$('#ctot').textContent=fmt(tot);$('#send').disabled=!n;
  $('#items').innerHTML=n?cart.map((it,i)=>`<div class="it"><div class="row"><b>${it.name}</b><span>${fmt(it.unit*it.q)}</span></div><p>${it.lines.join(' · ')}</p><div class="row"><div class="qty"><button data-c="-1" data-i="${i}" aria-label="Menos">−</button><span>${it.q}</span><button data-c="1" data-i="${i}" aria-label="Más">+</button></div><button class="x" data-c="del" data-i="${i}">Quitar</button></div></div>`).join(''):'<div class="empty">Tu carrito está vacío. Arma tu primer plato y aparecerá aquí.</div>';
}
const cartOpen=o=>{$('#cart').classList.toggle('on',o);$('#ov').classList.toggle('on',o)};
$('#openCart').onclick=()=>cartOpen(true);$('#closeCart').onclick=$('#ov').onclick=()=>cartOpen(false);
$('#send').onclick=()=>{
  const tot=cart.reduce((s,i)=>s+i.q*i.unit,0);
  const msg='Hola TAZ, quiero hacer este pedido:\n'+cart.map(i=>`${i.q}x ${i.name} (${i.lines.join('; ')}) - ${fmt(i.q*i.unit)}`).join('\n')+'\nTotal: '+fmt(tot);
  window.open('https://wa.me/16506830906?text='+encodeURIComponent(msg),'_blank');
};
$('#hlogo').innerHTML=logo();$('#hlogo').onclick=()=>location.href='index.html';
const pg=document.body.dataset.page;
$('#nav').innerHTML=`<a href="index.html" class="${pg==='inicio'?'on':''}">Inicio</a>`+KEYS.map(k=>`<a href="${PAGES[k][2]}" class="${pg===k?'on':''}">${PAGES[k][1]} ${PAGES[k][0]}</a>`).join('');
drawCart();
st=init('mazo');builder();
