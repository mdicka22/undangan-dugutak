// ══════════ NAV: scroll state & mobile menu ══════════
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

// ══════════ MOTION PREFERENCE ══════════
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ══════════ COUNTDOWN → 20 Desember 2026 (dengan efek flip) ══════════
const target = new Date('2026-12-20T08:00:00+07:00').getTime();
const el = {
  d: document.getElementById('cd-d'),
  h: document.getElementById('cd-h'),
  m: document.getElementById('cd-m'),
  s: document.getElementById('cd-s'),
};
const pad = n => String(n).padStart(2, '0');

function setNum(node, val) {
  if (node.textContent === val) return;
  node.textContent = val;
  if (reduceMotion) return;
  node.classList.remove('flip');
  void node.offsetWidth; // paksa reflow agar animasi terpicu ulang
  node.classList.add('flip');
}

function tick() {
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  setNum(el.d, pad(d));
  setNum(el.h, pad(h));
  setNum(el.m, pad(m));
  setNum(el.s, pad(s));
}
tick();
setInterval(tick, 1000);

// ══════════ PARTIKEL BARA EMAS (hero) — ringan ══════════
(function () {
  if (reduceMotion) return;
  const canvas = document.getElementById('embers');
  const hero = document.getElementById('hero');
  const media = document.querySelector('.hero__media');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let w, h, particles, raf = null, running = false;

  // sprite glow dirender SEKALI → jauh lebih murah daripada shadowBlur per-frame
  const S = 24;
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = S;
  const sctx = sprite.getContext('2d');
  const g = sctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(232,206,142,0.95)');
  g.addColorStop(0.4, 'rgba(201,168,76,0.5)');
  g.addColorStop(1, 'rgba(201,168,76,0)');
  sctx.fillStyle = g;
  sctx.fillRect(0, 0, S, S);

  function size() {
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(40, Math.round(w / 34));
    particles = Array.from({ length: count }, () => spawn(true));
  }
  function spawn(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 12,
      r: Math.random() * 6 + 2,
      sp: Math.random() * 0.45 + 0.12,
      drift: Math.random() * 0.6 - 0.3,
      ph: Math.random() * Math.PI * 2,
      a: Math.random() * 0.5 + 0.2,
    };
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.y -= p.sp; p.ph += 0.01;
      p.x += Math.sin(p.ph) * 0.4 + p.drift * 0.2;
      if (p.y < -12) Object.assign(p, spawn(false));
      ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(p.ph * 2));
      ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    ctx.globalAlpha = 1;
    if (running) raf = requestAnimationFrame(draw);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(draw); } media && media.classList.remove('paused'); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; media && media.classList.add('paused'); }

  size();
  start();

  // hemat CPU/baterai: berhenti saat hero tak terlihat atau tab disembunyikan
  new IntersectionObserver((es) => {
    es.forEach(e => (e.isIntersecting ? start() : stop()));
  }, { threshold: 0.02 }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 200); });
})();

// ══════════ SCROLL REVEAL ══════════
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${(i % 4) * 0.09}s`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ══════════ BACKSOUND / MUSIC ══════════
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
const musicLabel = document.getElementById('musicLabel');
let userStopped = false;

bgm.volume = 0.55;

function playMusic() {
  bgm.play().then(() => {
    musicBtn.classList.add('playing');
    musicLabel.textContent = 'Musik Aktif';
    musicBtn.setAttribute('aria-label', 'Hentikan musik');
  }).catch(() => {
    // autoplay diblokir browser — menunggu interaksi pengguna
  });
}
function pauseMusic() {
  bgm.pause();
  musicBtn.classList.remove('playing');
  musicLabel.textContent = 'Putar Musik';
  musicBtn.setAttribute('aria-label', 'Putar musik');
}

musicBtn.addEventListener('click', () => {
  if (bgm.paused) { userStopped = false; playMusic(); }
  else { userStopped = true; pauseMusic(); }
});

// coba mulai backsound pada interaksi pertama (klik/sentuh/scroll/tombol)
function tryAutoStart() {
  if (!userStopped && bgm.paused) playMusic();
  if (!bgm.paused) {
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev =>
      window.removeEventListener(ev, tryAutoStart));
  }
}
['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev =>
  window.addEventListener(ev, tryAutoStart, { passive: true }));

// ══════════ RSVP FORM ══════════
const form = document.getElementById('rsvpForm');
const note = document.getElementById('rsvpNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const required = [form.nama, form.angkatan, form.kontak];
  const empty = required.filter(f => !f.value.trim());

  if (empty.length) {
    empty.forEach(f => {
      f.style.borderColor = '#c0603f';
      setTimeout(() => { f.style.borderColor = ''; }, 2000);
    });
    return;
  }

  note.hidden = false;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Terkirim ✓';
  form.querySelectorAll('input, select, textarea, button').forEach(f => f.disabled = true);
});

// ══════════ SCROLL PROGRESS BAR ══════════
const progress = document.getElementById('scrollProgress');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = `scaleX(${p})`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

// ══════════ INTRO / PRELOADER ══════════
(function () {
  const intro = document.getElementById('intro');
  if (!intro) return;
  const hold = reduceMotion ? 300 : 2100;
  document.body.style.overflow = 'hidden';
  function done() {
    intro.classList.add('done');
    document.body.style.overflow = '';
    setTimeout(() => intro.remove(), 900);
  }
  window.addEventListener('load', () => setTimeout(done, hold));
  // jaring pengaman bila event load sudah lewat
  setTimeout(done, hold + 1200);
})();

// ══════════ SMOOTH SCROLL MOMENTUM (desktop, non-touch) ══════════
(function () {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const noTouch = !window.matchMedia('(hover: none)').matches;
  if (reduceMotion || !fine || !noTouch) return;

  let current = window.scrollY, targetY = current, ticking = false;
  const ease = 0.09;

  function clamp(v) {
    return Math.max(0, Math.min(v, document.documentElement.scrollHeight - window.innerHeight));
  }
  function loop() {
    current += (targetY - current) * ease;
    if (Math.abs(targetY - current) < 0.4) { current = targetY; ticking = false; }
    window.scrollTo(0, Math.round(current));
    if (ticking) requestAnimationFrame(loop);
  }
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return; // biarkan zoom
    e.preventDefault();
    targetY = clamp(targetY + e.deltaY);
    if (!ticking) { ticking = true; requestAnimationFrame(loop); }
  }, { passive: false });

  // sinkronkan target saat scroll via anchor/keyboard/scrollbar
  window.addEventListener('scroll', () => { if (!ticking) { current = targetY = window.scrollY; } }, { passive: true });
})();
