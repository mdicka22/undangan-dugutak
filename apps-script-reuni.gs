/**
 * REUNI AKBAR IKATP USK — Penyedia data pendaftaran aman untuk website.
 * Script ini berjalan sebagai PEMILIK sheet, jadi sheet boleh tetap PRIVAT.
 * Yang dikirim ke website HANYA data aman:
 *   - Total pendaftar
 *   - Jumlah pendaftar per angkatan
 *   - Harapan/pesan (nama, angkatan, teks) — JIKA kolom harapan ada di form
 * Nomor WhatsApp & email TIDAK pernah keluar.
 *
 * Cara pasang (atau redeploy):
 *   Buka sheet → Extensions → Apps Script → tempel/update kode ini →
 *   Deploy → Manage deployments → Edit → Version: "New version" → Deploy
 *   Salin URL /exec yang sama (URL tidak berubah kalau proyek sama).
 *
 * Sheet GID: 194034786 (tab responses form registrasi baru)
 */

var SHEET_GID = 194034786;

// Kata-kata yang di-skip dari kolom harapan (jawaban tidak substansial)
var BLOCK_HARAPAN = [
  'belum bisa memberikan jawaban', '-', 'tidak ada', 'n/a', '.', 'tidak',
  'belum ada', 'adain aja dulu', 'buat aja dulu', 'tidak ada harapan',
  'semoga semakin sulit', 'tidak ada pesan', 'tidak ada komentar'
];

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = null;
  var all = ss.getSheets();
  for (var i = 0; i < all.length; i++) {
    if (all[i].getSheetId() === SHEET_GID) { sheet = all[i]; break; }
  }
  if (!sheet) sheet = all[0]; // fallback ke tab pertama bila GID tidak ditemukan

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return emptyResponse();

  var headers = values[0].map(function (h) { return String(h || '').toLowerCase().trim(); });
  var rows    = values.slice(1).filter(function (r) { return r.join('') !== ''; });
  var total   = rows.length;

  // ── Deteksi kolom secara dinamis berdasarkan nama header ──────────────
  // Tambahkan keyword baru di sini bila nama kolom di form berbeda
  function findCol(keywords) {
    for (var i = 0; i < headers.length; i++) {
      for (var k = 0; k < keywords.length; k++) {
        if (headers[i].indexOf(keywords[k]) !== -1) return i;
      }
    }
    return -1;
  }

  var colNama     = findCol(['nama']);
  var colAngkatan = findCol(['angkatan', 'leting', 'tahun masuk', 'tahun angkatan']);
  var colHarapan  = findCol(['harapan', 'pesan', 'komentar', 'message']);
  var colDonasi   = findCol(['Jumlah yang ditransfer']);

  // ── Pendaftar per angkatan ─────────────────────────────────────────────
  var byYear = {};
  if (colAngkatan >= 0) {
    rows.forEach(function (r) {
      var raw = String(r[colAngkatan] || '').trim();
      var yr  = raw.match(/\d{4}/);
      if (!yr) return;
      yr = yr[0];
      byYear[yr] = (byYear[yr] || 0) + 1;
    });
  }
  var perAngkatan = Object.keys(byYear)
    .sort()
    .map(function (k) { return { y: k, count: byYear[k] }; });

  // ── Total donasi / nominal transfer ───────────────────────────────────
  var totalDonasi = 0;
  if (colDonasi >= 0) {
    rows.forEach(function (r) {
      // bersihkan simbol Rp, titik, spasi → ambil angka murni
      var raw = String(r[colDonasi] || '').replace(/[^0-9]/g, '');
      var num = parseInt(raw, 10);
      if (!isNaN(num) && num > 0) totalDonasi += num;
    });
  }

  // ── Harapan / pesan (opsional) ─────────────────────────────────────────
  var harapan = [];
  if (colHarapan >= 0) {
    rows.forEach(function (r) {
      var t = String(r[colHarapan] || '').replace(/\s+/g, ' ').trim();
      if (t.length < 6) return;
      if (BLOCK_HARAPAN.indexOf(t.toLowerCase()) !== -1) return;

      var nm = colNama >= 0 ? String(r[colNama] || '').trim() : 'Peserta';
      var ag = '';
      if (colAngkatan >= 0) {
        var y = String(r[colAngkatan] || '').match(/\d{4}/);
        if (y) ag = y[0];
      }
      harapan.push({ n: nm, a: ag, t: t });
    });
  }

  var out = {
    total       : total,
    perAngkatan : perAngkatan,
    harapan     : harapan,
    totalDonasi : totalDonasi,
    updated     : new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function emptyResponse() {
  return ContentService.createTextOutput(
    JSON.stringify({ total: 0, perAngkatan: [], harapan: [], updated: new Date().toISOString() })
  ).setMimeType(ContentService.MimeType.JSON);
}
