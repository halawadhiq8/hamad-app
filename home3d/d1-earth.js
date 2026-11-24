import {THREE, stage, tex, css, spin} from './kit.js';
import {LOC, P2, DAYS, MONTHS, t12, ap, nextPrayer, remain, remainAr, hijri, sun, weather, loop, reduce} from './data.js';
export const note = 'الكرة الأرضية الحقيقية: النهار والليل حسب مكان الشمس الحين، والخط الذهبي هو المكان اللي تشرق فيه الشمس الحين والخط البرتقالي اللي تغرب فيه. حرّكها بإصبعك بأي اتجاه دوران كامل، وكبّر وصغّر بإصبعين. ضغطتين ترجعك لموقعك.';

const G = 'https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/';
const vec = (lat, lon) => { const a = lat * Math.PI / 180, o = lon * Math.PI / 180; return new THREE.Vector3(Math.cos(a) * Math.cos(o), Math.sin(a), -Math.cos(a) * Math.sin(o)); };
function subsolar(d){ // نقطة الشمس العمودية على الأرض
  const N = Math.floor((d - new Date(d.getUTCFullYear(), 0, 0)) / 864e5), dec = 23.44 * Math.sin(2 * Math.PI * (284 + N) / 365);
  const utc = d.getUTCHours() + d.getUTCMinutes() / 60, b = 2 * Math.PI * (N - 81) / 364, eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  return [dec, -15 * (utc - 12 + eot / 60)];
}

export async function mount(root){
  css('d1css', `
  .d1{position:relative; min-height:100%; background:radial-gradient(120% 60% at 50% 38%,#0b1a2b 0%,#03060b 60%,#000 100%); color:#E9F1F7; font-family:'IBM Plex Sans Arabic',sans-serif;}
  .d1 .hero{position:relative; height:470px;}
  .d1 .top{position:absolute; pointer-events:none; top:46px; right:22px; left:22px; z-index:2; display:flex; justify-content:space-between; align-items:flex-start;}
  .d1 .clk{font-weight:300; font-size:64px; letter-spacing:-2px; line-height:.9; direction:ltr;}
  .d1 .clk small{font-size:18px; letter-spacing:0; color:#8FB8D4; margin-left:6px;}
  .d1 .dt{text-align:left; font-size:13px; color:#8FB8D4; line-height:1.7; margin-top:6px;}
  .d1 .dt b{display:block; color:#E9F1F7; font-weight:600; font-size:15px;}
  .d1 .loc{position:absolute; pointer-events:none; z-index:2; left:0; top:0; transform:translate(14px,-50%); font-size:12px; color:#CFE8F7; white-space:nowrap; opacity:0; transition:opacity .8s .9s;}
  .d1 .loc i{display:inline-block; width:22px; height:1px; background:#7FD6FF; vertical-align:middle; margin-left:6px;}
  .d1.in .loc{opacity:1;}
  .d1 .tl{position:absolute; z-index:2; left:0; top:0; transform:translate(-50%,-50%); font-size:11px; font-weight:600; padding:3px 8px; border-radius:10px; white-space:nowrap; pointer-events:none; transition:opacity .25s;}
  .d1 .tl.r{background:rgba(255,211,107,.16); color:#FFD36B; border:1px solid rgba(255,211,107,.45);} .d1 .tl.s{background:rgba(255,122,74,.16); color:#FF9A6E; border:1px solid rgba(255,122,74,.45);}
  .d1 .hint{position:absolute; z-index:2; bottom:54px; left:50%; transform:translateX(-50%); font-size:11px; color:#8FB8D4; opacity:.8; pointer-events:none;}
  .d1 .body{position:relative; z-index:2; margin-top:-40px; padding:0 16px 40px;}
  .d1 .np{border-radius:26px; padding:20px 22px; background:linear-gradient(180deg,rgba(20,40,60,.55),rgba(8,14,22,.75)); border:1px solid rgba(127,214,255,.18); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);}
  .d1 .np .k{font-size:12.5px; color:#8FB8D4;}
  .d1 .np .row{display:flex; justify-content:space-between; align-items:baseline; margin-top:6px;}
  .d1 .np .nm{font-size:30px; font-weight:600;}
  .d1 .np .tm{font-size:30px; font-weight:300; direction:ltr;}
  .d1 .cd{display:flex; gap:8px; margin-top:16px; direction:ltr; justify-content:flex-end;}
  .d1 .cd div{flex:1; text-align:center; padding:10px 0 8px; border-radius:14px; background:rgba(127,214,255,.06);}
  .d1 .cd b{display:block; font-size:24px; font-weight:400; font-variant-numeric:tabular-nums;}
  .d1 .cd span{font-size:10.5px; color:#8FB8D4;}
  .d1 .grid{display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;}
  .d1 .c{border-radius:20px; padding:14px 16px; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.06);}
  .d1 .c .k{font-size:11.5px; color:#8FB8D4;}
  .d1 .c .v{font-size:26px; font-weight:300; margin-top:4px;}
  .d1 .c .s{font-size:11.5px; color:#9fb2c0; margin-top:2px;}
  .d1 .rise{display:flex; justify-content:space-between; font-size:13px; color:#9fb2c0; margin-top:10px; padding:14px 18px; border-radius:20px; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.06);}
  .d1 .rise b{color:#FFC879; font-weight:600;}
  `);
  root.innerHTML = `<div class="d1"><div class="hero"><div class="top"><div class="clk" id="d1c"></div><div class="dt" id="d1d"></div></div><div class="loc"><i></i>موقعك · ${LOC.lat.toFixed(2)}°</div><div class="tl r" id="d1tr">☀︎ تشرق الحين</div><div class="tl s" id="d1ts">تغرب الحين ☾</div><div class="hint">اسحب لتدوير الأرض · إصبعين للتكبير</div></div>
    <div class="body"><div class="np"><div class="k">الصلاة الجاية</div><div class="row"><span class="nm" id="d1n">—</span><span class="tm" id="d1t">—</span></div>
      <div class="cd"><div><b id="d1h">00</b><span>ساعة</span></div><div><b id="d1m">00</b><span>دقيقة</span></div><div><b id="d1s">00</b><span>ثانية</span></div></div></div>
      <div class="grid"><div class="c"><div class="k">الحرارة</div><div class="v" id="d1w">--°</div><div class="s" id="d1wd">—</div></div><div class="c"><div class="k">جودة الهوا</div><div class="v" id="d1a">--</div><div class="s" id="d1ad">—</div></div></div>
      <div class="rise"><span>الشروق <b id="d1r">--</b></span><span>الغروب <b id="d1st">--</b></span></div></div></div>`;
  const el = root.firstElementChild, hero = el.querySelector('.hero'), locEl = el.querySelector('.loc');
  const S = stage(hero, {fov:30});
  S.camera.position.set(0, 0, 8.4);
  const [day, night] = await Promise.all([tex(G + 'earth-blue-marble.jpg'), tex(G + 'earth-night.jpg')]);
  const sunDir = new THREE.Vector3();
  const mat = new THREE.ShaderMaterial({uniforms:{day:{value:day}, night:{value:night}, sun:{value:sunDir}},
    vertexShader:`varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vN=normalize(position); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`uniform sampler2D day; uniform sampler2D night; uniform vec3 sun; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ float d=dot(normalize(vN),normalize(sun)); float k=smoothstep(-.12,.18,d);
        vec3 dc=texture2D(day,vUv).rgb; vec3 nc=texture2D(night,vUv).rgb; nc=pow(nc,vec3(1.4))*vec3(1.4,1.05,.7)*1.6;
        vec3 c=mix(nc+dc*.035,dc*(.25+.95*max(d,0.)),k);
        float tw=smoothstep(-.1,.02,d)*(1.-smoothstep(.02,.16,d)); c+=vec3(1.,.42,.12)*tw*.05;
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const tilt = new THREE.Group(), earth = new THREE.Mesh(new THREE.SphereGeometry(1.6, 96, 96), mat);
  tilt.add(earth); S.scene.add(tilt); tilt.position.y = -.35;
  const atm = new THREE.Mesh(new THREE.SphereGeometry(1.6 * 1.12, 64, 64), new THREE.ShaderMaterial({transparent:true, depthWrite:false, side:THREE.BackSide, blending:THREE.AdditiveBlending,
    vertexShader:`varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:`varying vec3 vN; void main(){ float i=pow(.72-dot(vN,vec3(0,0,1.)),3.); gl_FragColor=vec4(.35,.7,1.,1.)*i*.9; }`}));
  atm.position.y = -.35; S.scene.add(atm);
  // نقطة الموقع
  const p = vec(LOC.lat, LOC.lng).multiplyScalar(1.6 * 1.004);
  const pin = new THREE.Mesh(new THREE.SphereGeometry(.022, 16, 16), new THREE.MeshBasicMaterial({color:0xFF5A3C}));
  pin.position.copy(p); earth.add(pin);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.03, .04, 48), new THREE.MeshBasicMaterial({color:0xFF5A3C, transparent:true, side:THREE.DoubleSide}));
  ring.position.copy(p); ring.lookAt(p.clone().multiplyScalar(2)); earth.add(ring);
  // نجوم
  const sg = new THREE.BufferGeometry(), sp = []; for(let i = 0; i < 900; i++){ const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 30); sp.push(v.x, v.y, v.z); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); S.scene.add(new THREE.Points(sg, new THREE.PointsMaterial({color:0xBFD9FF, size:.12, transparent:true, opacity:.7})));

  // خط الشروق وخط الغروب على الأرض
  const arcR = new THREE.Mesh(new THREE.TorusGeometry(1.6 * 1.004, .007, 6, 160, Math.PI), new THREE.MeshBasicMaterial({color:0xFFD36B}));
  const arcS = new THREE.Mesh(new THREE.TorusGeometry(1.6 * 1.004, .007, 6, 160, Math.PI), new THREE.MeshBasicMaterial({color:0xFF7A4A}));
  arcR.matrixAutoUpdate = arcS.matrixAutoUpdate = false; earth.add(arcR, arcS);
  const mR = new THREE.Vector3(), mS = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  function setArcs(){
    const sN = sunDir.clone().normalize(), n = Y.clone().sub(sN.clone().multiplyScalar(Y.dot(sN))).normalize(), m = new THREE.Vector3().crossVectors(sN, n).normalize();
    const east = new THREE.Vector3().crossVectors(Y, m).normalize(), rise = east.dot(sN) > 0 ? m : m.clone().negate();
    mR.copy(rise).multiplyScalar(1.6 * 1.01); mS.copy(rise).negate().multiplyScalar(1.6 * 1.01);
    const mk = (mid, mesh) => { const Z = new THREE.Vector3().crossVectors(n, mid).normalize(); mesh.matrix.makeBasis(n, mid.clone().normalize(), Z); };
    mk(rise, arcR); mk(rise.clone().negate(), arcS);
  }
  const trEl = el.querySelector('#d1tr'), tsEl = el.querySelector('#d1ts');
  const place = (v, node) => { const w = earth.localToWorld(v.clone()), camDir = S.camera.position.clone().sub(w).normalize(), nrm = w.clone().sub(tilt.getWorldPosition(new THREE.Vector3())).normalize(), vis = nrm.dot(camDir) > .15;
    const sp = w.project(S.camera); node.style.left = ((sp.x + 1) / 2 * hero.clientWidth) + 'px'; node.style.top = ((1 - sp.y) / 2 * hero.clientHeight) + 'px'; node.style.opacity = vis ? 1 : 0; };
  const target = -Math.PI / 2 - LOC.lng * Math.PI / 180, lat = LOC.lat * Math.PI / 180;
  tilt.rotation.x = lat * .85;
  const setSun = () => { const [d, l] = subsolar(new Date()); sunDir.copy(vec(d, l)); };
  setSun(); setArcs();
  let userMoved = false;
  const sp0 = spin(hero, tilt, {zoom:z => { zoomK = z; }, min:.6, max:2.4, onStart:() => { userMoved = true; }}); let zoomK = 1, zoomNow = 1;
  let lastTap = 0; hero.addEventListener('pointerup', () => { const now = performance.now(); if(now - lastTap < 300){ tilt.quaternion.setFromEuler(new THREE.Euler(lat * .85, 0, 0)); sp0.reset(); userMoved = false; zoomK = 1; sp0.setScale(1); } lastTap = now; });
  requestAnimationFrame(() => el.classList.add('in'));
  const stop = loop(t => {
    const e = reduce ? 1 : Math.min(1, t / 2.4), ease = 1 - Math.pow(1 - e, 4);
    earth.rotation.y = target - (1 - ease) * Math.PI * 1.6 + (userMoved ? 0 : Math.sin(t * .15) * .06 * ease);
    sp0.step(); zoomNow += (zoomK - zoomNow) * .2;
    const sc = (.78 + .22 * ease) * zoomNow; tilt.scale.setScalar(sc); atm.scale.setScalar(sc);
    place(mR, trEl); place(mS, tsEl);
    const k = (t * .8) % 1; ring.scale.setScalar(1 + k * 3.2); ring.material.opacity = 1 - k;
    const sp = pin.getWorldPosition(new THREE.Vector3()).project(S.camera); locEl.style.left = ((sp.x + 1) / 2 * hero.clientWidth) + 'px'; locEl.style.top = ((1 - sp.y) / 2 * hero.clientHeight) + 'px';
    S.render();
  });
  // البيانات
  const tick = () => {
    const n = new Date(); document.getElementById('d1c').innerHTML = t12(n) + '<small>' + ap(n) + '</small>';
    document.getElementById('d1d').innerHTML = '<b>' + DAYS[n.getDay()] + ' ' + n.getDate() + ' ' + MONTHS[n.getMonth()] + '</b>' + hijri(n);
    const {next} = nextPrayer(n), r = remain(next.at, n);
    document.getElementById('d1n').textContent = next.name; document.getElementById('d1t').textContent = t12(next.at) + ' ' + ap(next.at);
    document.getElementById('d1h').textContent = P2(r.h); document.getElementById('d1m').textContent = P2(r.m); document.getElementById('d1s').textContent = P2(r.s);
  };
  tick(); const iv = setInterval(() => { tick(); setSun(); setArcs(); }, 1000);
  const s = sun(); document.getElementById('d1r').textContent = t12(s.rise); document.getElementById('d1st').textContent = t12(s.set);
  weather().then(w => { document.getElementById('d1w').textContent = w.temp + '°'; document.getElementById('d1wd').textContent = w.desc + ' · ' + w.hi + '° / ' + w.lo + '°';
    document.getElementById('d1a').textContent = w.aqi ?? '--'; document.getElementById('d1ad').textContent = 'غبار ' + (w.dust ?? '--') + ' µg'; });
  return () => { stop(); clearInterval(iv); sp0.off(); S.dispose(); };
}
