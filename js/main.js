/* RENTCAR — JS mínimo: navegación básica, modal de reserva, filtros y contador */
(function () {
  'use strict';

  var CARS = {
    duster: { name: 'Renault Duster', meta: 'SUV · Gris', rating: '4.9', trips: '64 viajes', price: 185000, img: 'assets/img/renault-duster.jpg' },
    cx30:   { name: 'Mazda CX-30',    meta: 'SUV · Plata', rating: '4.8', trips: '47 viajes', price: 230000, img: 'assets/img/mazda-cx30.jpg' },
    onix:   { name: 'Chevrolet Onix', meta: 'Compacto · Negro', rating: '4.7', trips: '81 viajes', price: 145000, img: 'assets/img/chevrolet-onix.jpg' },
    mini:   { name: 'MINI Cooper',    meta: 'Premium · Blanco', rating: '4.9', trips: '32 viajes', price: 275000, img: 'assets/img/mini-cooper.jpg' }
  };
  var SERVICE_RATE = 0.08, DELIVERY_FEE = 25000;

  function fmt(n) {
    return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function icon(path, size) {
    size = size || 20;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }
  var I = {
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"></path>',
    check: '<path d="m5 12 4 4L19 6"></path>',
    close: '<path d="m6 6 12 12M18 6 6 18"></path>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
    car: '<path d="M5 17h14l1-5-2-5H6l-2 5 1 5Z"></path><path d="M7 7l1-3h8l1 3M7 17v3M17 17v3M4 12h16"></path>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6Z"></path><path d="m8.5 12 2.2 2.2 4.8-5"></path>',
    arrow: '<path d="m5 12 14 0m-5-5 5 5-5 5"></path>'
  };

  function showToast(title, sub) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    root.innerHTML =
      '<div class="toast" role="status"><span>' + icon(I.check) + '</span>' +
      '<div><b>' + title + '</b><small>' + sub + '</small></div>' +
      '<button type="button" aria-label="Cerrar" onclick="this.parentNode.remove()">' + icon(I.close, 16) + '</button></div>';
    setTimeout(function () { root.innerHTML = ''; }, 6000);
  }

  function openBooking(key) {
    var car = CARS[key];
    var root = document.getElementById('modal-root');
    if (!car || !root) return;

    root.innerHTML =
      '<div class="modal-backdrop"><section class="booking-modal" role="dialog" aria-modal="true">' +
        '<button class="close-button" type="button" aria-label="Cerrar" id="bk-close">' + icon(I.close) + '</button>' +
        '<div class="booking-car"><div class="booking-photo"><img alt="' + car.name + '" src="' + car.img + '"></div>' +
        '<div><span class="overline">' + car.meta + '</span><h2>' + car.name + '</h2>' +
        '<div class="rating">' + icon(I.star, 14) + car.rating + ' <small>' + car.trips + '</small></div></div></div>' +
        '<div class="booking-grid"><div class="booking-options">' +
          '<span class="overline">1. ELIGE LAS FECHAS</span>' +
          '<div class="two-fields">' +
            '<label>Recogida<input type="date" id="bk-from" value="2025-06-06"></label>' +
            '<label>Devolución<input type="date" id="bk-to" min="2025-06-06" value="2025-06-09"></label>' +
          '</div>' +
          '<span class="overline">2. ¿DÓNDE LO RECIBES?</span>' +
          '<button class="delivery-option selected" type="button" data-fee="' + DELIVERY_FEE + '">' +
            '<span>' + icon(I.pin) + '</span><div><b>En mi ubicación actual</b><small>Calle 85 #11–53, Bogotá</small></div><i>' + icon(I.check, 14) + '</i></button>' +
          '<button class="delivery-option" type="button" data-fee="0">' +
            '<span>' + icon(I.car) + '</span><div><b>Recoger en sede</b><small>Calle 93B #13–30 · Sin costo</small></div><i></i></button>' +
          '<div class="included">' + icon(I.shield) + '<p><b>Protección esencial incluida</b><br><small>Asistencia 24/7 y cobertura básica.</small></p></div>' +
        '</div>' +
        '<aside class="estimate">' +
          '<span class="overline">ESTIMADO DEL ALQUILER</span>' +
          '<div class="estimate-days"><strong id="est-days">3</strong><span>días<small id="est-range"></small></span></div>' +
          '<div class="estimate-line"><span id="est-mult"></span><b id="est-base"></b></div>' +
          '<div class="estimate-line"><span>Tarifa de servicio</span><b id="est-service"></b></div>' +
          '<div class="estimate-line"><span>Entrega</span><b id="est-delivery"></b></div>' +
          '<div class="estimate-total"><span>Total estimado</span><strong id="est-total"></strong></div>' +
          '<button class="primary wide" type="button" id="bk-confirm">Confirmar alquiler ' + icon(I.arrow) + '</button>' +
          '<small class="fine-print">No se hará ningún cobro hasta confirmar.</small>' +
        '</aside></div></section></div>';

    var bd = root.firstElementChild;
    var from = bd.querySelector('#bk-from'), to = bd.querySelector('#bk-to');

    function fee() {
      var s = bd.querySelector('.delivery-option.selected');
      return s ? +s.dataset.fee : 0;
    }
    function recalc() {
      var days = Math.max(1, Math.round((new Date(to.value) - new Date(from.value)) / 86400000) || 1);
      var base = car.price * days, service = base * SERVICE_RATE, f = fee();
      bd.querySelector('#est-days').textContent = days;
      bd.querySelector('#est-range').textContent = from.value + ' — ' + to.value;
      bd.querySelector('#est-mult').textContent = fmt(car.price) + ' × ' + days + (days === 1 ? ' día' : ' días');
      bd.querySelector('#est-base').textContent = fmt(base);
      bd.querySelector('#est-service').textContent = fmt(service);
      bd.querySelector('#est-delivery').textContent = f ? fmt(f) : 'Gratis';
      bd.querySelector('#est-total').textContent = fmt(base + service + f);
    }
    function close() { root.innerHTML = ''; }

    bd.querySelector('#bk-close').onclick = close;
    bd.onclick = function (e) { if (e.target === bd) close(); };
    from.onchange = function () { to.min = from.value; recalc(); };
    to.onchange = recalc;
    bd.querySelectorAll('.delivery-option').forEach(function (btn) {
      btn.onclick = function () {
        bd.querySelectorAll('.delivery-option').forEach(function (b) {
          b.classList.remove('selected'); b.querySelector('i').innerHTML = '';
        });
        btn.classList.add('selected');
        btn.querySelector('i').innerHTML = icon(I.check, 14);
        recalc();
      };
    });
    bd.querySelector('#bk-confirm').onclick = function () {
      close();
      showToast('¡Alquiler confirmado!', 'Te enviamos los detalles a tu correo.');
    };
    recalc();
  }

  /* Abrir modal al hacer clic en una tarjeta */
  document.querySelectorAll('.car-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.favorite')) return;
      openBooking(card.dataset.car);
    });
  });
  document.querySelectorAll('.favorite').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      btn.classList.toggle('faved');
    });
  });

  /* Filtros de Explorar */
  var grid = document.getElementById('car-grid');
  if (grid) {
    var ft = document.getElementById('filter-type'),
        fb = document.getElementById('filter-brand'),
        fc = document.getElementById('filter-color'),
        count = document.getElementById('result-count');
    function apply() {
      var n = 0;
      grid.querySelectorAll('.car-card').forEach(function (c) {
        var ok = (ft.value === 'Todos' || c.dataset.type === ft.value) &&
                 (fb.value === 'Todas' || c.dataset.brand === fb.value) &&
                 (fc.value === 'Todos' || c.dataset.color === fc.value);
        c.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      if (count) count.textContent = n;
    }
    [ft, fb, fc].forEach(function (s) { if (s) s.onchange = apply; });
    var clear = document.getElementById('clear-filters');
    if (clear) clear.onclick = function () {
      ft.value = 'Todos'; fb.value = 'Todas'; fc.value = 'Todos'; apply();
    };
  }

  /* Contador regresivo (Mis viajes) */
  var cd = document.getElementById('countdown');
  if (cd) {
    var t = 2 * 3600 + 18 * 60 + 42;
    setInterval(function () {
      if (t > 0) t--;
      var p = function (n) { return String(n).padStart(2, '0'); };
      cd.textContent = p(Math.floor(t / 3600)) + ' : ' + p(Math.floor(t % 3600 / 60)) + ' : ' + p(t % 60);
    }, 1000);
  }

  /* Login → Inicio */
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = 'dashboard.html';
    });
  }
})();
