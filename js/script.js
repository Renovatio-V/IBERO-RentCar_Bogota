/* ---- DATOS DE FLOTA ---- */
const cars=[
 {n:"Renault Kwid Zen",t:"urbano",e:"🚗",p:145000,d:"Manual · 5 puestos · Gasolina",g:"linear-gradient(135deg,#312e81,#7c3aed)",tag:"Económico"},
 {n:"Chevrolet Spark GT",t:"urbano",e:"🚙",p:155000,d:"Manual · 5 puestos · Aire acondicionado",g:"linear-gradient(135deg,#0c4a6e,#22d3ee)",tag:"Popular"},
 {n:"Mazda CX-30 Touring",t:"suv",e:"🚘",p:320000,d:"Automática · 5 puestos · Full equipo",g:"linear-gradient(135deg,#701a75,#f472b6)",tag:"Premium"},
 {n:"Renault Duster Intens",t:"suv",e:"🛻",p:265000,d:"Mecánica · 5 puestos · Ideal para fuera de la ciudad",g:"linear-gradient(135deg,#064e3b,#34d399)",tag:"Aventura"},
 {n:"Ford Mustang GT",t:"deportivo",e:"🏎️",p:890000,d:"Automática · V8 · 460 HP",g:"linear-gradient(135deg,#7f1d1d,#f97316)",tag:"Lujo"},
 {n:"Toyota Hilux 2.8",t:"camioneta",e:"🛻",p:410000,d:"4x4 · Diésel · Carga y trabajo pesado",g:"linear-gradient(135deg,#1e3a8a,#60a5fa)",tag:"Trabajo"},
];
const fleet=document.getElementById('fleet');
fleet.innerHTML=cars.map(c=>`
 <div class="car-card reveal" data-t="${c.t}">
   <div class="car-img" style="background:${c.g}"><span class="tag">${c.tag}</span>${c.e}</div>
   <div class="car-body">
     <h3>${c.n}</h3>
     <div class="car-meta"><span>⚙️ ${c.d}</span></div>
     <div class="car-foot">
       <div class="price">$${c.p.toLocaleString('es-CO')} <small>/día</small></div>
       <button class="mini-btn" onclick="location.href='panel.html'">Reservar</button>
     </div>
   </div>
 </div>`).join('');

/* ---- FILTROS ---- */
document.querySelectorAll('.chip').forEach(ch=>ch.addEventListener('click',()=>{
  document.querySelector('.chip.active').classList.remove('active');
  ch.classList.add('active');
  const f=ch.dataset.f;
  document.querySelectorAll('.car-card').forEach(c=>{
    const show=f==='todos'||c.dataset.t===f;
    c.classList.toggle('hide',!show);
    if(show){c.style.opacity=0;requestAnimationFrame(()=>{c.style.opacity=1;c.style.transform='none'});}
  });
}));

/* ---- REVEAL ON SCROLL ---- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---- CONTADORES ANIMADOS ---- */
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target,end=+el.dataset.count,t0=performance.now();
  (function tick(t){const p=Math.min((t-t0)/1600,1),ease=1-Math.pow(1-p,3);
    el.textContent=Math.round(end*ease).toLocaleString('es-CO');
    if(p<1)requestAnimationFrame(tick)})(t0);
  cio.unobserve(el);
}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

/* ---- NAV MÓVIL ---- */
document.getElementById('ham').onclick=()=>document.getElementById('navLinks').classList.toggle('open');
document.querySelectorAll('#navLinks a').forEach(a=>a.onclick=()=>document.getElementById('navLinks').classList.remove('open'));
