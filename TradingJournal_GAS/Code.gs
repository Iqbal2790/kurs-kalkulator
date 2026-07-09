// Konfigurasi ID Spreadsheet (Harus diisi dengan ID Google Sheet milik user)
const SHEET_ID = '1Gu8bxnhmGM6Olc9KEKP5c2o5rBflT9Q6Rpdc5eJdR4o'; 

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Trading Journal')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Fungsi untuk menarik data Portfolio (Saldo BTC, Average Price, dan Riwayat)
function getPortfolio() {
  if (SHEET_ID === 'MASUKKAN_ID_SPREADSHEET_DI_SINI') {
    return { 
      success: false, 
      message: 'Mohon isi SHEET_ID di file Code.gs terlebih dahulu!',
      totalBtc: 0,
      avgPrice: 0,
      history: []
    };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    let totalBtc = 0;
    let totalCostUsd = 0;
    let history = [];
    
    // Looping dari baris ke-2 (skip header)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Pastikan baris tidak kosong sepenuhnya
      if (!row[0] && !row[1]) continue;

      let date = row[0];
      if (date instanceof Date) {
         date = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      }
      const type = row[1]; // "Beli" atau "Jual"
      const usdValue = parseFloat(row[2]) || 0;
      const btcPrice = parseFloat(row[3]) || 0;
      const btcQty = parseFloat(row[4]) || 0; 
      const pnlUsd = row[5];
      const pnlPct = row[6];
      const notes = row[7];
      
      if (type === 'Beli') {
        totalBtc += btcQty;
        totalCostUsd += usdValue;
      } else if (type === 'Jual') {
        // Average cost method: Saat jual, kita kurangi totalBtc, dan cost berkurang secara proporsional.
        const avgPriceBeforeSell = totalBtc > 0 ? totalCostUsd / totalBtc : 0;
        const soldBtc = Math.abs(btcQty);
        totalBtc -= soldBtc;
        totalCostUsd -= (soldBtc * avgPriceBeforeSell);
        
        // Mencegah floating point error jika saldo sudah hampir habis
        if (totalBtc <= 0.00000001) {
            totalBtc = 0;
            totalCostUsd = 0;
        }
      }
      
      history.push({
        date: date,
        type: type,
        usdValue: usdValue,
        btcPrice: btcPrice,
        btcQty: btcQty,
        pnlUsd: pnlUsd,
        pnlPct: pnlPct,
        notes: notes
      });
    }
    
    // Reverse agar transaksi terbaru di atas
    history.reverse();
    
    const avgPrice = totalBtc > 0 ? totalCostUsd / totalBtc : 0;
    
    return {
      success: true,
      totalBtc: totalBtc,
      avgPrice: avgPrice,
      history: history
    };
    
  } catch(e) {
    return {
      success: false,
      message: e.message,
      totalBtc: 0,
      avgPrice: 0,
      history: []
    };
  }
}

// Fungsi untuk menyimpan data transaksi baru
function saveTransaction(data) {
  try {
    if (SHEET_ID === 'MASUKKAN_ID_SPREADSHEET_DI_SINI') {
      return { success: false, message: 'Mohon isi SHEET_ID di file Code.gs terlebih dahulu!' };
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Jika sheet masih kosong, tambahkan header otomatis
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Tanggal', 
        'Tipe Transaksi', 
        'Nilai USD', 
        'Harga BTC/USD', 
        'Kuantitas BTC', 
        'Profit/Loss (USD)', 
        'Profit/Loss (%)', 
        'Catatan'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f3f3f3');
    }
    
    // Gunakan tanggal dari input user, jika kosong pakai timestamp saat ini
    let formattedDate = data.date;
    if (!formattedDate) {
      const date = new Date();
      formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    }
    
    // Masukkan row baru
    sheet.appendRow([
      formattedDate,
      data.type,         // "Beli" atau "Jual"
      data.usdValue,     // Modal (Beli) atau Hasil (Jual)
      data.btcPrice,     // Harga eksekusi BTC
      data.btcQty,       // Kuantitas BTC (+ atau -)
      data.pnlUsd !== undefined ? parseFloat(data.pnlUsd) : "", 
      data.pnlPct !== undefined ? parseFloat(data.pnlPct) : "", 
      data.notes || ""
    ]);
    
    return { success: true, message: 'Transaksi berhasil dicatat!' };
  } catch (error) {
    return { success: false, message: 'Gagal mencatat: ' + error.message };
  }
}
