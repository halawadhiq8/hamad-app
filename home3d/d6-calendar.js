import {css, tilt as tiltCtl} from './kit.js';
import {P2, DAYS, MONTHS, t12, ap, nextPrayer, remain, remainAr, hijri, sun, weather, reduce} from './data.js';
export const note = 'تقويم ورقي معلّق مثل تقويم العجيري بألوان أزرق وأبيض هادية: أول ما تفتح، ورقة أمس تنقطع وتطيح بحركة 3D وتطلع ورقة اليوم. الرقم بالأزرق يوم الجمعة. فيها الهجري والنجم والصلاة. اضغط على التقويم تنقطع الورقة مرة ثانية.';

// نجوم الوسم وما بعده (تقريبي حسب التقويم الكويتي)
const SEASONS = [['10-16','الوسم · نجم الغفر'],['10-29','الوسم · نجم الزبانا'],['11-11','الوسم · نجم الإكليل'],['11-24','الوسم · نجم القلب'],['12-07','المربعانية · بداية البرد'],['01-15','الشبط'],['02-10','العقارب'],['03-21','الحميميات'],['04-15','الذراعين'],['05-10','الثريا'],['06-07','التويبع'],['07-16','الجوزاء'],['08-24','سهيل · طلوع سهيل']];
function season(d){ const md = P2(d.getMonth() + 1) + '-' + P2(d.getDate()); let s = 'المربعانية'; SEASONS.slice().sort((x, y) => x[0] < y[0] ? -1 : 1).forEach(([k, v]) => { if(md >= k) s = v; }); return s; }

export async function mount(root){
  css('d6css', `
  .d6{position:relative; min-height:100%; font-family:'Amiri',serif; color:#24405F; background:#E8EDF3;
    background-image:radial-gradient(90% 60% at 50% 20%,rgba(255,255,255,.55),transparent 70%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.65' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 .3 0 0 0 0 .38 0 0 0 0 .5 0 0 0 .08 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E"); perspective:1100px;}
  .d6 .nail{position:absolute; top:22px; left:50%; width:12px; height:12px; margin-left:-6px; border-radius:50%; background:radial-gradient(circle at 35% 35%,#d9d9d9,#555); box-shadow:0 2px 3px rgba(0,0,0,.4); z-index:3;}
  .d6 .string{position:absolute; top:28px; left:50%; width:120px; height:46px; margin-left:-60px; border:1.5px solid #6a7d93; border-bottom:0; border-radius:60px 60px 0 0; transform:scaleY(.9); z-index:2;}
  .d6 .cal{position:relative; margin:58px auto 0; width:286px; transform-style:preserve-3d; transition:transform .25s ease-out; cursor:pointer;}
  .d6 .clip{height:40px; border-radius:10px 10px 4px 4px; background:linear-gradient(180deg,#4A74A6,#3A5F8C); position:relative; z-index:5; box-shadow:0 6px 10px -6px rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; color:#F3F7FC; font-family:'Reem Kufi',sans-serif; font-size:15px; letter-spacing:.5px;}
  .d6 .clip::before,.d6 .clip::after{content:''; position:absolute; top:-6px; width:14px; height:14px; border-radius:50%; background:#2b2b2b; box-shadow:inset 0 2px 2px rgba(255,255,255,.3);}
  .d6 .clip::before{right:40px;} .d6 .clip::after{left:40px;}
  .d6 .stack{position:relative; transform-style:preserve-3d;}
  .d6 .stack::after{content:''; position:absolute; inset:auto 2px -10px 2px; height:12px; background:repeating-linear-gradient(180deg,#f3f6fa 0 2px,#cfd9e6 2px 3px); border-radius:0 0 4px 4px; box-shadow:0 18px 26px -14px rgba(30,50,80,.35);}
  .d6 .pg{position:relative; background:#F8FAFD; padding:16px 18px 18px; text-align:center; transform-origin:50% 0; border-radius:0 0 3px 3px; backface-visibility:hidden; box-shadow:inset 0 1px 0 #dde5ef;}
  .d6 .pg::before{content:''; position:absolute; top:0; left:0; right:0; height:8px; background:radial-gradient(circle at 6px 0,transparent 4px,#F8FAFD 4.5px) 0 0/12px 8px repeat-x;}
  .d6 .pg.old{position:absolute; inset:0; z-index:4; transform:translateZ(2px); box-shadow:0 14px 24px -12px rgba(0,0,0,.35);}
  .d6 .pg.tear{animation:tear 1.35s cubic-bezier(.45,.05,.55,.95) forwards;}
  @keyframes tear{0%{transform:translateZ(2px) rotateX(0);}22%{transform:translateZ(2px) rotateX(34deg) rotateZ(-3deg);}100%{transform:translateZ(120px) translateY(560px) translateX(-90px) rotateX(150deg) rotateZ(-28deg); opacity:.2;}}
  .d6 .gm{display:flex; justify-content:space-between; font-size:17px; color:#24405F; border-bottom:1px solid #24405F; padding-bottom:6px;}
  .d6 .num{font-size:150px; font-weight:700; line-height:1; margin:6px 0 -6px; color:#24405F; font-variant-numeric:lining-nums;}
  .d6 .num.fri{color:#4A74A6;}
  .d6 .day{font-family:'Reem Kufi',sans-serif; font-size:30px; font-weight:600;}
  .d6 .hj{font-size:20px; color:#4A74A6; margin-top:4px;}
  .d6 .ss{margin-top:10px; font-size:15px; border-top:1px dashed #b7c6d8; border-bottom:1px dashed #b7c6d8; padding:6px 0;}
  .d6 .tm{display:grid; grid-template-columns:repeat(3,1fr); font-size:14px; margin-top:10px;}
  .d6 .tm b{display:block; font-family:'Readex Pro',sans-serif; font-weight:500; font-size:16px; direction:ltr;}
  .d6 .tag{position:relative; width:300px; margin:44px auto 0; display:grid; grid-template-columns:1.25fr 1fr; gap:10px; padding-bottom:40px;}
  .d6 .tag div{background:#24405F; color:#F3F7FC; border-radius:6px; padding:14px 14px 12px; font-family:'Readex Pro',sans-serif; font-size:11.5px; box-shadow:0 10px 18px -12px rgba(0,0,0,.6); transform:rotate(-1.2deg);}
  .d6 .tag div:last-child{background:#4A74A6; transform:rotate(1.4deg);}
  .d6 .tag b{display:block; font-family:'Amiri',serif; font-size:28px; line-height:1.1; margin-top:2px;}
  .d6 .tag small{opacity:.8;}
  `);
  const n = new Date(), y = new Date(n.getTime() - 864e5), s = sun(n), {list} = nextPrayer(n);
  const page = (d, cls) => `<div class="pg ${cls || ''}"><div class="gm"><span>${MONTHS[d.getMonth()]}</span><span>${d.getFullYear()}</span></div>
    <div class="num ${d.getDay() === 5 ? 'fri' : ''}">${d.getDate()}</div><div class="day">${DAYS[d.getDay()]}</div><div class="hj">${hijri(d)}</div><div class="ss">${season(d)}</div>
    <div class="tm"><div>الفجر<b>${t12(list[0].at)}</b></div><div>الشروق<b>${t12(s.rise)}</b></div><div>المغرب<b>${t12(list[3].at)}</b></div></div></div>`;
  root.innerHTML = `<div class="d6"><div class="nail"></div><div class="string"></div><div class="cal" id="d6cal"><div class="clip">كشكولي ${n.getFullYear()}</div><div class="stack" id="d6st">${page(n)}${page(y, 'old')}</div></div>
    <div class="tag"><div><small>الصلاة الجاية · <span id="d6t"></span></small><b id="d6n">—</b><small id="d6r"></small></div><div><small>الحرارة</small><b id="d6w">--°</b><small id="d6wd"></small></div></div></div>`;
  const el = root.firstElementChild, cal = el.querySelector('#d6cal'), st = el.querySelector('#d6st');
  const tear = () => { const o = st.querySelector('.pg.old'); if(!o) return; if(reduce){ o.remove(); return; } o.classList.add('tear'); setTimeout(() => o.remove(), 1400); };
  const t0 = setTimeout(tear, 700);
  cal.onclick = () => { if(st.querySelector('.pg.old')) return; st.insertAdjacentHTML('beforeend', page(n, 'old')); requestAnimationFrame(() => requestAnimationFrame(tear)); };
  const tc = tiltCtl(el); let raf = 0;
  const lp = () => { const [tx, ty] = tc.get(); cal.style.transform = 'rotateY(' + (tx * 7) + 'deg) rotateX(' + (-ty * 5) + 'deg)'; raf = requestAnimationFrame(lp); }; if(!reduce) lp();
  const tick = () => { const n = new Date(), {next} = nextPrayer(n), r = remain(next.at, n);
    document.getElementById('d6n').textContent = next.name; document.getElementById('d6t').textContent = t12(next.at) + ' ' + ap(next.at); document.getElementById('d6r').textContent = 'باقي ' + remainAr(r); };
  tick(); const iv = setInterval(tick, 1000);
  weather().then(w => { document.getElementById('d6w').textContent = w.temp + '°'; document.getElementById('d6wd').textContent = w.desc + ' · غبار ' + (w.dust ?? '--'); });
  return () => { clearTimeout(t0); clearInterval(iv); cancelAnimationFrame(raf); tc.off(); };
}
