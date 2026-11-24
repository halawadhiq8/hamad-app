import {THREE, stage, tex, css, spin} from './kit.js';
import {P2, DAYS, MONTHS, t12, ap, nextPrayer, remain, remainAr, hijri, moon, sun, weather, loop, reduce} from './data.js';
export const note = 'قمر حقيقي ثلاثي الأبعاد مضاء بنفس طور القمر الليلة. حرّكه بإصبعك دوران كامل بأي اتجاه ويمشي مع إصبعك بالضبط، وكبّره وصغّره بإصبعين (أو عجلة الماوس). التاريخ الهجري هو العنوان.';

export async function mount(root){
  css('d2css', `
  .d2{position:relative; min-height:100%; background:#050506; color:#EDEBE6; font-family:'Readex Pro',sans-serif; overflow:hidden;}
  .d2 .hero{position:relative; height:470px;}
  .d2 .hj{position:absolute; z-index:2; pointer-events:none; top:30px; text-shadow:0 2px 18px #000; right:0; left:0; text-align:center;}
  .d2 .hj .d{font-family:'Amiri',serif; font-weight:700; font-size:92px; line-height:.9; letter-spacing:-2px;}
  .d2 .hj .m{font-family:'Amiri',serif; font-size:24px; margin-top:6px; color:#d9d6cf;}
  .d2 .hj .g{font-size:12px; color:#8e8b84; margin-top:6px; letter-spacing:.3px;}
  .d2 .stat{position:absolute; z-index:2; pointer-events:none; bottom:18px; right:22px; left:22px; display:flex; justify-content:space-between; font-size:12px; color:#8e8b84;}
  .d2 .stat b{display:block; font-size:20px; color:#EDEBE6; font-weight:300; margin-top:2px;}
  .d2 .body{padding:8px 22px 40px;}
  .d2 .rule{height:1px; background:linear-gradient(90deg,transparent,#3a3833,transparent); margin:6px 0 22px;}
  .d2 .np{display:flex; justify-content:space-between; align-items:flex-end;}
  .d2 .np .k{font-size:12px; color:#8e8b84;}
  .d2 .np .nm{font-family:'Amiri',serif; font-size:40px; font-weight:700; line-height:1.1;}
  .d2 .np .tm{text-align:left; font-size:34px; font-weight:200; direction:ltr; line-height:1;}
  .d2 .np .rm{font-size:12.5px; color:#C9B98F; margin-top:6px; text-align:left;}
  .d2 .bar{height:2px; background:#1c1b19; border-radius:2px; margin:18px 0 24px; overflow:hidden;}
  .d2 .bar i{display:block; height:100%; background:linear-gradient(90deg,#6f6758,#E9DDBE); width:0; transition:width 1.2s cubic-bezier(.22,1,.36,1);}
  .d2 .pl{display:grid; grid-template-columns:repeat(5,1fr); text-align:center; font-size:11.5px; color:#8e8b84;}
  .d2 .pl b{display:block; color:#EDEBE6; font-weight:300; font-size:15px; margin-top:4px; direction:ltr;}
  .d2 .pl .on b{color:#E9DDBE; font-weight:500;}
  .d2 .wx{display:flex; justify-content:space-between; margin-top:28px; padding-top:18px; border-top:1px solid #1c1b19; font-size:12px; color:#8e8b84;}
  .d2 .wx b{display:block; color:#EDEBE6; font-weight:300; font-size:22px; margin-top:2px;}
  `);
  root.innerHTML = `<div class="d2"><div class="hero"><div class="hj"><div class="d" id="d2d"></div><div class="m" id="d2m"></div><div class="g" id="d2g"></div></div>
    <div class="stat"><div>الإضاءة<b id="d2i">--%</b></div><div style="text-align:center">عمر القمر<b id="d2a">--</b></div><div style="text-align:left">الوقت<b id="d2c" style="direction:ltr">--</b></div></div></div>
    <div class="body"><div class="rule"></div><div class="np"><div><div class="k">الصلاة الجاية</div><div class="nm" id="d2n">—</div></div><div><div class="tm" id="d2t">—</div><div class="rm" id="d2r">—</div></div></div>
      <div class="bar"><i id="d2b"></i></div><div class="pl" id="d2p"></div>
      <div class="wx"><div>الحرارة<b id="d2w">--°</b></div><div>الرياح<b id="d2wi">--</b></div><div>الغروب<b id="d2s">--</b></div></div></div></div>`;
  const el = root.firstElementChild, hero = el.querySelector('.hero');
  const S = stage(hero, {fov:28});
  S.camera.position.set(0, 0, 9);
  const map = await tex('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/moon_1024.jpg');
  const mat = new THREE.MeshStandardMaterial({map, bumpMap:map, bumpScale:.035, roughness:1, metalness:0});
  const m = new THREE.Mesh(new THREE.SphereGeometry(1.45, 128, 128), mat);
  S.scene.add(m);
  const light = new THREE.DirectionalLight(0xfff4e0, 3.2); S.scene.add(light);
  S.scene.add(new THREE.AmbientLight(0x404a66, .05));
  // طور القمر: phase 0 محاق، 0.5 بدر
  const mi = moon(), ph = mi.phase, ang = (ph - .5) * Math.PI * 2; // 0 = بدر قدامنا
  light.position.set(Math.sin(ang) * 10, .6, Math.cos(ang) * 10);
  // غبار نجوم بعيد
  const g = new THREE.BufferGeometry(), a = []; for(let i = 0; i < 700; i++){ a.push((Math.random() - .5) * 40, (Math.random() - .5) * 30, -15 - Math.random() * 10); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); S.scene.add(new THREE.Points(g, new THREE.PointsMaterial({color:0xffffff, size:.05, transparent:true, opacity:.6})));
  let zK = 1, zN = 1; const sp0 = spin(hero, m, {zoom:z => { zK = z; }, min:.5, max:2.4});
  const stop = loop(t => {
    const e = reduce ? 1 : Math.min(1, t / 2), ease = 1 - Math.pow(1 - e, 3);
    sp0.step(); if(!sp0.active && !reduce) m.rotateY(.0006); zN += (zK - zN) * .2;
    m.scale.setScalar((.6 + .4 * ease) * zN); m.position.y = -.95 - (1 - ease) * .8; mat.opacity = ease;
    S.render();
  });
  // البيانات
  const n0 = new Date();
  document.getElementById('d2d').textContent = hijri(n0, {day:'numeric'});
  document.getElementById('d2m').textContent = hijri(n0, {month:'long', year:'numeric'});
  document.getElementById('d2g').textContent = DAYS[n0.getDay()] + ' · ' + n0.getDate() + ' ' + MONTHS[n0.getMonth()] + ' ' + n0.getFullYear();
  document.getElementById('d2i').textContent = Math.round(mi.fraction * 100) + '%';
  document.getElementById('d2a').textContent = (ph * 29.53).toFixed(1) + ' يوم';
  const tick = () => {
    const n = new Date(), {next, prev, list} = nextPrayer(n), r = remain(next.at, n);
    document.getElementById('d2c').textContent = t12(n) + ' ' + ap(n);
    document.getElementById('d2n').textContent = next.name; document.getElementById('d2t').textContent = t12(next.at) + ' ' + ap(next.at);
    document.getElementById('d2r').textContent = 'باقي ' + remainAr(r);
    const pr = prev ? (n - prev.at) / (next.at - prev.at) : .5; document.getElementById('d2b').style.width = (pr * 100).toFixed(1) + '%';
    const h = list.map(p => '<div class="' + (p.k === next.k ? 'on' : '') + '">' + p.name + '<b>' + t12(p.at) + '</b></div>').join(''); const pl = document.getElementById('d2p'); if(pl._h !== h){ pl.innerHTML = h; pl._h = h; }
  };
  tick(); const iv = setInterval(tick, 1000);
  document.getElementById('d2s').textContent = t12(sun().set);
  weather().then(w => { document.getElementById('d2w').textContent = w.temp + '°'; document.getElementById('d2wi').textContent = w.wind + ' كم/س'; });
  return () => { stop(); clearInterval(iv); sp0.off(); S.dispose(); };
}
