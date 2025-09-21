// --- FORZAR HOME EN RELOAD ---
(function () {
  // Detecta recarga de la página (estándar + fallback)
  const isReload = (() => {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (nav && nav.type) return nav.type === 'reload';
    if (performance.navigation) return performance.navigation.type === 1; // fallback
    return false;
  })();

  if (isReload) {
    // Ir a Home (index.html) en cualquier recarga de flowers.html
    window.location.replace('index.html');
    return; // detiene el resto de app.js
  }
})();


(function () {
  // GUARD: si no hay ?to=Gabriela|Patricia -> volver al Home
  const VALID = ['Gaby', 'Mami Patty', 'Mami Barros'];
  const params = new URLSearchParams(window.location.search);
  const toParam = params.get('to');
  const valid = VALID.includes(toParam);
  if (!valid) {
    const last = localStorage.getItem('lastTo');
    const fallback = VALID.includes(last) ? `?to=${last}` : '';
    window.location.replace(`index.html${fallback}`);
    return;
  }

  const RECIPIENT = toParam;       // Solo Gabriela o Patricia
  const WORD = RECIPIENT;          // palabra que se dibuja


  const stage = document.querySelector('.stage');
  const container = document.getElementById('flowerWord');
  const measure = document.getElementById('measure');
  const ctx = measure.getContext('2d');
  const DPR = Math.min(2, window.devicePixelRatio || 1);


  // Mensajes personalizados (actualiza/añade estos)
  const msgEl = document.getElementById('mainMessage');
  if (msgEl) {
    const messages = {
      'Gaby': `¡Feliz Día de las Flores Amarillas, Gaby! 🌻<br><br>
      En este día tan especial quiero que sepas que tu sonrisa ilumina cada momento
      y tu cariño hace que todo sea más hermoso para todos nosotros.<br><br>
      Este ramo viene cargado de todo mi amor, sabes que siempre te voy a estar ahí para tí.
      Que sigas floreciendo y nos sigas llenando de alegría todos nuestros días.<br><br>
      Con todo mi cariño, tu ñaño que te adora , Danilito 💛`,

      'Mami Patty': `¡Feliz Día de las Flores Amarillas, Mami Patty! 🌻<br><br>
      Gracias por nuestro pilar, nuestra guía y nuestra luz de cada día. Tu amor, tu paciencia y tu fuerza
      me han hecho ser quien soy.<br><br>
      Hoy te regalo este ramo para recordarte cuánto te admiro y te amo. Que la vida te siga
      abrazando con salud y momentos ded alegría.<br><br>
      Con todo mi amor, tu hijo Danilito 💛`,

      'Mami Barros': `¡Feliz Día de las Flores Amarillas, Mami Barros! 🌻<br><br>
      Gracias por tu ternura, tus historias y ese abrazo que todo lo calma. Eres el corazón de la familia y
      la luz que siempre nos guía.<br><br>
      Hoy te dedico este ramo para decirte cuánto te queremos. Que la vida te regale salud, paz y nos de
      muchos momentos llenos de sonrisas.<br><br>
      Con todo el amor de tu nieto Danilito 💛`
    };
    msgEl.innerHTML = messages[RECIPIENT];

    document.title = `Para ${RECIPIENT} – Flores Amarillas`;
  }

  function buildWord() {
    container.innerHTML = '';
    const W = stage.clientWidth, H = stage.clientHeight;
    measure.width = Math.floor(W * DPR);
    measure.height = Math.floor(H * DPR);
    ctx.clearRect(0, 0, measure.width, measure.height);

    const isMobile = window.matchMedia('(max-width: 560px)').matches;

    // 1) Preparar líneas: en móvil, si hay dos palabras, dividir en 2 líneas
    let LINES = [WORD];
    if (isMobile && /\s/.test(WORD)) {
      const parts = WORD.trim().split(/\s+/);
      if (parts.length >= 2) {
        LINES = [parts[0], parts.slice(1).join(' ')]; // "Mami" / "Patty" o "Barros"
      }
    }

    // 2) Calcular fontSize que quepa en ancho y alto (manteniendo fillText + 900)
    const base = Math.min(W, H);
    let fontSize = Math.floor(base * 0.5);
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    function fits(fs) {
      ctx.font = `900 ${fs * DPR}px system-ui,Segoe UI,Arial`;
      const maxWidth = W * DPR * 0.86;
      let widest = 0;
      for (const line of LINES) {
        const w = ctx.measureText(line).width;
        if (w > widest) widest = w;
      }
      // Altura total si hay 2 líneas (ligera separación 0.1x)
      const lineGap = (LINES.length > 1) ? fs * 0.1 : 0;
      const totalHeight = (LINES.length * fs * DPR) + ((LINES.length - 1) * (lineGap * DPR));

      return (widest <= maxWidth) && (totalHeight <= H * DPR * 0.72);
    }

    while (!fits(fontSize) && fontSize > 10) fontSize -= 2;
    ctx.font = `900 ${fontSize * DPR}px system-ui,Segoe UI,Arial`;

    // 3) Dibujar 1 o 2 líneas (SIEMPRE con fillText) centradas
    const lineGap = (LINES.length > 1) ? fontSize * 0.1 : 0; // pequeña separación
    const totalHeightPx = (LINES.length * fontSize) + ((LINES.length - 1) * lineGap);
    let yStart = (measure.height / 2) - ((totalHeightPx * DPR) / 2) + (fontSize * DPR) / 2;

    LINES.forEach((line, i) => {
      const y = yStart + i * ((fontSize + lineGap) * DPR);
      ctx.fillText(line, measure.width / 2, y);
    });

    // 4) Muestrear píxeles y colocar flores (idéntico a tu build original)
    const img = ctx.getImageData(0, 0, measure.width, measure.height);
    const data = img.data;
    const STEP = Math.max(6, Math.floor(W / 170));
    const scaleX = W / measure.width;
    const scaleY = H / measure.height;

    for (let y = 0; y < measure.height; y += STEP) {
      for (let x = 0; x < measure.width; x += STEP) {
        const a = data[(y * measure.width + x) * 4 + 3];
        if (a > 150) {
          const fx = Math.round(x * scaleX);
          const fy = Math.round(y * scaleY);
          const dot = document.createElement('div');
          dot.className = 'flr';
          dot.style.left = (fx - 8) + 'px';
          dot.style.top = (fy - 8) + 'px';
          dot.style.setProperty('--r', (Math.random() * 180 - 90).toFixed(1) + 'deg');
          dot.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#flor"></use></svg>';
          container.appendChild(dot);
        }
      }
    }
  }

  let rid;
  const onResize = () => { cancelAnimationFrame(rid); rid = requestAnimationFrame(buildWord); };
  window.addEventListener('resize', onResize, { passive: true });
  buildWord();

  // --- Lógica regalo ---
  const btnOpen = document.getElementById('btnOpen');
  const overlay = document.getElementById('overlay');
  const btnClose = document.getElementById('btnClose');
  const lid = document.getElementById('lid');
  const flowersContainer = document.getElementById('flowersContainer');

  function openGift() {
    if (overlay.classList.contains('show')) return;
    lid.style.transform = 'translateX(-50%) rotateX(78deg) rotateZ(-12deg)';
    setTimeout(() => {
      overlay.classList.add('show');
      flowersContainer.style.display = "block"; // mostrar las flores
    }, 450);
  }

  function closeGift() {
    overlay.classList.remove('show');
    lid.style.transform = 'translateX(-50%)';
    flowersContainer.style.display = "none"; // ocultar al cerrar
  }

  btnOpen.addEventListener('click', openGift);
  btnClose.addEventListener('click', closeGift);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeGift(); });

  // --- pétalos cayendo ---
  const sky = document.querySelector('.sky');
  function makePetal() {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 100 100');
    el.setAttribute('class', 'petal');
    el.style.left = Math.random() * 100 + 'vw';
    el.style.setProperty('--dur', (7 + Math.random() * 6).toFixed(2) + 's');
    el.innerHTML = '<use href="#petal"></use>';
    sky.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
  setInterval(makePetal, 350);
  for (let i = 0; i < 10; i++) setTimeout(makePetal, i * 120);
})();
