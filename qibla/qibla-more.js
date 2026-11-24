/* ١٠ خريطة الطريق */
add({n:'خريطة الطريق', s:'خط من بيتك لمكة', tag:'الأوضح جغرافياً', idea:'خريطة حقيقية للمنطقة عليها خط ذهبي من موقعك لمكة، ومن موقعك يطلع مخروط يبين وين جوالك يطالع.', ux:'تفهم ليش القبلة بهالاتجاه: تشوف الطريق نفسه لمكة. لما يغطي المخروط الخط، أنت صح.', motion:'المخروط يلف معك، والخط يمشي فيه نور من بيتك لمكة لما تتطابق.',
  html:'<svg class="mapq" viewBox="0 0 360 360"></svg>',
  init(el){
    const z = 5, W = 256 * 2 ** z, px = (la, lo) => { const r = la * R; return [(lo + 180) / 360 * W, (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * W]; };
    const k = px(LOC.lat, LOC.lng), m = px(MECCA.lat, MECCA.lng), cx = (k[0] + m[0]) / 2, cy = (k[1] + m[1]) / 2, x0 = cx - 180, y0 = cy - 180;
    let s = '<defs><clipPath id="mclip"><rect width="360" height="360" rx="28"/></clipPath><radialGradient id="cone"><stop offset="0" stop-color="#F4B860" stop-opacity=".55"/><stop offset="1" stop-color="#F4B860" stop-opacity="0"/></radialGradient></defs><g clip-path="url(#mclip)"><rect width="360" height="360" fill="#121520"/>';
    for(let tx = Math.floor(x0 / 256); tx <= Math.floor((x0 + 360) / 256); tx++) for(let ty = Math.floor(y0 / 256); ty <= Math.floor((y0 + 360) / 256); ty++)
      s += '<image href="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/' + z + '/' + ty + '/' + tx + '" x="' + (tx * 256 - x0) + '" y="' + (ty * 256 - y0) + '" width="256" height="256"/>';
    const K = [k[0] - x0, k[1] - y0], M = [m[0] - x0, m[1] - y0];
    s += '<line x1="' + K[0] + '" y1="' + K[1] + '" x2="' + M[0] + '" y2="' + M[1] + '" stroke="#F4B860" stroke-width="2.5" stroke-dasharray="6 7" class="route"/>';
    s += '<g class="cone" transform="translate(' + K[0] + ' ' + K[1] + ')"><path d="M0 0 L-46 -150 A158 158 0 0 1 46 -150 Z" fill="url(#cone)"/></g>';
    s += '<circle cx="' + K[0] + '" cy="' + K[1] + '" r="7" fill="#F4B860" stroke="#06080D" stroke-width="3"/><text x="' + (K[0] + 12) + '" y="' + (K[1] - 10) + '" font-size="12" fill="#ECEAF3" font-family="Readex Pro">أنت</text>';
    s += '<use href="#kaaba" x="' + (M[0] - 18) + '" y="' + (M[1] - 18) + '" width="36" height="36"/><text x="' + M[0] + '" y="' + (M[1] + 30) + '" text-anchor="middle" font-size="12" fill="#ECEAF3" font-family="Readex Pro">مكة</text>';
    s += '<text x="18" y="30" font-size="12" fill="#F4B860" font-family="Readex Pro">↑ ش N</text></g><rect width="360" height="360" rx="28" fill="none" stroke="rgba(255,255,255,.1)"/>';
    el.querySelector('.mapq').innerHTML = s; const rt = el.querySelector('.route'); if(!RM) rt.animate([{strokeDashoffset:0},{strokeDashoffset:-26}], {duration:1200, iterations:Infinity}); },
  draw(el, h, ok){ const c = el.querySelector('.mapq .cone'), t = c.getAttribute('transform').replace(/ rotate\([^)]*\)/, ''); c.setAttribute('transform', t + ' rotate(' + h + ')');
    el.querySelector('.route').setAttribute('stroke-width', ok ? 4 : 2.5); el.querySelector('.route').style.filter = ok ? 'drop-shadow(0 0 6px #F4B860)' : 'none'; }});

/* ١١ الهلال */
add({n:'الهلال والنجمة', s:'هلال ذهبي يأشر', tag:'الأكثر رمزية', idea:'المؤشر هلال ذهبي ونجمة، يدورون داخل حلقة درجات رفيعة. النجمة دايماً على اتجاه القبلة.', ux:'رمز واضح ومحبوب، والنجمة نقطة وحدة سهلة تتابعها بعينك.', motion:'الهلال يلف بنابض ناعم، ولما تتطابق يمتلي نور وتلمع النجمة.',
  html:'<svg class="cres" viewBox="0 0 300 300"></svg>',
  init(el){ let s = '<defs><radialGradient id="crg"><stop offset="0" stop-color="#1A2140"/><stop offset="1" stop-color="#0A0D18"/></radialGradient></defs><circle cx="150" cy="150" r="140" fill="url(#crg)" stroke="rgba(255,255,255,.08)"/><path d="M150 4 l-7 -10 h14z" transform="translate(0 14)" fill="#F4B860"/><g class="rot">';
    for(let a = 0; a < 360; a += 5) s += '<line x1="150" y1="16" x2="150" y2="' + (a % 45 ? 21 : 28) + '" stroke="rgba(236,234,243,' + (a % 45 ? .2 : .65) + ')" transform="rotate(' + a + ' 150 150)"/>';
    DIRS.forEach(([ar, en, a]) => s += '<text x="150" y="46" text-anchor="middle" font-size="12" fill="' + (a ? '#ECEAF3' : '#F4B860') + '" font-family="Readex Pro" transform="rotate(' + a + ' 150 150)">' + ar + ' ' + en + '</text>');
    s += '</g><g class="moon"><path class="cr" d="M88 112 A66 66 0 1 0 212 112 A78 78 0 0 1 88 112 Z" fill="rgba(244,184,96,.08)" stroke="url(#gGold)" stroke-width="2.2" stroke-linejoin="round"/><path class="star" d="M150 70 l4.4 9.6 10.4 1-7.8 7 2.3 10.2-9.3-5.4-9.3 5.4 2.3-10.2-7.8-7 10.4-1z" fill="#F4B860"/><line x1="150" y1="64" x2="150" y2="40" stroke="#F4B860" stroke-width="1.5" stroke-dasharray="3 3"/></g>';
    el.querySelector('.cres').innerHTML = s; },
  draw(el, h, ok){ el.querySelector('.cres .rot').setAttribute('transform', 'rotate(' + (-h) + ' 150 150)'); el.querySelector('.cres .moon').setAttribute('transform', 'rotate(' + diffOf(h) + ' 150 150)');
    const cr = el.querySelector('.cres .cr'); cr.setAttribute('fill', ok ? 'rgba(244,184,96,.55)' : 'rgba(244,184,96,.08)'); el.querySelector('.cres .star').style.filter = ok ? 'drop-shadow(0 0 8px #FFE3A6)' : 'none'; }});

/* ١٢ ميزان الفقاعة */
add({n:'ميزان الفقاعة', s:'مثل ميزان الماء', tag:'الأكثر لمساً', idea:'أنبوب منحني مثل ميزان الماء (ميزان البنّاي) وفيه فقاعة ذهبية. خلها توقف بين الخطين بالنص.', ux:'فكرة يعرفها الكل: «خل الفقاعة بالنص». ما تحتاج تفهم درجات أو اتجاهات.', motion:'الفقاعة تتمايل وترتد مثل سائل حقيقي، وتتوهج لما تثبت بالنص.',
  html:'<svg class="bub" viewBox="0 0 320 260"></svg><div class="bub-k">' + KB() + '</div>',
  init(el){ el.querySelector('.bub').innerHTML = '<defs><linearGradient id="tube" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2440"/><stop offset=".5" stop-color="#2A3560"/><stop offset="1" stop-color="#121830"/></linearGradient><radialGradient id="bb" cx=".4" cy=".35"><stop offset="0" stop-color="#FFF6DD"/><stop offset=".5" stop-color="#F4B860"/><stop offset="1" stop-color="#C9802F"/></radialGradient></defs>' +
    '<path d="M24 120 Q160 230 296 120" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="58" stroke-linecap="round"/><path d="M24 120 Q160 230 296 120" fill="none" stroke="url(#tube)" stroke-width="50" stroke-linecap="round"/>' +
    '<path d="M30 112 Q160 214 290 112" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3" stroke-linecap="round"/>' +
    [-1, 1].map(s2 => '<line x1="' + (160 + s2 * 22) + '" y1="148" x2="' + (160 + s2 * 22) + '" y2="200" stroke="#F4B860" stroke-width="2"/>').join('') +
    [-60, -30, 30, 60].map(o => { const t = .5 + o / 272, x = (1 - t) ** 2 * 24 + 2 * (1 - t) * t * 160 + t * t * 296, y = (1 - t) ** 2 * 120 + 2 * (1 - t) * t * 230 + t * t * 120; return '<line x1="' + x + '" y1="' + (y - 22) + '" x2="' + x + '" y2="' + (y + 22) + '" stroke="rgba(255,255,255,.18)"/>'; }).join('') +
    '<ellipse class="b" rx="20" ry="16" fill="url(#bb)"/><text x="40" y="236" font-size="12" fill="#9095AB" font-family="Readex Pro">يسار</text><text x="280" y="236" text-anchor="end" font-size="12" fill="#9095AB" font-family="Readex Pro">يمين</text>'; },
  draw(el, h, ok){ const d = Math.max(-90, Math.min(90, diffOf(h))), t = .5 + d / 200, x = (1 - t) ** 2 * 24 + 2 * (1 - t) * t * 160 + t * t * 296, y = (1 - t) ** 2 * 120 + 2 * (1 - t) * t * 230 + t * t * 120;
    const b = el.querySelector('.bub .b'); b.setAttribute('cx', x); b.setAttribute('cy', y - 2); b.style.filter = ok ? 'drop-shadow(0 0 10px #FFE3A6)' : 'none';
    el.querySelector('.bub-k').classList.toggle('on', ok); }});

/* ١٣ سجادة الصلاة */
add({n:'سجادة الصلاة', s:'السجادة تلف للقبلة', tag:'الأقرب للواقع', idea:'سجادة صلاة مرسومة من فوق بنقوشها ومحرابها. السجادة تلف وتوريك بالضبط شلون تفرشها، وراسها دايماً للقبلة.', ux:'بدل الحسابات: «افرش سجادتك مثل اللي بالشاشة». مفيدة وقت السفر بالفندق.', motion:'السجادة تلف بثقل وظل ناعم، ولما يصير راسها لفوق تتوهج وتطلع الكعبة فوقها.',
  html:'<div class="rug-w"><div class="rug-k">' + KB() + '</div><svg class="rug" viewBox="0 0 150 250"></svg></div>',
  init(el){ let s = '<defs><linearGradient id="rugg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A2234"/><stop offset="1" stop-color="#4E1424"/></linearGradient><pattern id="rp" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M7 0 L14 7 L7 14 L0 7Z" fill="none" stroke="rgba(244,184,96,.35)" stroke-width=".8"/></pattern></defs>';
    s += '<g stroke="rgba(236,220,190,.7)" stroke-width="1">' + Array.from({length:12}, (_, i) => '<line x1="' + (16 + i * 10.5) + '" y1="238" x2="' + (16 + i * 10.5) + '" y2="249"/>').join('') + '</g>';
    s += '<rect x="8" y="6" width="134" height="232" rx="6" fill="url(#rugg)"/><rect x="16" y="14" width="118" height="216" rx="3" fill="none" stroke="#F4B860" stroke-width="1.2"/><rect x="22" y="20" width="106" height="204" fill="url(#rp)" opacity=".7"/>';
    s += '<path d="M30 220 V78 C30 48 52 32 75 22 C98 32 120 48 120 78 V220 Z" fill="#3A0F1B" stroke="#F4B860" stroke-width="1.4"/><path d="M75 46 l5 10 -5 10 -5 -10z" fill="#F4B860"/><circle cx="75" cy="160" r="20" fill="none" stroke="rgba(244,184,96,.55)"/><circle cx="75" cy="160" r="6" fill="#F4B860" opacity=".8"/>';
    el.querySelector('.rug').innerHTML = s; },
  draw(el, h, ok){ el.querySelector('.rug').style.transform = 'rotate(' + diffOf(h) + 'deg)'; el.querySelector('.rug-w').classList.toggle('on', ok); }});

/* ١٤ الأرقام فقط */
add({n:'الرقم الكبير', s:'تصميم طباعي بسيط', tag:'الأنظف', idea:'بدون أي دائرة: رقم ضخم يقول كم درجة باقي، وأسهم متحركة تبين لوين تلف، والخلفية تتلون ذهبي كل ما قربت.', ux:'مفهوم من بعيد وبنظرة وحدة، حتى لو الجوال على الأرض.', motion:'الأسهم تتحرك باتجاه اللفة، والرقم يعد تنازلياً، والخلفية تسخن لين تصير ذهبية كاملة.',
  html:'<div class="ty"><div class="ty-bg"></div><div class="ty-n">0°</div><div class="ty-ch"><i></i><i></i><i></i></div><div class="ty-t"></div><div class="ty-bar"><i></i></div></div>',
  init(){},
  draw(el, h, ok){ const d = diffOf(h), a = Math.abs(d), p = Math.max(0, 1 - a / 180);
    el.querySelector('.ty-n').textContent = ok ? '✓' : Math.round(a) + '°';
    el.querySelector('.ty-t').textContent = ok ? 'أنت متجه للقبلة' : (d > 0 ? 'لف يمين' : 'لف يسار');
    el.querySelector('.ty-ch').className = 'ty-ch ' + (ok ? 'hide' : d > 0 ? 'r' : 'l');
    el.querySelector('.ty-bg').style.opacity = (p ** 3).toFixed(3); el.querySelector('.ty-bar i').style.transform = 'scaleX(' + p + ')'; el.querySelector('.ty').classList.toggle('ok', ok); }});
