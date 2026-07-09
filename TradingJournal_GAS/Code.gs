// Konfigurasi ID Spreadsheet (Harus diisi dengan ID Google Sheet milik user)
// Cara dapatkan ID: Buka Google Sheets, copy ID panjang di URL (antara /d/ dan /edit)
const SHEET_ID = 'MASUKKAN_ID_SPREADSHEET_DI_SINI'; 

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Trading Journal')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Fungsi untuk menyimpan data trading ke Google Sheets
function saveTrade(data) {
  try {
    // Jika belum mengisi ID
    if (SHEET_ID === 'MASUKKAN_ID_SPREADSHEET_DI_SINI') {
      return { success: false, message: 'Mohon isi SHEET_ID di file Code.gs terlebih dahulu!' };
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Jika sheet masih kosong, tambahkan header otomatis
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Tanggal', 
        'Modal (USD)', 
        'Harga Beli', 
        'Porsi Jual (%)', 
        'Harga Jual', 
        'Profit/Loss (USD)', 
        'Profit/Loss (%)', 
        'Catatan'
      ]);
      // Format header
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f3f3f3');
    }
    
    const date = new Date();
    const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    
    // Masukkan row baru
    sheet.appendRow([
      formattedDate,
      data.buyUsd,
      data.buyPrice,
      data.sellPercentage,
      data.sellPrice,
      data.pnlUsd,
      data.pnlPercentage,
      data.notes
    ]);
    
    return { success: true, message: 'Trading berhasil disimpan ke jurnal!' };
  } catch (error) {
    return { success: false, message: 'Gagal menyimpan: ' + error.message };
  }
}
