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
      { label: '19–20 Desember', value: 39 },
      { label: 'Keduanya bisa',  value: 38 },
      { label: '14–15 November', value: 29 },
    ],
    lokasi: [
      { label: 'Pantai',            value: 35 },
      { label: 'Aula / Hotel',      value: 32 },
      { label: 'Resort',            value: 20 },
      { label: 'Kampus Teknik USK', value: 15 },
    ],
    hari: [
      { label: 'Sabtu',        value: 41 },
      { label: 'Jumat–Minggu', value: 36 },
      { label: 'Minggu',       value: 29 },
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
    { n: 'Deea Rizki Oziana', a: '2012', t: 'semoga pada datang semuaaaaa' },
    { n: 'MUHAMMAD RIFQI RIZQULLAH', a: '2018', t: 'saya rasa saat ini IKATP USK belum terlalu berperan bagi mayoritas alumi. harapannya dengan adanya ini jadi awal bagi IKATP untuk kembali membangun sinergi antar alumni dari antar angkatan, serta berharap kalo adanya acara ini bisa menghasilkan terobosan yang baik bagi keberlangsungan organisasi ini dan bagi seluruh alumni yang berada di wadah ini' },
    { n: 'Win Akbar', a: '2014', t: 'Semoga silaturahmi tetap berlanjut dan saling mengenal sesama alumni pertambangan' },
    { n: 'Fadel Azhari Natama Hasibuan', a: '2019', t: 'Besar harapan nya reuni akbar ini menjadi acara untuk kita untuk menjadi lebih akrab, lebih mengenal, lebih memiliki rasa kepemilikan untuk IKATP kita bersama.' },
    { n: 'M. Tri Mahfut Saputra', a: '2018', t: 'Semoga di tahun ke 10 IKATP. Ikatan ini dapat lehbih solid dan bermanfaat bagi semua lulusan teknik pertambangan. Dan dengan acara ini dapat mempererat tali silaturahmi antar alumni' },
    { n: 'M. Affhan Zuhri', a: '2017', t: 'bisa saling berkumpul dan silaturahmi' },
    { n: 'Muhammad akbar waris', a: '2017', t: 'Bisa banyak kenal dengan yang lain' },
    { n: 'Asyifaul Auwalin', a: '2017', t: 'Menjadi reuni yang menjalin silaturahmi keakraban yang saling bersinergi' },
    { n: 'Januardi', a: '2012', t: 'Harapanya, reuni akbar IKATP USK bukan hanya menjadi ajang berkumpul dan bernostalgia, tetapi juga menjadi momentum untuk mempererat silaturahmi, membangun kembali komunikasi antaralumni, serta memperkuat rasa kekeluargaan.' },
    { n: 'Riath Zamullana', a: '2018', t: 'Terjalinnya ikatan yg erat antar alumni' },
    { n: 'Syarif Akbar', a: '2015', t: 'Semoga segera terlaksana' },
    { n: 'Yusfaizi aditia', a: '2014', t: 'Lebih kompak' },
    { n: 'Bintang Try Atmaja', a: '2020', t: 'Menjadi acara yang benar benar bisa akrab satu sama lain antara alumni satu dan lainnnya yang tidak membeda beda angkatan' },
    { n: 'Dicky roza mulia sandy', a: '2015', t: 'Mengenang kerbersamaan dan temu kangen senior junior' },
    { n: 'Muhammad Aidil Tiska Aulia', a: '2017', t: 'Semoga Reuni Akbar dapat mempererat silaturahmi dan membangun networking antaralumni' },
    { n: 'Muhammad Taufiq', a: '2012', t: 'Terjalin silaturrahmi yang erat lintas alumni dan IKATP USK semakin jaya' },
    { n: 'Ali Hasymj', a: '2012', t: 'Silaturrahmi' },
    { n: 'Taufik Ardisal', a: '2018', t: 'Harapan saya, reuni akbar ini dapat menjadi ajang silaturahmi untuk mempererat hubungan antaralumni, berbagi pengalaman dan informasi, serta membangun networking dan kolaborasi yang dapat memberikan manfaat bagi alumni maupun kampus ke depannya.' },
    { n: 'Muhammad Furqanul Ikram', a: '2017', t: 'Semoga melalui reuni perdana tercipta suasana yang penuh kebersamaan, kegembiraan, dan semangat positif, sehingga hubungan antar alumni semakin erat dan rasa kekeluargaan dalam IKATP semakin kuat.' },
    { n: 'Hariyanti Mentari', a: '2017', t: 'Semoga reuni ini akan terus ada sampai waktu yang lama' },
    { n: 'diza putra rizki', a: '2017', t: 'ajang sialhturahmi lintas generasi dan mempererat hubungan IKATP USK' },
    { n: 'Muammar', a: '2016', t: 'Terjalin keakraban dan membangun relasi yang lebih kuat antar angkatan' },
    { n: 'Fella Arnad', a: '2016', t: 'Silaturrahmi' },
    { n: 'Khana Rizki Maulana', a: '2014', t: 'Menjadi ajang silaturahmi antar alumni agar tetap solid' },
    { n: 'Adhar dedyansyah', a: '2014', t: 'Semoga makin jaya' },
    { n: 'Ilham Akbar', a: '2018', t: 'Komunikasi & Silaturahmi berjalan' },
    { n: 'Agung Wiranto', a: '2014', t: 'Semoga terlaksana' },
    { n: 'Muhammad Arrafi Zaidhan', a: '2018', t: 'Dapat meningkatkan ikatan antar alumni' },
    { n: 'Siti Fadhillah', a: '2012', t: 'Mempererat silahturahmi, sharing knowledge dan memperkuat jejaring antaralumni', f: 'siti.jpeg' },
    { n: 'Fachriansyah', a: '2012', t: 'Reuni Akbar IKATP USK akan menjadi acara formal yang pertama kali diadakan selama Ikatan Alumni ini berdiri. Jadi harapan saya reuni ini bisa membangkitkan kembali kenangan kenangan para alumni ketika masih di kuliah dulu. Sekaligus bisa menjadi ajang temu ramah dan temu kangen antar alumni.' },
    { n: 'Aris Munandar', a: '2012', t: 'Bisa terselenggara dengan planning yang matang' },
    { n: 'Aminul ghifari', a: '2012', t: 'Silaturahmi, bertemu teman lama' },
    { n: 'Muhammad dicka andrian', a: '2012', t: 'Berjalan lancar, meriah, harmonis, dan sukses', f: 'dicka.jpeg' },
    { n: 'Rahmi Auli', a: '2017', t: 'Semoga bisa terlaksana dengan baik' },
    { n: 'Reizi Hanifa Arsya', a: '2016', t: 'Bisa dihadiri banyak alumni' },
    { n: 'Sayed Hubbul', a: '2012', t: 'Semoga menjadi wadah untuk mempererat ikatan alumni serta menjadi tempat informasi terkait lowongan kerja, project serta hal2 lain yang positif.' },
    { n: 'Fitri Amalia', a: '2019', t: 'Dapat berkumpul dengan alumni dan teman-teman yang sudah lama tidak ketemu' },
    { n: 'Muhammad Thoriq Farhan', a: '2021', t: 'Sukses' },
    { n: 'Fadiya Aqila Anhar', a: '2021', t: 'Semoga dapat berjalan dengan lancar dan dihadiri banyak kakak abang alumni agar antara leting atas hingga bawah dapat saling berkenalan melalui acara2 seperti ini.' },
    { n: 'Muhammad Ihsan Tanjung', a: '2017', t: 'Untuk meningkatkan solidaritas sesama alumni' },
    { n: 'Sausan Azzahra', a: '2019', t: 'Semakin mempererat tali silaturahmi antara alumni, dosen. Membawa kebermanfaatan dengan sharing pengalaman dunia kerja, sharing loker, berbagi ilmu juga' },
    { n: 'Jessica Anggraini', a: '2017', t: 'Lebih mengenal satu sama lain' },
    { n: 'Rafly Al Qausar', a: '2019', t: 'Ngumpul semua' },
    { n: 'Isna Rosifa', a: '2014', t: 'Bisa terlaksana dengan baik' },
    { n: 'Muhammad Rifaldi', a: '2012', t: 'Semoga dapat terwujud, karena sangat bagus untuk perkembangan ikatan alumni' },
    { n: 'M Razzaqul', a: '2016', t: 'Pengurus yg sanggup dan mampu mengurusi ikatp di lantik, bisa di coba dari alumni yg berkarir di tambang area Meulaboh krna pusat area industri pertambangan Aceh saat ini. Minimal ketua ikatp memiliki pengaruh di area tsb.' },
    { n: 'Teuku Irwandi', a: '2020', t: 'dengan adanya reuni akbar dapat Semakin mempererat silaturahmi IKATP USK' },
    { n: 'Zaki Azhari', a: '2016', t: 'Jadi wadah silaturahmi' },
    { n: 'Aiza Razali', a: '2019', t: 'kekompakan' },
    { n: 'Muhammad Hanin Rizfi', a: '2021', t: 'Bismillah bisa berjalan dengan lancar dan sesuai rencana' },
    { n: 'Muhammad akbar putra', a: '2020', t: 'Silaturahmi yang tetap berjalan, bertukar pikiran pandangan dalam karier dunia pertambangan dan pekerjaan' },
    { n: 'Rita Yusmi', a: '2020', t: 'Semoga kegiatan reuni dapat dilaksanakan dengan lancar, dan juga harapannya agar ketua IATP terpilih sehingga dapat mengemban tugas dengan baik dan dapat membawa lulusan teknik pertambangan ke arah yg lebih baik dan semakin jaya' },
    { n: 'Miska Amalia Putri', a: '2021', t: 'dapat menjalin silaturahmi antara alumni dan menambah relasi untuk mencari pekerjaan dan membangun karir' },
    { n: 'Ambia', a: '2012', t: 'Terlaksana seperti yang direncanakan' },
    { n: 'Abdul Ghani Purba', a: '2017', t: 'Aktif kembali dan saling peduli' },
    { n: 'Muhammad Akmal Khadafi', a: '2021', t: 'sukses selalu' },
    { n: 'Phonna Agam Meutuah', a: '2015', t: 'Tetap membersamai keluarga IKATP USK' },
    { n: 'Famela Naridha MT', a: '2015', t: 'Semoga terlaksana' },
    { n: 'Muhammad Kelvin Arief', a: '2021', t: 'Semoga dapat memperjelas kedudukan dan Kepengurusan IKATP USK dan peran Alumni secara jelas, efektif, dan berkelanjutan' },
    { n: 'Rayyan Aulia Fawwaz', a: '2020', t: 'Harapannya dapat memperat hubungan antar alumni lintas angkatan, dan dapat menjadi alumni yang kokoh.' },
    { n: 'Muhammad Kahfi Adrian', a: '2015', t: 'Koneksi kerja dan juga sebagai referensi hmtp atau iatp untuk referensi kerja' },
    { n: 'Muhammad Alfarizi Lubis', a: '2018', t: 'Ramah tamah antar alumni serta sharing karir kepada teman teman untuk memotivasi teman teman' },
    { n: 'Iqbal Januari Pratama', a: '2012', t: 'Semoga semua Alumni Teknik Pertambangan USK, dapat saling mengenal satu sama lain.' },
    { n: 'Farhan Ramadhandi', a: '2020', t: 'Di kasih arahan career atau persiapan awardee' },
    { n: 'M Arif Fadhlurrahman', a: '2013', t: 'Semoga banyak yang bisa berpartisipasi' },
    { n: 'M Ilman Rasyad', a: '2014', t: 'Mempererat silaturahmi antar alumni, dan bisa menghidupkan kembali semangat para alumni untuk membangun IKATP. Karena selama ini kekurangan anggota yang mau membangun IKATP.' },
    { n: 'Rahman Hakim', a: '2021', t: 'Semoga Reuni Akbar berjalan lancar, meriah, serta menjadi wadah mempererat silaturahmi dan memperluas jaringan antaralumni' },
    { n: 'M. Arif Revani', a: '2013', t: 'Tetap Semangat' },
    { n: 'Abi ariandi', a: '2015', t: 'Meriah dan silaturahmi nya dapat' },
    { n: 'Muhammad Gifari Sulvi', a: '2015', t: 'Semoga Reuni Akbar pertama ini bakal menjadi awal bagus dan dapat dilakukan seterusnya.' },
    { n: 'Reski Sefti Isnanda', a: '2018', t: 'semoga terlaksana dengan baik' },
    { n: 'Khairunnas', a: '2012', t: 'Semoga sukses sesuai harapan para alumni' },
    { n: 'Muhammad Ghazi Aufa', a: '2017', t: 'Lebih menggalakan lagi reuni seperti ini' },
    { n: 'Said Muhammad Muafi', a: '2018', t: 'Semakin kuat dalam menjaga kekompakan' },
    { n: 'Aidil Lian', a: '2012', t: 'Semoga peserta yang ikut lebih dari 50% total jumlah alumni agar silaturahmi tiap angkatan tetap terjalin' },
    { n: 'Nurul Maghfirah', a: '2019', t: 'Semoga semua dapat saling mengenal dan berbincang dengan baik' },
    { n: 'M Iqbal', a: '2012', t: 'Harap Tenang' },
    { n: 'Misbah hidayatullah', a: '2012', t: 'Semoga reuni ini menjadi awal dari kebersamaan yang lebih erat, penuh kehangatan dan meninggalkan kenangan indah bagi kita semua.' },
    { n: 'Rahmatsyah Putra', a: '2017', t: 'Semoga hubungan anggota keluarga IKATP selalu kompak' },
    { n: 'Mairia Ulfa Khatimmah', a: '2012', t: 'menyambung silaturrahmi yang sudah lama terputus' },
    { n: 'zahratul ajirni', a: '2018', t: 'dapat terjalin silaturahmi yang semakin baik' },
    { n: 'Afifah Adila', a: '2020', t: 'Lebih kompak, ikatan alumni semakin kuat' },
    { n: 'Nonong Rizki Arifah', a: '2012', t: 'Silaturrahmi terjaga' },
    { n: 'Ahmad Shaoqi', a: '2015', t: 'Acaranya berjalan lancar dan alumninya banyak yang datang' },
    { n: 'Muhammad Farhan Fachruza', a: '2018', t: 'Harapan nya semoga reuni akbar ini menjadi ajang untuk silaturahmi tetap terjaga dan makin erat antar lintas angkatan' },
    { n: 'Dody Pratama', a: '2012', t: 'Berguna buat daerah dan adik2 yg akan lulus' },
    { n: 'Dian Annisa', a: '2018', t: 'Silaturahmi' },
    { n: 'ardhalita lovyana', a: '2013', t: 'Semoga menjadi ajang silaturahmi, mempererat hubungan antaralumni, dan membangun kolaborasi yang positif ke depannya.' },
  ];

  function initials(name) {
    const w = name.trim().split(/\s+/);
    return (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[1][0]).toUpperCase();
  }
  function avatar(q) {
    // Kalau ada nama file foto (kolom "f") → tampilkan foto dari folder /foto.
    // Kalau file tidak ada / gagal dimuat → otomatis kembali ke avatar inisial.
    if (q.f) {
      const img = document.createElement('img');
      img.className = 'wq__ava wq__ava--img';
      img.src = 'foto/' + q.f;
      img.alt = q.n; img.loading = 'lazy';
      img.setAttribute('onerror', 'this.outerHTML=\'<span class="wq__ava">' + initials(q.n) + '</span>\'');
      return img;
    }
    const sp = document.createElement('span'); sp.className = 'wq__ava'; sp.textContent = initials(q.n);
    return sp;
  }
  function card(q) {
    const fig = document.createElement('figure'); fig.className = 'wq';
    const mark = document.createElement('div'); mark.className = 'wq__mark'; mark.textContent = '“';
    const p = document.createElement('p'); p.className = 'wq__text'; p.textContent = q.t;
    const cap = document.createElement('figcaption'); cap.className = 'wq__by';
    const meta = document.createElement('span'); meta.className = 'wq__meta';
    const b = document.createElement('b'); b.textContent = q.n;
    const s = document.createElement('small'); s.textContent = 'Angkatan ' + q.a;
    meta.append(b, s); cap.append(avatar(q), meta); fig.append(mark, p, cap);
    return fig;
  }

  const tracks = wall.querySelectorAll('.wall__track');
  const copies = reduceMotion ? 1 : 2; // 2 set untuk loop mulus
  for (let c = 0; c < copies; c++) {
    HARAPAN.forEach((q, i) => tracks[i % 2].appendChild(card(q)));
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

// ══════════ ONLINE NOW (Supabase Realtime Presence) ══════════
(function () {
  const badge = document.getElementById('onlineBadge');
  const countEl = document.getElementById('onlineCount');
  if (!badge || !countEl || !window.supabase || !window.supabase.createClient) return;

  const SUPABASE_URL = 'https://rroscbhgzvdiwiujyxhv.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyb3NjYmhnenZkaXdpdWp5eGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMTM2NTcsImV4cCI6MjEwMjU4OTY1N30.-Wq9l0Y9C4kftE6zHnVsJIqfbMgzkEJ566zh7zEjQQY';

  try {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    const key = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'u' + Math.random().toString(36).slice(2);
    const channel = client.channel('reuni-online', { config: { presence: { key } } });

    function update() {
      const state = channel.presenceState();
      countEl.textContent = Object.keys(state).length;
      badge.hidden = false;
    }
    channel.on('presence', { event: 'sync' }, update);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') { await channel.track({ at: Date.now() }); }
    });
  } catch (e) { /* diam bila gagal konek */ }
})();

// ══════════ SALIN NOMOR REKENING ══════════
(function () {
  const btn = document.getElementById('rekCopy');
  const no = document.getElementById('rekNo');
  if (!btn || !no) return;
  btn.addEventListener('click', () => {
    const text = no.textContent.trim();
    const done = () => { btn.textContent = 'Tersalin ✓'; btn.classList.add('copied'); setTimeout(() => { btn.textContent = 'Salin'; btn.classList.remove('copied'); }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else { fallback(); }
    function fallback() {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done();
    }
  });
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
