/* الأحداث الفلكية: جزء محسوب (أطوار القمر، تقابل الكواكب، استطالة الزهرة وعطارد) وجزء من التقويم المعروف (الكسوف والخسوف والشهب والفصول) */
const DAY = 864e5;
const METEORS = [
  ['الرباعيات', 1, 3, 110, 'زخة قوية بس قصيرة، أحسن وقت قبل الفجر'],
  ['القيثاريات', 4, 22, 18, 'شهب سريعة ولامعة أحياناً'],
  ['إيتا الدلويات', 5, 6, 50, 'من بقايا مذنب هالي، أحسن قبل الفجر'],
  ['البرشاويات', 8, 12, 100, 'أشهر زخة بالصيف، شهب لامعة وكثيرة'],
  ['الجباريات', 10, 21, 20, 'من بقايا مذنب هالي'],
  ['الأسديات', 11, 17, 15, 'شهب سريعة جداً'],
  ['التوأميات', 12, 14, 150, 'أقوى زخة شهب بالسنة، تبدأ من أول الليل'],
  ['الدبيات الصغرى', 12, 22, 10, 'زخة خفيفة قريبة من الشمال']];
// الكسوف والخسوف (التواريخ من كتالوج ناسا، بالتوقيت العالمي)
const ECLIPSES = [
  ['2027-02-06', 'sun', 'كسوف حلقي للشمس', 'يبان بأمريكا الجنوبية والمحيط الأطلسي وغرب أفريقيا · ما يبان بالكويت'],
  ['2027-02-20', 'moon', 'خسوف شبه ظلي للقمر', 'خفيف جداً، القمر يغمق شوي بس'],
  ['2027-07-18', 'moon', 'خسوف شبه ظلي للقمر', 'خفيف جداً وصعب يلاحَظ'],
  ['2027-08-02', 'sun', 'كسوف كلي للشمس', 'مساره يمر بمصر والسعودية (جدة ومكة) واليمن، والكلي يطول قرابة 6 دقائق · بالكويت كسوف جزئي كبير'],
  ['2027-08-17', 'moon', 'خسوف شبه ظلي للقمر', 'خفيف جداً'],
  ['2028-01-12', 'moon', 'خسوف جزئي للقمر', 'جزء صغير من القمر يدخل ظل الأرض'],
  ['2028-01-26', 'sun', 'كسوف حلقي للشمس', 'يبان بأمريكا الجنوبية وإسبانيا · ما يبان بالكويت'],
  ['2028-07-06', 'moon', 'خسوف جزئي للقمر', 'يبان بأجزاء من آسيا وأستراليا وأفريقيا'],
  ['2028-07-22', 'sun', 'كسوف كلي للشمس', 'يبان بأستراليا ونيوزيلندا · ما يبان بالكويت'],
  ['2028-12-31', 'moon', 'خسوف كلي للقمر', 'القمر يحمر بالكامل، يبان من آسيا وأوروبا']];
const SEASONS = [['2026-12-21', 'الانقلاب الشتوي', 'أقصر نهار وأطول ليل بالسنة'], ['2027-03-20', 'الاعتدال الربيعي', 'الليل والنهار متساويين تقريباً'], ['2027-06-21', 'الانقلاب الصيفي', 'أطول نهار بالسنة'],
  ['2027-09-23', 'الاعتدال الخريفي', 'الليل والنهار متساويين تقريباً'], ['2027-12-22', 'الانقلاب الشتوي', 'أقصر نهار بالسنة'], ['2028-03-20', 'الاعتدال الربيعي', 'الليل والنهار متساويين تقريباً'], ['2028-06-20', 'الانقلاب الصيفي', 'أطول نهار بالسنة']];
const PL = {mercury:'عطارد', venus:'الزهرة', mars:'المريخ', jupiter:'المشتري', saturn:'زحل', uranus:'أورانوس', neptune:'نبتون'};

function lonOf(v){ return Math.atan2(-v.z, v.x); } // خط الطول البروجي من إحداثيات المشهد
function elong(helio, k, d){ const e = helio('earth', d), p = helio(k, d), a = p.clone().sub(e), s = e.clone().negate();
  const ang = Math.acos(Math.max(-1, Math.min(1, a.dot(s) / a.length() / s.length()))) * 180 / Math.PI;
  let east = (lonOf(a) - lonOf(s)) * 180 / Math.PI; east = ((east % 360) + 360) % 360; return {ang, evening:east < 180}; }

export function buildEvents(helio, from = new Date(), span = 550){
  const out = [], end = new Date(from.getTime() + span * DAY), within = d => d >= from && d <= end;
  // الشهب
  for(let y = from.getFullYear(); y <= end.getFullYear(); y++) METEORS.forEach(([n, m, dd, z, note]) => { const d = new Date(y, m - 1, dd, 2); if(!within(d)) return;
    const ill = Math.round(SunCalc.getMoonIllumination(d).fraction * 100);
    out.push({d, type:'meteor', title:'ذروة شهب ' + n, sub:note + ' · حتى ' + z + ' شهاب بالساعة', tag:ill > 55 ? 'القمر منور ' + ill + '% ويضايق الرؤية' : 'القمر خفيف ' + ill + '%، مشاهدة ممتازة', good:ill <= 55, imp:z >= 50}); });
  ECLIPSES.forEach(([ds, kind, t, s]) => { const d = new Date(ds + 'T12:00:00Z'); if(within(d)) out.push({d, type:'eclipse', kind, title:t, sub:s, good:/بالكويت جزئي|من آسيا/.test(s), imp:!/شبه ظلي/.test(t)}); });
  SEASONS.forEach(([ds, t, s]) => { const d = new Date(ds + 'T12:00:00'); if(within(d)) out.push({d, type:'season', title:t, sub:s, imp:true}); });
  for(let y = from.getFullYear(); y <= end.getFullYear(); y++){ const d = new Date(y, 7, 24, 4); if(within(d)) out.push({d, type:'season', title:'طلوع سهيل', sub:'يبان سهيل جهة الجنوب قبل الفجر، وتبدأ الحرارة تخف شوي شوي', imp:true}); }
  // أطوار القمر (بدر ومحاق) + البدر العملاق
  let prev = SunCalc.getMoonIllumination(from).phase;
  for(let t = from.getTime() + 6 * 3600e3; t < end.getTime(); t += 6 * 3600e3){
    const ph = SunCalc.getMoonIllumination(new Date(t)).phase;
    const cross = (a, b, x) => (a < x && b >= x);
    if(cross(prev, ph, .5) || (prev > ph && false)){ let lo = t - 6 * 3600e3, hi = t; for(let i = 0; i < 20; i++){ const m = (lo + hi) / 2; SunCalc.getMoonIllumination(new Date(m)).phase < .5 ? lo = m : hi = m; }
      const d = new Date(hi), dist = SunCalc.getMoonPosition(d, 29.37, 47.98).distance, sup = dist < 362000;
      out.push({d, type:'moon', phase:.5, title:sup ? 'بدر عملاق' : 'بدر', sub:(sup ? 'القمر أقرب من العادة ويبان أكبر وأنور · ' : '') + 'بعده ' + Math.round(dist).toLocaleString('en') + ' كم', time:true, good:sup, imp:sup}); }
    if(prev > .9 && ph < .1){ let lo = t - 6 * 3600e3, hi = t; for(let i = 0; i < 20; i++){ const m = (lo + hi) / 2; SunCalc.getMoonIllumination(new Date(m)).phase > .5 ? lo = m : hi = m; }
      out.push({d:new Date(hi), type:'moon', phase:0, title:'محاق (قمر جديد)', sub:'ليالي ما فيها قمر: أحسن وقت لتصوير النجوم والمجرة', time:true}); }
    prev = ph;
  }
  // التقابل (أحسن وقت تشوف الكوكب طول الليل) والاستطالة العظمى للزهرة وعطارد
  const keys = ['mercury','venus','mars','jupiter','saturn','uranus','neptune'], E = {};
  keys.forEach(k => E[k] = []);
  for(let t = from.getTime() - DAY; t <= end.getTime() + DAY; t += DAY){ const d = new Date(t); keys.forEach(k => E[k].push({d, ...elong(helio, k, d)})); }
  keys.forEach(k => { const a = E[k]; for(let i = 1; i < a.length - 1; i++){ const x = a[i]; if(!(x.ang > a[i - 1].ang && x.ang >= a[i + 1].ang) || !within(x.d)) continue;
    if(k === 'mercury' || k === 'venus'){ out.push({d:x.d, type:'planet', planet:k, title:'أبعد ظهور ' + (k === 'venus' ? 'للزهرة' : 'لعطارد') + ' عن الشمس', sub:(x.evening ? 'يبان بالمغرب جهة الغرب بعد الغروب' : 'يبان قبل الشروق جهة الشرق') + ' · ' + Math.round(x.ang) + '° عن الشمس', good:true, imp:k === 'venus'}); }
    else if(x.ang > 170){ const dE = helio(k, x.d).distanceTo(helio('earth', x.d)) * 149.6; out.push({d:x.d, type:'planet', planet:k, title:'تقابل ' + PL[k], sub:'أقرب وألمع ما يكون، يطلع مع الغروب ويبان طول الليل · ' + (dE >= 1000 ? (dE / 1000).toFixed(2) + ' مليار كم' : Math.round(dE) + ' مليون كم'), good:true, imp:['mars','jupiter','saturn'].includes(k)}); } } });
  return out.sort((a, b) => a.d - b.d);
}

export const TYPES = [['imp','المهم'],['all','الكل'],['meteor','شهب'],['eclipse','الكسوف'],['moon','القمر'],['planet','الكواكب'],['season','الفصول']];
export function icon(e){
  if(e.type === 'meteor') return '<svg viewBox="0 0 40 40"><path d="M6 8 L28 26" stroke="url(#gm)" stroke-width="3" stroke-linecap="round"/><path d="M14 4 L30 18" stroke="url(#gm)" stroke-width="1.6" stroke-linecap="round" opacity=".6"/><circle cx="30" cy="28" r="4" fill="#FFE6A8"/><defs><linearGradient id="gm" x1="0" x2="1"><stop offset="0" stop-color="#FFE6A8" stop-opacity="0"/><stop offset="1" stop-color="#FFE6A8"/></linearGradient></defs></svg>';
  if(e.type === 'eclipse') return e.kind === 'sun' ? '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="#FFB347"/><circle cx="20" cy="20" r="15" fill="none" stroke="#FFB347" stroke-opacity=".35" stroke-width="3"/><circle cx="23" cy="18" r="11.5" fill="#0b0e1c"/></svg>'
    : '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="#B3452C"/><circle cx="16" cy="17" r="12" fill="#e9e2d6" opacity=".25"/></svg>';
  if(e.type === 'moon') return e.phase ? '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="#ECE6D8"/><circle cx="16" cy="16" r="2.5" fill="#c9c1b0"/><circle cx="24" cy="24" r="3" fill="#c9c1b0"/></svg>' : '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="#1a1e30" stroke="#5b6386" stroke-width="1.4"/></svg>';
  if(e.type === 'planet') return '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="9" fill="#E8C690"/><ellipse cx="20" cy="20" rx="16" ry="5" fill="none" stroke="#E8C690" stroke-width="1.6" transform="rotate(-18 20 20)"/></svg>';
  return '<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="8" fill="#FFC46B"/><path d="M4 28 H36" stroke="#8FA0C8" stroke-width="1.6"/>' + [0, 45, 90, 135, 180].map(a => '<path d="M20 22 L' + (20 + Math.cos(Math.PI + a * Math.PI / 180) * 15).toFixed(1) + ' ' + (22 + Math.sin(Math.PI + a * Math.PI / 180) * 15).toFixed(1) + '" stroke="#FFC46B" stroke-width="1.4" opacity=".55"/>').join('') + '</svg>';
}
