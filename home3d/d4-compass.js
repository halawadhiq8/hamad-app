import {THREE, stage, css, tilt as tiltCtl} from './kit.js';
import {LOC, P2, DAYS, MONTHS, t12, ap, nextPrayer, remain, remainAr, hijri, qibla, weather, loop, reduce} from './data.js';
export const note = 'بوصلة نحاس حقيقية تحت قبة زجاج، على جلد أخضر. تطيح وتتأرجح الإبرة لين تستقر، والمؤشر الذهبي بالكعبة يأشر على القبلة. بالجوال اضغط «فعّل البوصلة» وتدور مع اتجاهك.';

function faceTexture(q){
  const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'), R = 512;
  const g = x.createRadialGradient(R, R, 60, R, R, R); g.addColorStop(0, '#F6EEDB'); g.addColorStop(1, '#E2D3B0'); x.fillStyle = g; x.fillRect(0, 0, 1024, 1024);
  x.translate(R, R);
  for(let a = 0; a < 360; a += 2){ x.save(); x.rotate(a * Math.PI / 180); x.strokeStyle = '#3B2A17'; x.lineWidth = a % 10 ? 2 : 4; x.beginPath(); x.moveTo(0, -470); x.lineTo(0, a % 30 ? (a % 10 ? -452 : -440) : -425); x.stroke(); x.restore(); }
  x.fillStyle = '#3B2A17'; x.font = '500 34px Readex Pro'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for(let a = 30; a < 360; a += 30) if(a % 90){ x.save(); x.rotate(a * Math.PI / 180); x.fillText(a, 0, -395); x.restore(); }
  const card = [['ش', 0, '#9E2B1E'], ['ق', 90, '#3B2A17'], ['ج', 180, '#3B2A17'], ['غ', 270, '#3B2A17']];
  x.font = '700 84px "Reem Kufi"'; card.forEach(([t, a, col]) => { x.save(); x.rotate(a * Math.PI / 180); x.fillStyle = col; x.fillText(t, 0, -370); x.restore(); });
  // وردة الاتجاهات
  for(let i = 0; i < 8; i++){ x.save(); x.rotate(i * Math.PI / 4); const L = i % 2 ? 210 : 320, w = i % 2 ? 26 : 40;
    x.fillStyle = '#3B2A17'; x.beginPath(); x.moveTo(0, -L); x.lineTo(w, 0); x.lineTo(0, 0); x.fill(); x.fillStyle = '#B98A3E'; x.beginPath(); x.moveTo(0, -L); x.lineTo(-w, 0); x.lineTo(0, 0); x.fill(); x.restore(); }
  x.strokeStyle = '#3B2A17'; x.lineWidth = 3; [480, 300, 120].forEach(r => { x.beginPath(); x.arc(0, 0, r, 0, 7); x.stroke(); });
  // علامة القبلة على الحافة
  x.save(); x.rotate(q * Math.PI / 180); x.fillStyle = '#1b1b1b'; x.fillRect(-22, -505, 44, 44); x.fillStyle = '#C9A24A'; x.fillRect(-22, -493, 44, 9); x.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export async function mount(root){
  const Q = qibla();
  css('d4css', `
  .d4{position:relative; min-height:100%; color:#F1E7D0; font-family:'Readex Pro',sans-serif; background:#0F2A22;
    background-image:radial-gradient(120% 70% at 50% 30%,rgba(255,255,255,.06),transparent 60%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .35 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");}
  .d4::before{content:''; position:absolute; inset:10px; border:1.5px dashed rgba(201,162,74,.35); border-radius:28px; pointer-events:none;}
  .d4 .hero{position:relative; height:470px;}
  .d4 .hd{position:absolute; z-index:2; top:36px; right:28px; left:28px; display:flex; justify-content:space-between; align-items:flex-start;}
  .d4 .hd .t{font-family:'Reem Kufi',sans-serif; font-size:44px; font-weight:600; direction:ltr; line-height:1;}
  .d4 .hd .t small{font-size:16px; margin-left:4px; color:#C9A24A;}
  .d4 .hd .d{font-size:12.5px; color:#BFB394; text-align:left; line-height:1.6;}
  .d4 .body{position:relative; z-index:2; padding:0 26px 44px;}
  .d4 .q{display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(201,162,74,.35); border-bottom:1px solid rgba(201,162,74,.35); padding:16px 0;}
  .d4 .q .deg{font-family:'Reem Kufi',sans-serif; font-size:52px; color:#E0BE6C; line-height:1;}
  .d4 .q .k{font-size:12px; color:#BFB394;} .d4 .q .v{font-size:16px; margin-top:4px;}
  .d4 .np{display:flex; justify-content:space-between; align-items:flex-end; padding:18px 0 6px;}
  .d4 .np .nm{font-family:'Reem Kufi',sans-serif; font-size:34px; font-weight:600;}
  .d4 .np .tm{direction:ltr; font-size:28px; font-weight:300;}
  .d4 .np .rm{font-size:12.5px; color:#E0BE6C; text-align:left;}
  .d4 .row{display:flex; justify-content:space-between; font-size:12px; color:#BFB394; padding-top:14px;}
  .d4 .row b{display:block; color:#F1E7D0; font-size:20px; font-weight:400; margin-top:2px;}
  .d4 .btn{position:absolute; z-index:3; bottom:12px; left:50%; transform:translateX(-50%); font:inherit; font-size:12px; padding:7px 14px; border-radius:16px; border:1px solid rgba(201,162,74,.5); background:rgba(15,42,34,.6); color:#E0BE6C;}
  `);
  const dist = (() => { const R = 6371, t = Math.PI / 180, a = LOC.lat * t, b = 21.4225 * t, dl = (39.8262 - LOC.lng) * t; return Math.round(R * Math.acos(Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(dl))); })();
  const dirAr = d => ['الشمال','الشمال الشرقي','الشرق','الجنوب الشرقي','الجنوب','الجنوب الغربي','الغرب','الشمال الغربي'][Math.round(d / 45) % 8];
  root.innerHTML = `<div class="d4"><div class="hero"><div class="hd"><div class="t" id="d4c"></div><div class="d" id="d4d"></div></div><button class="btn" id="d4b">فعّل البوصلة</button></div>
    <div class="body"><div class="q"><div><div class="k">اتجاه القبلة</div><div class="v">${dirAr(Q)} · مكة ${dist.toLocaleString('en')} كم</div></div><div class="deg">${Math.round(Q)}°</div></div>
      <div class="np"><div><div class="k" style="font-size:12px;color:#BFB394">الصلاة الجاية</div><div class="nm" id="d4n">—</div></div><div><div class="tm" id="d4t">—</div><div class="rm" id="d4r">—</div></div></div>
      <div class="row"><div>الحرارة<b id="d4w">--°</b></div><div>الرطوبة<b id="d4h">--%</b></div><div>الرياح<b id="d4wi">--</b></div></div></div></div>`;
  const el = root.firstElementChild, hero = el.querySelector('.hero');
  const S = stage(hero, {fov:30, env:true});
  S.renderer.toneMappingExposure = 1.05; S.renderer.shadowMap.enabled = true;
  S.camera.position.set(0, 8.6, 6.4); S.camera.lookAt(0, .9, -.4);
  const brass = new THREE.MeshStandardMaterial({color:0xC89B4A, metalness:1, roughness:.28});
  const darkBrass = new THREE.MeshStandardMaterial({color:0x7A5A28, metalness:1, roughness:.45});
  const G = new THREE.Group(); S.scene.add(G);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.98, .42, 96), brass); body.castShadow = true; G.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.86, .07, 24, 128), brass); rim.rotation.x = Math.PI / 2; rim.position.y = .23; G.add(rim);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.72, .05, 96), darkBrass); inner.position.y = .2; G.add(inner);
  const dial = new THREE.Group(); G.add(dial);
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.68, 96), new THREE.MeshStandardMaterial({map:faceTexture(Q), roughness:.8})); face.rotation.x = -Math.PI / 2; face.position.y = .231; dial.add(face);
  // الإبرة
  const needle = new THREE.Group(); needle.position.y = .3; dial.add(needle);
  const nGeo = new THREE.ConeGeometry(.09, 1.3, 4); nGeo.rotateX(-Math.PI / 2);
  const nN = new THREE.Mesh(nGeo, new THREE.MeshStandardMaterial({color:0xA3261A, metalness:.3, roughness:.4})); nN.position.z = -.65; nN.scale.y = .35; needle.add(nN);
  const nS = new THREE.Mesh(nGeo, new THREE.MeshStandardMaterial({color:0xDAD6CE, metalness:.9, roughness:.25})); nS.position.z = .65; nS.rotation.y = Math.PI; nS.scale.y = .35; needle.add(nS);
  // مؤشر القبلة (ذهبي + مكعب الكعبة)
  const qp = new THREE.Group(); qp.position.y = .27; dial.add(qp);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(.035, .02, 1.25), brass); arm.position.z = -.62; qp.add(arm);
  const kb = new THREE.Mesh(new THREE.BoxGeometry(.16, .16, .16), new THREE.MeshStandardMaterial({color:0x111111, roughness:.6})); kb.position.set(0, .08, -1.32); qp.add(kb);
  const band = new THREE.Mesh(new THREE.BoxGeometry(.165, .025, .165), brass); band.position.set(0, .12, -1.32); qp.add(band);
  qp.rotation.y = -Q * Math.PI / 180;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.09, 24, 16), brass); cap.position.y = .33; dial.add(cap);
  // قبة الزجاج
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1.75, 64, 32, 0, Math.PI * 2, 0, .42), new THREE.MeshPhysicalMaterial({transmission:1, roughness:.04, thickness:.12, ior:1.5, clearcoat:1, transparent:true, opacity:.35}));
  glass.position.y = .23 - 1.75 * Math.cos(.42) ; glass.scale.y = 1; G.add(glass);
  // حلقة التعليق
  const bow = new THREE.Mesh(new THREE.TorusGeometry(.32, .06, 16, 48), brass); bow.position.set(0, .05, -2.15); bow.rotation.x = .25; G.add(bow);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .32, 24), brass); stem.rotation.x = Math.PI / 2; stem.position.set(0, .05, -1.95); G.add(stem);
  // ظل على الجلد
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({opacity:.45})); floor.rotation.x = -Math.PI / 2; floor.position.y = -.22; floor.receiveShadow = true; S.scene.add(floor);
  const key = new THREE.DirectionalLight(0xfff1d6, 2.2); key.position.set(-3, 8, 2); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; S.scene.add(key);
  let heading = 0, nAng = 1.6, nVel = 0;
  const tc = tiltCtl(el);
  const stop = loop(t => {
    const e = reduce ? 1 : Math.min(1, t / 1.1), drop = 1 - Math.pow(1 - e, 3);
    G.position.y = (1 - drop) * 2.4;
    const [tx, ty] = tc.get(); G.rotation.z += (-tx * .12 - G.rotation.z) * .06; G.rotation.x += (ty * .1 - G.rotation.x) * .06;
    dial.rotation.y += (heading * Math.PI / 180 - dial.rotation.y) * .1;
    // الإبرة تتأرجح لين تستقر على الشمال
    nVel += (-nAng) * .035; nVel *= reduce ? 0 : .955; nAng += nVel; if(reduce) nAng = 0; needle.rotation.y = nAng;
    S.render();
  });
  document.getElementById('d4b').onclick = async e => {
    try{ if(DeviceOrientationEvent.requestPermission){ const r = await DeviceOrientationEvent.requestPermission(); if(r !== 'granted') return; } }catch(err){}
    const on = ev => { const h = ev.webkitCompassHeading != null ? ev.webkitCompassHeading : (ev.absolute && ev.alpha != null ? 360 - ev.alpha : null); if(h != null){ if(Math.abs(h - heading) > 8) nVel += .05; heading = h; } };
    addEventListener('deviceorientationabsolute', on); addEventListener('deviceorientation', on); e.target.textContent = 'البوصلة شغالة';
  };
  const tick = () => { const n = new Date(), {next} = nextPrayer(n), r = remain(next.at, n);
    document.getElementById('d4c').innerHTML = t12(n) + '<small>' + ap(n) + '</small>'; document.getElementById('d4d').innerHTML = DAYS[n.getDay()] + ' ' + n.getDate() + ' ' + MONTHS[n.getMonth()] + '<br>' + hijri(n);
    document.getElementById('d4n').textContent = next.name; document.getElementById('d4t').textContent = t12(next.at) + ' ' + ap(next.at); document.getElementById('d4r').textContent = 'باقي ' + remainAr(r); };
  tick(); const iv = setInterval(tick, 1000);
  weather().then(w => { document.getElementById('d4w').textContent = w.temp + '°'; document.getElementById('d4h').textContent = w.hum + '%'; document.getElementById('d4wi').textContent = w.wind + ' كم/س'; });
  return () => { stop(); clearInterval(iv); tc.off(); S.dispose(); };
}
