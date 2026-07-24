/* ===================================================================
   KOPENAO TRAVEL — script.js
   Pure vanilla JS. No backend, no API, no database.
=================================================================== */
(function(){
  'use strict';

  /* ---------------- Loader ---------------- */
  window.addEventListener('load', function(){
    var loader = document.getElementById('loader');
    setTimeout(function(){ loader.classList.add('hide'); }, 500);
  });

  /* ---------------- Navbar scroll state ---------------- */
  var navbar = document.getElementById('navbar');
  var revmeter = document.getElementById('revmeter');
  var revFill = document.getElementById('revFill');
  var revNeedle = document.getElementById('revNeedle');
  var revLabel = document.getElementById('revLabel');
  var floatingCta = document.getElementById('floatingCta');
  var FILL_CIRCUM = 314; // 2*PI*50

  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    navbar.classList.toggle('scrolled', y > 40);

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? Math.min(1, Math.max(0, y / docH)) : 0;

    revmeter.classList.toggle('visible', y > 200);
    revFill.style.strokeDashoffset = String(FILL_CIRCUM * (1 - pct));
    // needle sweeps from -120deg to +120deg across the 0-100% range
    var angle = -120 + pct * 240;
    revNeedle.style.transform = 'rotate(' + angle + 'deg)';
    revLabel.textContent = Math.round(pct * 100) + '%';

    // hide floating CTA near footer
    var footer = document.querySelector('.footer');
    if (footer){
      var footerTop = footer.getBoundingClientRect().top;
      floatingCta.style.display = (footerTop < window.innerHeight && window.innerWidth <= 980) ? 'none' : '';
    }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------------- Hamburger / mobile menu ---------------- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', function(){
    var open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileMenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------------- Animated stat counter ---------------- */
  var statNum = document.querySelector('.stat-num');
  if (statNum){
    var target = parseInt(statNum.getAttribute('data-count'), 10) || 0;
    var counted = false;
    var counterObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting && !counted){
          counted = true;
          var start = 0;
          var duration = 900;
          var startTime = null;
          function step(ts){
            if (!startTime) startTime = ts;
            var progress = Math.min(1, (ts - startTime) / duration);
            statNum.textContent = Math.round(progress * target);
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          counterObserver.unobserve(statNum);
        }
      });
    }, { threshold:0.5 });
    counterObserver.observe(statNum);
  }

  /* ---------------- Tabs (Fonctionnalités) ---------------- */
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = btn.getAttribute('data-tab');
      tabBtns.forEach(function(b){ b.classList.remove('active'); });
      tabPanels.forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelector('.tab-panel[data-panel="' + target + '"]').classList.add('active');
    });
  });

  /* ===================================================================
     Availability calendar
  =================================================================== */
  var calendarGrid = document.getElementById('calendarGrid');
  var calMonthLabel = document.getElementById('calMonthLabel');
  var calPrev = document.getElementById('calPrev');
  var calNext = document.getElementById('calNext');

  var today = new Date();
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();

  var MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var DOW_NAMES = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  // Deterministic pseudo-random "reserved" pattern per date, so it's stable across renders
  function isReserved(y, m, d){
    var seed = y * 372 + m * 31 + d;
    // simple hash to spread reservations ~30% of days
    var hash = (seed * 2654435761) % 100;
    return Math.abs(hash) % 100 < 28;
  }

  function renderCalendar(y, m){
    calMonthLabel.textContent = MONTH_NAMES[m] + ' ' + y;
    calendarGrid.innerHTML = '';

    DOW_NAMES.forEach(function(name){
      var el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = name;
      calendarGrid.appendChild(el);
    });

    var firstDay = new Date(y, m, 1).getDay(); // 0=Sun
    var offset = (firstDay + 6) % 7; // convert to Mon-first
    var daysInMonth = new Date(y, m + 1, 0).getDate();

    for (var i = 0; i < offset; i++){
      var empty = document.createElement('div');
      empty.className = 'cal-day empty';
      calendarGrid.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++){
      var cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = d;

      var isPast = new Date(y, m, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var reserved = isPast ? true : isReserved(y, m, d);

      cell.classList.add(reserved ? 'reserved' : 'available');

      if (y === today.getFullYear() && m === today.getMonth() && d === today.getDate()){
        cell.classList.add('today');
      }
      calendarGrid.appendChild(cell);
    }
  }

  calPrev.addEventListener('click', function(){
    viewMonth--;
    if (viewMonth < 0){ viewMonth = 11; viewYear--; }
    renderCalendar(viewYear, viewMonth);
  });
  calNext.addEventListener('click', function(){
    viewMonth++;
    if (viewMonth > 11){ viewMonth = 0; viewYear++; }
    renderCalendar(viewYear, viewMonth);
  });

  renderCalendar(viewYear, viewMonth);

  /* ===================================================================
     Booking form: duration + price calculation
  =================================================================== */
  var dateStart = document.getElementById('dateStart');
  var timeStart = document.getElementById('timeStart');
  var dateEnd = document.getElementById('dateEnd');
  var timeEnd = document.getElementById('timeEnd');
  var driverSelect = document.getElementById('driver');

  var sumDays = document.getElementById('sumDays');
  var sumRate = document.getElementById('sumRate');
  var sumDriver = document.getElementById('sumDriver');
  var sumTotal = document.getElementById('sumTotal');

  var DAILY_RATE = 120000;
  var WEEKLY_RATE = 700000; // for 7-13 days, priced per week
  var MONTHLY_RATE = 2600000; // for 28+ days
  var DRIVER_RATE = 25;

  function computePrice(days){
    if (days >= 28){
      var months = Math.floor(days / 28);
      var remDays = days % 28;
      return months * MONTHLY_RATE + remDays * DAILY_RATE;
    }
    if (days >= 7){
      var weeks = Math.floor(days / 7);
      var remD = days % 7;
      return weeks * WEEKLY_RATE + remD * DAILY_RATE;
    }
    return days * DAILY_RATE;
  }

  function rateLabelForDays(days){
    if (days >= 28) return '2 600 000\u00A0Ar/mois';
    if (days >= 7) return '700 000\u00A0Ar/semaine';
    return '120 000\u00A0Ar/jour';
  }

  function updateSummary(){
    if (!dateStart.value || !dateEnd.value){
      sumDays.textContent = '0 jour';
      sumTotal.textContent = '0\u00A0Ar';
      return;
    }
    var start = new Date(dateStart.value + 'T' + (timeStart.value || '00:00'));
    var end = new Date(dateEnd.value + 'T' + (timeEnd.value || '00:00'));
    var diffMs = end - start;
    var days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (isNaN(days) || days <= 0){
      sumDays.textContent = '0 jour';
      sumRate.textContent = '—';
      sumDriver.textContent = '—';
      sumTotal.textContent = '0\u00A0Ar';
      return;
    }

    var base = computePrice(days);
    var withDriver = driverSelect.value === 'oui';
    var driverCost = withDriver ? days * DRIVER_RATE : 0;
    var total = base + driverCost;

    sumDays.textContent = days + (days > 1 ? ' jours' : ' jour');
    sumRate.textContent = rateLabelForDays(days);
    sumDriver.textContent = withDriver ? ('+' + driverCost + '\u00A0Ar') : 'Sans chauffeur';
    sumTotal.textContent = total.toLocaleString('fr-FR') + '\u00A0Ar';
  }

  [dateStart, timeStart, dateEnd, timeEnd, driverSelect].forEach(function(el){
    el.addEventListener('change', updateSummary);
    el.addEventListener('input', updateSummary);
  });

  // Sensible defaults: min dates = today, dateEnd min follows dateStart
  (function setupDateDefaults(){
    var iso = today.toISOString().split('T')[0];
    dateStart.min = iso;
    dateEnd.min = iso;
    dateStart.addEventListener('change', function(){
      dateEnd.min = dateStart.value;
      if (dateEnd.value && dateEnd.value < dateStart.value){
        dateEnd.value = dateStart.value;
      }
      updateSummary();
    });
  })();

  /* ---------------- Booking form submit -> modal ---------------- */
  var bookingForm = document.getElementById('bookingForm');
  var modalOverlay = document.getElementById('modalOverlay');
  var modalClose = document.getElementById('modalClose');
  var modalOk = document.getElementById('modalOk');

  function openModal(){
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  modalClose.addEventListener('click', closeModal);
  modalOk.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e){
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeModal();
  });

  bookingForm.addEventListener('submit', function(e){
    e.preventDefault();
    if (!bookingForm.checkValidity()){
      bookingForm.reportValidity();
      return;
    }
    openModal();
    bookingForm.reset();
    updateSummary();
  });

  /* ---------------- Contact form submit -> modal ---------------- */
  var contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    if (!contactForm.checkValidity()){
      contactForm.reportValidity();
      return;
    }
    openModal();
    contactForm.reset();
  });

  /* ===================================================================
     Testimonials carousel
  =================================================================== */
  var track = document.getElementById('carouselTrack');
  var dotsWrap = document.getElementById('carouselDots');
  var cards = track ? track.children : [];
  var current = 0;
  var autoTimer;

  function buildDots(){
    for (var i = 0; i < cards.length; i++){
      var b = document.createElement('button');
      if (i === 0) b.classList.add('active');
      (function(idx){
        b.addEventListener('click', function(){ goTo(idx); resetAuto(); });
      })(i);
      dotsWrap.appendChild(b);
    }
  }
  function goTo(idx){
    current = (idx + cards.length) % cards.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    Array.prototype.forEach.call(dotsWrap.children, function(d, i){
      d.classList.toggle('active', i === current);
    });
  }
  function resetAuto(){
    clearInterval(autoTimer);
    autoTimer = setInterval(function(){ goTo(current + 1); }, 5500);
  }
  if (track && cards.length){
    buildDots();
    resetAuto();
  }

  /* ---------------- Smooth in-page nav offset for sticky header ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(e){
      var id = link.getAttribute('href');
      if (id.length > 1){
        var el = document.querySelector(id);
        if (el){
          e.preventDefault();
          var y = el.getBoundingClientRect().top + window.pageYOffset - 84;
          window.scrollTo({ top:y, behavior:'smooth' });
        }
      }
    });
  });

})();