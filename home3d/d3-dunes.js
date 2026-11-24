import {THREE, stage, css} from './kit.js';
import {P2, DAYS, MONTHS, t12, ap, nextPrayer, remain, remainAr, hijri, sun, weather, loop, reduce} from './data.js';
export const note = 'كثبان رملية ثلاثية الأبعاد، والشمس فيها بمكانها الحقيقي الحين (الارتفاع واللون والظلال)، فالمشهد يتغير طول اليوم: ظهر أبيض، عصر ذهبي، مغرب وردي، وليل بنجوم. الرمل يتطاير مع الريح.';

// ضوضاء بسيطة للكثبان
function noise2(seed){ const p = new Uint8Array(512); for(let i = 0; i < 256; i++) p[i] = i; let s = seed; for(let i = 255; i > 0; i--){ s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; } for(let i = 0; i < 256; i++) p[i + 256] = p[i];
  const g = (h, x, y) => ((h & 1) ? x : -x) + ((h & 2) ? y : -y), f = t => t * t * t * (t * (t * 6 - 15) + 10), l = (a, b, t) => a + t * (b - a);
  return (x, y) => { const X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y); const u = f(x), v = f(y), A = p[X] + Y, B = p[X + 1] + Y;
    return l(l(g(p[A], x, y), g(p[B], x - 1, y), u), l(g(p[A + 1], x, y - 1), g(p[B + 1], x - 1, y - 1), u), v); }; }

export async function mount(root){
  css('d3css', `
  .d3{position:relative; min-height:100%; color:#2B1A10; font-family:'Readex Pro',sans-serif; background:var(--sky2);}
  .d3 .hero{position:relative; height:520px; background:linear-gradient(180deg,var(--sky1) 0%,var(--sky2) 70%);}
  .d3 .t{position:absolute; z-index:2; top:44px; right:22px; left:22px; color:var(--ink);}
  .d3 .t .h{font-family:'Lalezar',sans-serif; font-size:84px; line-height:.95; direction:ltr; text-align:right;}
  .d3 .t .h small{font-size:26px; margin-left:6px;}
  .d3 .t .d{font-size:14px; margin-top:6px; opacity:.85;}
  .d3 .body{position:relative; z-index:2; margin-top:-70px; padding:0 16px 40px;}
  .d3 .card{background:#F4E6D0; border-radius:28px; padding:20px 20px 18px; box-shadow:0 20px 40px -24px rgba(60,30,10,.6);}
  .d3 .arc{position:relative; height:96px;}
  .d3 .arc svg{width:100%; height:100%; overflow:visible;}
  .d3 .arcl{display:flex; justify-content:space-between; font-size:12px; color:#8A6A50; margin-top:2px;}
  .d3 .arcl b{color:#2B1A10; font-weight:600; font-size:15px; display:block;}
  .d3 .np{display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:16px; border-top:1px dashed #D9C2A2;}
  .d3 .np .nm{font-family:'Lalezar',sans-serif; font-size:34px; line-height:1;}
  .d3 .np .k{font-size:12px; color:#8A6A50;}
  .d3 .np .rm{text-align:left; font-size:13px; color:#8A6A50;}
  .d3 .np .rm b{display:block; font-size:26px; color:#B4471E; font-weight:600; direction:ltr; font-variant-numeric:tabular-nums;}
  .d3 .wx{display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:10px;}
  .d3 .wx div{background:#2B1A10; color:#F4E6D0; border-radius:20px; padding:14px; font-size:11.5px;}
  .d3 .wx b{display:block; font-family:'Lalezar',sans-serif; font-size:30px; font-weight:400; line-height:1.1; margin-top:4px;}
  `);
  root.innerHTML = `<div class="d3"><div class="hero"><div class="t"><div class="h" id="d3c"></div><div class="d" id="d3d"></div></div></div>
    <div class="body"><div class="card"><div class="arc"><svg viewBox="0 0 320 96" id="d3arc"></svg></div><div class="arcl"><div>الشروق<b id="d3r">--</b></div><div style="text-align:left">الغروب<b id="d3s">--</b></div></div>
      <div class="np"><div><div class="k">الصلاة الجاية</div><div class="nm" id="d3n">—</div></div><div class="rm"><b id="d3cd">--:--:--</b><span id="d3t"></span></div></div></div>
      <div class="wx"><div>الحرارة<b id="d3w">--°</b></div><div>الغبار<b id="d3du">--</b></div><div>الرياح<b id="d3wi">--</b></div></div></div></div>`;
  const el = root.firstElementChild, hero = el.querySelector('.hero');
  // لون السما حسب ارتفاع الشمس
  const S0 = sun(), alt = S0.alt * 180 / Math.PI;
  const pal = alt > 25 ? ['#9CC9E8', '#F1E2C8', '#2B1A10', 0xFFF6E6, 3.0] : alt > 6 ? ['#F2B77A', '#F6D9AE', '#3A1D0C', 0xFFC27A, 3.2] : alt > -4 ? ['#6E4C79', '#F09A7A', '#FFF2E6', 0xFF8A5C, 2.4] : ['#070B1C', '#20243F', '#EDEBF5', 0x8FA6FF, .7];
  el.style.setProperty('--sky1', pal[0]); el.style.setProperty('--sky2', pal[1]); el.style.setProperty('--ink', pal[2]);
  const S = stage(hero, {fov:42});
  S.renderer.shadowMap.enabled = true; S.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  S.scene.fog = new THREE.Fog(new THREE.Color(pal[1]), 18, 60);
  const N = noise2(7), size = 80, seg = 180;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for(let i = 0; i < pos.count; i++){ const x = pos.getX(i), z = pos.getZ(i);
    let h = Math.abs(N(x * .045, z * .07)) * 4.2 + N(x * .11, z * .14) * 1.1 + N(x * .4, z * .4) * .12; // حواف حادة مثل الكثبان
    pos.setY(i, h - 1.6); }
  geo.computeVertexNormals();
  const sand = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color:0xD9A46A, roughness:.95, metalness:0, emissive:alt > -4 ? 0x4a2614 : 0x0a0a18}));
  sand.receiveShadow = sand.castShadow = true; S.scene.add(sand);
  const L = new THREE.DirectionalLight(pal[3], pal[4]); L.castShadow = true; L.shadow.mapSize.set(1024, 1024);
  Object.assign(L.shadow.camera, {left:-30, right:30, top:30, bottom:-30, far:120}); S.scene.add(L, L.target);
  S.scene.add(new THREE.HemisphereLight(new THREE.Color(pal[0]), 0x7a4a2a, alt > -4 ? 1.3 : .35));
  const fill = new THREE.DirectionalLight(new THREE.Color(pal[0]), alt > -4 ? .6 : .15); fill.position.set(-8, 6, 20); S.scene.add(fill);
  // الشمس قدام الكاميرا دايماً بارتفاعها الحقيقي
  const sAlt = Math.max(-.08, S0.alt), dir = new THREE.Vector3(0, Math.sin(Math.max(.05, sAlt)), -Math.cos(sAlt)).normalize();
  L.position.copy(dir.clone().multiplyScalar(50));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.MeshBasicMaterial({color:alt > 6 ? 0xFFF7E8 : 0xFFB37A, fog:false, transparent:true, opacity:alt > -2 ? 1 : 0}));
  disc.position.copy(dir.clone().multiplyScalar(55)); disc.lookAt(0, 0, 0); S.scene.add(disc);
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const gx = gc.getContext('2d'), gr = gx.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gc), color:alt > 6 ? 0xFFF0D0 : 0xFF9A60, transparent:true, opacity:alt > -2 ? .35 : 0, fog:false, blending:THREE.AdditiveBlending}));
  glow.scale.setScalar(16); glow.position.copy(disc.position); S.scene.add(glow);
  // نجوم بالليل
  if(alt < -4){ const g = new THREE.BufferGeometry(), a = []; for(let i = 0; i < 800; i++){ const v = new THREE.Vector3().randomDirection(); if(v.y < .05) v.y = -v.y + .05; v.multiplyScalar(58); a.push(v.x, v.y, v.z); } g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); S.scene.add(new THREE.Points(g, new THREE.PointsMaterial({color:0xffffff, size:.18, fog:false}))); }
  // رمل طاير
  const pc = 260, pg = new THREE.BufferGeometry(), pa = new Float32Array(pc * 3); for(let i = 0; i < pc; i++){ pa[i * 3] = (Math.random() - .5) * 30; pa[i * 3 + 1] = Math.random() * 2.5 - .5; pa[i * 3 + 2] = -Math.random() * 25; }
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3)); const parts = new THREE.Points(pg, new THREE.PointsMaterial({color:0xF3D2A2, size:.06, transparent:true, opacity:.7})); S.scene.add(parts);
  S.camera.position.set(0, 1.6, 12);
  const stop = loop(t => {
    const e = reduce ? 1 : Math.min(1, t / 3), ease = 1 - Math.pow(1 - e, 3);
    S.camera.position.z = 12 - ease * 4 - (reduce ? 0 : t * .05) % 6; S.camera.position.y = 1.9 - ease * .5; S.camera.lookAt(0, 1.2 + (1 - ease) * 2, -30);
    for(let i = 0; i < pc; i++){ pa[i * 3] += .045; pa[i * 3 + 1] += Math.sin(t * 2 + i) * .003; if(pa[i * 3] > 15) pa[i * 3] = -15; } pg.attributes.position.needsUpdate = true;
    S.render();
  });
  // قوس الشمس
  const drawArc = () => { const n = new Date(), s = sun(n), f = Math.max(0, Math.min(1, (n - s.rise) / (s.set - s.rise))), x = 300 - f * 280, y = 86 - Math.sin(f * Math.PI) * 74;
    document.getElementById('d3arc').innerHTML = '<path d="M20,86 Q160,-62 300,86" fill="none" stroke="#D9C2A2" stroke-width="2" stroke-dasharray="3 5"/><path d="M0,86 H320" stroke="#D9C2A2"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#E9782F"/><circle cx="' + x + '" cy="' + y + '" r="16" fill="#E9782F" opacity=".18"/>';
    document.getElementById('d3r').textContent = t12(s.rise) + ' ص'; document.getElementById('d3s').textContent = t12(s.set) + ' م'; };
  const tick = () => { const n = new Date(), {next} = nextPrayer(n), r = remain(next.at, n);
    document.getElementById('d3c').innerHTML = t12(n) + '<small>' + ap(n) + '</small>'; document.getElementById('d3d').textContent = DAYS[n.getDay()] + ' ' + n.getDate() + ' ' + MONTHS[n.getMonth()] + ' · ' + hijri(n, {day:'numeric', month:'long'});
    document.getElementById('d3n').textContent = next.name; document.getElementById('d3t').textContent = 'الأذان ' + t12(next.at) + ' ' + ap(next.at); document.getElementById('d3cd').textContent = P2(r.h) + ':' + P2(r.m) + ':' + P2(r.s); };
  drawArc(); tick(); const iv = setInterval(tick, 1000), iv2 = setInterval(drawArc, 60000);
  weather().then(w => { document.getElementById('d3w').textContent = w.temp + '°'; document.getElementById('d3du').textContent = w.dust ?? '--'; document.getElementById('d3wi').textContent = w.wind; });
  return () => { stop(); clearInterval(iv); clearInterval(iv2); S.dispose(); };
}
