/* ============================================================
   MAIN.JS — TERENA OIL
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. LENIS SMOOTH SCROLL ── */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 0.7,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ── 2. PRELOADER ── */
  const loader = document.getElementById('loader');
  const lFill  = document.getElementById('l-fill');
  const lPct   = document.getElementById('l-pct');

  let pct = 0;
  const tick = setInterval(() => {
    pct += Math.random() * 14 + 5;
    if (pct >= 100) {
      pct = 100;
      clearInterval(tick);
      if (lFill) lFill.style.width = '100%';
      if (lPct)  lPct.textContent = '100%';
      setTimeout(() => {
        if (loader) loader.classList.add('out');
        document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
      }, 450);
    } else {
      if (lFill) lFill.style.width = pct + '%';
      if (lPct)  lPct.textContent = Math.floor(pct) + '%';
    }
  }, 55);

  /* ── 3. CUSTOM CURSOR ── */
  const cDot  = document.getElementById('c-dot');
  const cRing = document.getElementById('c-ring');

  if (cDot && cRing && window.matchMedia('(hover: hover)').matches) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cDot.style.left = mx + 'px';
      cDot.style.top  = my + 'px';
    });
    (function animRing() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      cRing.style.left = rx + 'px';
      cRing.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
    });
  }

  /* ── 3b. ACTIVE NAV LINK ── */
  (function () {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__a, .mob__a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  })();

  /* ── 4. NAVBAR ── */
  const nav  = document.getElementById('nav');
  const btt  = document.getElementById('btt');
  const onSc = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (btt) btt.classList.toggle('vis', y > 500);
  };
  window.addEventListener('scroll', onSc, { passive: true });
  onSc();

  /* ── 5. MOBILE MENU ── */
  const burger = document.getElementById('nav-burger');
  const mob    = document.getElementById('mob');
  const toggleMenu = () => {
    const open = mob.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    mob.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', toggleMenu);
  mob.querySelectorAll('.mob__a').forEach(a => a.addEventListener('click', () => {
    mob.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mob.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }));

  /* ── 6. HERO STATUS ── */
  const sdot  = document.getElementById('sdot');
  const stext = document.getElementById('stext');
  if (sdot && stext) {
    const now = new Date();
    const day = now.getDay();
    const h   = now.getHours() + now.getMinutes() / 60;
    let open  = day === 0 ? (h >= 7 && h < 20) : (h >= 6 && h < 22);
    let close = day === 0 ? '20h00' : '22h00';
    if (open) {
      stext.textContent = 'Station ouverte · Ferme à ' + close;
    } else {
      sdot.classList.add('closed');
      stext.textContent = 'Station fermée · Ouvre demain à 6h00';
    }
  }

  /* ── 7. BOARD DATE ── */
  const boardDate = document.getElementById('board-date');
  if (boardDate) {
    boardDate.textContent = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  /* ── 8. SVG GAUGE ANIMATION ── */
  const gFill = document.getElementById('g-fill');
  const gPct  = document.getElementById('gauge-pct');
  if (gFill && gPct) {
    const circum = 2 * Math.PI * 75;
    const target = 0.82;
    let current  = 0;
    let started  = false;

    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        io.disconnect();
        const start = performance.now();
        const dur   = 2200;
        (function step(now) {
          const p    = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          current    = ease * target;
          const offset = circum * (1 - current);
          gFill.style.strokeDashoffset = offset;
          gPct.textContent = Math.round(current * 100) + '%';
          if (p < 1) requestAnimationFrame(step);
        })(start);
      }
    }, { threshold: .3 });
    io.observe(document.querySelector('.hero__gauge') || document.body);
    setTimeout(() => {
      if (!started) { started = true; io.disconnect();
        gFill.style.strokeDashoffset = circum * (1 - target);
        gPct.textContent = Math.round(target * 100) + '%';
      }
    }, 2000);
  }

  /* ── 9. SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const rio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); rio.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => rio.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('on'));
  }

  /* ── 10. COUNTER ANIMATION ── */
  const mets = document.querySelectorAll('.met');
  if ('IntersectionObserver' in window && mets.length) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el     = e.target;
        const target = parseInt(el.dataset.count, 10);
        const sfx    = el.dataset.sfx || '';
        const numEl  = el.querySelector('.met__n');
        if (!numEl || isNaN(target)) return;
        cio.unobserve(el);
        const dur   = 1500;
        const start = performance.now();
        (function step(now) {
          const p    = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          numEl.textContent = Math.round(ease * target) + sfx;
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.5 });
    mets.forEach(el => cio.observe(el));
  }

  /* ── 11. GSAP ANIMATIONS ── */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* Hero title lines — split per line and animate up */
    document.querySelectorAll('.hero__line').forEach((line, i) => {
      const inner = document.createElement('span');
      inner.innerHTML = line.innerHTML;
      inner.style.display = 'block';
      line.innerHTML = '';
      line.appendChild(inner);
      gsap.from(inner, {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: .2 + i * .14,
      });
    });

    /* Hero eyebrow + desc + status + btns */
    gsap.from('[data-anim="fade"]', {
      opacity: 0,
      y: 16,
      duration: .9,
      ease: 'power2.out',
      delay: .7,
      stagger: .1,
    });

    /* Service cards stagger */
    gsap.utils.toArray('.srv').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        y: 40,
        opacity: 0,
        duration: .7,
        ease: 'power2.out',
        delay: i * 0.07,
      });
    });

    /* Board rows */
    gsap.utils.toArray('.brow').forEach((row, i) => {
      gsap.from(row, {
        scrollTrigger: { trigger: row, start: 'top 90%', once: true },
        x: -24,
        opacity: 0,
        duration: .55,
        ease: 'power2.out',
        delay: i * 0.09,
      });
    });

    /* Gallery items */
    gsap.utils.toArray('.gi').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        scale: .95,
        opacity: 0,
        duration: .65,
        ease: 'power2.out',
        delay: i * 0.06,
      });
    });

    /* PARALLAX + HOVER — gallery photos */
    gsap.utils.toArray('.gi').forEach(item => {
      const img = item.querySelector('img');
      if (!img) return;
      gsap.to(img, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
      item.addEventListener('mouseenter', () => gsap.to(img, { scale: 1.06, duration: 0.65, ease: 'power2.out' }));
      item.addEventListener('mouseleave', () => gsap.to(img, { scale: 1,    duration: 0.65, ease: 'power2.out' }));
    });

    /* PARALLAX — page hero background image */
    const phImg = document.querySelector('.ph-img img');
    if (phImg) {
      gsap.to(phImg, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.page-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }

    /* Stagger — car wash tarif cards */
    gsap.utils.toArray('.cwtarif').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
        y: 36,
        opacity: 0,
        duration: .65,
        ease: 'power2.out',
        delay: i * 0.09,
      });
    });

    /* Stagger — benefits / bbene */
    gsap.utils.toArray('.bbene').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        x: -20,
        opacity: 0,
        duration: .55,
        ease: 'power2.out',
        delay: i * 0.07,
      });
    });

    /* Market category cards stagger */
    gsap.utils.toArray('.mcat').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
        y: 30,
        opacity: 0,
        duration: .6,
        ease: 'power2.out',
        delay: i * 0.08,
      });
    });

    /* Steps animation */
    gsap.utils.toArray('.biz__step').forEach((step, i) => {
      gsap.from(step, {
        scrollTrigger: { trigger: step, start: 'top 85%', once: true },
        y: 50,
        opacity: 0,
        duration: .75,
        ease: 'power3.out',
        delay: i * 0.15,
      });
    });
  }

  /* ── 12. MAGNETIC BUTTONS ── */
  document.querySelectorAll('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const dx  = e.clientX - (r.left + r.width  / 2);
      const dy  = e.clientY - (r.top  + r.height / 2);
      btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ── 13. SWIPER TESTIMONIALS ── */
  if (window.Swiper) {
    new Swiper('.tswiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: '.tpagi', clickable: true },
      navigation: { prevEl: '.tprev', nextEl: '.tnext' },
      breakpoints: {
        640:  { slidesPerView: 1.15 },
        900:  { slidesPerView: 2 },
        1100: { slidesPerView: 3 },
      },
    });
  }

  /* ── 14. CONTACT FORM ── */
  const cform = document.getElementById('cform');
  const fsub  = document.getElementById('fsub');
  const fok   = document.getElementById('fok');

  const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
  const TEL_RE   = /^[\d\s\+\-\(\)\.]{7,20}$/;
  let lastSubmit = 0;

  function sanitize(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim()
      .slice(0, 1000);
  }

  if (cform) {
    const origBtnText = fsub ? fsub.textContent : 'Envoyer';
    const isEnt = !!document.getElementById('f-societe');

    cform.addEventListener('submit', async e => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastSubmit < 30000) {
        fsub.textContent = 'Patientez 30s avant de renvoyer…';
        setTimeout(() => { fsub.textContent = origBtnText; }, 3000);
        return;
      }

      let valid = true;
      cform.querySelectorAll('[required]').forEach(field => {
        const val = field.value.trim();
        let ok = val !== '';
        if (ok && field.type === 'email') ok = EMAIL_RE.test(val);
        field.classList.toggle('err', !ok);
        if (!ok) valid = false;
      });

      const telField = document.getElementById('ft');
      if (telField && telField.value.trim() !== '') {
        const telOk = TEL_RE.test(telField.value.trim());
        telField.classList.toggle('err', !telOk);
        if (!telOk) valid = false;
      }

      if (!valid) return;

      lastSubmit        = Date.now();
      fsub.disabled    = true;
      fsub.textContent = 'Envoi en cours…';

      try {
        if (isEnt) {
          const fVal = parseInt(document.getElementById('f-flotte')?.value, 10);
          await window.supa.insert('terena_demandes', {
            societe:   sanitize(document.getElementById('f-societe')?.value || ''),
            secteur:   sanitize(document.getElementById('f-secteur')?.value || '') || null,
            flotte:    isNaN(fVal) ? null : fVal,
            conso:     sanitize(document.getElementById('f-conso')?.value || '') || null,
            prenom:    sanitize(document.getElementById('fp')?.value || ''),
            nom:       sanitize(document.getElementById('fn')?.value || ''),
            telephone: sanitize(document.getElementById('ft')?.value || ''),
            email:     sanitize(document.getElementById('fe')?.value || '') || null,
            message:   sanitize(document.getElementById('fm')?.value || '') || null,
          });
        } else {
          await window.supa.insert('terena_messages', {
            prenom:    sanitize(document.getElementById('fp')?.value || ''),
            nom:       sanitize(document.getElementById('fn')?.value || ''),
            telephone: sanitize(document.getElementById('ft')?.value || ''),
            email:     sanitize(document.getElementById('fe')?.value || '') || null,
            sujet:     sanitize(document.getElementById('fs')?.value || ''),
            message:   sanitize(document.getElementById('fm')?.value || ''),
          });
        }
        fsub.disabled    = false;
        fsub.textContent = origBtnText;
        cform.reset();
        if (fok) { fok.style.display = 'flex'; setTimeout(() => { fok.style.display = 'none'; }, 6000); }
      } catch (_err) {
        fsub.disabled    = false;
        fsub.textContent = 'Erreur — Réessayez ou appelez-nous';
        setTimeout(() => { fsub.textContent = origBtnText; }, 4000);
      }
    });
    cform.querySelectorAll('.fi, .fta').forEach(f => {
      f.addEventListener('input', () => f.classList.remove('err'));
    });
  }

  /* ── 14b. CONTACT HOURS STATUS ── */
  const hrsStatus = document.getElementById('hrs-status');
  if (hrsStatus) {
    const now2 = new Date();
    const day2 = now2.getDay();
    const h2   = now2.getHours() + now2.getMinutes() / 60;
    const open2 = day2 === 0 ? (h2 >= 7 && h2 < 20) : (h2 >= 6 && h2 < 22);
    const close2 = day2 === 0 ? '20h00' : '22h00';
    if (open2) {
      hrsStatus.textContent = 'Station ouverte · Ferme à ' + close2;
    } else {
      hrsStatus.style.color = 'var(--red)';
      hrsStatus.previousElementSibling && (hrsStatus.previousElementSibling.style.background = 'var(--red)');
      hrsStatus.textContent = 'Station fermée · Ouvre demain à 6h00';
    }
  }

  /* ── 15. BACK TO TOP ── */
  if (btt) {
    btt.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 0.7 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 16. SMOOTH ANCHOR LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id  = a.getAttribute('href');
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(tgt, { offset: -80, duration: 0.7 });
      } else {
        const top = tgt.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── 17. HERO SCROLL BTN ── */
  const heroScroll = document.getElementById('hero-scroll');
  if (heroScroll) {
    heroScroll.addEventListener('click', () => {
      const ticker = document.querySelector('.ticker');
      if (!ticker) return;
      if (lenis) lenis.scrollTo(ticker, { offset: 0, duration: 0.7 });
      else ticker.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── 18. FAQ ACCORDION ── */
  document.querySelectorAll('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq__item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq__a').setAttribute('aria-hidden', 'true');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        item.querySelector('.faq__a').setAttribute('aria-hidden', 'false');
      }
    });
  });

  /* ── 19. SERVICE WORKER (PWA) ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

})();
