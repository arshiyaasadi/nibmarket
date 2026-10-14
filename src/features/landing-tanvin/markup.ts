/** Static Tanvin landing markup (scoped under .tanvin-landing). */
export const TANVIN_LANDING_MARKUP = `<!-- NAV -->
<nav class="nav" id="nav">
  <div class="wrap nav__in">
    <a href="#top" class="logo" aria-label="شبکه بازاریابان نوین">
      <span class="logo__mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M10 4 5.5 20M18 4l-4.5 16" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/></svg>
      </span>
      <span class="logo__name">شبکه بازاریابان نوین</span>
    </a>
    <div class="nav__links" id="navLinks">
      <a href="#story">نحوه کار</a>
      <a href="#calc">محاسبه درآمد</a>
      <a href="#badges">نشان‌ها</a>
      <a href="#missions">مأموریت‌ها</a>
      <a href="#pool">رقابت ماهانه</a>
      <a href="#coin">سکه تنوین</a>
      <a href="#faq">سؤالات</a>
      
    </div>
    <a class="btn btn--gold nav__cta" href="#join" data-tanvin-auth="1">ورود به تنوین</a>
    <button class="nav__burger" id="burger" type="button" aria-label="منو" aria-expanded="false" aria-controls="navLinks">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="rgb(80,30,120)" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
  </div>
</nav>

<!-- HERO -->
<header id="top" class="hero brand-surface">
  <div class="wrap hero__grid">
    <div class="hero__text">
      <h1>تنوین همگام با <span>رشد</span> نوین</h1>
      <div class="steps">
        <span><b>۱</b>معرفی سرمایه‌گذار</span>
        <svg width="44" height="10" viewBox="0 0 44 10" aria-hidden="true"><path d="M43 5H2M6 1 2 5l4 4" stroke="rgba(255,255,255,.85)" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>
        <span><b>۲</b>دریافت روزانه سکه نقره تنوین</span>
      </div>
      <ul class="hero__list">
        <li><i class="dot" aria-hidden="true"></i>بدون حق عضویت</li>
        <li><i class="dot" aria-hidden="true"></i>بدون نیاز به سرمایه شخصی</li>
        <li><i class="dot" aria-hidden="true"></i>با انواع صندوق‌های سرمایه‌گذاری</li>
      </ul>
      <div class="hero__btns">
        <a class="btn btn--gold" href="#join" data-tanvin-auth="1">دریافت لینک دعوت</a>
        <a class="btn btn--ghost" href="#calc">محاسبه سهم</a>
      </div>
    </div>
    <div class="hero__coin">
      <img src="/landing/assets/coin.png" width="1000" height="1149" alt="سکه نقره تنوین با نشان نوین">
    </div>
  </div>
</header>

<!-- STRIP -->
<section class="wrap strip rv">
  <p class="strip__a">از مجموع سرمایه‌گذاری‌های محقق‌شده توسط بازاریابان به صندوق‌های تأمین سرمایه نوین؛</p>
  <div class="strip__b">
    <span class="strip__pct">۲٪</span>
    <p>کارمزد شبکه، مبتنی بر سکه نقره تنوین محاسبه شده و تخصیص می‌یابد.</p>
  </div>
</section>

<!-- STORY -->
<section id="story" class="section section--tint story">
  <div class="wrap">
    <div class="head rv">
      <h2 class="h2">همکاری با تنوین، شبکه بازاریابان تأمین سرمایه نوین</h2>
      <p class="lead">در تنوین، هر کسی می‌تواند سرمایه‌گذار را به صندوق‌های تأمین سرمایه نوین معرفی کند و در ازای آن، هر روز سهم خود را به‌صورت سکه تنوین با پشتوانه نقره دریافت کند.</p>
    </div>

    <div class="acc rv" data-acc="multi">
      <div class="acc__item">
        <button type="button" class="acc__btn" aria-expanded="false">
          <span class="acc__num">۱</span><span class="acc__title">صندوق‌های نوین</span><i class="pm" aria-hidden="true"></i>
        </button>
        <div class="acc__panel"><div>
          <div class="acc__body">
            <p>تأمین سرمایه نوین، نهاد مالی دارای مجوز از سازمان بورس، صندوق‌هایی با سطح‌های مختلف ریسک مدیریت می‌کند.</p>
            <div class="cards4" id="funds"></div>
            <p style="font-size:var(--fs-18)">نوار کنار هر صندوق، سطح ریسک آن را نشان می‌دهد.</p>
          </div>
        </div></div>
      </div>

      <div class="acc__item">
        <button type="button" class="acc__btn" aria-expanded="false">
          <span class="acc__num">۲</span><span class="acc__title">نقش بازاریاب</span><i class="pm" aria-hidden="true"></i>
        </button>
        <div class="acc__panel"><div>
          <div class="acc__body">
            <div class="flow" role="img" aria-label="بازاریاب با لینک اختصاصی، سرمایه‌گذار را به صندوق نوین معرفی می‌کند و از نوین سهم می‌گیرد">
              <div class="mini"><b>بازاریاب</b><span>پس از ثبت‌نام رایگان، یک لینک معرفی اختصاصی دریافت می‌کند و آن را برای سرمایه‌گذاران مورد نظر خود می‌فرستد.</span></div>
              <div class="mini"><b>سرمایه‌گذار</b><span>با لینک بازاریاب ثبت‌نام می‌کند و صندوق مناسب خود را انتخاب می‌کند.</span></div>
              <div class="mini"><b>صندوق نوین</b><span>سرمایه‌گذار در صندوق انتخابی سرمایه‌گذاری می‌کند و تیم نوین سرمایه او را مدیریت می‌کند.</span></div>
              <div class="mini mini--brand"><b>سهم بازاریاب</b><span>هر روز به نسبت مبلغ سرمایه و مدتی که در صندوق باقی می‌ماند محاسبه، به سکه تنوین تبدیل و به کیف پول بازاریاب واریز می‌شود.</span></div>
            </div>
            <ul class="bullets">
              <li><i class="dot"></i>ثبت‌نام رایگان است و سرمایه شخصی لازم ندارد.</li>
              <li><i class="dot"></i>سهم را نوین می‌پردازد؛ از سود سرمایه‌گذار کم نمی‌شود.</li>
              <li><i class="dot"></i>معرفی فعال: کد ملی جدید، دست‌کم ۱۰ میلیون تومان و ۳۰ روز ماندگاری.</li>
            </ul>
          </div>
        </div></div>
      </div>

      <div class="acc__item">
        <button type="button" class="acc__btn" aria-expanded="false">
          <span class="acc__num">۳</span><span class="acc__title">سهم نقره‌ای</span><i class="pm" aria-hidden="true"></i>
        </button>
        <div class="acc__panel"><div>
          <div class="acc__body">
            <p>سهم بازاریاب هر روز به سکه تنوین تبدیل و به کیف پول او واریز می‌شود؛ تا زمانی که سرمایه در صندوق بماند.</p>
            <div class="invite" style="align-items:center">
              <div class="tree" role="img" aria-label="شبکه سه‌سطحی بازاریاب">
                <div><span class="tag">بازاریاب</span></div>
                <div class="tree__row"><i style="width:20px;height:20px;background:var(--purple-800)"></i><i style="width:20px;height:20px;background:var(--purple-800)"></i><i style="width:20px;height:20px;background:var(--purple-800)"></i><em>سطح یک : معرفی‌های مستقیم</em></div>
                <div class="tree__row"><i style="width:15px;height:15px;background:var(--purple-500)"></i><i style="width:15px;height:15px;background:var(--purple-500)"></i><i style="width:15px;height:15px;background:var(--purple-500)"></i><i style="width:15px;height:15px;background:var(--purple-500)"></i><em>سطح دو : معرفی‌های سطح یک</em></div>
                <div class="tree__row"><i style="width:11px;height:11px;background:var(--purple-300)"></i><i style="width:11px;height:11px;background:var(--purple-300)"></i><i style="width:11px;height:11px;background:var(--purple-300)"></i><i style="width:11px;height:11px;background:var(--purple-300)"></i><i style="width:11px;height:11px;background:var(--purple-300)"></i><em>سطح سه : معرفی‌های سطح دو</em></div>
              </div>
              <div class="coinnote">
                <img src="/landing/assets/coin.png" alt="" loading="lazy">
                <div><b style="font-size:var(--fs-22);display:block">هر سکه تنوین</b><span>پشتوانه ۱ سوت نقره با خلوص ۹۹۹</span></div>
              </div>
            </div>
            <ul class="bullets">
              <li><i class="dot"></i>از سرمایه هر سه سطح شبکه سهم می‌رسد؛ بیشترین سهم از سطح ۱.</li>
              <li><i class="dot"></i>با رشد شبکه، پشتوانه هر سکه تنوین بیشتر می‌شود.</li>
              <li><i class="dot"></i>تا آخرین روزی که سرمایه در صندوق باشد، سهم بازاریاب هر روز پرداخت می‌شود.</li>
            </ul>
          </div>
        </div></div>
      </div>
    </div>

    <div class="split rv">
      <h3>تقسیم ۲٪ سالانه میان سه سطح شبکه</h3>
      <p>سهم کل شبکه از هر سرمایه معرفی‌شده، ۲ درصد در سال است.</p>
      <div class="bar" id="bar" role="img" aria-label="تقسیم سهم ۲ درصدی: سطح ۱ شصت درصد، سطح ۲ بیست درصد، سطح ۳ ده درصد، استخر ده درصد">
        <div class="bar__l1" data-f="60" title="سطح ۱">۶۰٪</div>
        <div class="bar__l2" data-f="20" title="سطح ۲">۲۰٪</div>
        <div class="bar__l3" data-f="10" title="سطح ۳">۱۰٪</div>
        <div class="bar__pool" data-f="10" title="استخر ماهانه">۱۰٪</div>
      </div>
      <div class="split__nums">
        <div><b style="color:var(--purple-800)">۱٫۲٪</b><span>سطح ۱ · معرفی‌ مستقیم</span></div>
        <div><b style="color:var(--purple-600)">۰٫۴٪</b><span>سطح ۲ · معرفی‌های سطح یک</span></div>
        <div><b style="color:var(--purple-500)">۰٫۲٪</b><span>سطح ۳ · معرفی‌های سطح دو</span></div>
        <div><b style="color:var(--purple-500)">۰٫۲٪</b><span>استخر ماهانه · ارزش سکه و جایزه برترین‌ها</span></div>
      </div>
    </div>
  </div>
</section>

<!-- CALCULATOR -->
<section id="calc" class="section">
  <div class="wrap">
    <div class="head rv">
      <span class="eyebrow">ماشین‌حساب</span>
      <h2 class="h2">محاسبه سهم بازاریاب</h2>
      <p class="lead">با انتخاب یک نمونه یا وارد کردن عددها، سهم ماهانه و روزانه بازاریاب محاسبه می‌شود. مبنای محاسبه، ارزش فعلی سکه تنوین (حدود ۵۲۳ تومان) است.</p>
    </div>
    <div class="presets rv" role="group" aria-label="نمونه‌ها" id="presets"></div>
    <div class="calc rv">
      <div class="calc__form">
        <div class="crow crow--avg">
          <label class="crow__head" for="avg">میانگین سرمایه هر سرمایه‌گذار (میلیون تومان)</label>
          <div class="crow__ctl">
            <input class="range" id="avg" type="range" min="0" max="1000" value="340">
            <output class="crow__val" id="avgFa" for="avg">۱۰۵</output>
            <small>حداقل ۱۰ میلیون تومان</small>
          </div>
        </div>
        <div class="levels">
          <div class="crow">
            <div class="crow__head">
              <span class="dots dots--1" aria-hidden="true"><i></i><i></i><i></i></span>
              <label for="n1">سطح یک: معرفی‌های مستقیم</label>
            </div>
            <div class="crow__ctl"><input class="range" id="n1" type="range" min="0" max="100" value="10"><output class="crow__val" id="n1fa" for="n1">۱۰</output></div>
          </div>
          <div class="crow">
            <div class="crow__head">
              <span class="dots dots--2" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
              <label for="n2">سطح دو: معرفی‌های سطح یک</label>
            </div>
            <div class="crow__ctl"><input class="range" id="n2" type="range" min="0" max="200" value="0"><output class="crow__val" id="n2fa" for="n2">۰</output></div>
          </div>
          <div class="crow">
            <div class="crow__head">
              <span class="dots dots--3" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
              <label for="n3">سطح سه: معرفی‌های سطح دو</label>
            </div>
            <div class="crow__ctl"><input class="range" id="n3" type="range" min="0" max="500" value="0"><output class="crow__val" id="n3fa" for="n3">۰</output></div>
          </div>
        </div>
      </div>
      <div class="calc__out brand-surface" aria-live="polite">
        <div>
          <span class="lbl">سهم ماهانه تقریبی</span>
          <div class="calc__big"><span id="monthly">۱٬۰۵۰٬۰۰۰</span><span>تومان</span></div>
        </div>
        <div class="calc__row">
          <div><span class="lbl">سکه تنوین در ماه</span><b><span id="mCoins">۲٬۰۰۸</span> تنوین</b></div>
          <div><span class="lbl">واریز روزانه</span><b><span id="dCoins">۶۶</span> تنوین</b></div>
        </div>
        <a class="btn btn--gold" href="#join" data-tanvin-auth="1">شروع بازاریابی</a>
      </div>
    </div>
  </div>
</section>

<!-- BADGES -->
<section id="badges" class="section section--tint">
  <div class="wrap">
    <div class="head rv">
      <span class="eyebrow">نشان‌ها و سفیر تأمین سرمایه نوین</span>
      <h2 class="h2">بهترین بازاریابان، همکار رسمی تأمین سرمایه نوین می‌شوند</h2>
      <p class="lead">چهار نشان، هر کدام جداگانه و به هر ترتیبی. هر نشان یک توانایی را نشان می‌دهد و دو نشان، راه سفیر نوین را باز می‌کند.</p>
    </div>
    <div class="ambassador brand-surface rv">
      <div class="ambassador__grid">
        <div class="ambassador__a">
          <span class="lbl">نشان نهایی</span>
          <h3>سفیر نوین</h3>
          <div class="pills">
            <span class="pill">همکار رسمی تأمین سرمایه نوین</span>
            <span class="pill">مزایای ویژه همکاری</span>
            <span class="pill pill--solid">۳۰٬۰۰۰ تنوین</span>
          </div>
          <p>سفیران با قرارداد همکاری، نماینده رسمی تأمین سرمایه نوین می‌شوند و از مزایای ویژه همکاری، از جمله سفر و خدمات پشتیبانی VIP، بهره‌مند می‌شوند.</p>
        </div>
        <div class="ambassador__b">
          <span class="keyline" aria-hidden="true"></span>
          <div>
            <b>شرایط سفیر نوین</b>
            <ul>
              <li><i class="dot"></i>دو نشان از چهار نشان زیر</li>
              <li><i class="dot"></i>۳۰ معرفی فعال یا ۱۰ میلیارد تومان سرمایه معرفی‌شده</li>
              <li><i class="dot"></i>ماندگاری دست‌کم ۸۵٪ سرمایه‌ها در ۱۲ ماه</li>
              <li><i class="dot"></i>گذراندن دوره آموزشی پیشرفته</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="cards4 rv" id="badgeCards"></div>
  </div>
</section>

<!-- WHO -->
<section id="who" class="section">
  <div class="wrap">
    <div class="head rv" style="max-width:960px">
      <span class="eyebrow">بازاریابان تأمین سرمایه نوین</span>
      <h2 class="h2">بازاریابی برای تأمین سرمایه نوین، برای کسانی که دیگران به توصیه‌شان اعتماد می‌کنند</h2>
    </div>
    <div class="cards3 rv" id="personas"></div>
  </div>
</section>

<!-- MISSIONS -->
<section id="missions" class="section section--tint">
  <div class="wrap">
    <div class="head rv">
      <span class="eyebrow">مأموریت‌ها</span>
      <h2 class="h2">۱٬۰۰۰ سکه تنوین برای شروع بازاریابی</h2>
      <p class="lead">با انجام هر مرحله، دایره آن پر و سکه‌هایش به کیف پول بازاریاب واریز می‌شود.</p>
    </div>
    <div class="missions rv" id="missionList"></div>
  </div>
</section>

<!-- INVITEE -->
<section id="invitee" class="section">
  <div class="wrap">
    <div class="head rv">
      <span class="eyebrow">هدیه سرمایه‌گذاران</span>
      <h2 class="h2">سرمایه‌گذار معرفی‌شده، علاوه بر سود صندوق، سکه تنوین هدیه می‌گیرد</h2>
      <p class="lead">سرمایه‌گذاری که با لینک بازاریاب می‌آید، صندوق مناسب خود را انتخاب می‌کند و از همان ابتدا سکه تنوین هدیه می‌گیرد.</p>
    </div>
    <div class="invite rv">
      <div class="box">
        <div class="gift"><b>۲۰۰ تنوین</b><span>هدیه شروع سرمایه‌گذاری</span><small>احراز هویت، نخستین واریز و ۳۰ روز ماندگاری</small></div>
        <div class="gift"><b>۲ تنوین</b><span>هر روز ورود به تنوین</span><small>برای دارندگان موجودی</small></div>
        <div class="gift"><b>تا ۲۰۰ تنوین</b><span>هدیه پله‌های موجودی</span><small>۵۰، ۱۰۰ و ۲۰۰ تنوین در ۲۰۰ میلیون، ۵۰۰ میلیون و ۱٫۲ میلیارد تومان</small></div>
        <div class="funds">
          <span>انتخاب از میان همه صندوق‌های نوین:</span>
          <div class="pills"><span class="soft">درآمد ثابت</span><span class="soft">طلای گلدیس</span><span class="soft">ETF</span><span class="soft">و سایر صندوق‌ها</span></div>
        </div>
      </div>
      <div class="box">
        <h3>پیام آماده معرفی</h3>
        <blockquote id="msg">سلام. معرفی از طرف بازاریاب تنوین، شبکه بازاریابان تأمین سرمایه نوین: سرمایه‌گذاری در صندوق‌های نوین با این لینک، از ابتدا ۲۰۰ سکه تنوین با پشتوانه نقره هدیه دارد.</blockquote>
        <div class="copyrow">
          <button type="button" class="btn btn--line" id="copyBtn">کپی پیام</button>
          <span class="copied" id="copied" role="status">پیام کپی شد.</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- POOL -->
<section id="pool" class="pool brand-surface">
  <div class="wrap">
    <div class="head rv">
      <span class="eyebrow">رقابت ماهانه</span>
      <h2 class="h2">هر ماه پنج برنده؛ هر ماه پشتوانه بیشتر برای همه</h2>
      <p class="lead">۱۰٪ سهم شبکه هر ماه در استخر جمع می‌شود. رتبه بر اساس میانگین روزانه سرمایه جدیدی است که شبکه بازاریاب آورده و هر ماه از صفر شروع می‌شود.</p>
    </div>
    <div class="pool__grid">
      <div class="rv">
        <div class="podium" id="podium" role="img" aria-label="سهم پنج بازاریاب برتر از استخر: ۱۵، ۱۲، ۱۰، ۸ و ۵ درصد">
          <div data-h="44" style="background:var(--purple-300)"><b>۴</b><span>۸٪</span></div>
          <div data-h="76" style="background:var(--purple-200)"><b>۲</b><span>۱۲٪</span></div>
          <div data-h="100" style="background:var(--white)"><b>۱</b><span>۱۵٪</span></div>
          <div data-h="62" style="background:var(--purple-200)"><b>۳</b><span>۱۰٪</span></div>
          <div data-h="30" style="background:var(--purple-300)"><b>۵</b><span>۵٪</span></div>
        </div>
        <p class="podium-cap">سهم پنج بازاریاب برتر ماه از کل استخر</p>
      </div>
      <div id="coin" class="halfcard rv">
        <span class="keyline" aria-hidden="true"></span>
        <div>
          <span class="pct">۵۰٪</span>
          <h3>نیم دیگر، ارزش تنوین همه را بالا می‌برد</h3>
          <p>هر تنوین در شروع معادل یک سوت نقره با خلوص ۹۹۹ است و با قیمت نقره حرکت می‌کند. نیمی از استخر هر ماه به پشتوانه آن اضافه می‌شود؛ پس هر سکه‌ای که نگه داشته شود، پشتوانه بیشتری پیدا می‌کند.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section id="faq" class="section faq-sec">
  <div class="wrap">
    <div class="head rv">
      <span class="eyebrow">پرسش‌های متداول</span>
      <h2 class="h2">پیش از شروع بازاریابی</h2>
    </div>
    <div class="faq rv" id="faqList"></div>
  </div>
</section>

<!-- FINAL CTA -->
<section id="join" class="brand-surface join">
  <img src="/landing/assets/coin.png" alt="" loading="lazy">
  <h2>همکاری با شبکه تنوین از همین لینک آغاز می‌شود</h2>
  <p>با ثبت شماره موبایل، لینک معرفی اختصاصی در تنوین ساخته می‌شود. پیوستن رایگان است.</p>
  <form id="joinForm" novalidate>
    <label for="mob" class="sr">شماره موبایل</label>
    <input class="input" id="mob" type="tel" inputmode="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" autocomplete="tel">
    <button class="btn btn--yellow" type="submit">ساخت لینک معرفی</button>
  </form>
  <p class="join__msg" id="joinMsg" role="status"></p>
</section>

<footer>
  <div class="wrap">
    <span>تنوین · شبکه بازاریابان نوین · تأمین سرمایه نوین</span>
    <span>قوانین تنوین · قوانین و مقررات · پشتیبانی</span>
  </div>
</footer>`;
