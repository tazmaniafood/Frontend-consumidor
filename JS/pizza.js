/* Constructor de pizza. Las opciones (nombres, precios, foto) viven en pizza.html como data-*;
   aquí solo se lee, se calcula el total, se muestra la pizza y se envía al carrito.
   Foto de cada especialidad: data-img="../IMG/Pizzas/<nombre>.webp". Si la foto no existe
   todavía, se muestra la plantilla base con los ingredientes en emoji.

   Sabores: la pizza puede ser Entera (1 parte), Mitad y mitad (2) o Cuartos (4).
   Cada parte tiene su especialidad (o "Pizza a tu gusto") y sus propios extras.
   Cada parte tiene también su propio borde.
   Precio = la especialidad más cara de las partes (según el tamaño) + todos los extras
   + el borde de cada parte (proporcional: un borde de queso en media pizza cuesta la mitad).
   La parte que se va a elegir se escoge tocándola en la pizza. */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],fmt=n=>'$'+n.toFixed(2);

/* Lee las opciones del HTML: G.size, G.base, G.edge, G.ex */
const G={};
$$('.op').forEach(el=>{
  const d=el.dataset;
  (G[d.g]=G[d.g]||[]).push({el,n:el.querySelector('b').textContent,e:el.querySelector('em').textContent,pr:el.querySelector('.pr'),
    p:+d.p||0,pz:d.pz?d.pz.split(',').map(Number):null,img:d.img||'',tp:(d.tp||'').split(' ').filter(Boolean),custom:d.custom==='1',ok:false});
});

const part=(base,edge=0)=>({base,ex:[],edge});
const copy=p=>({base:p.base,ex:[...p.ex],edge:p.edge});
const fresh=()=>({size:0,n:1,act:0,parts:[part(0)],q:1});
let s=fresh(),lastBase=0;
const P=()=>s.parts[s.act];
const isCustom=p=>p.base!=null&&G.base[p.base].custom;
const short=b=>b.custom?'A tu gusto':b.n;
const exSum=p=>p.ex.reduce((t,i)=>t+G.ex[i].p,0);
const listo=()=>s.parts.every(p=>p.base!=null);
const price=()=>listo()?Math.max(...s.parts.map(p=>G.base[p.base].pz[s.size]))+s.parts.reduce((t,p)=>t+exSum(p)+G.edge[p.edge].p/s.n,0):null;
const nombre=k=>(s.n===2?'Mitad ':'Cuarto ')+(k+1);
const mark=(o,v)=>{o.el.classList.toggle('on',v);o.el.setAttribute('aria-pressed',v)};
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Precarga las fotos: la que exista se marca ok y aparece como miniatura en su botón */
const thumb=src=>{const i=new Image();i.src=src;i.alt='';return i};
G.base.forEach(o=>{
  if(!o.img)return;
  const im=new Image();
  im.onload=()=>{o.ok=true;o.el.querySelector('em').replaceChildren(thumb(o.img));paint()};
  im.src=o.img;
});

/* ---------- Pizza entera ---------- */
let shown='';
function drawPizza(){
  const img=$('#pzImg'),p=s.parts[0],b=G.base[p.base];
  $('#pz').classList.toggle('has-img',b.ok);$('#pz').classList.toggle('custom',b.custom);
  drawTops(b.custom?p.ex.map(i=>G.ex[i].e):[]);
  if(b.ok&&shown!==b.img){
    img.src=b.img;img.alt='Pizza '+b.n;shown=b.img;
    img.classList.remove('swap');void img.offsetWidth;img.classList.add('swap');
  }
  if(!b.ok){img.removeAttribute('src');img.alt='';shown=''}
}
/* Pizza a tu gusto: los ingredientes elegidos se reparten en espiral sobre la pizza en blanco */
function drawTops(list){
  const all=[];
  list.forEach(e=>{for(let r=0;r<6;r++)all.push(e)});
  all.sort((a,c)=>((a.codePointAt(0)*7)%11)-((c.codePointAt(0)*7)%11));
  $('#tops').replaceChildren(...all.map((e,i)=>{
    const t=document.createElement('i'),a=i*2.399,r=Math.sqrt((i+.6)/all.length)*36;
    t.textContent=e;t.style.left=(50+r*Math.cos(a))+'%';t.style.top=(50+r*Math.sin(a))+'%';
    return t;
  }));
}

/* ---------- Pizza por partes ---------- */
const SVGNS='http://www.w3.org/2000/svg';
const ang=(k,n)=>-90+360*k/n;                       /* la parte 1 empieza arriba y va en sentido horario */
const pt=(a,r)=>[50+r*Math.cos(a*Math.PI/180),50+r*Math.sin(a*Math.PI/180)];
const clip=k=>{const a0=ang(k,s.n),a1=ang(k+1,s.n),p=['50% 50%'];for(let a=a0;a<=a1+.01;a+=5){const[x,y]=pt(a,75);p.push(x.toFixed(2)+'% '+y.toFixed(2)+'%')}return'polygon('+p.join(',')+')'};
/* emojis repartidos dentro de una parte */
function sprinkle(sec,k,list,cnt){
  const span=360/s.n;
  for(let j=0;j<cnt;j++){
    const a=ang(k,s.n)+span*(.12+.76*((j*.618+.3)%1)),r=12+31*Math.sqrt((j+.5)/cnt),[x,y]=pt(a,r),t=document.createElement('i');
    t.textContent=list[j%list.length];t.style.left=x+'%';t.style.top=y+'%';sec.append(t);
  }
}
function drawSplit(){
  const box=$('#split');
  const secs=s.parts.map((p,k)=>{
    const d=document.createElement('div');d.className='sec'+(p.base==null?' vacia':'')+(k===s.act?' act':'');d.style.clipPath=clip(k);
    if(p.base!=null){
      const b=G.base[p.base],ex=p.ex.map(i=>G.ex[i].e);
      if(b.ok){const im=new Image();im.src=b.img;im.alt='';d.append(im);if(ex.length)sprinkle(d,k,ex,Math.min(8,ex.length*2))}
      else{d.classList.add('base');const list=b.custom?ex:[...b.tp,...ex];if(list.length)sprinkle(d,k,list,s.n===2?12:7)}
    }
    return d;
  });
  /* contorno de cada parte (se puede tocar para elegirla) y el borde de cada una */
  const svg=document.createElementNS(SVGNS,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('class','cuts');
  const el=(tag,at)=>{const e=document.createElementNS(SVGNS,tag);for(const k in at)e.setAttribute(k,at[k]);return e};
  const sector=k=>{const[x0,y0]=pt(ang(k,s.n),49.5),[x1,y1]=pt(ang(k+1,s.n),49.5);return`M50 50L${x0} ${y0}A49.5 49.5 0 0 1 ${x1} ${y1}Z`};
  const arc=(k,r)=>{const[x0,y0]=pt(ang(k,s.n)+1.2,r),[x1,y1]=pt(ang(k+1,s.n)-1.2,r);return`M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`};
  const path=k=>{const e=el('path',{d:sector(k),class:k===s.act?'act':''});e.dataset.part=k;
    const t=el('title',{});t.textContent=nombre(k);e.append(t);return e};
  s.parts.forEach((p,k)=>{if(k!==s.act)svg.append(path(k))});
  s.parts.forEach((p,k)=>{if(p.edge)svg.append(el('path',{d:arc(k,47),class:'borde '+['','bocadillo','queso'][p.edge]}))});
  svg.append(path(s.act));                /* la parte elegida va encima para que su contorno se vea completo */
  const labs=s.parts.map((p,k)=>{
    const[x,y]=pt(ang(k+.5,s.n),s.n===2?27:29),l=document.createElement('span');
    l.className='slab'+(k===s.act?' act':'')+(p.base==null?' vacia':'');l.style.left=x+'%';l.style.top=y+'%';
    const i=document.createElement('i');i.textContent=k+1;
    const b=document.createElement('b');b.textContent=p.base==null?'¿Cuál?':short(G.base[p.base]);
    l.append(i,b);return l;
  });
  box.replaceChildren(...secs,svg,...labs);
}

function drawPicked(custom){
  const box=$('#picked'),p=P();
  if(!custom)return box.replaceChildren();
  const lab=document.createElement('span');lab.className='pk-lab';lab.textContent=s.n>1?nombre(s.act)+' lleva:':'Tu pizza lleva:';
  if(!p.ex.length){const e=document.createElement('span');e.className='pk-empty';e.textContent='Solo masa y queso. Toca los ingredientes para ponérselos 👇';return box.replaceChildren(lab,e)}
  const chips=p.ex.map(i=>{const b=document.createElement('button');b.type='button';b.className='pk';b.dataset.pick=i;
    b.setAttribute('aria-label','Quitar '+G.ex[i].n);b.textContent=G.ex[i].e+' '+G.ex[i].n+' ✕';return b});
  const clr=document.createElement('button');clr.type='button';clr.className='pk-clear';clr.dataset.clear='1';clr.textContent='Limpiar todo';
  box.replaceChildren(lab,...chips,clr);
}
const describe=p=>{const b=G.base[p.base],ex=p.ex.map(i=>G.ex[i].n);
  return (b.custom?'A tu gusto: '+(ex.length?ex.join(', '):'solo masa y queso'):b.n+(ex.length?' + '+ex.join(', '):''))+(p.edge?', borde de '+G.edge[p.edge].n.toLowerCase():'')};

function paint(){
  const split=s.n>1,p=P(),custom=isCustom(p),t=price();
  /* Sabores */
  $$('.sab').forEach(b=>{const n=+b.dataset.n;b.classList.toggle('on',n===s.n);b.setAttribute('aria-pressed',n===s.n);});
  G.size.forEach((o,i)=>mark(o,s.size===i));
  G.base.forEach((o,i)=>{mark(o,p.base===i);o.pr.textContent=fmt(o.pz[s.size])});
  G.edge.forEach((o,i)=>{mark(o,p.edge===i);o.pr.textContent=o.p?'+'+fmt(o.p/s.n):''});
  $('#edgeLab').innerHTML='Borde'+(split?'<small>'+nombre(s.act).toLowerCase()+'</small>':'');
  G.ex.forEach((o,i)=>{mark(o,p.ex.includes(i));o.pr.textContent='+'+fmt(o.p)});
  /* La pizza */
  const z=$('#pz');
  z.className='pz'+(split?' is-split':['',' bocadillo',' queso'][p.edge]);
  if(split){drawSplit();$('#tops').replaceChildren()}else{$('#split').replaceChildren();drawPizza()}
  /* Pasos */
  /* Pizza a tu gusto (entera o en una parte): se ocultan las especialidades y queda el menú personalizado */
  const solo=custom;
  $('.steps').classList.toggle('custom',solo);$('#customBar').hidden=!solo;
  $('#customBar b').textContent='🍕 '+(split?nombre(s.act)+' a tu gusto':'Pizza personalizada');
  $('#espTitle').textContent=split?'Sabor '+(s.n===2?'de la mitad ':'del cuarto ')+(s.act+1):'Especialidad';
  const tpStep=$('.tp').closest('.step');
  tpStep.hidden=p.base==null;
  tpStep.querySelector('h3 i').textContent=solo?1:2;
  const tp=$('.tp');tp.classList.toggle('all',custom);tpStep.classList.toggle('taller',custom);
  $('#exTitle').textContent=(custom?'A la mano':'Toppings extra')+(split?' · '+nombre(s.act):'');
  $('#exSub').textContent=custom?(split?'Ingredientes para esta parte':'Todos los ingredientes, listos para tu pizza'):(split?'Solo para esta parte':'Elige una categoría');
  drawPicked(custom);
  /* Resumen y total */
  $('#pvSub').textContent=split
    ?[s.parts.map(q=>q.base==null?'¿?':short(G.base[q.base])).join(' / '),G.size[s.size].n].filter(Boolean).join(' · ')
    :[G.base[p.base].n,G.size[s.size].n,p.edge?'Borde de '+G.edge[p.edge].n.toLowerCase():'',p.ex.length?(custom?'Con: ':'Extra: ')+p.ex.map(i=>G.ex[i].n).join(', '):''].filter(Boolean).join(' · ');
  $('#tot').textContent=t==null?'—':fmt(t);
  $('#q').textContent=s.q;
  const add=$('#addBtn'),falta=s.parts.findIndex(q=>q.base==null);
  add.disabled=t==null;
  add.textContent=t==null?'Elige el sabor de la parte '+(falta+1):'Agregar al carrito · '+fmt(t*s.q);
}

/* Cambia entre Entera / Mitades / Cuartos conservando lo que ya se eligió */
function setN(n){
  const o=s.parts,first=o.find(p=>p.base!=null)||part(lastBase);
  if(n===s.n)return;
  const e=o[0].edge;
  if(n===1)s.parts=[copy(o[s.act].base!=null?o[s.act]:first)];
  else if(n===2)s.parts=s.n===1?[copy(o[0]),part(null,e)]:[copy(o[0]),copy(o[2])];
  else s.parts=s.n===1?[copy(o[0]),part(null,e),part(null,e),part(null,e)]:[copy(o[0]),copy(o[0]),copy(o[1]),copy(o[1])];
  s.n=n;
  const f=s.parts.findIndex(p=>p.base==null);s.act=f<0?0:f;
}

function add(){
  const t=price();if(t==null)return;
  if(s.n===1){
    const p=s.parts[0],b=G.base[p.base],lines=b.custom?[G.size[s.size].n]:[G.size[s.size].n,b.n];
    if(p.edge)lines.push('Borde de '+G.edge[p.edge].n.toLowerCase());
    if(p.ex.length)lines.push((b.custom?'Ingredientes: ':'Extra: ')+p.ex.map(i=>G.ex[i].n).join(', '));
    else if(b.custom)lines.push('Solo masa y queso');
    Cart.add({name:b.custom?b.n:'Pizza '+b.n,lines,unit:t,q:s.q});
  }else{
    /* partes iguales se juntan: dos cuartos de Hawaiana = ½ Hawaiana */
    const g=new Map();s.parts.forEach(p=>{const k=describe(p);g.set(k,(g.get(k)||0)+1)});
    const FR=s.n===2?{1:'½',2:'Toda'}:{1:'¼',2:'½',3:'¾',4:'Toda'};
    const lines=[G.size[s.size].n,...[...g].map(([k,c])=>FR[c]+' '+k)];
    Cart.add({name:s.n===2?'Pizza mitad y mitad':'Pizza en cuartos',lines,unit:t,q:s.q});
  }
  s=fresh();shown='';paint();
}

document.addEventListener('click',e=>{
  const sab=e.target.closest('.sab');
  if(sab){setN(+sab.dataset.n);paint();
    /* en celular la lista de sabores queda abajo: se baja a ella para elegir rápido */
    if(s.n>1&&s.parts.some(p=>p.base==null)&&matchMedia('(max-width:760px)').matches)setTimeout(()=>$('.steps').scrollIntoView({behavior:reduce()?'auto':'smooth',block:'start'}),250);
    return}
  const pa=e.target.closest('[data-part]');
  if(pa){s.act=+pa.dataset.part;paint();
    /* al tocar la pizza en celular se baja a los sabores para elegir */
    if(matchMedia('(max-width:760px)').matches)$('.steps').scrollIntoView({behavior:reduce()?'auto':'smooth',block:'start'});
    return}
  const pk=e.target.closest('[data-pick]');
  if(pk){const j=P().ex.indexOf(+pk.dataset.pick);if(j>=0)P().ex.splice(j,1);return paint()}
  if(e.target.closest('[data-clear]')){P().ex=[];return paint()}
  if(e.target.id==='backEsp'){s.parts[s.act]=part(s.n>1?null:lastBase,P().edge);paint();return $('.opts-base').scrollIntoView({behavior:reduce()?'auto':'smooth',block:'start'})}
  const op=e.target.closest('.op');
  if(op){
    const g=op.dataset.g,i=+op.dataset.i,p=P();
    if(g==='ex'){if(p.base==null)return;const j=p.ex.indexOf(i);j<0?p.ex.push(i):p.ex.splice(j,1)}
    else if(g==='base'){
      const was=p.base;
      if(was!==i&&(was==null||G.base[was].custom||G.base[i].custom))p.ex=[];
      p.base=i;
      if(!G.base[i].custom)lastBase=i;
      /* por partes: pasa sola a la siguiente parte sin sabor (salvo "a tu gusto", que necesita ingredientes) */
      if(s.n>1&&!G.base[i].custom){const f=s.parts.findIndex(q=>q.base==null);if(f>=0)s.act=f}
    }
    else if(g==='edge')p.edge=i;
    else s[g]=i;
    return paint();
  }
  const q=e.target.closest('[data-q]');
  if(q){s.q=Math.max(1,Math.min(20,s.q+ +q.dataset.q));return paint()}
  if(e.target.id==='addBtn')add();
});

paint();
})();
