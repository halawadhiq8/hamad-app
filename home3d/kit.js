import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export {THREE};

/* مسرح three.js داخل عنصر: يتبع حجمه، ويوقف وينظف نفسه */
export function stage(host, {fov = 35, near = .1, far = 200, env = false, alpha = true} = {}){
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(fov, 1, near, far);
  if(env){ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(renderer), .04).texture; pm.dispose(); }
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; if(!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  const dispose = () => { ro.disconnect(); scene.traverse(o => { if(o.geometry) o.geometry.dispose(); if(o.material){ [].concat(o.material).forEach(m => { Object.values(m).forEach(v => v && v.isTexture && v.dispose()); m.dispose(); }); } }); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };
  return {renderer, scene, camera, dispose, render:() => renderer.render(scene, camera)};
}
export const tex = (url, srgb = true) => new Promise(res => new THREE.TextureLoader().load(url, t => { if(srgb) t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, () => res(null)));

/* ستايل خاص بكل واجهة */
export function css(id, text){
  // كل خط وحجم يمرون على متغيرات عشان المستخدم يقدر يغيرهم (--ff و --fz)
  text = text.replace(/font-size:\s*([\d.]+)px/g, 'font-size:calc($1px * var(--fz, 1))').replace(/font-family:\s*([^;}]+)/g, 'font-family:var(--ff, $1)');
  let s = document.getElementById(id); if(!s){ s = document.createElement('style'); s.id = id; document.head.appendChild(s); } s.textContent = text; }

/* مالة خفيفة مع حركة الجوال أو الماوس */
export function tilt(target, cb){
  let tx = 0, ty = 0;
  const mv = e => { const r = target.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2; };
  const ori = e => { if(e.gamma == null) return; tx = Math.max(-1, Math.min(1, e.gamma / 30)); ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); };
  target.addEventListener('pointermove', mv); addEventListener('deviceorientation', ori);
  return {get:() => [tx, ty], off:() => { target.removeEventListener('pointermove', mv); removeEventListener('deviceorientation', ori); }};
}

/* تدوير بالإصبع (كامل بكل الاتجاهات) + تكبير وتصغير بالقرص أو العجلة */
export function spin(el, obj, {zoom = null, min = .5, max = 2.6, onStart = null} = {}){
  el.style.touchAction = 'none';
  const pts = new Map(); let vx = 0, vy = 0, last = 0, pinch0 = 0, z0 = 1, scale = 1, active = false;
  const qx = new THREE.Quaternion(), qy = new THREE.Quaternion(), AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0);
  const rot = (dx, dy) => { qy.setFromAxisAngle(AY, dx); qx.setFromAxisAngle(AX, dy); obj.quaternion.premultiply(qy).premultiply(qx); };
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const down = e => { el.setPointerCapture(e.pointerId); pts.set(e.pointerId, {x:e.clientX, y:e.clientY}); vx = vy = 0; if(!active){ active = true; onStart && onStart(); } if(pts.size === 2){ pinch0 = dist(); z0 = scale; } };
  const move = e => { const p = pts.get(e.pointerId); if(!p) return;
    if(pts.size === 1){ const dx = (e.clientX - p.x) * .008, dy = (e.clientY - p.y) * .008; rot(dx, dy); vx = dx; vy = dy; }
    p.x = e.clientX; p.y = e.clientY;
    if(pts.size === 2 && zoom){ scale = Math.max(min, Math.min(max, z0 * dist() / pinch0)); zoom(scale); } };
  const up = e => { pts.delete(e.pointerId); };
  const wheel = e => { if(!zoom) return; e.preventDefault(); scale = Math.max(min, Math.min(max, scale * Math.exp(-e.deltaY * .0015))); zoom(scale); };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('wheel', wheel, {passive:false});
  return {
    step(){ if(pts.size === 0 && (Math.abs(vx) + Math.abs(vy)) > 1e-4){ rot(vx, vy); vx *= .94; vy *= .94; } },
    get active(){ return active; }, reset(){ active = false; vx = vy = 0; }, setScale(s){ scale = s; },
    off(){ el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('wheel', wheel); }
  };
}
