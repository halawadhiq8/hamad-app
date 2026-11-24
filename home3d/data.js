/* بيانات حقيقية مشتركة لكل التصاميم: الموقع، الطقس، الصلاة، الشمس والقمر، القبلة */
export const LOC = (() => { try{ const s = JSON.parse(localStorage.getItem('rihala_loc') || 'null'); if(s && s.lat) return s; }catch(e){} return {lat:29.3759, lng:47.9774}; })();
export const P2 = n => String(n).padStart(2, '0');
export const AR = {fajr:'الفجر', sunrise:'الشروق', dhuhr:'الظهر', asr:'العصر', maghrib:'المغرب', isha:'العشاء'};
export const DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
export const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
export const t12 = d => { const h = d.getHours() % 12 || 12; return h + ':' + P2(d.getMinutes()); };
export const ap = d => d.getHours() < 12 ? 'ص' : 'م';
export const WMO = {0:'صافي',1:'صافي غالباً',2:'غائم جزئياً',3:'غائم',45:'ضباب',48:'ضباب',51:'رذاذ',53:'رذاذ',55:'رذاذ',61:'مطر خفيف',63:'مطر',65:'مطر غزير',80:'زخات',81:'زخات',82:'زخات قوية',95:'رعد',96:'رعد وبرد',99:'رعد وبرد'};

export function prayers(date = new Date()){
  const c = new adhan.Coordinates(LOC.lat, LOC.lng), t = new adhan.PrayerTimes(c, date, adhan.CalculationMethod.Kuwait());
  return ['fajr','sunrise','dhuhr','asr','maghrib','isha'].map(k => ({k, name:AR[k], at:t[k]}));
}
export function nextPrayer(now = new Date()){
  const list = prayers(now).filter(p => p.k !== 'sunrise'), tom = prayers(new Date(now.getTime() + 864e5)).filter(p => p.k !== 'sunrise');
  const all = list.concat(tom), i = all.findIndex(p => p.at > now);
  return {next:all[i], prev:i > 0 ? all[i - 1] : null, list};
}
export const remain = (to, now = new Date()) => { const s = Math.max(0, Math.floor((to - now) / 1000)); return {h:Math.floor(s / 3600), m:Math.floor(s / 60) % 60, s:s % 60, total:s}; };
export const remainAr = r => { const hs = r.h === 0 ? '' : r.h === 1 ? 'ساعة' : r.h === 2 ? 'ساعتين' : r.h + ' ساعات', ms = r.m === 0 ? '' : r.m === 1 ? 'دقيقة' : r.m === 2 ? 'دقيقتين' : r.m <= 10 ? r.m + ' دقائق' : r.m + ' دقيقة'; return [hs, ms].filter(Boolean).join(' و ') || 'أقل من دقيقة'; };
export const hijri = (d = new Date(), opt = {day:'numeric', month:'long', year:'numeric'}) => { try{ return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', opt).format(d); }catch(e){ return ''; } };
export const qibla = () => adhan.Qibla(new adhan.Coordinates(LOC.lat, LOC.lng));
export const sun = (d = new Date()) => { const p = SunCalc.getPosition(d, LOC.lat, LOC.lng), t = SunCalc.getTimes(d, LOC.lat, LOC.lng); return {alt:p.altitude, az:p.azimuth + Math.PI, rise:t.sunrise, set:t.sunset, noon:t.solarNoon}; };
export const moon = (d = new Date()) => SunCalc.getMoonIllumination(d);

let W = null, WP = null;
export function weather(){
  if(W) return Promise.resolve(W); if(WP) return WP;
  const q = 'latitude=' + LOC.lat + '&longitude=' + LOC.lng + '&timezone=auto';
  WP = Promise.allSettled([
    fetch('https://api.open-meteo.com/v1/forecast?' + q + '&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code,uv_index,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&forecast_days=1').then(r => r.json()),
    fetch('https://air-quality-api.open-meteo.com/v1/air-quality?' + q + '&current=us_aqi,dust').then(r => r.json())
  ]).then(([w, a]) => {
    const c = w.value && w.value.current ? w.value : null, aq = a.value && a.value.current ? a.value.current : {};
    W = c ? {temp:Math.round(c.current.temperature_2m), feels:Math.round(c.current.apparent_temperature), wind:Math.round(c.current.wind_speed_10m), windDir:c.current.wind_direction_10m,
      code:c.current.weather_code, desc:WMO[c.current.weather_code] || '—', uv:Math.round(c.current.uv_index || 0), hum:c.current.relative_humidity_2m,
      hi:Math.round(c.daily.temperature_2m_max[0]), lo:Math.round(c.daily.temperature_2m_min[0]), aqi:aq.us_aqi != null ? Math.round(aq.us_aqi) : null, dust:aq.dust != null ? Math.round(aq.dust) : null}
      : {temp:'--', feels:'--', wind:'--', windDir:0, desc:'—', uv:'--', hum:'--', hi:'--', lo:'--', aqi:null, dust:null};
    return W;
  });
  return WP;
}
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* حلقة رسم تقف لما تتبدل الواجهة */
export function loop(fn){ let raf = 0, on = true, t0 = performance.now(); const f = t => { if(!on) return; fn((t - t0) / 1000); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => { on = false; cancelAnimationFrame(raf); }; }
