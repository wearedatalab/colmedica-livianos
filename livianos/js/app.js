/* ============================================================
   PLANES LIVIANOS COLMÉDICA — lógica de la página
   (mismos lineamientos, botones y UTM de la landing de planes)
   ============================================================ */
(function () {
  'use strict';

  /* ===== Year ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Scroll progress + header ===== */
  const progress = document.getElementById('scroll-progress');
  const header = document.getElementById('siteHeader');
  function onScroll() {
    const h = document.documentElement;
    const sc = h.scrollTop || document.body.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (sc / max) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', sc > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ===== Mobile menu ===== */
  const burger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
    });
  }
  window.closeMobile = function () {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    if (burger) burger.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  /* ===== Tag Manager (mismo evento eventClick del sitio actual) ===== */
  window.dataLayer = window.dataLayer || [];
  function clicTag(eventCategory, eventAction, eventLabel) {
    try {
      window.dataLayer.push({
        eventCategory: eventCategory,
        eventAction: String(eventAction || '').toLowerCase().replace(/[\*\^\'\!]/g, ''),
        eventLabel: String(eventLabel || '').toLowerCase(),
        eventvalue: '',
        event: 'eventClick'
      });
    } catch (_) {}
  }
  window.clicTag = clicTag;

  /* ============================================================
     UTM / BOTONES — misma operación de la landing de planes:
     • Si la página llega CON parámetros (UTM, gclid, fbclid…)
       estos se conservan tal cual en todos los botones.
     • Si llega SIN parámetros, cada botón usa su URL por defecto.
     • Los enlaces al formulario S3 se abren en ventana emergente
       vertical (igual que la landing y el sitio oficial).
     ============================================================ */
  const S3BASE = 'https://colmedica.s3.us-east-2.amazonaws.com/index.html';
  const POPUP = 'width=550,height=800,left=50,top=50,toolbar=yes';

  // Parámetros por defecto (sin UTM entrante)
  const S3_DEFAULTS = {
    // Igual que el botón "Compra telefónica" de la página Livianos actual
    livianos: '?plan=1&subplan=06&crm=Planes-Livianos&crm-sub=Planes-Livianos',
    // Igual que la landing de planes (por gama)
    premium: '?plan=2&subplan=03&crm=Organico&crm-sub=Landing-completos&utm_source=Directo&utm_medium=Directo',
    medios:  '?plan=7&subplan=03&crm=Organico&crm-sub=Landing-completos&utm_source=Directo&utm_medium=Directo',
    // Igual que el videobot actual
    videobot: '?plan=1&subplan=livianos-videobot&crm=Planes-Livianos&crm-sub=Planes-Livianos&utm_source=videobot',
    asesor:   '?plan=2&subplan=03&crm=Performance&crm-sub=Landing-Page&utm_source=videobot'
  };
  const GAMA_GROUP = {
    diamante: 'premium', zafiro: 'premium', rubi: 'premium',
    ambar: 'medios', caobo: 'medios', hospitalarios: 'medios'
  };

  function pageQS() {
    // Se ignoran los parámetros del carrito (CodigoPlan) igual que el sitio actual
    let qs = window.location.search || '';
    if (qs.indexOf('CodigoPlan') !== -1) qs = qs.slice(0, qs.indexOf('CodigoPlan')).replace(/[?&]$/, '');
    return qs && qs !== '?' ? qs : '';
  }

  function s3Url(kind) {
    const qs = pageQS();
    if (qs) return S3BASE + qs;
    return S3BASE + (S3_DEFAULTS[kind] || S3_DEFAULTS.livianos);
  }
  window.colmedicaAfiliacionUrl = (gama) => s3Url(GAMA_GROUP[gama] || 'livianos');
  window.s3Url = s3Url;

  function openS3(url, label) {
    clicTag('boton', 'habla aqui con un asesor', label || 'formulario');
    const w = window.open(url, '', POPUP);
    if (w) { try { w.focus(); } catch (_) {} }
    else { window.open(url, '_blank'); }
  }
  window.openS3 = openS3;

  // Botones estáticos → formulario S3 (popup)
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-s3], [data-s3-gama]');
    if (!el) return;
    e.preventDefault();
    const kind = el.dataset.s3Gama ? (GAMA_GROUP[el.dataset.s3Gama] || 'premium') : (el.dataset.s3 || 'livianos');
    openS3(s3Url(kind), el.textContent.trim());
  });
  // Cualquier otro enlace directo al S3 (paneles del videobot, modales)
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="' + S3BASE + '"]');
    if (!a || a.hasAttribute('data-s3') || a.hasAttribute('data-s3-gama')) return;
    e.preventDefault();
    const qs = pageQS();
    openS3(qs ? S3BASE + qs : a.href, a.textContent.trim());
  });

  // Enlaces .agregar-utm → conservan los parámetros de la página (igual que el sitio actual)
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a.agregar-utm');
    if (!a) return;
    const raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#') return;
    const qs = pageQS();
    if (!qs) return;
    const hashIdx = raw.indexOf('#');
    const hash = hashIdx !== -1 ? raw.slice(hashIdx) : '';
    const noHash = hashIdx !== -1 ? raw.slice(0, hashIdx) : raw;
    const base = noHash.split('?')[0];
    const own = noHash.split('?')[1] || '';
    a.href = base + qs + (own ? '&' + own : '') + hash;
  });

  // Abrir los T&C al hacer click en el superíndice del precio
  document.addEventListener('click', function (e) {
    const a = e.target.closest('[data-open-terms]');
    if (!a) return;
    const id = (a.getAttribute('href') || '').replace('#', '');
    const target = document.getElementById(id);
    if (target && target.tagName === 'DETAILS') target.open = true;
  });

  /* ============================================================
     VIDEO PRINCIPAL DEL HERO
     ============================================================ */
  const videoHome = document.getElementById('videoHome');
  const videoHomePlay = document.getElementById('videoHomePlay');
  if (videoHome && videoHomePlay) {
    videoHomePlay.addEventListener('click', () => {
      videoHomePlay.classList.add('is-hidden');
      videoHome.controls = true;
      videoHome.play();
      clicTag('home', 'video principal', 'play');
    });
    videoHome.addEventListener('ended', () => {
      videoHome.controls = false;
      videoHomePlay.classList.remove('is-hidden');
      try { videoHome.currentTime = 0; } catch (_) {}
    });
  }

  /* ============================================================
     MODAL INFORMATIVO DE PLAN LIVIANO (video + info + compra)
     Contenido igual al modal de la página actual.
     ============================================================ */
  const LIVIANOS = {
    esmeralda: {
      title: 'Plan Esmeralda Ambulatorio',
      price: 'Desde $62.432*',
      video: 'livianos/videos/EsmeraldaAmbulatorio.mp4',
      desc: '<ul><li>Acceso <strong>ilimitado</strong> a consulta domiciliaria médica general 24/7.</li><li>Acceso directo a más de <strong>100 especialidades</strong>.</li><li>Odontología preventiva.</li><li>Sin límite de edad ni examen de ingreso.</li></ul>',
      cond: '*Valor mensual 2026 con IVA para una persona de 3 a 17 años. Aplican condiciones contractuales.',
      buy: 'https://www.colmedica.com/Productos/Paginas/Registro.aspx?CodigoPlan=40',
      more: 'plan-esmeralda-ambulatorio.html'
    },
    domiciliario: {
      title: 'Plan Domiciliario Superior',
      price: 'Desde $51.254*',
      video: 'livianos/videos/DomiciliarioSuperior.mp4',
      desc: '<ul><li>Acceso a consultas médicas <strong>presenciales y por videollamada</strong>.</li><li>Acceso <strong>ilimitado</strong> a consulta domiciliaria médica general 24/7.</li><li>Traslado en ambulancia terrestre.</li><li>Terapias domiciliarias: física (fisioterapia) y respiratorias.</li></ul>',
      cond: '*Tarifa mensual IVA incluido. Aplican condiciones. No aplica para contratos ya existentes.',
      buy: 'https://www.colmedica.com/Productos/Paginas/Registro.aspx?CodigoPlan=102',
      more: 'plan-domiciliario-superior.html'
    },
    oncologico: {
      title: 'Plan Oncológico Vida Plus',
      price: 'Desde $46.989*',
      video: 'livianos/videos/Oncologico.mp4',
      desc: '<ul><li>Atención en las <strong>principales clínicas</strong> del país.</li><li><strong>Valoración preventiva</strong> oncológica.</li><li>Orientación médica <strong>ilimitada</strong> por llamada o videollamada 24/7.</li><li>Reembolso por gastos de diagnóstico inicial o nuevo cáncer.</li></ul>',
      cond: '*Valor mensual 2026 con IVA para una persona de 15 a 18 años en un contrato familiar. Aplican condiciones contractuales.',
      buy: 'https://www.colmedica.com/Productos/Paginas/Registro.aspx?CodigoPlan=88',
      more: 'plan-oncologico-vida-plus.html'
    }
  };

  const pvModal = document.getElementById('planVideoModal');
  const pvPlayer = document.getElementById('planVideoPlayer');
  window.openPlanVideo = function (key) {
    const p = LIVIANOS[key];
    if (!p || !pvModal) return;
    document.getElementById('planVideoTitle').textContent = p.title;
    document.getElementById('planVideoPrice').textContent = p.price;
    document.getElementById('planVideoDesc').innerHTML = p.desc;
    document.getElementById('planVideoCond').textContent = p.cond;
    document.getElementById('planVideoBuy').setAttribute('href', p.buy);
    document.getElementById('planVideoMore').setAttribute('href', p.more);
    pvPlayer.src = p.video;
    pvModal.classList.add('open');
    pvModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    pvPlayer.play().catch(function () {});
    clicTag('home', p.title, 'ver video');
  };
  window.closePlanVideo = function () {
    if (!pvModal) return;
    try { pvPlayer.pause(); } catch (_) {}
    pvPlayer.removeAttribute('src');
    pvPlayer.load();
    pvModal.classList.remove('open');
    pvModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };
  if (pvModal) pvModal.addEventListener('click', e => { if (e.target === pvModal) window.closePlanVideo(); });

  /* ============================================================
     CARRUSEL "MÁS BENEFICIOS" (igual que la landing de planes)
     ============================================================ */
  (function () {
    const track = document.getElementById('planesCarousel');
    if (!track) return;
    const wrap = track.parentElement;
    const cards = Array.from(track.querySelectorAll('.plan-card'));
    const dotsBox = document.getElementById('planDots');
    const pillsBox = document.getElementById('planesPills');
    const prevBtn = document.getElementById('planPrev');
    const nextBtn = document.getElementById('planNext');

    const SHORT_NAMES = {
      diamante: 'Diamante', zafiro: 'Zafiro', rubi: 'Rubí',
      hospitalarios: 'Hospitalarios', caobo: 'Caobo', ambar: 'Ámbar Vital'
    };

    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Ir al plan ' + (i + 1));
      d.addEventListener('click', () => scrollToCard(i));
      dotsBox.appendChild(d);
    });
    const dots = Array.from(dotsBox.children);

    cards.forEach((c, i) => {
      const gama = c.dataset.gama || '';
      const label = SHORT_NAMES[gama] || (c.querySelector('.plan-gama') ? c.querySelector('.plan-gama').textContent : ('Plan ' + (i + 1)));
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'plan-pill' + (i === 0 ? ' active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Ver ' + label);
      b.textContent = label;
      b.addEventListener('click', () => scrollToCard(i));
      pillsBox.appendChild(b);
    });
    const pills = Array.from(pillsBox.children);

    function scrollToCard(i) {
      const card = cards[i];
      if (!card) return;
      track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }
    function getActiveIndex() {
      const left = track.scrollLeft;
      let best = 0, bestDist = Infinity;
      cards.forEach((c, i) => {
        const dist = Math.abs((c.offsetLeft - track.offsetLeft) - left);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      return best;
    }
    function scrollPillIntoView(idx) {
      const pill = pills[idx];
      if (!pill) return;
      const pillRect = pill.getBoundingClientRect();
      const boxRect = pillsBox.getBoundingClientRect();
      if (pillRect.left < boxRect.left || pillRect.right > boxRect.right) {
        pillsBox.scrollTo({ left: pill.offsetLeft - pillsBox.clientWidth / 2 + pill.offsetWidth / 2, behavior: 'smooth' });
      }
    }
    function update() {
      const active = getActiveIndex();
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
      pills.forEach((p, i) => p.classList.toggle('active', i === active));
      scrollPillIntoView(active);
      const maxScroll = track.scrollWidth - track.clientWidth;
      const atEnd = Math.abs(track.scrollLeft - maxScroll) < 4;
      wrap.classList.toggle('at-end', atEnd);
      prevBtn.style.opacity = active === 0 ? '.45' : '1';
      prevBtn.style.pointerEvents = active === 0 ? 'none' : 'auto';
      nextBtn.style.opacity = atEnd ? '.45' : '1';
      nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
    }
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    prevBtn.addEventListener('click', () => scrollToCard(Math.max(0, getActiveIndex() - 1)));
    nextBtn.addEventListener('click', () => scrollToCard(Math.min(cards.length - 1, getActiveIndex() + 1)));
    window.addEventListener('load', update);
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(update, 180); });
    update();

    // Drag-to-scroll (igual que la landing)
    let isDown = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      isDown = true; moved = false;
      startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('is-grabbing');
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-grabbing');
      if (moved) scrollToCard(getActiveIndex());
    });
  })();

  /* ============================================================
     MODAL "VER PLAN COMPLETO" (datos de la landing de planes)
     ============================================================ */
  const PLANS = {
    diamante: {
      gama: 'Planes Diamante', tagline: 'Cobertura superior y asistencia en viajes en el exterior.', price: '428.782',
      features: [
        'Red hospitalaria VIP',
        'Hospitalización en habitación tipo suite',
        'Médico domiciliario',
        'Servicio de orientación médica 24/7',
        '+100 especialidades de acceso directo',
        '+4.400 profesionales adscritos',
        'Medicamentos ambulatorios pre y post-hospitalarios',
        '34 Centros Médicos, de Diagnóstico y Odontológicos propios',
        '1 Centro médico exclusivo Zafiro en Bogotá',
        'Asistencia en viajes en el exterior',
        'Reembolso para copagos y cuotas moderadoras*',
        'Auxilio diario por hospitalización*',
        'Auxilio para nueva tecnología en servicios ambulatorios y hospitalarios*',
        'Reembolso para que elijas libremente dónde y con quién atenderte aunque no haga parte de nuestra guía médica**'
      ]
    },
    zafiro: {
      gama: 'Planes Zafiro', tagline: 'Coberturas y acceso élite para tu salud.', price: '301.786',
      features: [
        'Red hospitalaria VIP',
        'Hospitalización en habitación individual',
        'Médico domiciliario',
        'Servicio de orientación médica 24/7',
        '+100 especialidades de acceso directo',
        '+4.400 profesionales adscritos',
        'Medicamentos ambulatorios pre y post-hospitalarios',
        '34 Centros Médicos, de Diagnóstico y Odontológicos propios',
        '1 Centro médico exclusivo Zafiro en Bogotá',
        'Asistencia en viajes en el exterior',
        'Reembolso para copagos y cuotas moderadoras*',
        'Auxilio diario por hospitalización*',
        'Auxilio para nueva tecnología en servicios ambulatorios y hospitalarios*'
      ]
    },
    rubi: {
      gama: 'Planes Rubí', tagline: 'Protección y cuidado confiable para los tuyos.', price: '257.664',
      features: [
        'Red hospitalaria preferente',
        'Hospitalización en habitación individual',
        'Médico domiciliario',
        'Servicio de orientación médica 24/7',
        '+100 especialidades de acceso directo',
        '+4.400 profesionales adscritos',
        'Medicamentos ambulatorios pre y post-hospitalarios',
        '33 Centros Médicos, de Diagnóstico y Odontológicos propios'
      ]
    },
    ambar: {
      gama: 'Ámbar Vital', tagline: 'Incluye acceso a 4 clínicas VIP a nivel nacional.', price: '154.219',
      features: [
        'Red hospitalaria preferente + 4 clínicas VIP',
        'Hospitalización en habitación individual',
        'Médico domiciliario',
        'Servicio de orientación médica 24/7',
        '+100 especialidades de acceso directo',
        '+4.400 profesionales adscritos',
        '33 Centros Médicos, de Diagnóstico y Odontológicos propios',
        'Este plan se comercializa a nivel nacional, excluyendo Bogotá y municipios aledaños a Bogotá.'
      ]
    },
    caobo: {
      gama: 'Caobo Integral', tagline: 'Cobertura integral con maternidad y alto costo.', price: '129.687',
      features: [
        'Red hospitalaria esencial',
        'Hospitalización en habitación individual',
        'Médico domiciliario',
        'Servicio de orientación médica 24/7',
        'Consultas médicas puerta de entrada a través de los Centros Médicos Colmédica de: Chapinero, Suba, Salitre Capital, Metrópolis, Calle 185, Unicentro de Occidente, Plaza Central y Chía.',
        'Este plan se comercializa únicamente para usuarios con residencia en Bogotá o Chía.'
      ]
    },
    hospitalarios: {
      gama: 'Hospitalarios', tagline: 'Protección con coberturas específicas en servicios hospitalarios.', price: '53.122',
      features: [
        'Atención de Urgencias que deriven en Hospitalización o Cirugía',
        'Consultas médicas pre y post - hospitalarias',
        'Hospitalización en habitación individual',
        'Cama de acompañante',
        'Auxiliar de Enfermería',
        'Traslado en Ambulancia Terrestre',
        'Servicio de orientación médica 24/7'
      ]
    }
  };

  const modal = document.getElementById('planModal');
  window.openPlan = function (key) {
    const p = PLANS[key];
    if (!p || !modal) return;
    document.getElementById('modalHead').dataset.gama = key;
    document.getElementById('modalGama').textContent = p.gama;
    document.getElementById('modalTagline').textContent = p.tagline;
    document.getElementById('modalPriceValue').textContent = p.price || '';
    document.getElementById('modalFeatures').innerHTML = p.features.map(f =>
      '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>'
    ).join('');
    const mfBtn = modal.querySelector('.modal-footer a.btn-primary');
    if (mfBtn) mfBtn.href = window.colmedicaAfiliacionUrl(key);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };
  window.closePlan = function () {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) window.closePlan(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modal) window.closePlan();
      if (pvModal) window.closePlanVideo();
    }
  });

  /* ============================================================
     VIDEOBOT — integrado directamente (sin iframe)
     Mismo flujo, videos y enlaces del videobot actual.
     ============================================================ */
  (function () {
    const shell = document.getElementById('videobot');
    if (!shell) return;

    const V = 'livianos/videobot/';
    const KNOW_Q = '?plan=1&subplan=06&crm=Planes-Livianos&crm-sub=Planes-Livianos&utm_source=videobot';

    // Árbol de decisión (idéntico al 3.3.html del videobot)
    const PANES = {
      '0':    { video: 'intro.mp4', intro: true },
      '0p':   { video: '0p-especialistas.mp4', q: '¿Necesitas especialistas?', yes: ['Si los necesito', '01', 'si_especialista'], no: ['No los necesito aún', '00', 'no_especialista'], back: '0' },
      '01':   { video: '01-examenes.mp4', q: '¿Necesitas exámenes especializados y laboratorios?', yes: ['Si los necesito', '011', 'si_examenes'], no: ['No los necesito aún', '010', 'no_examenes'], back: '0p' },
      '00':   { video: '00-domiciliario.mp4', q: '¿Necesitas servicios domiciliarios?', yes: ['Si los necesito', '001', 'si_domicilio1'], no: ['No los necesito aún', '000', 'no_domicilio1'], back: '0p' },
      '011':  { video: '011-domiciliario.mp4', q: '¿Necesitas servicios domiciliarios?', yes: ['Si los necesito', '0111', 'si_domicilio2'], no: ['No los necesito aún', '0110', 'no_domicilio2'], back: '01' },
      '010':  { video: '00-domiciliario.mp4', q: '¿Necesitas servicios domiciliarios?', yes: ['Si los necesito', '0101', 'si_domicilio3'], no: ['No los necesito aún', '0100', 'no_domicilio3'], back: '01' },
      '001':  { video: '001-plan-domiciliario-vital.mp4', plan: 'Domiciliario Vital', know: 'https://www.colmedica.com/Productos/Paginas/DomiciliarioVital.aspx' + KNOW_Q, back: '00', idKnow: 'si_plan_domicilio', idQuote: 'no_plan_domicilio' },
      '000':  { video: '000-odontologia.mp4', q: '¿Necesitas servicios odontológicos?', yes: ['Si los necesito', '0001', 'si_odontologico'], no: ['No los necesito aún', '0000', 'no_odontologico'], back: '00' },
      '0111': { video: '0111-odontologico.mp4', q: '¿Necesitas servicios odontológicos?', yes: ['Si los necesito', '01111'], no: ['No los necesito aún', '01110'], back: '011' },
      '0110': { video: '000-odontologia.mp4', q: '¿Necesitas servicios odontológicos?', yes: ['Si los necesito', '01101'], no: ['No los necesito aún', '01100'], back: '011' },
      '0101': { video: '0101-plan-domiciliario-superior.mp4', plan: 'Domiciliario Superior', know: 'plan-domiciliario-superior.html', back: '010' },
      '0100': { video: '0100-odontologia.mp4', q: '¿Necesitas servicios odontológicos?', yes: ['Si los necesito', '01001'], no: ['No los necesito aún', '01000'], back: '010' },
      '0001': { video: '0001-plan-odontologico.mp4', plan: 'Odontológico Básico Integral', know: 'https://www.colmedica.com/Productos/Paginas/Odontologico.aspx' + KNOW_Q, back: '000' },
      '0000': { video: '0000-oncologico.mp4', q: '¿Necesitas protección ante un cáncer?', yes: ['Si lo necesito', '00001'], no: ['No lo necesito aún', '00000'], back: '000' },
      '01111': { video: '01111-plan-esmeralda.mp4', plan: 'Esmeralda Ambulatorio', know: 'plan-esmeralda-ambulatorio.html', back: '0111' },
      '01110': { video: '01111-plan-esmeralda.mp4', plan: 'Esmeralda Ambulatorio', know: 'plan-esmeralda-ambulatorio.html', back: '0111' },
      '01101': { video: '01111-plan-esmeralda.mp4', plan: 'Esmeralda Ambulatorio', know: 'plan-esmeralda-ambulatorio.html', back: '0110' },
      '01100': { video: '01111-plan-esmeralda.mp4', plan: 'Esmeralda Ambulatorio', know: 'plan-esmeralda-ambulatorio.html', back: '0110' },
      '01001': { video: '01111-plan-esmeralda.mp4', plan: 'Esmeralda Ambulatorio', know: 'plan-esmeralda-ambulatorio.html', back: '0100' },
      '01000': { video: '00000-planes-completos.mp4', otros: true, back: '0100' },
      '00001': { video: '00001-plan-oncologico.mp4', plan: 'Oncológico Vida Plus', know: 'plan-oncologico-vida-plus.html', back: '0000' },
      '00000': { video: '00000-planes-completos.mp4', otros: true, back: '0000' }
    };

    const vigilado = '<span class="vigilado-video vigilado--pill"><img src="livianos/fotos/logo-SuperSalud-Res.png" alt="Vigilado Supersalud"></span>';

    function btn(label, attrs, extraClass) {
      return '<a class="vbot-btn' + (extraClass ? ' ' + extraClass : '') + '" ' + attrs + '>' + label + '</a>';
    }

    let html = '';
    Object.keys(PANES).forEach(key => {
      const p = PANES[key];
      let right = '';
      if (p.intro) {
        right =
          '<div class="vbot-q" id="vbotIntroAsk">' +
          '  <p>¿Quieres conocer el plan que más se adapta a tus necesidades?</p>' +
          '  <div class="vbot-btns"><a class="vbot-btn" id="dale_play" data-vbot-play="0">Dale Play</a></div>' +
          '</div>' +
          '<div class="vbot-q" id="vbotIntroGo" style="display:none">' +
          '  <p>Comienza esta encuesta rápida</p>' +
          '  <div class="vbot-btns"><a class="vbot-btn" id="comenzar" data-vbot-go="0p">¡Clic aquí!</a></div>' +
          '</div>';
      } else if (p.q) {
        right =
          '<div class="vbot-q">' +
          '  <p>' + p.q + '</p>' +
          '  <div class="vbot-btns">' +
          btn(p.yes[0], (p.yes[2] ? 'id="' + p.yes[2] + '" ' : '') + 'data-vbot-go="' + p.yes[1] + '"') +
          btn(p.no[0], (p.no[2] ? 'id="' + p.no[2] + '" ' : '') + 'data-vbot-go="' + p.no[1] + '"') +
          btn('volver a la anterior pregunta', 'data-vbot-go="' + p.back + '"', 'vbot-btn--back') +
          '  </div>' +
          '</div>';
      } else if (p.plan) {
        const isExternal = p.know.indexOf('http') === 0;
        right =
          '<div class="vbot-q">' +
          '  <p>Te recomendamos el plan<br><span class="vbot-plan-name">' + p.plan + '</span></p>' +
          '  <div class="vbot-btns">' +
          btn('Conocer más del plan', (p.idKnow ? 'id="' + p.idKnow + '" ' : '') + 'href="' + p.know + '" class-placeholder' + (isExternal ? ' target="_blank" rel="noopener"' : ''), '') +
          btn('Cotizar el precio', (p.idQuote ? 'id="' + p.idQuote + '" ' : '') + 'href="' + S3BASE + S3_DEFAULTS.videobot + '"') +
          btn('volver a la anterior pregunta', 'data-vbot-go="' + p.back + '"', 'vbot-btn--back') +
          '  </div>' +
          '</div>';
      } else if (p.otros) {
        right =
          '<div class="vbot-q">' +
          '  <p>Te invitamos a ver otros planes para ti</p>' +
          '  <div class="vbot-btns">' +
          btn('Conocer más', 'href="https://www.colmedica.com/Productos/planes.aspx' + KNOW_Q + '" target="_blank" rel="noopener"') +
          btn('Hablar con un asesor', 'href="' + S3BASE + S3_DEFAULTS.asesor + '"') +
          btn('volver a la anterior pregunta', 'data-vbot-go="' + p.back + '"', 'vbot-btn--back') +
          '  </div>' +
          '</div>';
      }

      html +=
        '<div class="vbot-pane' + (key === '0' ? ' is-active' : '') + '" data-pane="' + key + '">' +
        '  <div class="vbot-flex">' +
        '    <div class="vbot-video">' +
        '      <div class="vbot-video-inner">' +
        '        <video preload="none" playsinline ' + (p.intro ? 'poster="' + V + 'inicio.jpg"' : 'controls controlsList="nofullscreen" disablePictureInPicture') + '>' +
        '          <source src="' + V + p.video + '" type="video/mp4">' +
        '        </video>' +
        (p.intro ? '<button class="video-play-btn" data-vbot-play="0" aria-label="Reproducir"><span class="play-circle"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></button>' : '') +
        vigilado +
        '      </div>' +
        '    </div>' +
        right +
        '  </div>' +
        '</div>';
    });
    // Limpieza del placeholder de clase (los enlaces "conocer más" internos llevan UTM)
    html = html.replace(/class-placeholder/g, 'data-agregar-utm="1"');
    shell.innerHTML = html;

    const panes = {};
    shell.querySelectorAll('.vbot-pane').forEach(el => { panes[el.dataset.pane] = el; });

    function pauseAll() {
      shell.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (_) {} });
    }
    function goTo(key) {
      const pane = panes[key];
      if (!pane) return;
      pauseAll();
      shell.querySelectorAll('.vbot-pane').forEach(el => el.classList.remove('is-active'));
      pane.classList.add('is-active');
      const vid = pane.querySelector('video');
      if (vid && key !== '0') { vid.play().catch(function () {}); }
      clicTag('videobot', 'pantalla', key);
    }

    shell.addEventListener('click', function (e) {
      // Play de la intro
      const playBtn = e.target.closest('[data-vbot-play]');
      if (playBtn) {
        e.preventDefault();
        const pane = panes['0'];
        const vid = pane.querySelector('video');
        const overlay = pane.querySelector('.video-play-btn');
        if (overlay) overlay.classList.add('is-hidden');
        vid.controls = true;
        vid.play().catch(function () {});
        const ask = document.getElementById('vbotIntroAsk');
        const go = document.getElementById('vbotIntroGo');
        if (ask) ask.style.display = 'none';
        if (go) go.style.display = '';
        clicTag('videobot', 'intro', 'dale play');
        return;
      }
      // Navegación entre paneles
      const nav = e.target.closest('[data-vbot-go]');
      if (nav) {
        e.preventDefault();
        goTo(nav.dataset.vbotGo);
        return;
      }
      // Enlaces internos "Conocer más del plan" → conservar UTM de la página
      const know = e.target.closest('a[data-agregar-utm]');
      if (know) {
        const raw = know.getAttribute('href');
        if (raw && raw.indexOf('http') !== 0) {
          const qs = pageQS();
          if (qs) know.href = raw.split('?')[0] + qs;
        }
      }
    });
  })();

  /* ============================================================
     BARRA FLOTANTE DE COMPRA (páginas internas de plan)
     ============================================================ */
  const floatbar = document.getElementById('floatbar');
  if (floatbar) {
    const heroRef = document.querySelector('.iplan-hero');
    function updateBar() {
      const limit = heroRef ? heroRef.offsetTop + heroRef.offsetHeight : 400;
      const nearEnd = window.innerHeight + window.scrollY >= document.body.offsetHeight - 120;
      floatbar.classList.toggle('is-visible', window.scrollY > limit - 100 && !nearEnd);
    }
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  }

})();
