/**
 * REUNI AKBAR IKATP USK - penyedia data pendaftaran aman untuk website.
 * Script berjalan sebagai pemilik sheet, jadi sheet boleh tetap privat.
 * Data yang dikirim ke website:
 *   - Total pendaftar
 *   - Jumlah pendaftar per angkatan
 *   - Harapan/pesan, bila kolomnya ada
 *   - Total donasi dari kolom "Jumlah yang ditransfer"
 */

var SHEET_GID = 194034786;
var DONASI_COL_INDEX = 13; // Kolom N: "Jumlah yang ditransfer"

var BLOCK_HARAPAN = [
  'belum bisa memberikan jawaban', '-', 'tidak ada', 'n/a', '.', 'tidak',
  'belum ada', 'adain aja dulu', 'buat aja dulu', 'tidak ada harapan',
  'semoga semakin sulit', 'tidak ada pesan', 'tidak ada komentar'
];

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getTargetSheet(ss);
  var values = sheet.getDataRange().getValues();

  if (values.length < 2) return emptyResponse();

  var headers = values[0].map(function (h) { return normalizeHeader(h); });
  var rows = values.slice(1).filter(function (r) {
    return r.join('') !== '';
  });

  var total = rows.length;

  function findCol(keywords) {
    for (var i = 0; i < headers.length; i++) {
      for (var k = 0; k < keywords.length; k++) {
        if (headers[i].indexOf(normalizeHeader(keywords[k])) !== -1) return i;
      }
    }
    return -1;
  }

  var colNama = findCol(['nama']);
  var colAngkatan = findCol(['angkatan', 'leting', 'tahun masuk', 'tahun angkatan']);
  var colHarapan = findCol(['harapan', 'pesan', 'komentar', 'message']);

  var colDonasi = findCol([
    'jumlah yang ditransfer',
    'jumlah yang di transfer',
    'jumlah transfer',
    'nominal transfer',
    'nominal yang ditransfer',
    'jumlah donasi',
    'nominal donasi',
    'donasi transfer'
  ]);

  // Pengaman khusus sheet ini: jangan ambil kolom pertanyaan "berkenan donasi".
  // Total donasi harus berasal dari kolom N, yaitu "Jumlah yang ditransfer".
  if (headers.length > DONASI_COL_INDEX) colDonasi = DONASI_COL_INDEX;

  var perAngkatan = buildPerAngkatan(rows, colAngkatan);
  var totalDonasi = buildTotalDonasi(rows, colDonasi);
  var harapan = buildHarapan(rows, colNama, colAngkatan, colHarapan);

  var out = {
    total: total,
    perAngkatan: perAngkatan,
    harapan: harapan,
    totalDonasi: totalDonasi,
    updated: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function getTargetSheet(ss) {
  var all = ss.getSheets();
  for (var i = 0; i < all.length; i++) {
    if (all[i].getSheetId() === SHEET_GID) return all[i];
  }
  return all[0];
}

function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNominalTransfer(value) {
  if (typeof value === 'number') return value;

  var raw = String(value || '').trim();
  if (!raw) return 0;

  // Terima format umum: Rp 100.000, 100000, atau 100.000,00.
  var clean = raw.replace(/[^0-9,.-]/g, '');
  if (clean.indexOf(',') !== -1) clean = clean.split(',')[0];
  clean = clean.replace(/[^0-9]/g, '');

  var num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}

function buildTotalDonasi(rows, colDonasi) {
  var totalDonasi = 0;
  if (colDonasi < 0) return totalDonasi;

  rows.forEach(function (r) {
    var num = parseNominalTransfer(r[colDonasi]);
    if (!isNaN(num) && num > 0) totalDonasi += num;
  });

  return totalDonasi;
}

function buildPerAngkatan(rows, colAngkatan) {
  var byYear = {};
  if (colAngkatan >= 0) {
    rows.forEach(function (r) {
      var raw = String(r[colAngkatan] || '').trim();
      var yr = raw.match(/\d{4}/);
      if (!yr) return;
      yr = yr[0];
      byYear[yr] = (byYear[yr] || 0) + 1;
    });
  }

  return Object.keys(byYear)
    .sort()
    .map(function (k) {
      return { y: k, count: byYear[k] };
    });
}

function buildHarapan(rows, colNama, colAngkatan, colHarapan) {
  var harapan = [];
  if (colHarapan < 0) return harapan;

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

  return harapan;
}

function emptyResponse() {
  return ContentService.createTextOutput(
    JSON.stringify({
      total: 0,
      perAngkatan: [],
      harapan: [],
      totalDonasi: 0,
      updated: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
