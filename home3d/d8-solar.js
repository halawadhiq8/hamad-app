import {THREE, stage, tex, css} from './kit.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {DAYS, MONTHS, t12, ap, nextPrayer, remain, remainAr, hijri, loop, reduce} from './data.js';
import {buildEvents, TYPES, icon} from './events.js?v=3';
export const note = 'المجموعة الشمسية 3D بمواقع الكواكب الحقيقية اليوم: شمس متوهجة، مدارات منورة ووراء كل كوكب ذيل ضو. اضغط على أي كوكب تطير له وتطلع معلوماته وبعده عن الأرض الحين. ▶ يسرّع الزمن.';

const TX = 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/';
const EL = {
  mercury:[.38709927,.00000037,.20563593,.00001906,7.00497902,-.00594749,252.2503235,149472.67411175,77.45779628,.16047689,48.33076593,-.12534081],
  venus:[.72333566,.0000039,.00677672,-.00004107,3.39467605,-.0007889,181.9790995,58517.81538729,131.60246718,.00268329,76.67984255,-.27769418],
  earth:[1.00000261,.00000562,.01671123,-.00004392,-.00001531,-.01294668,100.46457166,35999.37244981,102.93768193,.32327364,0,0],
  mars:[1.52371034,.00001847,.0933941,.00007882,1.84969142,-.00813131,-4.55343205,19140.30268499,-23.94362959,.44441088,49.55953891,-.29257343],
  jupiter:[5.202887,-.00011607,.04838624,-.00013253,1.30439695,-.00183714,34.39644051,3034.74612775,14.72847983,.21252668,100.47390909,.20469106],
  saturn:[9.53667594,-.0012506,.05386179,-.00050991,2.48599187,.00193609,49.95424423,1222.49362201,92.59887831,-.41897216,113.66242448,-.28867794],
  uranus:[19.18916464,-.00196176,.04725744,-.00004397,.77263783,-.00242939,313.23810451,428.48202785,170.9542763,.40805281,74.01692503,.04240589],
  neptune:[30.06992276,.00026291,.00859048,.00005105,1.77004347,.00035372,-55.12002969,218.45945325,44.96476227,-.32241464,131.78422574,-.00508664],
  pluto:[39.48211675,-.00031596,.2488273,.0000517,17.14001206,.00004818,238.92903833,145.20780515,224.06891629,-.04062942,110.30393684,-.01183482]};
const INFO = {
  mercury:{ar:'عطارد', per:'88 يوم', col:'#C9B9A6', sub:'أقرب كوكب للشمس وأصغرهم', d:'4,879', day:'59 يوم أرضي', yr:'88 يوم', moons:'0', temp:'-173° إلى 427°', fact:'سنته أقصر من يومه الشمسي: يدور حول الشمس مرتين قبل ما يشوف شروق واحد.', size:.3, map:'mercurymap.jpg'},
  venus:{ar:'الزهرة', per:'225 يوم', col:'#F2C46B', sub:'ألمع شي بالسما بعد الشمس والقمر', d:'12,104', day:'243 يوم (يدور بالعكس)', yr:'225 يوم', moons:'0', temp:'465°', fact:'أحر كوكب مع إنه مو الأقرب، لأن جوه ثاني أكسيد الكربون يحبس الحرارة.', size:.5, map:'venusmap.jpg', atm:0xFFD38A},
  earth:{ar:'الأرض', per:'365 يوم', col:'#7FD0FF', sub:'إحنا هني', d:'12,742', day:'24 ساعة', yr:'365.25 يوم', moons:'1', temp:'15° متوسط', fact:'الكوكب الوحيد المعروف فيه ماي سايل على سطحه وحياة.', size:.54, map:'earthmap1k.jpg', atm:0x5AB4FF},
  mars:{ar:'المريخ', per:'687 يوم', col:'#FF8A5B', sub:'الكوكب الأحمر', d:'6,779', day:'24 ساعة و37 دقيقة', yr:'687 يوم', moons:'2', temp:'-65° متوسط', fact:'فيه أعلى جبل بالمجموعة الشمسية: أوليمبوس، ارتفاعه تقريباً 3 مرات إيفرست.', size:.4, map:'marsmap1k.jpg', atm:0xFF8A5B},
  jupiter:{ar:'المشتري', per:'12 سنة', col:'#F0C79A', sub:'أكبر كوكب', d:'139,820', day:'9 ساعات و56 دقيقة', yr:'11.9 سنة', moons:'95', temp:'-110°', fact:'البقعة الحمرا العظيمة عاصفة أكبر من الأرض كلها، مستمرة من أكثر من 300 سنة.', size:1.35, map:'jupitermap.jpg'},
  saturn:{ar:'زحل', per:'29 سنة', col:'#F4D9A0', sub:'صاحب الحلقات', d:'116,460', day:'10 ساعات و33 دقيقة', yr:'29.5 سنة', moons:'146', temp:'-140°', fact:'كثافته أقل من الماي: لو فيه حوض بحجمه كان طفا.', size:1.15, map:'saturnmap.jpg'},
  uranus:{ar:'أورانوس', per:'84 سنة', col:'#9BE7F0', sub:'الكوكب المايل على جنبه', d:'50,724', day:'17 ساعة و14 دقيقة', yr:'84 سنة', moons:'28', temp:'-195°', fact:'محوره مايل 98 درجة، فكل قطب يعيش 42 سنة نهار و42 سنة ليل.', size:.8, map:'uranusmap.jpg', atm:0x9BE7F0},
  neptune:{ar:'نبتون', per:'165 سنة', col:'#6E9BFF', sub:'أبعد كوكب', d:'49,244', day:'16 ساعة', yr:'165 سنة', moons:'16', temp:'-200°', fact:'رياحه أسرع رياح بالمجموعة الشمسية: توصل أكثر من 2,000 كم/س.', size:.78, map:'neptunemap.jpg', atm:0x4F7BFF},
  pluto:{ar:'بلوتو', per:'248 سنة', col:'#E2D3C4', sub:'كوكب قزم بحزام كايبر', d:'2,377', day:'6.4 يوم', yr:'248 سنة', moons:'5', temp:'-230°', fact:'فيه سهل جليدي على شكل قلب اسمه «تومبو»، من نيتروجين متجمد.', size:.22, map:'plutomap1k.jpg'}};
const AU = 149597870.7, rad = Math.PI / 180;
function elems(k, date){ const T = (date / 864e5 + 2440587.5 - 2451545) / 36525, e0 = EL[k];
  return {a:e0[0] + e0[1] * T, e:e0[2] + e0[3] * T, I:(e0[4] + e0[5] * T) * rad, L:e0[6] + e0[7] * T, w:e0[8] + e0[9] * T, O:(e0[10] + e0[11] * T) * rad}; }
export function helio(k, date){ const o = elems(k, date); const M = ((o.L - o.w) % 360) * rad; let E = M; for(let i = 0; i < 10; i++) E = M + o.e * Math.sin(E);
  const v = orbitPt(o.a, o.e, o.I, o.w * rad - o.O, o.O, E); v.E = ((E % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return v; }
function orbitPt(a, e, I, om, O, E){ const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(om), sw = Math.sin(om), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
  return new THREE.Vector3((cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp, (sw * sI) * xp + (cw * sI) * yp, -((cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp)); }
const vr = r => 4.5 + 9 * Math.log2(1 + r); // مسافات مضغوطة بتوزيع مريح للعين
const vis = v => { const r = v.length(); return v.clone().multiplyScalar(vr(r) / r); };
const km = n => n >= 1e9 ? (n / 1e9).toFixed(2) + ' مليار كم' : (n / 1e6).toFixed(1) + ' مليون كم';
const lt = s => { const m = s / 60; return m < 60 ? Math.round(m) + ' دقيقة ضوئية' : (m / 60).toFixed(1) + ' ساعة ضوئية'; };
const glowTex = stops => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); };
const NOISE = `float h3(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float n3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f); return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
  float fbm(vec3 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n3(p); p*=2.03; a*=.5; } return v; }`;

export async function mount(root){
  css('d8scss', `
  .d8s{position:relative; min-height:100%; color:#EAF0FF; font-family:'Readex Pro',sans-serif; background:#01020A;}
  .d8s .hero{position:relative; height:640px; overflow:hidden;}
  .d8s .hd{position:absolute; z-index:3; top:24px; right:20px; left:20px; display:flex; justify-content:space-between; pointer-events:none; font-size:12px; color:#8FA0C8;}
  .d8s .hd b{display:block; font-size:15px; color:#EAF0FF; font-weight:500;}
  .d8s .ttl{position:absolute; z-index:3; top:72px; right:0; left:0; text-align:center; pointer-events:none; font-size:12px; letter-spacing:2px; color:#AFC2F5; opacity:.85;}
  .d8s .lab{position:absolute; z-index:2; transform:translate(-50%,0); text-align:center; white-space:nowrap; pointer-events:none; line-height:1.15; transition:opacity .3s; text-shadow:0 1px 6px #000,0 0 2px #000;}
  .d8s .lab b{display:block; font-size:12.5px; font-weight:600;}
  .d8s .lab span{font-size:10.5px; color:#E6EAF6; opacity:.85;}
  .d8s .ctl{position:absolute; z-index:3; top:104px; left:14px; display:flex; flex-direction:column; gap:8px;}
  .d8s .ctl button{width:40px; height:40px; border-radius:13px; border:1px solid rgba(160,180,255,.25); background:rgba(10,14,30,.55); color:#EAF0FF; font:inherit; font-size:14px; backdrop-filter:blur(8px);}
  .d8s .simd{position:absolute; z-index:3; top:106px; right:16px; font-size:11px; color:#8FA0C8; pointer-events:none;}
  .d8s .simd b{display:block; color:#EAF0FF; font-weight:500; font-size:13px;}
  .d8s .chips{position:absolute; z-index:3; bottom:12px; left:0; right:0; display:flex; gap:6px; overflow-x:auto; padding:0 14px; scrollbar-width:none;}
  .d8s .chips::-webkit-scrollbar{display:none;}
  .d8s .chips button{flex:none; font:inherit; font-size:12px; padding:7px 12px; border-radius:16px; border:1px solid rgba(160,180,255,.22); background:rgba(10,14,30,.55); color:#C9D4F2; backdrop-filter:blur(6px); display:flex; align-items:center; gap:6px;}
  .d8s .chips button i{width:8px; height:8px; border-radius:50%;}
  .d8s .chips button.on{background:#EAF0FF; color:#02030A;}
  .d8s .card{position:absolute; z-index:4; left:12px; right:12px; bottom:58px; border-radius:24px; padding:16px 18px 14px; background:linear-gradient(180deg,rgba(16,22,46,.8),rgba(5,7,18,.92)); border:1px solid rgba(160,180,255,.2); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
    opacity:0; visibility:hidden; pointer-events:none; transform:translateY(40px); transition:transform .5s cubic-bezier(.22,1,.36,1), opacity .35s, visibility 0s .5s;}
  .d8s .card.on{opacity:1; visibility:visible; pointer-events:auto; transform:none; transition:transform .5s cubic-bezier(.22,1,.36,1), opacity .35s;}
  .d8s .card .x{position:absolute; top:12px; left:12px; width:30px; height:30px; border-radius:50%; border:1px solid rgba(160,180,255,.25); background:none; color:#C9D4F2; font-size:14px;}
  .d8s .card h3{margin:0; font-size:26px; font-weight:600;} .d8s .card .sb{font-size:12px; color:#8FA0C8; margin-top:1px;}
  .d8s .card .big{margin-top:10px; padding:10px 14px; border-radius:16px; background:rgba(120,150,255,.08);}
  .d8s .card .big .k{font-size:11px; color:#8FA0C8;} .d8s .card .big b{display:block; font-size:22px; font-weight:400; margin-top:1px;} .d8s .card .big small{color:#A8B6DC; font-size:11.5px;}
  .d8s .card .gr{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px 10px; margin-top:10px; font-size:11px; color:#8FA0C8;}
  .d8s .card .gr b{display:block; font-size:13px; color:#EAF0FF; font-weight:500; margin-top:1px;}
  .d8s .card .ft{margin-top:10px; font-size:12px; line-height:1.65; color:#C9D4F2; border-top:1px solid rgba(160,180,255,.14); padding-top:8px;}
  .d8s .ev{margin:6px 16px 44px;}
  .d8s .ev h2{font-size:22px; font-weight:600; margin:0;} .d8s .ev .evs{font-size:12px; color:#8FA0C8; margin-top:2px;}
  .d8s .evf{display:flex; flex-wrap:wrap; justify-content:center; gap:6px; margin:14px 0;}
  .d8s .evf button{flex:0 0 calc(25% - 4.5px); min-width:0; font-size:11.5px !important; padding:8px 2px !important;}
  .d8s .evf::-webkit-scrollbar{display:none;}
  .d8s .evf button{font:inherit; font-size:12px; padding:8px 4px; text-align:center; white-space:nowrap; border-radius:16px; border:1px solid rgba(160,180,255,.2); background:transparent; color:#C9D4F2;}
  .d8s .evf button.on{background:#EAF0FF; color:#02030A; border-color:#EAF0FF;}
  .d8s .feat{position:relative; overflow:hidden; border-radius:22px; padding:16px 18px; margin-bottom:12px; background:radial-gradient(120% 140% at 100% 0%,rgba(255,170,80,.16),transparent 55%),linear-gradient(180deg,rgba(24,30,58,.9),rgba(8,10,24,.95)); border:1px solid rgba(255,190,120,.22);}
  .d8s .feat .k{font-size:11.5px; color:#FFC88A;} .d8s .feat .t{font-size:20px; font-weight:600; margin-top:4px;} .d8s .feat .s{font-size:12.5px; color:#A8B6DC; margin-top:4px; line-height:1.6;}
  .d8s .feat .cd{display:flex; gap:6px; margin-top:12px; direction:ltr; justify-content:flex-end;}
  .d8s .feat .cd div{min-width:54px; text-align:center; padding:8px 0 6px; border-radius:12px; background:rgba(255,255,255,.05);} .d8s .feat .cd b{display:block; font-size:20px; font-weight:400; font-variant-numeric:tabular-nums;} .d8s .feat .cd span{font-size:10px; color:#8FA0C8;}
  .d8s .feat svg{position:absolute; left:14px; top:14px; width:46px; height:46px;}
  .d8s .evl{display:flex; flex-direction:column; gap:8px;}
  .d8s .eci{display:grid; grid-template-columns:52px 1fr 38px; gap:12px; align-items:center; padding:12px 14px; border-radius:18px; background:rgba(255,255,255,.035); border:1px solid rgba(160,180,255,.1); text-align:right;
    opacity:0; transform:translateY(14px); transition:opacity .5s, transform .5s cubic-bezier(.22,1,.36,1); font:inherit; color:inherit; width:100%;}
  .d8s .eci.in{opacity:1; transform:none;}
  .d8s .eci .dt{text-align:center; border-left:1px solid rgba(160,180,255,.14); padding-left:10px;} .d8s .eci .dt b{display:block; font-size:22px; font-weight:500; line-height:1;} .d8s .eci .dt span{font-size:10.5px; color:#8FA0C8;}
  .d8s .eci .t{font-size:14.5px; font-weight:600;} .d8s .eci .s{font-size:11.5px; color:#A8B6DC; margin-top:3px; line-height:1.55;}
  .d8s .eci .tg{display:inline-block; margin-top:5px; font-size:10.5px; padding:2px 8px; border-radius:8px; background:rgba(255,255,255,.06); color:#C9D4F2;} .d8s .eci .tg.g{background:rgba(120,220,160,.12); color:#9BE3B5;}
  .d8s .eci svg{width:38px; height:38px;}
  .d8s .eci .in2{font-size:10.5px; color:#8FA0C8; margin-top:4px;}
  .d8s .mg{border-bottom:1px solid rgba(160,180,255,.1);}
  .d8s .mh{display:flex; align-items:center; gap:10px; width:100%; padding:14px 2px; background:none; border:0; color:inherit; font:inherit; text-align:right;}
  .d8s .mh b{font-size:16px; font-weight:600;} .d8s .mh span{font-size:12px; color:#8FA0C8; margin-right:auto; margin-left:6px;}
  .d8s .chev{width:8px; height:8px; border-left:1.6px solid #8FA0C8; border-bottom:1.6px solid #8FA0C8; transform:rotate(-45deg); transition:transform .25s; flex:none; margin-top:-4px;}
  .d8s .open > .mh .chev, .d8s .er.open .chev{transform:rotate(135deg); margin-top:4px;}
  .d8s .mi{display:none; padding-bottom:8px;} .d8s .mg.open .mi{display:block; animation:evIn .35s cubic-bezier(.22,1,.36,1);}
  @keyframes evIn{from{opacity:0; transform:translateY(-6px);}to{opacity:1; transform:none;}}
  .d8s .eh{display:flex; align-items:center; gap:12px; width:100%; padding:9px 2px; background:none; border:0; color:inherit; font:inherit; text-align:right;}
  .d8s .eh .dd{width:40px; flex:none; text-align:center; font-size:10.5px; color:#8FA0C8; line-height:1.15;} .d8s .eh .dd b{display:block; font-size:19px; color:#EAF0FF; font-weight:500;}
  .d8s .eh .ic svg{width:26px; height:26px; display:block;} .d8s .eh .tt{flex:1; font-size:14.5px;}
  .d8s .ed{display:none; margin:0 52px 10px 4px; font-size:12.5px; line-height:1.7; color:#A8B6DC;} .d8s .er.open .ed{display:block;}
  .d8s .ed .tg{display:inline-block; margin-top:6px; font-size:11px; padding:2px 8px; border-radius:8px; background:rgba(255,255,255,.06); color:#C9D4F2;} .d8s .ed .tg.g{background:rgba(120,220,160,.12); color:#9BE3B5;}
  .d8s .ed .go{display:block; margin-top:8px; font:inherit; font-size:12px; padding:6px 12px; border-radius:12px; border:1px solid rgba(160,180,255,.25); background:none; color:#C9D4F2;}
  .d8s .np{display:flex; justify-content:space-between; align-items:center; margin:14px 16px 22px; padding:16px 18px; border-radius:20px; background:rgba(255,255,255,.04); border:1px solid rgba(160,180,255,.12);}
  .d8s .np .nm{font-size:24px; font-weight:600;} .d8s .np .k{font-size:12px; color:#8FA0C8;} .d8s .np .r{text-align:left; font-size:12.5px; color:#8FA0C8;} .d8s .np .r b{display:block; font-size:22px; color:#EAF0FF; font-weight:300; direction:ltr;}
  `);
  const keys = Object.keys(INFO);
  root.innerHTML = `<div class="d8s"><div class="hero"><div class="hd"><div><b id="d8sd"></b><span id="d8sh"></span></div><div style="text-align:left"><b id="d8sc" style="direction:ltr"></b>الوقت</div></div>
    <div class="ttl">المجموعة الشمسية · اليوم</div>
    <div class="ctl"><button id="d8sp" aria-label="تسريع الزمن">▶</button><button id="d8sr" aria-label="رجوع لليوم">↺</button></div><div class="simd" id="d8ss"></div>
    <div class="card" id="d8card"></div><div class="chips" id="d8chips">${keys.map(k => '<button data-k="' + k + '"><i style="background:' + INFO[k].col + '"></i>' + INFO[k].ar + '</button>').join('')}</div></div>
    <div class="np"><div><div class="k">الصلاة الجاية</div><div class="nm" id="d8sn">—</div></div><div class="r"><b id="d8st">—</b><span id="d8sr2"></span></div></div>
    <section class="ev"><h2>الأحداث الفلكية</h2><div class="evs" id="evsub"></div><div class="evf" id="evf"></div><div id="evfeat"></div><div class="evl" id="evl"></div></section></div>`;
  const el = root.firstElementChild, hero = el.querySelector('.hero'), card = el.querySelector('#d8card');
  const S = stage(hero, {fov:42, far:1200, alpha:false});
  S.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  S.renderer.toneMappingExposure = 1;
  const ctl = new OrbitControls(S.camera, S.renderer.domElement); ctl.enableDamping = true; ctl.dampingFactor = .07; ctl.enablePan = false; ctl.minDistance = 2.2; ctl.maxDistance = 260; ctl.rotateSpeed = .55; ctl.autoRotateSpeed = .35;
  S.renderer.domElement.style.touchAction = 'none';
  // توهج حقيقي (bloom)
  const comp = new EffectComposer(S.renderer); comp.addPass(new RenderPass(S.scene, S.camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .4, .35, 1.1) // التوهج للشمس بس، الكواكب تبقى واضحة; comp.addPass(bloom); comp.addPass(new OutputPass());
  const fit = () => { const w = hero.clientWidth, h = hero.clientHeight; if(w && h){ comp.setPixelRatio(S.renderer.getPixelRatio()); comp.setSize(w, h); } };
  const ro = new ResizeObserver(fit); ro.observe(hero); fit();

  // ---- الخلفية: درب التبانة + سديم + نجوم ----
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 64, 32), new THREE.ShaderMaterial({side:THREE.BackSide, depthWrite:false,
    vertexShader:`varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:NOISE + `varying vec3 vD; void main(){ vec3 d=normalize(vD); vec3 bn=normalize(vec3(.35,.82,.45)); float b=dot(d,bn);
      float band=exp(-pow(b/.2,2.)); float n=fbm(d*3.2+3.), n2=fbm(d*7.+11.);
      float dust=smoothstep(.45,.75,fbm(d*5.5+7.))*band;
      vec3 c=mix(vec3(.02,.022,.03),vec3(.11,.105,.1),n)*band*.8; c+=vec3(.35,.28,.2)*pow(band,4.)*n2*.35; c-=vec3(.06)*dust;
      
      gl_FragColor=vec4(max(c,0.),1.); }`}));
  S.scene.add(sky);
  const BN = new THREE.Vector3(.35, .82, .45).normalize();
  const starLayer = (n, r0, size, op) => { const g = new THREE.BufferGeometry(), p = [], c = [], col = new THREE.Color();
    for(let i = 0; i < n; i++){ const v = new THREE.Vector3().randomDirection(); if(Math.random() < .55){ v.addScaledVector(BN, -v.dot(BN) * (.75 + Math.random() * .2)).normalize(); }
      v.multiplyScalar(r0 + Math.random() * 60); p.push(v.x, v.y, v.z); col.setHSL(Math.random() < .2 ? .08 : .6 + Math.random() * .08, .5, .75 + Math.random() * .25); c.push(col.r, col.g, col.b); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({size, vertexColors:true, transparent:true, opacity:op, depthWrite:false})); };
  S.scene.add(starLayer(3500, 420, .7, .55));

  // ---- الشمس: سطح يغلي + حافة منورة + ألسنة لهب حول الحافة ----
  const SR = 3.4;
  const sunMat = new THREE.ShaderMaterial({uniforms:{t:{value:0}},
    vertexShader:`varying vec3 vO; varying vec3 vN; varying vec3 vP; void main(){ vO=position; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:NOISE + `uniform float t; varying vec3 vO; varying vec3 vN; varying vec3 vP;
      void main(){ vec3 p=normalize(vO)*3.2;
        vec3 q=vec3(fbm(p+t*.05),fbm(p+vec3(5.2,1.3,2.8)-t*.04),fbm(p+vec3(1.7,9.2,4.1)+t*.03));
        float f=fbm(p*1.6+q*2.4+t*.02);                       // تيارات ملتوية
        float cells=1.-abs(n3(normalize(vO)*26.+t*.15)*2.-1.); // حبيبات صغيرة
        float h=clamp(f*1.25+cells*.22-.18,0.,1.);
        vec3 c=mix(vec3(.55,.09,.0),vec3(1.25,.42,.03),smoothstep(.05,.45,h)); c=mix(c,vec3(1.9,1.05,.25),smoothstep(.45,.8,h)); c=mix(c,vec3(2.6,2.1,1.2),smoothstep(.82,1.,h));
        float mu=max(dot(normalize(-vP),vN),0.); c*=.75+.25*mu; c+=vec3(2.,1.1,.4)*pow(1.-mu,3.)*.9; // حافة منورة
        gl_FragColor=vec4(c,1.); }`});
  const sunM = new THREE.Mesh(new THREE.SphereGeometry(SR, 96, 96), sunMat); S.scene.add(sunM);
  // ألسنة اللهب والخيوط حول الحافة (لوح يواجه الكاميرا دايماً)
  const flareMat = new THREE.ShaderMaterial({uniforms:{t:{value:0}}, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    vertexShader:`varying vec2 vUv; void main(){ vUv=uv*2.-1.; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:NOISE + `uniform float t; varying vec2 vUv;
      void main(){ float r=length(vUv), a=atan(vUv.y,vUv.x); float R=.4; if(r<R*.985) discard;
        float d=(r-R)/R;                                           // المسافة عن الحافة
        float s1=fbm(vec3(cos(a)*3.,sin(a)*3.,d*3.-t*.18)), s2=fbm(vec3(cos(a)*9.,sin(a)*9.,d*6.-t*.3));
        float strands=pow(smoothstep(.45,.92,s2),1.8)*exp(-d*4.5)*1.3;   // خيوط رفيعة
        float flames=smoothstep(.32,.78,s1)*exp(-d*8.)*1.2;               // ألسنة قريبة من الحافة
        float glow=exp(-d*14.)*1.+exp(-d*4.)*.14;                      // هالة قريبة
        vec3 c=vec3(1.9,.75,.16)*(strands+flames)+vec3(2.2,1.2,.45)*glow;
        float al=clamp(strands+flames+glow,0.,1.);
        gl_FragColor=vec4(c*al,al); }`});
  const flare = new THREE.Mesh(new THREE.PlaneGeometry(SR * 5, SR * 5), flareMat); S.scene.add(flare);
  const corona2 = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0, 'rgba(255,190,110,.28)'], [.3, 'rgba(255,120,40,.05)'], [1, 'rgba(0,0,0,0)']]), blending:THREE.AdditiveBlending, depthWrite:false}));
  corona2.scale.setScalar(SR * 9); S.scene.add(corona2);
  S.scene.add(new THREE.PointLight(0xFFF2E0, 3200, 0, 1.7), new THREE.AmbientLight(0x8890b0, .55));

  // ---- الكواكب ----
  const P = {}, now0 = new Date();
  const atmMat = col => new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(col)}}, transparent:true, depthWrite:false, side:THREE.BackSide, blending:THREE.AdditiveBlending,
    vertexShader:`varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`uniform vec3 c; varying vec3 vN; varying vec3 vP; void main(){ float i=pow(max(.75-dot(vN,normalize(-vP)),0.),3.2); gl_FragColor=vec4(c*i*.9,1.); }`});
  await Promise.all(keys.map(async k => {
    const I = INFO[k], map = await tex(TX + I.map);
    const g = new THREE.Group(); S.scene.add(g);
    I.size *= 1.8; const m = new THREE.Mesh(new THREE.SphereGeometry(I.size, 64, 64), new THREE.MeshBasicMaterial({map})); m.userData.k = k; g.add(m); // بدون ظل عشان يبان الكوكب كامل
    if(k === 'saturn'){
      const r0 = I.size * (k === 'saturn' ? 1.25 : 1.5), r1 = I.size * (k === 'saturn' ? 2.35 : 1.75), rg = new THREE.RingGeometry(r0, r1, 128, 2);
      const uv = rg.attributes.uv, ps = rg.attributes.position; for(let i = 0; i < uv.count; i++){ const r = Math.hypot(ps.getX(i), ps.getY(i)); uv.setXY(i, (r - r0) / (r1 - r0), .5); }
      const rm = k === 'saturn' ? new THREE.MeshBasicMaterial({map:await tex(TX + 'saturnringcolor.jpg'), alphaMap:await tex(TX + 'saturnringpattern.gif', false), transparent:true, side:THREE.DoubleSide, depthWrite:false})
        : new THREE.MeshBasicMaterial({color:0x9BE7F0, transparent:true, opacity:.35, side:THREE.DoubleSide, depthWrite:false});
      const ring = new THREE.Mesh(rg, rm); ring.rotation.x = -Math.PI / 2 + (k === 'saturn' ? .47 : 1.55); g.add(ring);
    }
    if(k === 'uranus') m.rotation.z = 1.7;
    let moon = null; if(k === 'earth'){ moon = new THREE.Mesh(new THREE.SphereGeometry(.14, 32, 32), new THREE.MeshBasicMaterial({map:await tex(TX + 'moonmap1k.jpg')})); g.add(moon); }
    const o = elems(k, now0), N = 360, pts = [], Es = [];
    for(let i = 0; i <= N; i++){ const E = i / N * Math.PI * 2; Es.push(E); pts.push(vis(orbitPt(o.a, o.e, o.I, o.w * rad - o.O, o.O, E))); }
    const lg = new THREE.BufferGeometry().setFromPoints(pts), cols = new Float32Array((N + 1) * 3); lg.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const line = new THREE.Line(lg, new THREE.LineBasicMaterial({vertexColors:true, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false})); S.scene.add(line);
    const lab = document.createElement('div'); lab.className = 'lab'; lab.innerHTML = '<b style="color:' + I.col + '">' + I.ar + '</b><span>' + I.per + '</span>'; hero.appendChild(lab);
    P[k] = {g, m, moon, lab, line, cols, Es, base:new THREE.Color(k === 'earth' ? 0x7FC8FF : k === 'pluto' ? 0x8A7F9E : 0x6F86C8), tip:new THREE.Color(I.col)};
  }));
  // ---- حزام الكويكبات وحزام كايبر ----
  function belt(n, a0, a1, h, size, colA, colB){
    const geo = new THREE.IcosahedronGeometry(1, 0), pos = geo.attributes.position; for(let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) * (.7 + Math.random() * .6), pos.getY(i) * (.6 + Math.random() * .5), pos.getZ(i) * (.7 + Math.random() * .6)); geo.computeVertexNormals();
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({roughness:1, metalness:0, flatShading:true}), n), d = new THREE.Object3D(), c = new THREE.Color();
    for(let i = 0; i < n; i++){ const a = Math.random() * Math.PI * 2, r = vr(a0 + Math.random() * (a1 - a0)) + (Math.random() - .5) * .5;
      d.position.set(Math.cos(a) * r, (Math.random() - .5) * h, Math.sin(a) * r); d.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); d.scale.setScalar(size * (.35 + Math.random() ** 3 * 1.6)); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
      c.copy(colA).lerp(colB, Math.random()); mesh.setColorAt(i, c); }
    S.scene.add(mesh); return mesh;
  }

  // ---- الحركة والتحكم ----
  const PRI = ['jupiter','saturn','earth','uranus','neptune','mars','venus','mercury','pluto'];
  let simDays = 0, playing = false, sel = null, flyT = 1, viewK = 0, idleT = 0;
  const camFrom = new THREE.Vector3(), camTo = new THREE.Vector3(), tgtFrom = new THREE.Vector3(), tgtTo = new THREE.Vector3(), OVER = new THREE.Vector3(0, 22, 34);
  const simDate = () => new Date(Date.now() + simDays * 864e5);
  function place(){ const d = simDate(); keys.forEach(k => { const h = helio(k, d), o = P[k]; o.g.position.copy(vis(h)); o.E = h.E;
    for(let i = 0; i < o.Es.length; i++){ let b = (o.E - o.Es[i]) % (2 * Math.PI); if(b < 0) b += 2 * Math.PI; const k2 = Math.exp(-b * 1.6) * .9, base = .16;
      o.cols[i * 3] = o.base.r * base + o.tip.r * k2; o.cols[i * 3 + 1] = o.base.g * base + o.tip.g * k2; o.cols[i * 3 + 2] = o.base.b * base + o.tip.b * k2; }
    o.line.geometry.attributes.color.needsUpdate = true; }); }
  place();
  S.camera.position.set(0, 230, 40); ctl.target.set(0, 0, 0);
  let introT = reduce ? 1 : 0; const introFrom = S.camera.position.clone();
  ctl.addEventListener('start', () => { ctl.autoRotate = false; idleT = 0; });
  function flyTo(k){
    sel = k; flyT = 0; camFrom.copy(S.camera.position); tgtFrom.copy(ctl.target); ctl.autoRotate = false;
    [...el.querySelectorAll('#d8chips button')].forEach(b => b.classList.toggle('on', b.dataset.k === k));
    if(!k){ tgtTo.set(0, 0, 0); camTo.copy(OVER); card.classList.remove('on'); return; }
    const p = P[k].g.position, s = INFO[k].size; tgtTo.copy(p); camTo.copy(p).sub(p.clone().setLength(s * 8 + 2)).add(new THREE.Vector3(s * 2, s * 2.4 + .8, 0));
    fillCard(k); card.classList.add('on');
  }
  function fillCard(k){
    const I = INFO[k], d = simDate(), pe = helio('earth', d), pk = helio(k, d), dE = pk.distanceTo(pe) * AU, dS = pk.length() * AU, when = simDays ? 'بهذا التاريخ' : 'الحين';
    card.innerHTML = `<button class="x" aria-label="إغلاق">✕</button><h3 style="color:${I.col}">${I.ar}</h3><div class="sb">${I.sub}</div>` +
      (k === 'earth' ? `<div class="big"><div class="k">البعد عن الشمس ${when}</div><b>${km(dS)}</b><small>ضو الشمس يوصلنا بـ ${lt(dS / 299792.458)}</small></div>`
        : `<div class="big"><div class="k">البعد عن الأرض ${when}</div><b>${km(dE)}</b><small>إشارة الراديو توصله بـ ${lt(dE / 299792.458)}</small></div>`) +
      `<div class="gr"><div>عن الشمس<b>${km(dS).replace(' كم', '')}</b></div><div>القطر<b>${I.d} كم</b></div><div>الأقمار<b>${I.moons}</b></div><div>يومه<b>${I.day}</b></div><div>سنته<b>${I.yr}</b></div><div>الحرارة<b>${I.temp}</b></div></div><div class="ft">${I.fact}</div>`;
    card.querySelector('.x').onclick = () => flyTo(null);
  }
  el.querySelectorAll('#d8chips button').forEach(b => b.onclick = () => flyTo(b.dataset.k === sel ? null : b.dataset.k));
  let downAt = null;
  S.renderer.domElement.addEventListener('pointerdown', e => downAt = [e.clientX, e.clientY]);
  S.renderer.domElement.addEventListener('pointerup', e => { if(!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return; const r = S.renderer.domElement.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width * 2 - 1, my = -(e.clientY - r.top) / r.height * 2 + 1;
    let best = null, bd = 1e9; keys.forEach(k => { const v = P[k].g.position.clone().project(S.camera); const dpx = Math.hypot((v.x - mx) * r.width / 2, (v.y - my) * r.height / 2); if(v.z < 1 && dpx < 28 && dpx < bd){ bd = dpx; best = k; } });
    if(best) flyTo(best); });
  const playBtn = el.querySelector('#d8sp'), simEl = el.querySelector('#d8ss');
  playBtn.onclick = () => { playing = !playing; playBtn.textContent = playing ? '❚❚' : '▶'; };
  el.querySelector('#d8sr').onclick = () => { simDays = 0; playing = false; playBtn.textContent = '▶'; place(); if(sel) fillCard(sel); };
  let lastT = 0, cardT = 0;
  const stop = loop(t => {
    const dt = Math.min(.05, t - lastT); lastT = t;
    if(introT < 1){ introT = Math.min(1, t / 3.2); const e = 1 - Math.pow(1 - introT, 3); S.camera.position.lerpVectors(introFrom, OVER, e); if(introT >= 1 && !sel) ctl.autoRotate = !reduce; }
    if(playing){ simDays += dt * 30; place(); if(sel && (cardT += dt) > .25){ fillCard(sel); cardT = 0; } }
    if(!sel && !ctl.autoRotate && introT >= 1 && !reduce && (idleT += dt) > 8) ctl.autoRotate = true;
    sunMat.uniforms.t.value = t; flareMat.uniforms.t.value = t; sunM.rotation.y += dt * .015; flare.quaternion.copy(S.camera.quaternion);
    keys.forEach((k, i) => { const o = P[k]; o.m.rotation.y += dt * (k === 'venus' ? -.06 : .3 + i * .02); if(o.moon){ const a = t * .9; o.moon.position.set(Math.cos(a) * .95, .1, Math.sin(a) * .95); } });
    if(flyT < 1){ flyT = Math.min(1, flyT + dt / 1.6); const e = flyT < .5 ? 4 * flyT ** 3 : 1 - Math.pow(-2 * flyT + 2, 3) / 2; S.camera.position.lerpVectors(camFrom, camTo, e); ctl.target.lerpVectors(tgtFrom, tgtTo, e); }
    else if(sel){ const p = P[sel].g.position, d = p.clone().sub(ctl.target); ctl.target.add(d); S.camera.position.add(d); }
    ctl.update();
    viewK += ((sel ? 1 : 0) - viewK) * .08; const w = hero.clientWidth, h = hero.clientHeight;
    if(viewK > .01) S.camera.setViewOffset(w, h, 0, h * .27 * viewK, w, h); else S.camera.clearViewOffset();
    const cd = S.camera.position;
    // الأسماء: ما تركب على بعض (الكواكب الكبيرة لها الأولوية)
    const boxes = [];
    PRI.forEach(k => { const o = P[k], v = o.g.position.clone().project(S.camera), off = INFO[k].size * 1.2 + .3, top = o.g.position.clone().add(new THREE.Vector3(0, -off, 0)).project(S.camera);
      const x = (v.x + 1) / 2 * w, y = (1 - top.y) / 2 * h + 4; o.lab.style.left = x + 'px'; o.lab.style.top = y + 'px';
      const bx = [x - 30, y - 2, x + 30, y + 30], hit = boxes.some(b => bx[0] < b[2] && bx[2] > b[0] && bx[1] < b[3] && bx[3] > b[1]);
      const show = !(v.z > 1 || (sel && sel !== k && cd.distanceTo(o.g.position) > 25) || sel === k || hit); if(show) boxes.push(bx); o.lab.style.opacity = show ? 1 : 0; });
    if(simDays){ const d = simDate(); simEl.innerHTML = '<b>' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + '</b>+' + Math.round(simDays) + ' يوم'; } else simEl.innerHTML = '';
    comp.render();
  });
  // ---- الأحداث الفلكية ----
  const EV = buildEvents(helio), evl = el.querySelector('#evl'), evf = el.querySelector('#evf'), feat = el.querySelector('#evfeat');
  const MON = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const inDays = d => { const n = Math.ceil((d - Date.now()) / 864e5); return n <= 0 ? 'اليوم' : n === 1 ? 'باچر' : n === 2 ? 'بعد يومين' : n <= 10 ? 'بعد ' + n + ' أيام' : 'بعد ' + n + ' يوم'; };
  let evType = 'imp';
  const io = new IntersectionObserver(es => es.forEach(x => { if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }), {root:root, threshold:.1});
  const DSH = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
  const openM = new Set();
  function renderEvents(){
    const Y = new Date().getFullYear(), all = EV.filter(e => evType === 'all' || (evType === 'imp' ? e.imp : e.type === evType));
    const nxt = all.find(e => e.d.getFullYear() > Y), list = all.filter(e => e.d.getFullYear() === Y).concat(nxt ? [nxt] : []); // أحداث هالسنة + أول حدث بالسنة الجاية
    const groups = []; list.forEach(e => { const k = e.d.getFullYear() * 12 + e.d.getMonth(); let g = groups[groups.length - 1]; if(!g || g.k !== k){ g = {k, d:e.d, items:[]}; groups.push(g); } g.items.push(e); });
    evl.innerHTML = groups.map((g, gi) => { const open = true;
      return '<div class="mg' + (open ? ' open' : '') + '" data-k="' + g.k + '"><button class="mh"><b>' + MON[g.d.getMonth()] + ' ' + g.d.getFullYear() + '</b><span>' + (g.items.length === 1 ? 'حدث واحد' : g.items.length === 2 ? 'حدثين' : g.items.length + (g.items.length <= 10 ? ' أحداث' : ' حدث')) + '</span><i class="chev"></i></button>' +
        '<div class="mi">' + g.items.map(e => '<div class="er" data-i="' + EV.indexOf(e) + '"><button class="eh"><span class="dd"><b>' + e.d.getDate() + '</b>' + DSH[e.d.getDay()] + '</span><span class="ic">' + icon(e) + '</span><span class="tt">' + e.title + '</span><i class="chev"></i></button>' +
          '<div class="ed">' + e.sub + (e.time ? ' · الساعة ' + t12(e.d) + ' ' + ap(e.d) : '') + (e.tag ? '<span class="tg ' + (e.good ? 'g' : '') + '">' + e.tag + '</span>' : '') + (e.planet ? '<button class="go">شوفه بالمجسم ←</button>' : '') + '</div></div>').join('') + '</div></div>'; }).join('') || '<p class="evs">ما فيه أحداث بهالتصنيف.</p>';
    evl.querySelectorAll('.mh').forEach(h => h.onclick = () => { const m = h.parentElement, k = +m.dataset.k; m.classList.toggle('open'); m.classList.contains('open') ? openM.add(k) : openM.delete(k); });
    evl.querySelectorAll('.eh').forEach(h => h.onclick = () => h.parentElement.classList.toggle('open'));
    evl.querySelectorAll('.go').forEach(b => b.onclick = () => { const e = EV[+b.closest('.er').dataset.i]; root.scrollTo({top:0, behavior:reduce ? 'auto' : 'smooth'}); setTimeout(() => flyTo(e.planet), 350); });
  }
  function tickEv(){ return; const f = EV.find(e => (evType === 'all' || e.type === evType)), cd = el.querySelector('#evcd'); if(!f || !cd) return; const s = Math.max(0, Math.floor((f.d - Date.now()) / 1000));
    cd.innerHTML = [[Math.floor(s / 86400), 'يوم'], [Math.floor(s / 3600) % 24, 'ساعة'], [Math.floor(s / 60) % 60, 'دقيقة'], [s % 60, 'ثانية']].map(([v, l]) => '<div><b>' + String(v).padStart(2, '0') + '</b><span>' + l + '</span></div>').join(''); }
  const scope = k => { const Y = new Date().getFullYear(), a = EV.filter(e => k === 'all' || (k === 'imp' ? e.imp : e.type === k)), n = a.find(e => e.d.getFullYear() > Y); return a.filter(e => e.d.getFullYear() === Y).concat(n ? [n] : []); };
  evf.innerHTML = TYPES.map(([k, n]) => '<button data-t="' + k + '" class="' + (k === 'imp' ? 'on' : '') + '">' + n + ' <small style="opacity:.6">' + scope(k).length + '</small></button>').join('');
  evf.querySelectorAll('button').forEach(b => b.onclick = () => { evType = b.dataset.t; evf.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); renderEvents(); });
  el.querySelector('#evsub').textContent = 'باقي أحداث ' + new Date().getFullYear() + ' وأول حدث بـ ' + (new Date().getFullYear() + 1);
  renderEvents();
  const tick = () => { tickEv(); const n = new Date(), {next} = nextPrayer(n), r = remain(next.at, n);
    document.getElementById('d8sd').textContent = DAYS[n.getDay()] + ' ' + n.getDate() + ' ' + MONTHS[n.getMonth()]; document.getElementById('d8sh').textContent = hijri(n);
    document.getElementById('d8sc').textContent = t12(n) + ' ' + ap(n); document.getElementById('d8sn').textContent = next.name;
    document.getElementById('d8st').textContent = t12(next.at) + ' ' + ap(next.at); document.getElementById('d8sr2').textContent = 'باقي ' + remainAr(r); };
  tick(); const iv = setInterval(tick, 1000);
  return () => { stop(); clearInterval(iv); io.disconnect(); ro.disconnect(); ctl.dispose(); comp.dispose(); S.dispose(); };
}
