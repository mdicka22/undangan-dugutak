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

// ══════════ COUNTDOWN (config-driven) ══════════
// >>> CARA MENGAKTIFKAN HITUNG MUNDUR SAAT JADWAL SUDAH PASTI:
//     Cukup isi tanggal & jam acara di baris EVENT_DATE ini (format ISO, zona Aceh +07:00),
//     contoh: const EVENT_DATE = '2026-12-20T08:00:00+07:00';
//     Biarkan null untuk menampilkan mode "TBA". Animasi flip & konsepnya tetap sama.
const EVENT_DATE = null;

const cdUnits = document.getElementById('cdUnits');
const cdTba = document.getElementById('cdTba');
const cdDate = document.getElementById('cdDate');
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

if (EVENT_DATE) {
  // MODE HITUNG MUNDUR
  cdTba.style.display = 'none';
  cdUnits.style.display = '';
  const target = new Date(EVENT_DATE).getTime();
  const label = new Date(EVENT_DATE).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  cdDate.innerHTML = label + ' &middot; Banda Aceh';
  const tick = () => {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    setNum(el.d, pad(d));
    setNum(el.h, pad(h));
    setNum(el.m, pad(m));
    setNum(el.s, pad(s));
  };
  tick();
  setInterval(tick, 1000);
} else {
  // MODE TBA (jadwal belum diumumkan)
  cdUnits.style.display = 'none';
  cdTba.style.display = '';
  cdDate.innerHTML = 'Tanggal Segera Diumumkan &middot; Banda Aceh';
}

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

// ══════════ DASHBOARD HASIL SURVEI ══════════
// >>> Untuk memperbarui angka: cukup ubah nilai di objek SURVEY di bawah ini.
//     (Nanti bisa diganti fetch otomatis dari Google Sheet saat sudah online.)
(function () {
  const section = document.getElementById('survei');
  if (!section) return;

  const SURVEY = {
    tanggal: [
      { label: 'Keduanya bisa',   value: 23 },
      { label: '19–20 Desember',  value: 22 },
      { label: '14–15 November',  value: 18 },
    ],
    lokasi: [
      { label: 'Aula / Hotel',        value: 22 },
      { label: 'Pantai',              value: 21 },
      { label: 'Resort',              value: 16 },
      { label: 'Kampus Teknik USK',   value: 4 },
    ],
    hari: [
      { label: 'Sabtu',        value: 29 },
      { label: 'Jumat–Minggu', value: 19 },
      { label: 'Minggu',       value: 15 },
    ],
  };

  // ── Bar charts ──
  section.querySelectorAll('.chart[data-chart]').forEach((chart) => {
    const data = SURVEY[chart.dataset.chart];
    const max = Math.max.apply(null, data.map(d => d.value));
    const wrap = chart.querySelector('.bars');
    data.forEach((d, i) => {
      const row = document.createElement('div');
      row.className = 'bar' + (i === 0 ? ' bar--top' : '');
      row.innerHTML =
        '<div class="bar__head"><span class="bar__lbl">' + d.label + '</span><span class="bar__val">' + d.value + '</span></div>' +
        '<div class="bar__track"><div class="bar__fill" data-w="' + ((d.value / max) * 100) + '"></div></div>';
      wrap.appendChild(row);
    });
  });

  // ── Animasi counter ──
  function animateCount(elm) {
    const target = parseInt(elm.dataset.count, 10);
    if (reduceMotion) { elm.textContent = target; return; }
    const dur = 1100, t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      elm.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // ── Trigger saat section terlihat ──
  let done = false;
  new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting || done) return;
      done = true;
      section.querySelectorAll('[data-count]').forEach(animateCount);
      requestAnimationFrame(() => {
        section.querySelectorAll('.bar__fill').forEach(f => { f.style.width = f.dataset.w + '%'; });
      });
      obs.disconnect();
    });
  }, { threshold: 0.2 }).observe(section);
})();

// ══════════ DINDING HARAPAN ALUMNI ══════════
// >>> Sumber kutipan (dari kolom "Harapan" survei). Nanti bisa diganti fetch dari Google Sheet.
(function () {
  const wall = document.getElementById('wall');
  if (!wall) return;

  const HARAPAN = [
    { n: 'Deea Rizki Oziana', a: '2012', t: 'Semoga pada datang semuaaaaa.' },
    { n: 'Win Akbar', a: '2014', t: 'Semoga silaturahmi tetap berlanjut dan saling mengenal sesama alumni pertambangan.' },
    { n: 'Fadel Azhari Natama Hasibuan', a: '2019', t: 'Besar harapannya reuni akbar ini menjadi acara untuk kita lebih akrab, lebih mengenal, dan lebih memiliki rasa kepemilikan terhadap IKATP kita bersama.' },
    { n: 'M. Tri Mahfut Saputra', a: '2018', t: 'Semoga di tahun ke-10 IKATP, ikatan ini semakin solid dan bermanfaat bagi semua lulusan teknik pertambangan, serta mempererat tali silaturahmi antar alumni.' },
    { n: 'M. Affhan Zuhri', a: '2017', t: 'Bisa saling berkumpul dan bersilaturahmi.' },
    { n: 'Muhammad Akbar Waris', a: '2017', t: 'Bisa banyak kenal dengan yang lain.' },
    { n: 'Asyifaul Auwalin', a: '2017', t: 'Menjadi reuni yang menjalin silaturahmi dan keakraban yang saling bersinergi.' },
    { n: 'Januardi', a: '2012', t: 'Reuni akbar IKATP USK bukan hanya ajang berkumpul dan bernostalgia, tetapi juga momentum untuk mempererat silaturahmi, membangun kembali komunikasi antaralumni, serta memperkuat rasa kekeluargaan.' },
    { n: 'Riath Zamullana', a: '2018', t: 'Terjalinnya ikatan yang erat antar alumni.' },
    { n: 'Syarif Akbar', a: '2015', t: 'Semoga segera terlaksana.' },
    { n: 'Yusfaizi Aditia', a: '2014', t: 'Lebih kompak.' },
    { n: 'Bintang Try Atmaja', a: '2020', t: 'Menjadi acara yang benar-benar akrab antara alumni satu dan lainnya, tanpa membeda-bedakan angkatan.' },
    { n: 'Dicky Roza Mulia Sandy', a: '2015', t: 'Mengenang kebersamaan dan temu kangen senior–junior.' },
    { n: 'Muhammad Aidil Tiska Aulia', a: '2017', t: 'Semoga Reuni Akbar dapat mempererat silaturahmi dan membangun networking antaralumni.' },
    { n: 'Muhammad Taufiq', a: '2012', t: 'Terjalin silaturahmi yang erat lintas alumni, dan IKATP USK semakin jaya.' },
    { n: 'Ali Hasymj', a: '2012', t: 'Silaturahmi.' },
    { n: 'Taufik Ardisal', a: '2018', t: 'Harapan saya, reuni akbar ini menjadi ajang silaturahmi untuk mempererat hubungan antaralumni, berbagi pengalaman, serta membangun networking dan kolaborasi yang bermanfaat bagi alumni maupun kampus.' },
    { n: 'Muhammad Furqanul Ikram', a: '2017', t: 'Semoga melalui reuni perdana tercipta suasana penuh kebersamaan, kegembiraan, dan semangat positif, sehingga hubungan antar alumni semakin erat.' },
    { n: 'Hariyanti Mentari', a: '2017', t: 'Semoga reuni ini akan terus ada sampai waktu yang lama.' },
    { n: 'Diza Putra Rizki', a: '2017', t: 'Ajang silaturahmi lintas generasi dan mempererat hubungan IKATP USK.' },
    { n: 'Muammar', a: '2016', t: 'Terjalin keakraban dan membangun relasi yang lebih kuat antar angkatan.' },
    { n: 'Khana Rizki Maulana', a: '2014', t: 'Menjadi ajang silaturahmi antar alumni agar tetap solid.' },
    { n: 'Adhar Dedyansyah', a: '2014', t: 'Semoga makin jaya.' },
    { n: 'Ilham Akbar', a: '2018', t: 'Komunikasi dan silaturahmi terus berjalan.' },
    { n: 'Agung Wiranto', a: '2014', t: 'Semoga terlaksana.' },
    { n: 'Muhammad Arrafi Zaidhan', a: '2018', t: 'Dapat meningkatkan ikatan antar alumni.' },
    { n: 'Siti Fadhillah', a: '2012', t: 'Mempererat silaturahmi, sharing knowledge, dan memperkuat jejaring antaralumni.' },
    { n: 'Fachriansyah', a: '2012', t: 'Reuni Akbar IKATP USK akan menjadi acara formal pertama sejak ikatan alumni ini berdiri. Harapan saya, reuni ini membangkitkan kembali kenangan para alumni sekaligus menjadi ajang temu ramah dan temu kangen.' },
    { n: 'Aris Munandar', a: '2012', t: 'Bisa terselenggara dengan perencanaan yang matang.' },
    { n: 'Aminul Ghifari', a: '2012', t: 'Silaturahmi, bertemu teman lama.' },
    { n: 'Muhammad Dicka Andrian', a: '2012', t: 'Berjalan lancar, meriah, harmonis, dan sukses.' },
    { n: 'Rahmi Auli', a: '2017', t: 'Semoga bisa terlaksana dengan baik.' },
    { n: 'Reizi Hanifa Arsya', a: '2016', t: 'Bisa dihadiri banyak alumni.' },
    { n: 'Sayed Hubbul', a: '2012', t: 'Semoga menjadi wadah untuk mempererat ikatan alumni serta menjadi tempat informasi terkait lowongan kerja, project, dan hal-hal positif lainnya.' },
    { n: 'Fitri Amalia', a: '2019', t: 'Dapat berkumpul dengan alumni dan teman-teman yang sudah lama tidak bertemu.' },
    { n: 'Fadiya Aqila Anhar', a: '2021', t: 'Semoga berjalan lancar dan dihadiri banyak abang–kakak alumni, agar leting atas hingga bawah dapat saling berkenalan.' },
    { n: 'Muhammad Ihsan Tanjung', a: '2017', t: 'Untuk meningkatkan solidaritas sesama alumni.' },
    { n: 'Sausan Azzahra', a: '2019', t: 'Semakin mempererat tali silaturahmi antara alumni dan dosen, membawa kebermanfaatan melalui sharing pengalaman dunia kerja dan berbagi ilmu.' },
    { n: 'Jessica Anggraini', a: '2017', t: 'Lebih mengenal satu sama lain.' },
    { n: 'Rafly Al Qausar', a: '2019', t: 'Ngumpul semua.' },
    { n: 'Isna Rosifa', a: '2014', t: 'Bisa terlaksana dengan baik.' },
    { n: 'Muhammad Rifaldi', a: '2012', t: 'Semoga dapat terwujud, karena sangat bagus untuk perkembangan ikatan alumni.' },
    { n: 'M. Razzaqul', a: '2016', t: 'Semoga terbentuk pengurus yang sanggup dan mampu mengurus IKATP, agar ikatan ini terus tumbuh dan berpengaruh.' },
    { n: 'Teuku Irwandi', a: '2020', t: 'Dengan adanya reuni akbar, semakin mempererat silaturahmi IKATP USK.' },
    { n: 'Zaki Azhari', a: '2016', t: 'Jadi wadah silaturahmi.' },
    { n: 'Muhammad Hanin Rizfi', a: '2021', t: 'Bismillah, bisa berjalan dengan lancar dan sesuai rencana.' },
  ];

  function initials(name) {
    const w = name.trim().split(/\s+/);
    return (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[1][0]).toUpperCase();
  }
  function card(q) {
    const fig = document.createElement('figure'); fig.className = 'wq';
    const mark = document.createElement('div'); mark.className = 'wq__mark'; mark.textContent = '“';
    const p = document.createElement('p'); p.className = 'wq__text'; p.textContent = q.t;
    const cap = document.createElement('figcaption'); cap.className = 'wq__by';
    const ava = document.createElement('span'); ava.className = 'wq__ava'; ava.textContent = initials(q.n);
    const meta = document.createElement('span'); meta.className = 'wq__meta';
    const b = document.createElement('b'); b.textContent = q.n;
    const s = document.createElement('small'); s.textContent = 'Angkatan ' + q.a;
    meta.append(b, s); cap.append(ava, meta); fig.append(mark, p, cap);
    return fig;
  }

  const tracks = wall.querySelectorAll('.wall__track');
  HARAPAN.forEach((q, i) => tracks[i % 2].appendChild(card(q)));
  if (!reduceMotion) {
    tracks.forEach(tr => Array.from(tr.children).forEach(ch => tr.appendChild(ch.cloneNode(true))));
  }
})();

// ══════════ COUNTER DONASI ══════════
(function () {
  const el = document.getElementById('donasiNum');
  if (!el) return;
  const target = parseInt(el.dataset.amount, 10) || 0;
  function run() {
    if (reduceMotion || target === 0) { el.textContent = target.toLocaleString('id-ID'); return; }
    const dur = 1400, t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { run(); obs.disconnect(); } });
  }, { threshold: 0.4 }).observe(el);
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
