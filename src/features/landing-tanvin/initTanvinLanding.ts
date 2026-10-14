/* Auto-adapted from landing/script.js — scoped to landing root */
// @ts-nocheck — ported vanilla JS; keep behavior identical to static landing.
export type TanvinLandingAuthHandler = () => void;

export function initTanvinLanding(
  root: HTMLElement,
  onAuthEntry: TanvinLandingAuthHandler,
): () => void {
  "use strict";

  var COIN_PRICE = 523; // تومان
  var $ = function (s, r) {
    return (r || root).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || root).querySelectorAll(s));
  };
  var fa = function (n) {
    return Math.round(n).toLocaleString("fa-IR");
  };
  var toEn = function (s) {
    return String(s)
      .replace(/[۰-۹]/g, function (d) {
        return d.charCodeAt(0) - 1776;
      })
      .replace(/[٠-٩]/g, function (d) {
        return d.charCodeAt(0) - 1632;
      })
      .replace(/[^\d.]/g, "");
  };

  /* ---------- Data ---------- */
  var funds = [
    {
      name: "صندوق درآمد ثابت",
      desc: "سود روزشمار، مناسب حفظ ارزش پس‌انداز",
      risk: 1,
      label: "ریسک کم",
    },
    {
      name: "صندوق طلای گلدیس",
      desc: "سرمایه‌گذاری در طلا، بدون نگهداری فیزیکی",
      risk: 2,
      label: "ریسک متوسط",
    },
    {
      name: "صندوق‌های مختلط",
      desc: "ترکیب سهام و اوراق، تعادل رشد و ریسک",
      risk: 2,
      label: "ریسک متوسط",
    },
    {
      name: "صندوق‌های سهامی",
      desc: "سرمایه‌گذاری در بورس، رشد بالقوه بیشتر",
      risk: 3,
      label: "ریسک بالا",
    },
  ];
  var presets = [
    { n1: 5, avg: 105, avgLabel: "۱۰ میلیون تومان" },
    { n1: 15, avg: 300, avgLabel: "۳۰۰ میلیون تومان" },
    { n1: 30, avg: 10000, avgLabel: "۱۰ میلیارد" },
  ];
  var badges = [
    { l: "پ", n: "پیشگام", d: "۱۰ معرفی فعال مستقیم", r: "۳٬۰۰۰ تنوین" },
    {
      l: "م",
      n: "معتبر",
      d: "۳ سرمایه‌گذار، هر کدام با سرمایه ۱٫۵ میلیارد تومان یا بیشتر و ماندگاری دست‌کم یک ماه",
      r: "۶٬۰۰۰ تنوین",
    },
    {
      l: "ک",
      n: "کلکسیونر",
      d: "شبکه بازاریاب در همه صندوق‌های تأمین سرمایه نوین دارایی داشته باشد",
      r: "۳٬۰۰۰ تنوین",
    },
    {
      l: "ر",
      n: "راهبر",
      d: "۵ نفر از معرفی‌های بازاریاب، هر کدام ۳ معرفی فعال داشته باشند",
      r: "۱۰٬۰۰۰ تنوین",
    },
  ];
  var personas = [
    {
      who: "مشاوران مالی، بیمه و املاک",
      h: "مشتریانی که به دنبال جای امن برای سرمایه‌اند",
      d: "معرفی یک محصول مجاز و کم‌ریسک؛ تا زمانی که سرمایه مشتری بماند، سهم روزانه ادامه دارد. مسیر سفیر نوین از همین‌جا آغاز می‌شود.",
      q: "مشتری می‌ماند؛ سهم هر روز ادامه دارد.",
    },
    {
      who: "صاحبان کسب‌وکار",
      h: "شبکه‌ای از همکاران و تأمین‌کنندگان",
      d: "زمان زیادی لازم نیست. ارسال لینک کافی است؛ ثبت‌نام و همراهی سرمایه‌گذار با کارشناسان تأمین سرمایه نوین است.",
      q: "ارسال لینک؛ ادامه کار با نوین.",
    },
    {
      who: "فعالان شبکه‌های اجتماعی",
      h: "مخاطبانی که به یک صدا گوش می‌دهند",
      d: "مأموریت‌ها از روز نخست سکه تنوین می‌دهند و پنج بازاریاب برتر هر ماه از استخر ماهانه جایزه می‌گیرند.",
      q: "هر معرفی، یک قدم تا جایزه ماه.",
    },
  ];
  var missions = [
    {
      n: "شروع بازاریابی",
      s: "یک‌بار برای هر بازاریاب",
      t: "۱٬۰۰۰ تنوین",
      steps: [
        { t: "دوره آموزشی سطح ۱", c: "۲۰۰ تنوین", done: true },
        { t: "نخستین معرفی فعال", c: "۳۰۰ تنوین" },
        { t: "۳ معرفی فعال در ۳۰ روز", c: "۵۰۰ تنوین" },
      ],
    },
    {
      n: "هر معرفی",
      s: "برای هر سرمایه‌گذار، تکرارشونده",
      t: "۱۵۰ تنوین",
      steps: [
        { t: "معرفی فعال", c: "۵۰ تنوین", done: true },
        { t: "ماندگاری ۶ ماهه", c: "۵۰ تنوین" },
        { t: "ماندگاری ۱۲ ماهه", c: "۵۰ تنوین" },
      ],
    },
  ];
  var faqs = [
    [
      "آیا بازاریابی نیاز به سرمایه‌گذاری شخصی دارد؟",
      "خیر. سهم معرفی، مأموریت‌ها و نشان‌ها هیچ شرط سرمایه شخصی ندارند.",
    ],
    [
      "آیا از سود سرمایه‌گذار کم می‌شود؟",
      "خیر. سهم بازاریاب را نوین می‌پردازد و سود و سرمایه سرمایه‌گذار دست‌نخورده می‌ماند.",
    ],
    [
      "«معرفی فعال» یعنی چه؟",
      "سرمایه‌گذار تازه با کد ملی جدید که دست‌کم ۱۰ میلیون تومان از حساب خود واریز کرده و ۳۰ روز در صندوق مانده است.",
    ],
    [
      "کدام صندوق‌ها مشمول طرح‌اند؟",
      "همه صندوق‌های تأمین سرمایه نوین، از جمله درآمد ثابت، طلای گلدیس و ETF.",
    ],
    [
      "سهم بازاریاب چه زمانی واریز می‌شود؟",
      "سهم بازاریاب روزشمار محاسبه می‌شود و به‌صورت سکه تنوین در حساب کاربری او ثبت می‌شود. در شش ماه نخست طرح، سکه‌های تنوین قابل نقد کردن نیستند؛ پس از آن، به معادل ارزش روز نقره خرید و فروش می‌شوند.",
    ],
    [
      "اگر سرمایه‌گذار سرمایه خود را برداشت کند؟",
      "سهم بازاریاب تا آخرین روزی که سرمایه در صندوق باشد، هر روز محاسبه و پرداخت می‌شود. همه سکه‌های دریافت‌شده تا آن روز در کیف پول بازاریاب باقی می‌مانند و در زمان مقتضی قابل برداشت خواهند بود.",
    ],
    [
      "سکه تنوین چیست؟",
      "سکه دیجیتال شبکه تنوین که هر واحد آن در شروع معادل یک سوت نقره با خلوص ۹۹۹ است. ارزشش با قیمت نقره و با افزایش ماهانه پشتوانه از محل استخر تغییر می‌کند.",
    ],
    [
      "آیا سهم معرفی تضمینی است؟",
      "خیر. مقدار آن به دارایی و ماندگاری سرمایه‌گذاران معرفی‌شده و ارزش روز سکه تنوین بستگی دارد.",
    ],
  ];

  /* ---------- Render static lists ---------- */
  $("#funds").innerHTML = funds
    .map(function (f) {
      var bars = [1, 2, 3]
        .map(function (i) {
          return "<i" + (i <= f.risk ? ' class="on"' : "") + "></i>";
        })
        .join("");
      return (
        '<div class="mini"><b>' +
        f.name +
        "</b><span>" +
        f.desc +
        '</span><span class="risk" role="img" aria-label="' +
        f.label +
        '">' +
        bars +
        "</span></div>"
      );
    })
    .join("");

  $("#badgeCards").innerHTML = badges
    .map(function (b) {
      return (
        '<div class="badge"><span class="badge__l">' +
        b.l +
        "</span><h3>" +
        b.n +
        "</h3><p>" +
        b.d +
        '</p><span class="badge__r">' +
        b.r +
        "</span></div>"
      );
    })
    .join("");

  $("#personas").innerHTML = personas
    .map(function (p) {
      return (
        '<div class="persona"><span class="who">' +
        p.who +
        "</span><h3>" +
        p.h +
        "</h3><p>" +
        p.d +
        '</p><p class="q">' +
        p.q +
        "</p></div>"
      );
    })
    .join("");

  $("#missionList").innerHTML = missions
    .map(function (m) {
      var steps = m.steps
        .map(function (s) {
          return (
            '<button type="button" class="mstep' +
            (s.done ? " is-done" : "") +
            '" aria-pressed="' +
            !!s.done +
            '"><i aria-hidden="true"></i><span>' +
            s.t +
            "</span><small>" +
            s.c +
            "</small></button>"
          );
        })
        .join("");
      return (
        '<div class="mission"><div class="mission__h"><b>' +
        m.n +
        "</b><small>" +
        m.s +
        "</small><strong>" +
        m.t +
        '</strong></div><div class="mission__steps">' +
        steps +
        "</div></div>"
      );
    })
    .join("");
  $$(".mstep").forEach(function (b) {
    b.addEventListener("click", function () {
      var on = b.classList.toggle("is-done");
      b.setAttribute("aria-pressed", on);
    });
  });

  /* ---------- Accordions ---------- */
  function setOpen(item, open) {
    item.classList.toggle("is-open", open);
    var btn = item.querySelector("button");
    btn.setAttribute("aria-expanded", open);
  }
  $$(".acc__item").forEach(function (item) {
    item.querySelector(".acc__btn").addEventListener("click", function () {
      setOpen(item, !item.classList.contains("is-open"));
    });
  });

  var faqOpen = 4;
  $("#faqList").innerHTML = faqs
    .map(function (f, i) {
      return (
        '<div class="faq__item' +
        (i === faqOpen ? " is-open" : "") +
        '">' +
        '<button type="button" class="faq__btn" aria-expanded="' +
        (i === faqOpen) +
        '"><span>' +
        f[0] +
        '</span><i class="pm" aria-hidden="true"></i></button>' +
        '<div class="acc__panel"><div><p class="faq__a">' +
        f[1] +
        "</p></div></div></div>"
      );
    })
    .join("");
  var faqItems = $$("#faqList .faq__item");
  faqItems.forEach(function (item) {
    item.querySelector(".faq__btn").addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      faqItems.forEach(function (o) {
        setOpen(o, false);
      });
      setOpen(item, willOpen);
    });
  });

  /* ---------- Calculator ---------- */
  var state = { avg: 105, n1: 10, n2: 0, n3: 0, preset: -1 };
  var avgIn = $("#avg"),
    n1In = $("#n1"),
    n2In = $("#n2"),
    n3In = $("#n3");

  $("#presets").innerHTML = presets
    .map(function (p, i) {
      return (
        '<button type="button" class="preset" aria-pressed="false" data-i="' +
        i +
        '"><span>معرفی ' +
        fa(p.n1) +
        " سرمایه‌گذار مستقیم با میانگین " +
        p.avgLabel +
        "</span></button>"
      );
    })
    .join("");
  var presetBtns = $$("#presets .preset");
  presetBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var p = presets[+b.dataset.i];
      state = { avg: p.avg, n1: p.n1, n2: 0, n3: 0, preset: +b.dataset.i };
      syncInputs();
      calc(true);
    });
  });

  // اسلایدر میانگین سرمایه لگاریتمی است: ۱۰ میلیون تا ۱۰ میلیارد تومان
  var AVG_MIN = 10,
    AVG_SPAN = 1000;
  function avgFromSlider(v) {
    var n = AVG_MIN * Math.pow(AVG_SPAN, v / 1000);
    return n < 100 ? Math.round(n) : n < 1000 ? Math.round(n / 5) * 5 : Math.round(n / 50) * 50;
  }
  function sliderFromAvg(a) {
    return Math.round((1000 * Math.log(a / AVG_MIN)) / Math.log(AVG_SPAN));
  }
  function setFill(input) {
    input.style.setProperty(
      "--p",
      ((input.value - input.min) / (input.max - input.min)) * 100 + "%",
    );
  }

  function syncInputs() {
    avgIn.value = sliderFromAvg(state.avg);
    n1In.value = state.n1;
    n2In.value = state.n2;
    n3In.value = state.n3;
  }

  avgIn.addEventListener("input", function () {
    state.avg = avgFromSlider(+avgIn.value);
    state.preset = -1;
    calc(false);
  });
  [
    [n1In, "n1"],
    [n2In, "n2"],
    [n3In, "n3"],
  ].forEach(function (pair) {
    pair[0].addEventListener("input", function () {
      state[pair[1]] = +pair[0].value;
      state.preset = -1;
      calc(false);
    });
  });

  function calc(flash) {
    var avgM = Math.max(10, state.avg || 0);
    var a = avgM * 1e6;
    var N1 = Math.max(0, state.n1 || 0),
      N2 = Math.max(0, state.n2 || 0),
      N3 = Math.max(0, state.n3 || 0);
    var yr = a * (N1 * 0.012 + N2 * 0.004 + N3 * 0.002);

    $("#monthly").textContent = fa(yr / 12);
    $("#mCoins").textContent = fa(yr / 12 / COIN_PRICE);
    $("#dCoins").textContent = fa(yr / 365 / COIN_PRICE);
    $("#avgFa").textContent = fa(avgM);
    $("#n1fa").textContent = fa(N1);
    $("#n2fa").textContent = fa(N2);
    $("#n3fa").textContent = fa(N3);
    [avgIn, n1In, n2In, n3In].forEach(setFill);

    presetBtns.forEach(function (b, i) {
      b.setAttribute("aria-pressed", state.preset === i ? "true" : "false");
    });

    if (flash) {
      var el = $(".calc__big");
      el.classList.remove("flash");
      void el.offsetWidth;
      el.classList.add("flash");
    }
  }
  calc(false);

  /* ---------- Copy message ---------- */
  var copiedTimer;
  $("#copyBtn").addEventListener("click", function () {
    var t = $("#msg").textContent.trim();
    var done = function () {
      var c = $("#copied");
      c.classList.add("is-on");
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(function () {
        c.classList.remove("is-on");
      }, 2500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = t;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
      done();
    }
  });

  /* ---------- Join form ---------- */
  var mob = $("#mob");
  mob.addEventListener("input", function () {
    mob.classList.remove("is-bad");
  });
  $("#joinForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = toEn(mob.value);
    var msg = $("#joinMsg");
    if (!/^09\d{9}$/.test(v)) {
      mob.classList.add("is-bad");
      msg.textContent = "لطفاً شماره موبایل معتبر (مثل ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.";
      mob.focus();
      return;
    }
    msg.textContent = "در حال انتقال به صفحه ورود…";
    onAuthEntry();
  });

  /* ---------- Nav: scroll state, active link, mobile menu ---------- */
  var nav = $("#nav"),
    links = $$("#navLinks a"),
    burger = $("#burger"),
    navLinks = $("#navLinks");
  burger.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
  });
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("is-open");
      burger.setAttribute("aria-expanded", false);
    });
  });

  var sections = links.map(function (a) {
    return document.getElementById(a.getAttribute("href").slice(1));
  });
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
    var y = window.scrollY + 140,
      cur = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top + window.scrollY <= y) cur = i;
    });
    links.forEach(function (a, i) {
      a.classList.toggle("is-active", i === cur);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal + chart animations ---------- */
  var bars = $$("#bar > div"),
    podium = $$("#podium > div");
  bars.forEach(function (b) {
    b.style.flex = "0.0001";
  });
  function animateBar() {
    bars.forEach(function (b) {
      b.style.flex = b.dataset.f;
    });
  }
  function animatePodium() {
    podium.forEach(function (p, i) {
      setTimeout(function () {
        p.style.height = p.dataset.h + "%";
      }, i * 90);
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          if (en.target.contains($("#bar"))) animateBar();
          if (en.target.contains($("#podium"))) animatePodium();
          io.unobserve(en.target);
        });
      },
      { threshold: 0.15 },
    );
    $$(".rv").forEach(function (el) {
      io.observe(el);
    });
  } else {
    $$(".rv").forEach(function (el) {
      el.classList.add("in");
    });
    animateBar();
    animatePodium();
  }

  /* Auth CTAs */
  Array.prototype.slice
    .call(root.querySelectorAll('[data-tanvin-auth="1"]'))
    .forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        onAuthEntry();
      });
    });

  return function cleanup() {
    window.removeEventListener("scroll", onScroll);
  };
}
