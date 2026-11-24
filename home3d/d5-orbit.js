import {THREE, stage, css} from './kit.js';
import {P2, DAYS, MONTHS, t12, ap, nextPrayer, prayers, remain, hijri, weather, loop, reduce} from './data.js';
export const note = 'اليوم كله مدار ثلاثي الأبعاد حول شمس: كل صلاة كوكب بمكانها من الـ ٢٤ ساعة، ونقطة «الحين» تمشي على المدار ووراها ذيل. الصلاة الجاية كوكبها يكبر وينبض، والعدّاد يتنازل تحت.';

export async function mount(root){
  css('d5css', `
  .d5{position:relative; min-height:100%; color:#F3EEFF; font-family:'Readex Pro',sans-serif; background:radial-gradient(90% 55% at 50% 32%,#2A1650 0%,#0E0820 55%,#07040F 100%);}
  .d5 .hero{position:relative; height:460px;}
  .d5 .lab{position:absolute; z-index:2; transform:translate(-50%,-140%); font-size:11px; color:#CFC4F0; white-space:nowrap; text-align:center; pointer-events:none; transition:opacity .3s;}
  .d5 .lab b{display:block; font-size:12.5px; color:#fff; font-weight:500;}
  .d5 .lab.on b{color:#FFD27A;}
  .d5 .hd{position:absolute; z-index:2; top:34px; right:24px; left:24px; display:flex; justify-content:space-between; font-size:12.5px; color:#B9AEDD;}
  .d5 .hd b{display:block; color:#F3EEFF; font-size:15px; font-weight:500;}
  .d5 .cd{position:relative; z-index:2; text-align:center; margin-top:-30px;}
  .d5 .cd .k{font-size:13px; color:#B9AEDD;}
  .d5 .cd .k b{color:#FFD27A; font-weight:600;}
  .d5 .cd .n{font-size:64px; font-weight:200; letter-spacing:1px; direction:ltr; font-variant-numeric:tabular-nums; line-height:1.1; background:linear-gradient(180deg,#fff,#B9AEDD); -webkit-background-clip:text; background-clip:text; color:transparent;}
  .d5 .body{padding:18px 18px 40px;}
  .d5 .ln{display:flex; gap:8px;}
  .d5 .ln div{flex:1; border-radius:18px; padding:14px; background:rgba(255,255,255,.04); border:1px solid rgba(185,174,221,.14); font-size:11.5px; color:#B9AEDD;}
  .d5 .ln b{display:block; color:#F3EEFF; font-size:22px; font-weight:300; margin-top:4px;}
  `);
  root.innerHTML = `<div class="d5"><div class="hero" id="d5h"><div class="hd"><div><b id="d5d"></b><span id="d5hj"></span></div><div style="text-align:left"><b id="d5c" style="direction:ltr"></b>الوقت الحين</div></div></div>
    <div class="cd"><div class="k">باقي على <b id="d5n">—</b> · <span id="d5t"></span></div><div class="n" id="d5cd">--:--:--</div></div>
    <div class="body"><div class="ln"><div>الحرارة<b id="d5w">--°</b></div><div>جودة الهوا<b id="d5a">--</b></div><div>الغبار<b id="d5du">--</b></div></div></div></div>`;
  const el = root.firstElementChild, hero = el.querySelector('.hero');
  const S = stage(hero, {fov:38});
  S.camera.position.set(0, 4.2, 10.4); S.camera.lookAt(0, -.4, 0);
  const sys = new THREE.Group(); sys.rotation.x = .18; S.scene.add(sys);
  // الشمس بالنص
  const sunM = new THREE.Mesh(new THREE.SphereGeometry(.55, 48, 48), new THREE.MeshBasicMaterial({color:0xFFC46B})); sys.add(sunM);
  const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gx = gc.getContext('2d'), gr = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,200,110,.9)'); gr.addColorStop(.25, 'rgba(255,140,60,.35)'); gr.addColorStop(1, 'rgba(120,60,200,0)'); gx.fillStyle = gr; gx.fillRect(0, 0, 256, 256);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gc), blending:THREE.AdditiveBlending, depthWrite:false})); halo.scale.setScalar(4.2); sys.add(halo);
  const R = 3.2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, .012, 8, 256), new THREE.MeshBasicMaterial({color:0x8E7CD6, transparent:true, opacity:.6})); ring.rotation.x = Math.PI / 2; sys.add(ring);
  // علامات الساعات
  for(let h = 0; h < 24; h++){ const a = h / 24 * Math.PI * 2, m = new THREE.Mesh(new THREE.BoxGeometry(.02, .02, h % 6 ? .12 : .28), new THREE.MeshBasicMaterial({color:0x6E5DB5})); m.position.set(Math.sin(a) * R, 0, -Math.cos(a) * R); m.lookAt(0, 0, 0); sys.add(m); }
  const angOf = d => (d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600) / 24 * Math.PI * 2;
  const posOf = a => new THREE.Vector3(Math.sin(a) * R, 0, -Math.cos(a) * R);
  const COL = {fajr:0x7FB7FF, sunrise:0xFFB070, dhuhr:0xFFF1B0, asr:0xFFC46B, maghrib:0xFF7A59, isha:0x9F86FF};
  const P = prayers(), planets = P.map(p => { const m = new THREE.Mesh(new THREE.SphereGeometry(p.k === 'sunrise' ? .07 : .13, 32, 32), new THREE.MeshStandardMaterial({color:COL[p.k], emissive:COL[p.k], emissiveIntensity:.5, roughness:.5}));
    m.position.copy(posOf(angOf(p.at))); sys.add(m); const lab = document.createElement('div'); lab.className = 'lab'; lab.innerHTML = '<b>' + p.name + '</b>' + t12(p.at); hero.appendChild(lab); return {p, m, lab}; });
  const light = new THREE.PointLight(0xFFC46B, 30, 20); sys.add(light); S.scene.add(new THREE.AmbientLight(0x6a5aa0, .6));
  // نقطة الحين + ذيل
  const now = new THREE.Mesh(new THREE.SphereGeometry(.09, 24, 24), new THREE.MeshBasicMaterial({color:0xffffff})); sys.add(now);
  const TL = 60, tg = new THREE.BufferGeometry(), ta = new Float32Array(TL * 3); tg.setAttribute('position', new THREE.BufferAttribute(ta, 3));
  const tail = new THREE.Line(tg, new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:.8})); sys.add(tail);
  // غبار مجري
  const dg = new THREE.BufferGeometry(), da = []; for(let i = 0; i < 1400; i++){ const a = Math.random() * Math.PI * 2, r = 1 + Math.random() * 7; da.push(Math.cos(a) * r, (Math.random() - .5) * (.3 + r * .08), Math.sin(a) * r); }
  dg.setAttribute('position', new THREE.Float32BufferAttribute(da, 3)); const dust = new THREE.Points(dg, new THREE.PointsMaterial({color:0xB9A6FF, size:.025, transparent:true, opacity:.55})); sys.add(dust);
  const stop = loop(t => {
    const e = reduce ? 1 : Math.min(1, t / 2.2), ease = 1 - Math.pow(1 - e, 4);
    sys.rotation.y = angOf(new Date()) - Math.PI + (1 - ease) * -2.4 + (reduce ? 0 : Math.sin(t * .12) * .2);
    sys.scale.setScalar(.5 + .5 * ease);
    const n = new Date(), a = angOf(n), {next} = nextPrayer(n);
    now.position.copy(posOf(a));
    for(let i = 0; i < TL; i++){ const v = posOf(a - i * .012 * ease); ta.set([v.x, v.y, v.z], i * 3); } tg.attributes.position.needsUpdate = true;
    dust.rotation.y = t * .01;
    const w = hero.clientWidth, h = hero.clientHeight;
    planets.forEach(o => { const on = o.p.k === next.k && o.p.at.toDateString() === next.at.toDateString(); o.m.scale.setScalar(on ? 1.5 + Math.sin(t * 4) * .2 : 1); o.m.material.emissiveIntensity = on ? 1.4 : .45;
      const v = o.m.getWorldPosition(new THREE.Vector3()).project(S.camera); o.lab.style.left = ((v.x + 1) / 2 * w) + 'px'; o.lab.style.top = ((1 - v.y) / 2 * h) + 'px'; o.lab.style.opacity = ease; o.lab.classList.toggle('on', on); });
    S.render();
  });
  const tick = () => { const n = new Date(), {next} = nextPrayer(n), r = remain(next.at, n);
    document.getElementById('d5d').textContent = DAYS[n.getDay()] + ' ' + n.getDate() + ' ' + MONTHS[n.getMonth()]; document.getElementById('d5hj').textContent = hijri(n);
    document.getElementById('d5c').textContent = t12(n) + ' ' + ap(n); document.getElementById('d5n').textContent = next.name; document.getElementById('d5t').textContent = t12(next.at) + ' ' + ap(next.at);
    document.getElementById('d5cd').textContent = P2(r.h) + ':' + P2(r.m) + ':' + P2(r.s); };
  tick(); const iv = setInterval(tick, 1000);
  weather().then(w => { document.getElementById('d5w').textContent = w.temp + '°'; document.getElementById('d5a').textContent = w.aqi ?? '--'; document.getElementById('d5du').textContent = w.dust ?? '--'; });
  return () => { stop(); clearInterval(iv); S.dispose(); };
}
