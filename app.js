/*
  Keelson Auto Care concept: app.js
  Dependency-free behaviours shared by every page:
    1. Mobile navigation (accessible toggle, focus trap, Esc to close)
    2. Footer newsletter demo
    3. Service menu filters and details dialog (services.html)
    4. Multi-step booking form (book.html)
  Privacy: this file makes no network requests and uses no cookies, storage or
  analytics. Forms validate in the browser, then show an on-page demo confirmation.
*/
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (n) => '$' + n.toLocaleString('en-US');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Keep Tab and Shift+Tab cycling inside a set of elements (mobile menu, dialog). */
  function trapTab(e, items) {
    if (e.key !== 'Tab') return;
    const list = items.filter((el) => el.getClientRects().length > 0);
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !list.includes(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* 1. Mobile navigation ------------------------------------------------ */
  function initNav() {
    const toggle = $('.nav-toggle');
    const menu = $('#mobile-menu');
    const header = $('.site-header');
    if (!toggle || !menu || !header) return;

    function setOpen(open, restoreFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      if (open) {
        // The header is sticky, so the panel starts wherever the header currently ends.
        menu.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
        const first = $(FOCUSABLE, menu);
        if (first) first.focus();
      } else if (restoreFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true', true));
    document.addEventListener('keydown', (e) => {
      if (menu.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false, true);
      } else {
        trapTab(e, [toggle, ...$$(FOCUSABLE, menu)]);
      }
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false, false);
    });
    const desktop = window.matchMedia('(min-width: 1080px)');
    desktop.addEventListener('change', () => {
      if (desktop.matches && !menu.hidden) setOpen(false, false);
    });
  }

  /* 2. Newsletter (footer) ------------------------------------------------ */
  function initNewsletter() {
    $$('.newsletter-form').forEach((form) => {
      const input = $('input[type="email"]', form);
      const msg = $('.nl-msg', form);
      // Submit buttons ship disabled so nothing can be submitted without these demo handlers.
      $('button[type="submit"]', form).disabled = false;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ok = EMAIL_RE.test(input.value.trim());
        msg.className = 'nl-msg ' + (ok ? 'is-ok' : 'is-error');
        msg.textContent = ok
          ? 'Thanks! This is a demo, so you have not been subscribed and nothing was sent.'
          : 'Enter a valid email address, like name@example.com.';
        if (ok) {
          input.removeAttribute('aria-invalid');
          form.reset();
        } else {
          input.setAttribute('aria-invalid', 'true');
          input.focus();
        }
      });
    });
  }

  /* 3. Service menu: filters and details dialog -------------------------- */
  function initServices() {
    const grid = $('#svc-grid');
    if (!grid) return;
    const buttons = $$('.filter-btn');
    const cards = $$('.svc-card', grid);
    const status = $('#svc-status');

    function apply(filter, fromUser) {
      const btn = buttons.find((b) => b.dataset.filter === filter) || buttons[0];
      const cat = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let shown = 0;
      cards.forEach((card) => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.hidden = !show;
        if (show) shown += 1;
      });
      status.textContent = cat === 'all' ? `Showing all ${shown} services` : `Showing ${shown} ${btn.dataset.label} services`;
      if (fromUser) {
        // Keep the filter in the address bar so it can be shared. Some browsers refuse
        // this on file:// pages; filtering works either way.
        try {
          history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat);
        } catch (err) { /* ignore */ }
      }
    }

    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter, true)));
    const fromHash = decodeURIComponent(location.hash.slice(1));
    apply(fromHash, false);
    if (buttons.some((b) => b.dataset.filter === fromHash && fromHash !== 'all')) {
      // Arriving from a home page tile such as services.html#brakes: jump to the menu.
      const menu = $('#menu');
      if (menu) menu.scrollIntoView({ block: 'start' });
    }
    window.addEventListener('hashchange', () => apply(decodeURIComponent(location.hash.slice(1)), false));

    initServiceDialog(grid);
  }

  function initServiceDialog(grid) {
    const dialog = $('#svc-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    let opener = null;

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-details]');
      if (!btn) return;
      const card = btn.closest('.svc-card');
      opener = btn;
      $('#dlg-cat', dialog).textContent = card.dataset.catLabel;
      $('#dlg-title', dialog).textContent = $('h3', card).textContent;
      $('#dlg-price', dialog).innerHTML = $('.svc-card__meta', card).innerHTML;
      $('#dlg-body', dialog).innerHTML = $('.svc-details', card).innerHTML;
      $('#dlg-book', dialog).href = 'book.html?service=' + encodeURIComponent(card.dataset.id);
      dialog.showModal();
      $('.modal__close', dialog).focus();
    });
    // Backdrop clicks land on the <dialog> itself; buttons marked data-close also close it.
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });
    dialog.addEventListener('keydown', (e) => trapTab(e, $$(FOCUSABLE, dialog)));
    // Esc is handled natively (cancel then close). Always hand focus back to the opener.
    dialog.addEventListener('close', () => {
      if (opener) opener.focus();
    });
  }

  /* 4. Booking form -------------------------------------------------------- */
  function initBooking() {
    const form = $('#booking-form');
    if (!form) return;
    const card = $('#booking-card');
    const done = $('#booking-done');
    const steps = $$('.step', form);
    const stepper = $$('.stepper li');
    const errorBox = $('#error-summary');
    const backBtn = $('#btn-back');
    const nextBtn = $('#btn-next');
    const nextLabel = $('.btn-label', nextBtn);
    nextBtn.disabled = false; // ships disabled so the form cannot submit without this script
    const names = steps.map((s) => s.dataset.name);
    const baseTitle = document.title;
    let current = 0;
    let returnToReview = false;

    const checked = (name) => $$(`input[name="${name}"]:checked`, form);
    const radio = (name) => (checked(name)[0] || { value: '' }).value;
    const val = (name) => {
      const el = form.elements.namedItem(name);
      return el && typeof el.value === 'string' ? el.value.trim() : '';
    };
    const dataOf = (name, key) => {
      const el = checked(name)[0];
      return el ? el.dataset[key] || '' : '';
    };

    // Each rule returns an error message, or '' when the answer is fine.
    const RULES = {
      year: () => (val('year') ? '' : 'Choose the model year.'),
      make: () => (val('make') ? '' : 'Choose the make.'),
      model: () => (val('model') ? '' : 'Enter the model, for example Outback or Civic.'),
      mileage: () => (/^\d{1,6}$/.test(val('mileage').replace(/[,\s]/g, '')) ? '' : 'Enter the mileage as a number, for example 48000.'),
      powertrain: () => (radio('powertrain') ? '' : 'Choose what powers the vehicle.'),
      services: () => (checked('services').length ? '' : 'Choose at least one service. Not sure what you need? Pick a diagnosis.'),
      visit: () => (radio('visit') ? '' : 'Choose whether you will wait or drop the car off.'),
      day: () => (radio('day') ? '' : 'Choose a day.'),
      time: () => (!radio('day') || radio('time') ? '' : 'Choose a time.'),
      first_name: () => (val('first_name') ? '' : 'Enter your first name.'),
      last_name: () => (val('last_name') ? '' : 'Enter your last name.'),
      phone: () => (val('phone').replace(/\D/g, '').length >= 10 ? '' : 'Enter a mobile number with area code, for example 555 555 0123.'),
      email: () => (EMAIL_RE.test(val('email')) ? '' : 'Enter an email address, like name@example.com.'),
    };

    function setError(name, message) {
      $$(`[name="${name}"]`, form).forEach((el) => {
        if (message) el.setAttribute('aria-invalid', 'true');
        else el.removeAttribute('aria-invalid');
      });
      const wrap = $(`[data-field="${name}"]`, form);
      if (wrap) wrap.classList.toggle('is-invalid', Boolean(message));
      const err = $('#err-' + name);
      if (err) {
        $('.msg', err).textContent = message;
        err.hidden = !message;
      }
    }

    const fieldsOf = (index) => (steps[index].dataset.fields || '').split(' ').filter(Boolean);
    const problemsOf = (index) => fieldsOf(index).map((name) => [name, RULES[name]()]).filter(([, msg]) => msg);
    const targetId = (name) => {
      const el = $(`[name="${name}"]:not(:disabled)`, form);
      return el ? el.id : '';
    };

    // Show inline errors plus a linked summary, then move focus to the summary.
    function validate(index) {
      fieldsOf(index).forEach((name) => setError(name, RULES[name]()));
      const problems = problemsOf(index);
      if (!problems.length) {
        errorBox.hidden = true;
        return true;
      }
      $('.msg', errorBox).textContent = problems.length === 1 ? 'There is 1 thing to fix' : `There are ${problems.length} things to fix`;
      $('ul', errorBox).innerHTML = problems.map(([name, msg]) => `<li><a href="#${targetId(name)}">${esc(msg)}</a></li>`).join('');
      errorBox.hidden = false;
      errorBox.focus();
      return false;
    }

    errorBox.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) {
        target.scrollIntoView({ block: 'center' });
        target.focus({ preventScroll: true });
      }
    });

    function go(index, moveFocus = true) {
      current = index;
      const last = index === steps.length - 1;
      steps.forEach((s, i) => { s.hidden = i !== index; });
      stepper.forEach((li, i) => {
        li.classList.toggle('is-done', i < index);
        li.classList.toggle('is-current', i === index);
        if (i === index) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
        $('.stepper__state', li).textContent = i < index ? ' (completed)' : '';
      });
      errorBox.hidden = true;
      backBtn.hidden = index === 0;
      nextLabel.textContent = last ? 'Confirm booking (demo)' : returnToReview ? 'Save and review' : 'Next: ' + names[index + 1];
      if (last) renderReview();
      if (moveFocus) {
        document.title = `Step ${index + 1} of ${steps.length}: ${names[index]} | ${baseTitle}`;
        card.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
        $('h2', steps[index]).focus({ preventScroll: true });
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (current === steps.length - 1) {
        finish();
        return;
      }
      if (!validate(current)) return;
      if (returnToReview) {
        returnToReview = false;
        go(steps.length - 1);
      } else {
        go(current + 1);
      }
    });
    backBtn.addEventListener('click', () => {
      returnToReview = false;
      go(current - 1);
    });

    // Re-check a field as soon as the person fixes it, and keep the summary current.
    form.addEventListener('input', (e) => {
      const name = e.target.name;
      if (name && RULES[name] && $(`[name="${name}"][aria-invalid="true"]`, form)) setError(name, RULES[name]());
      updateSummary();
    });
    form.addEventListener('change', (e) => {
      if (e.target.name === 'day') {
        renderTimes();
        if ($('[data-field="time"].is-invalid', form)) setError('time', RULES.time());
        updateSummary();
      }
    });

    /* Date and time slots: the next 12 open days (the shop is closed on Sundays). */
    const SLOTS = {
      week: ['7:30 AM', '8:30 AM', '9:30 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'],
      sat: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
    };
    // Deterministic "already booked" pattern so the demo looks lived-in without randomness.
    const slotsFor = (date) => (date.getDay() === 6 ? SLOTS.sat : SLOTS.week)
      .map((t, i) => ({ t, booked: (date.getDate() * 7 + i * 5 + date.getMonth()) % 9 < 3 }));
    let days = [];

    function renderDays() {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      days = [];
      while (days.length < 12) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0) days.push(new Date(d));
      }
      $('#day-options').innerHTML = days.map((day, i) => {
        const open = slotsFor(day).filter((s) => !s.booked).length;
        const long = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        return `<label class="chip"><input type="radio" name="day" id="day-${i}" value="${i}" data-long="${long}"${open ? '' : ' disabled'}>`
          + `<span class="chip__box"><span class="chip__dow">${day.toLocaleDateString('en-US', { weekday: 'short' })}</span>`
          + `<span class="chip__date">${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>`
          + `<span class="visually-hidden">, </span><span class="chip__note">${open ? open + ' open' : 'Full'}</span></span></label>`;
      }).join('');
    }

    function renderTimes() {
      const wrap = $('#time-options');
      const day = checked('day')[0];
      const previous = radio('time');
      if (!day) {
        wrap.innerHTML = '<p class="slot-placeholder">Choose a day to see open times.</p>';
        return;
      }
      wrap.innerHTML = '<div class="chips chips--time">' + slotsFor(days[Number(day.value)]).map((s, i) => {
        const state = s.booked ? ' disabled' : s.t === previous ? ' checked' : '';
        return `<label class="chip"><input type="radio" name="time" id="time-${i}" value="${s.t}"${state}>`
          + `<span class="chip__box"><span class="chip__time">${s.t}</span><span class="visually-hidden">, </span>`
          + `<span class="chip__note">${s.booked ? 'Booked' : 'Open'}</span></span></label>`;
      }).join('') + '</div>';
    }

    /* Summary panel and review step ---------------------------------------- */
    function data() {
      const services = checked('services').map((cb) => ({ name: cb.dataset.name, price: Number(cb.dataset.price), unit: cb.dataset.unit || '' }));
      const day = checked('day')[0];
      const time = radio('time');
      const miles = val('mileage').replace(/[,\s]/g, '');
      return {
        vehicle: [val('year'), val('make'), val('model')].filter(Boolean).join(' '),
        mileage: /^\d+$/.test(miles) ? Number(miles).toLocaleString('en-US') + ' miles' : '',
        powertrain: dataOf('powertrain', 'label'),
        services,
        total: services.reduce((sum, s) => sum + s.price, 0),
        note: val('notes'),
        when: day ? day.dataset.long + (time ? ' at ' + time : '') : '',
        visit: dataOf('visit', 'label'),
        name: [val('first_name'), val('last_name')].filter(Boolean).join(' '),
        phone: val('phone'),
        email: val('email'),
        updates: dataOf('updates', 'label') + (checked('reminders').length ? ', with reminder texts' : ''),
      };
    }

    function setText(sel, text, empty) {
      const el = $(sel);
      el.textContent = text || empty;
      el.classList.toggle('empty', !text);
    }

    function updateSummary() {
      const d = data();
      setText('#sum-vehicle', d.vehicle ? d.vehicle + (d.mileage ? ', ' + d.mileage : '') : '', 'Not added yet');
      $('#sum-services').innerHTML = d.services.length
        ? '<ul>' + d.services.map((s) => `<li><span>${esc(s.name)}</span><span>${money(s.price)}</span></li>`).join('') + '</ul>'
        : '<span class="empty">None chosen yet</span>';
      $('#sum-total').textContent = money(d.total);
      setText('#sum-when', d.when ? d.when + (d.visit ? '. ' + d.visit : '') : '', 'Not chosen yet');
      $('#mini-total').textContent = d.services.length
        ? `${d.services.length} selected, starting at ${money(d.total)}`
        : 'No services selected yet';
    }

    const block = (i, title, body) => `<section class="review__block" aria-labelledby="rv-${i}"><div class="review__head">`
      + `<h3 id="rv-${i}">${title}</h3><button type="button" class="btn btn--link" data-edit="${i}">Edit<span class="visually-hidden"> ${title.toLowerCase()}</span></button></div>${body}</section>`;
    const rows = (pairs) => '<dl>' + pairs.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v || 'Not given')}</dd>`).join('') + '</dl>';

    function renderReview() {
      const d = data();
      const list = d.services.map((s) => `<li>${esc(s.name)}: from ${money(s.price)}${s.unit ? ' ' + esc(s.unit) : ''}</li>`).join('');
      $('#review').innerHTML = [
        block(0, 'Vehicle', rows([['Vehicle', d.vehicle], ['Mileage', d.mileage], ['Powertrain', d.powertrain]])),
        block(1, 'Services', `<ul>${list}</ul>${d.note ? `<p class="mt-0">Your note: ${esc(d.note)}</p>` : ''}`
          + `<p class="review__total"><span>Starting estimate</span><strong>${money(d.total)}</strong></p>`),
        block(2, 'Date and time', rows([['When', d.when], ['Visit', d.visit]])),
        block(3, 'Contact', rows([['Name', d.name], ['Mobile', d.phone], ['Email', d.email], ['Updates', d.updates]])),
      ].join('');
    }

    $('#review').addEventListener('click', (e) => {
      const edit = e.target.closest('[data-edit]');
      if (!edit) return;
      returnToReview = true;
      go(Number(edit.dataset.edit));
    });

    function finish() {
      // Belt and braces: re-check every step before showing the confirmation.
      const bad = steps.slice(0, -1).findIndex((s, i) => problemsOf(i).length);
      if (bad > -1) {
        go(bad);
        validate(bad);
        return;
      }
      const d = data();
      $('#done-name').textContent = val('first_name');
      $('#done-when').textContent = d.when + (d.visit ? '. ' + d.visit : '');
      $('#done-ref').textContent = 'KAC-' + Math.floor(1000 + Math.random() * 9000);
      card.hidden = true;
      done.hidden = false;
      document.title = 'Booking received (demo) | ' + baseTitle;
      done.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
      $('#done-title').focus({ preventScroll: true });
    }

    $('#btn-restart').addEventListener('click', () => {
      form.reset();
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
      $$('.is-invalid', form).forEach((el) => el.classList.remove('is-invalid'));
      $$('.field-error', form).forEach((el) => { el.hidden = true; });
      returnToReview = false;
      renderDays();
      renderTimes();
      updateSummary();
      done.hidden = true;
      card.hidden = false;
      go(0);
    });

    // Services can be pre-selected from links such as book.html?service=brake-pads
    const wanted = new URLSearchParams(location.search).get('service');
    if (wanted) {
      wanted.split(',').forEach((id) => {
        const cb = $(`input[name="services"][value="${CSS.escape(id)}"]`, form);
        if (cb) cb.checked = true;
      });
    }

    renderDays();
    renderTimes();
    updateSummary();
    go(0, false);
  }

  initNav();
  initNewsletter();
  initServices();
  initBooking();
})();
