(function () {
  'use strict';

  var COIN_PRICE = 523; // تومان
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fa = function (n) { return Math.round(n).toLocaleString('fa-IR'); };
  var toEn = function (s) {
    return String(s)
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 1776; })
      .replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632; })
      .replace(/[^\d.]/g, '');
  };

  /* ---------- Data ---------- */
  var funds = [
    { name: 'صندوق درآمد ثابت', desc: 'سود روزشمار، مناسب حفظ ارزش پس‌انداز', risk: 1, label: 'ریسک کم' },
    { name: 'صندوق طلای گلدیس', desc: 'سرمایه‌گذاری در طلا، بدون نگهداری فیزیکی', risk: 2, label: 'ریسک متوسط' },
    { name: 'صندوق‌های مختلط', desc: 'ترکیب سهام و اوراق، تعادل رشد و ریسک', risk: 2, label: 'ریسک متوسط' },
    { name: 'صندوق‌های سهامی', desc: 'سرمایه‌گذاری در بورس، رشد بالقوه بیشتر', risk: 3, label: 'ریسک بالا' }
  ];
  var presets = [
    { n1: 5, avg: 105, avgLabel: '۱۰ میلیون تومان' },
    { n1: 15, avg: 300, avgLabel: '۳۰۰ میلیون تومان' },
    { n1: 30, avg: 10000, avgLabel: '۱۰ میلیارد' }
  ];
  var personas = [
    { who: 'مشاوران مالی، بیمه و املاک', h: 'مشتریانی که به دنبال جای امن برای سرمایه‌اند', d: 'معرفی یک محصول مجاز و کم‌ریسک؛ تا زمانی که سرمایه مشتری بماند، سهم روزانه ادامه دارد. مسیر سفیر نوین از همین‌جا آغاز می‌شود.', q: 'مشتری می‌ماند؛ سهم هر روز ادامه دارد.' },
    { who: 'صاحبان کسب‌وکار', h: 'شبکه‌ای از همکاران و تأمین‌کنندگان', d: 'زمان زیادی لازم نیست. ارسال لینک کافی است؛ ثبت‌نام و همراهی سرمایه‌گذار با کارشناسان تأمین سرمایه نوین است.', q: 'ارسال لینک؛ ادامه کار با نوین.' },
    { who: 'فعالان شبکه‌های اجتماعی', h: 'مخاطبانی که به یک صدا گوش می‌دهند', d: 'مأموریت‌ها از روز نخست سکه تنوین می‌دهند و پنج بازاریاب برتر هر ماه از استخر ماهانه جایزه می‌گیرند.', q: 'هر معرفی، یک قدم تا جایزه ماه.' }
  ];
  var missions = [
    { tag: 'مأموریت ۱', n: 'شروع بازاریابی', s: 'یک‌بار برای هر بازاریاب', note: 'تنوین · یک‌بار', repeat: false, done: 1, steps: [
      { t: 'دوره آموزشی سطح ۱', c: 200 },
      { t: 'نخستین معرفی فعال', c: 300 },
      { t: '۳ معرفی فعال در ۳۰ روز', c: 500 } ] },
    { tag: 'مأموریت ۲', n: 'هر معرفی', s: 'برای هر سرمایه‌گذار، تکرارشونده', note: 'تنوین · به ازای هر نفر', repeat: true, done: 1, steps: [
      { t: 'معرفی فعال', c: 50 },
      { t: 'ماندگاری ۶ ماهه', c: 50 },
      { t: 'ماندگاری ۱۲ ماهه', c: 50 } ] }
  ];
  var faqs = [
    ['آیا بازاریابی نیاز به سرمایه‌گذاری شخصی دارد؟', 'خیر. سهم معرفی، مأموریت‌ها و نشان‌ها هیچ شرط سرمایه شخصی ندارند.'],
    ['آیا از سود سرمایه‌گذار کم می‌شود؟', 'خیر. سهم بازاریاب را نوین می‌پردازد و سود و سرمایه سرمایه‌گذار دست‌نخورده می‌ماند.'],
    ['«معرفی فعال» یعنی چه؟', 'سرمایه‌گذار تازه با کد ملی جدید که دست‌کم ۱۰ میلیون تومان از حساب خود واریز کرده و ۳۰ روز در صندوق مانده است.'],
    ['کدام صندوق‌ها مشمول طرح‌اند؟', 'همه صندوق‌های تأمین سرمایه نوین، از جمله درآمد ثابت، طلای گلدیس و ETF.'],
    ['سهم بازاریاب چه زمانی واریز می‌شود؟', 'سهم بازاریاب روزشمار محاسبه می‌شود و به‌صورت سکه تنوین در حساب کاربری او ثبت می‌شود. در شش ماه نخست طرح، سکه‌های تنوین قابل نقد کردن نیستند؛ پس از آن، به معادل ارزش روز نقره خرید و فروش می‌شوند.'],
    ['اگر سرمایه‌گذار سرمایه خود را برداشت کند؟', 'سهم بازاریاب تا آخرین روزی که سرمایه در صندوق باشد، هر روز محاسبه و پرداخت می‌شود. همه سکه‌های دریافت‌شده تا آن روز در کیف پول بازاریاب باقی می‌مانند و در زمان مقتضی قابل برداشت خواهند بود.'],
    ['سکه تنوین چیست؟', 'سکه دیجیتال شبکه تنوین که هر واحد آن در شروع معادل یک سوت نقره با خلوص ۹۹۹ است. ارزشش با قیمت نقره و با افزایش ماهانه پشتوانه از محل استخر تغییر می‌کند.'],
    ['آیا سهم معرفی تضمینی است؟', 'خیر. مقدار آن به دارایی و ماندگاری سرمایه‌گذاران معرفی‌شده و ارزش روز سکه تنوین بستگی دارد.']
  ];

  /* ---------- Render static lists ---------- */
  $('#funds').innerHTML = funds.map(function (f) {
    var bars = [1, 2, 3].map(function (i) { return '<i' + (i <= f.risk ? ' class="on"' : '') + '></i>'; }).join('');
    return '<div class="mini"><b>' + f.name + '</b><span>' + f.desc + '</span><span class="risk" role="img" aria-label="' + f.label + '">' + bars + '</span></div>';
  }).join('');


  $('#personas').innerHTML = personas.map(function (p) {
    return '<div class="persona"><span class="who">' + p.who + '</span><h3>' + p.h + '</h3><p>' + p.d + '</p><p class="q">' + p.q + '</p></div>';
  }).join('');

  /* ---------- Missions: journey map ---------- */
  // محور افقی (درصد از چپ، راست‌به‌چپ): شروع → مرحله ۱ → ۲ → ۳
  var M_START = { x: 95, y: 88 };
  var M_X = [74, 46, 18];
  var M_TOP = 16; // بالاترین نقطه = مجموع کامل سکه‌ها

  function missionHTML(m, mi) {
    var total = m.steps.reduce(function (a, s) { return a + s.c; }, 0);
    var cum = 0;
    var pts = [M_START];
    var nodes = '';
    var rows = '';
    m.steps.forEach(function (s, i) {
      cum += s.c;
      var y = M_START.y - (cum / total) * (M_START.y - M_TOP);
      pts.push({ x: M_X[i], y: y });
      var st = i < m.done ? 'is-done' : (i === m.done ? 'is-next' : '');
      var label = fa(i + 1) + '. ' + s.t + '، ' + fa(s.c) + ' تنوین' + (i < m.done ? '، انجام شد' : '');
      nodes += '<div class="jnode ' + st + '" style="left:' + M_X[i] + '%;top:' + y.toFixed(2) + '%">' +
        '<button type="button" class="jnode__dot" data-m="' + mi + '" data-s="' + i + '" aria-pressed="' + (i < m.done) + '" aria-label="' + label + '">' + fa(i + 1) + '</button>' +
        '<span class="jnode__bubble">+' + fa(s.c) + ' · مجموع ' + fa(cum) + '</span></div>';
      rows += '<li class="jstep ' + st + '"><span>۰' + fa(i + 1) + ' ' + s.t + '</span><small>' +
        fa(s.c) + ' تنوین' + (i < m.done ? ' · واریز شد' : '') + '</small></li>';
    });
    // نقطه‌ها (درصد) روی svg ذخیره می‌شوند؛ drawJourneys آن‌ها را به پیکسل تبدیل و فلش‌ها را می‌کشد
    var ptsAttr = pts.map(function (p) { return p.x + ',' + p.y.toFixed(2); }).join(' ');

    return '<article class="mission">' +
      '<div class="mission__top">' +
        '<div class="mission__h"><span class="mission__tag">' + m.tag + '</span><h3>' + m.n + '</h3><small>' + m.s + '</small></div>' +
        '<div class="mission__total"><strong>' + fa(total) + '</strong><small>' + m.note + '</small></div>' +
      '</div>' +
      '<ol class="mission__steps">' + rows + '</ol>' +
      '<div class="journey">' +
        '<svg class="journey__svg" aria-hidden="true" data-m="' + mi + '" data-done="' + m.done + '" data-pts="' + ptsAttr + '"></svg>' +
        '<div class="jstart" style="left:' + M_START.x + '%;top:' + M_START.y + '%"><i></i><span>شروع</span></div>' +
        nodes +
      '</div>' +
      (m.repeat ? '<p class="mission__repeat">این سه مرحله برای هر سرمایه‌گذار معرفی‌شده دوباره تکرار می‌شود.</p>' : '') +
    '</article>';
  }
  // مسیر را با مختصات پیکسلی واقعی می‌کشد تا سر فلش‌ها کشیده و کج نشوند
  var NODE_R = 22, START_R = 6, ARROW_GAP = 5;
  function drawJourneys() {
    $$('.journey__svg').forEach(function (svg) {
      var w = svg.clientWidth, h = svg.clientHeight;
      if (!w || !h) return;
      var done = +svg.dataset.done, id = svg.dataset.m;
      var pts = svg.dataset.pts.split(' ').map(function (s) {
        var p = s.split(','); return { x: +p[0] / 100 * w, y: +p[1] / 100 * h };
      });
      var out = '<defs>' +
        '<marker id="jarrow-done-' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path class="jarrow jarrow--done" d="M1 1 9 5 1 9z"/></marker>' +
        '<marker id="jarrow-todo-' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path class="jarrow jarrow--todo" d="M1 1 9 5 1 9z"/></marker>' +
        '</defs>' +
        '<line class="jline jline--base" x1="0" y1="' + pts[0].y + '" x2="' + w + '" y2="' + pts[0].y + '"/>';
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / len, uy = dy / len;
        var r0 = (i === 1 ? START_R : NODE_R) + 2, r1 = NODE_R + ARROW_GAP; // از لبه دایره تا لبه دایره بعد
        var kind = i <= done ? 'done' : 'todo';
        out += '<line class="jline jline--' + kind + '" marker-end="url(#jarrow-' + kind + '-' + id + ')"' +
          ' x1="' + (a.x + ux * r0).toFixed(1) + '" y1="' + (a.y + uy * r0).toFixed(1) + '"' +
          ' x2="' + (b.x - ux * r1).toFixed(1) + '" y2="' + (b.y - uy * r1).toFixed(1) + '"/>';
      }
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.innerHTML = out;
    });
  }
  function renderMissions() {
    $('#missionList').innerHTML = missions.map(missionHTML).join('');
    drawJourneys();
  }
  renderMissions();
  var jRaf;
  window.addEventListener('resize', function () { cancelAnimationFrame(jRaf); jRaf = requestAnimationFrame(drawJourneys); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawJourneys);
  // کلیک روی هر دایره: تا آن مرحله پر می‌شود؛ کلیک دوباره روی آخرین مرحله پر، آن را خالی می‌کند
  $('#missionList').addEventListener('click', function (e) {
    var b = e.target.closest('.jnode__dot');
    if (!b) return;
    var m = missions[+b.dataset.m], i = +b.dataset.s;
    m.done = (m.done === i + 1) ? i : i + 1;
    renderMissions();
    var again = $('.jnode__dot[data-m="' + b.dataset.m + '"][data-s="' + i + '"]');
    if (again) again.focus();
  });

  /* ---------- Accordions ---------- */
  function setOpen(item, open) {
    item.classList.toggle('is-open', open);
    var btn = item.querySelector('button');
    btn.setAttribute('aria-expanded', open);
  }
  $$('.acc__item').forEach(function (item) {
    item.querySelector('.acc__btn').addEventListener('click', function () {
      setOpen(item, !item.classList.contains('is-open'));
    });
  });

  var faqOpen = 4;
  $('#faqList').innerHTML = faqs.map(function (f, i) {
    return '<div class="faq__item' +(i === faqOpen ? ' is-open' : '') + '">' +
      '<button type="button" class="faq__btn" aria-expanded="' + (i === faqOpen) + '"><span>' + f[0] + '</span><i class="pm" aria-hidden="true"></i></button>' +
      '<div class="acc__panel"><div><p class="faq__a">' + f[1] + '</p></div></div></div>';
  }).join('');
  var faqItems = $$('#faqList .faq__item');
  faqItems.forEach(function (item) {
    item.querySelector('.faq__btn').addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');
      faqItems.forEach(function (o) { setOpen(o, false); });
      setOpen(item, willOpen);
    });
  });

  /* ---------- Calculator ---------- */
  var state = { avg: 105, n1: 10, n2: 0, n3: 0, preset: -1 };
  var avgIn = $('#avg'), n1In = $('#n1'), n2In = $('#n2'), n3In = $('#n3');

  $('#presets').innerHTML = presets.map(function (p, i) {
    return '<button type="button" class="preset" aria-pressed="false" data-i="' + i + '"><span>معرفی ' + fa(p.n1) + ' سرمایه‌گذار مستقیم با میانگین ' + p.avgLabel + '</span></button>';
  }).join('');
  var presetBtns = $$('#presets .preset');
  presetBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var p = presets[+b.dataset.i];
      state = { avg: p.avg, n1: p.n1, n2: 0, n3: 0, preset: +b.dataset.i };
      syncInputs();
      calc(true);
    });
  });

  // اسلایدر میانگین سرمایه لگاریتمی است: ۱۰ میلیون تا ۱۰ میلیارد تومان
  var AVG_MIN = 10, AVG_SPAN = 1000;
  function avgFromSlider(v) {
    var n = AVG_MIN * Math.pow(AVG_SPAN, v / 1000);
    return n < 100 ? Math.round(n) : n < 1000 ? Math.round(n / 5) * 5 : Math.round(n / 50) * 50;
  }
  function sliderFromAvg(a) { return Math.round(1000 * Math.log(a / AVG_MIN) / Math.log(AVG_SPAN)); }
  function setFill(input) {
    input.style.setProperty('--p', ((input.value - input.min) / (input.max - input.min) * 100) + '%');
  }

  function syncInputs() {
    avgIn.value = sliderFromAvg(state.avg);
    n1In.value = state.n1;
    n2In.value = state.n2;
    n3In.value = state.n3;
  }

  // عدد به حروف فارسی (۱ تا ۹۹۹) — برای نمایش میانگین سرمایه
  var W_ONES = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  var W_TEENS = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  var W_TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  var W_HUND = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  function words999(n) {
    var parts = [], h = Math.floor(n / 100), r = n % 100;
    if (h) parts.push(W_HUND[h]);
    if (r >= 10 && r < 20) parts.push(W_TEENS[r - 10]);
    else { if (Math.floor(r / 10)) parts.push(W_TENS[Math.floor(r / 10)]); if (r % 10) parts.push(W_ONES[r % 10]); }
    return parts.join(' و ');
  }
  // مقدار به میلیون تومان ← «صد و پنج میلیون تومان» / «یک میلیارد و پانصد میلیون تومان»
  function millionsToWords(m) {
    var b = Math.floor(m / 1000), r = m % 1000, out = [];
    if (b) out.push(words999(b) + ' میلیارد');
    if (r) out.push(words999(r) + ' میلیون');
    return out.join(' و ') + ' تومان';
  }

  avgIn.addEventListener('input', function () { state.avg = avgFromSlider(+avgIn.value); state.preset = -1; calc(false); });
  [[n1In, 'n1'], [n2In, 'n2'], [n3In, 'n3']].forEach(function (pair) {
    pair[0].addEventListener('input', function () { state[pair[1]] = +pair[0].value; state.preset = -1; calc(false); });
  });

  function calc(flash) {
    var avgM = Math.max(10, state.avg || 0);
    var a = avgM * 1e6;
    var N1 = Math.max(0, state.n1 || 0), N2 = Math.max(0, state.n2 || 0), N3 = Math.max(0, state.n3 || 0);
    var yr = a * (N1 * 0.012 + N2 * 0.004 + N3 * 0.002);

    $('#monthly').textContent = fa(yr / 12);
    $('#mCoins').textContent = fa(yr / 12 / COIN_PRICE);
    $('#dCoins').textContent = fa(yr / 365 / COIN_PRICE);
    $('#avgFa').textContent = millionsToWords(Math.round(avgM));
    $('#n1fa').textContent = fa(N1) + ' نفر';
    $('#n2fa').textContent = fa(N2) + ' نفر';
    $('#n3fa').textContent = fa(N3) + ' نفر';
    [avgIn, n1In, n2In, n3In].forEach(setFill);

    presetBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', state.preset === i ? 'true' : 'false'); });

    if (flash) {
      var el = $('.calc__big');
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    }
  }
  calc(false);

  /* ---------- Copy message ---------- */
  var copiedTimer;
  $('#copyBtn').addEventListener('click', function () {
    var t = $('#msg').textContent.trim();
    var done = function () {
      var c = $('#copied'); c.classList.add('is-on');
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(function () { c.classList.remove('is-on'); }, 2500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  });

  /* ---------- Join form → club BFF lead + entry to club ---------- */
  var mob = $('#mob');
  var joinBtn = $('#joinForm button[type="submit"]');
  mob.addEventListener('input', function () { mob.classList.remove('is-bad'); });
  $('#joinForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = toEn(mob.value);
    var msg = $('#joinMsg');
    if (!/^09\d{9}$/.test(v)) {
      mob.classList.add('is-bad');
      msg.textContent = 'لطفاً شماره موبایل معتبر (مثل ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.';
      mob.focus();
      return;
    }
    if (joinBtn) joinBtn.disabled = true;
    msg.textContent = 'در حال ثبت…';
    fetch('/api/v2/leads/registration-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ mobile: v, source: 'landing_join' }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('lead_failed');
        msg.textContent = 'ثبت شد. در حال ورود به کلاب تنوین…';
        window.location.href =
          'https://club.nibmarket.com/login?returnUrl=' + encodeURIComponent('/dashboard');
      })
      .catch(function () {
        msg.textContent = 'ثبت موقت نشد؛ مستقیم وارد کلاب می‌شوید…';
        window.location.href =
          'https://club.nibmarket.com/login?returnUrl=' + encodeURIComponent('/dashboard');
      })
      .finally(function () {
        if (joinBtn) joinBtn.disabled = false;
      });
  });

  /* ---------- Nav: scroll state, active link, mobile menu ---------- */
  var nav = $('#nav'), links = $$('#navLinks a'), burger = $('#burger'), navLinks = $('#navLinks');
  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  links.forEach(function (a) { a.addEventListener('click', function () { navLinks.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); }); });

  // همه لینک‌های داخل صفحه (منو، لوگو، دکمه‌ها، لینک‌های داخل متن) با اسکرول نرم به بخش خودشان می‌روند
  // فاصله از بالا = ارتفاع واقعی منو تا تیتر بخش زیر منو پنهان نشود
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function goTo(id, push) {
    var t = document.getElementById(id);
    if (!t) return false;
    var top = t.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
    if (push) history.pushState(null, '', '#' + id);
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var id = a.getAttribute('href').slice(1);
    if (id && goTo(id, true)) e.preventDefault();
  });
  // باز کردن صفحه با # در آدرس (مثلاً لینک اشتراکی) یا دکمه برگشت مرورگر
  window.addEventListener('popstate', function () { if (location.hash) goTo(location.hash.slice(1), false); });
  if (location.hash) window.addEventListener('load', function () { goTo(location.hash.slice(1), false); });

  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    var y = window.scrollY + 140, cur = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top + window.scrollY <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal + chart animations ---------- */
  var bars = $$('#bar > div'), podium = $$('#podium > div');
  bars.forEach(function (b) { b.style.flex = '0.0001'; });
  function animateBar() { bars.forEach(function (b) { b.style.flex = b.dataset.f; }); }
  function animatePodium() { podium.forEach(function (p, i) { setTimeout(function () { p.style.height = p.dataset.h + '%'; }, i * 90); }); }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.contains($('#bar'))) animateBar();
        if (en.target.contains($('#podium'))) animatePodium();
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('in'); });
    animateBar(); animatePodium();
  }
})();
