# PRD: Kalkulator Kurs Mata Uang

**Versi:** 1.0
**Tanggal:** 9 Juli 2026
**Status:** Draft — siap untuk development (rencana dikerjakan via Antigravity)

---

## 1. Latar Belakang & Tujuan

Membuat web app sederhana untuk mengonversi nilai mata uang menggunakan kurs harian dari sumber terpercaya (ECB), tanpa biaya API, dan bisa diakses publik via Vercel.

**Tujuan utama:**
- User bisa memasukkan jumlah uang, memilih mata uang asal & tujuan, lalu melihat hasil konversi
- Data kurs diambil otomatis dari API (bukan angka statis/hardcode)
- Aplikasi ringan, cepat, dan gratis untuk dijalankan & di-deploy

---

## 2. Target Pengguna

Siapa saja yang butuh konversi kurs cepat: traveler, pelajar, pekerja lepas yang menerima pembayaran asing, dsb. Tidak ada kebutuhan akun/login — aplikasi bersifat publik dan stateless.

---

## 3. Scope Fitur

### 3.1 Fitur Inti (Must Have)
| Fitur | Deskripsi |
|---|---|
| Input jumlah | User memasukkan angka yang ingin dikonversi |
| Pilih mata uang asal (From) | Dropdown pilihan mata uang |
| Pilih mata uang tujuan (To) | Dropdown pilihan mata uang |
| Tombol swap | Tukar posisi From ↔ To dengan satu klik |
| Hasil konversi | Menampilkan hasil perhitungan real-time saat input berubah |
| Info kurs | Menampilkan rate yang dipakai, misal "1 USD = 16.200 IDR" |
| Tanggal update kurs | Menampilkan kapan data kurs terakhir diperbarui (karena update harian, bukan per detik) |

### 3.2 Fitur Tambahan (Nice to Have — opsional, bisa fase berikutnya)
- Daftar mata uang favorit/terakhir dipakai (disimpan di local state, bukan database)
- Mode gelap/terang
- Riwayat konversi selama sesi berjalan (tidak perlu disimpan permanen)

### 3.3 Di Luar Scope (Out of Scope)
- Data real-time per detik/menit (butuh API berbayar, tidak termasuk versi ini)
- Login/akun user
- Transaksi/pembayaran sungguhan
- Data historis kurs (grafik tren, dsb.)

---

## 4. Kebutuhan Data & API

**Sumber data:** [Frankfurter API](https://api.frankfurter.dev)
- Gratis, **tanpa API key**, tanpa signup
- Sumber data: European Central Bank (ECB) reference rates
- Cakupan: ~30 mata uang utama dunia (USD, EUR, JPY, GBP, AUD, dll) **+ IDR**
- Update: 1x sehari, sekitar jam 16:00 CET (bukan real-time per detik)
- Endpoint utama yang relevan:
  - `GET https://api.frankfurter.dev/v2/latest?base=USD` → daftar kurs terbaru berbasis USD
  - `GET https://api.frankfurter.dev/v2/currencies` → daftar kode mata uang yang didukung

**Catatan penting:** Karena update harian, label di UI harus jujur menyebut "kurs harian (ECB)" — bukan "real-time" — supaya user tidak salah ekspektasi.

**Caching:** Karena data hanya berubah 1x/hari, sebaiknya fetch API di-cache di sisi client (misal simpan di state, fetch ulang hanya saat pertama kali load atau setelah beberapa jam) supaya hemat request.

---

## 5. Kebutuhan Teknis

| Aspek | Rekomendasi |
|---|---|
| Frontend | HTML/CSS/JS sederhana, atau React (jika ingin lebih terstruktur) |
| Hosting/Deploy | Vercel (gratis untuk static site / hobby project) |
| API call | Fetch langsung dari browser ke Frankfurter (CORS didukung, tidak perlu backend) |
| Database | Tidak diperlukan |
| Environment variable/API key | Tidak diperlukan (API publik tanpa key) |

---

## 6. Alur Pengguna (User Flow)

1. User membuka web app
2. App otomatis fetch daftar mata uang & kurs terbaru dari Frankfurter
3. User memasukkan jumlah, pilih mata uang asal & tujuan
4. App menghitung dan menampilkan hasil konversi secara instan (tanpa perlu klik tombol "Convert", cukup saat user mengetik/memilih)
5. User bisa swap From ↔ To
6. Jika API gagal diakses → tampilkan pesan error yang jelas + kemungkinan fallback ke kurs terakhir yang berhasil diambil (jika di-cache)

---

## 7. Kebutuhan Non-Fungsional

- **Performa:** Loading awal cepat, idealnya < 2 detik
- **Responsif:** Bisa dipakai nyaman di mobile & desktop
- **Error handling:** Pesan error yang manusiawi saat API down/limit tercapai, bukan sekadar layar kosong
- **Aksesibilitas dasar:** Label input jelas, kontras warna cukup

---

## 8. Metrik Keberhasilan (Success Criteria)

- App berhasil di-deploy dan bisa diakses publik via URL Vercel
- Konversi mata uang menghasilkan angka yang sesuai dengan kurs Frankfurter saat itu
- Tidak ada error saat mata uang utama dunia + IDR dipilih

---

## 9. Asumsi

- User menerima bahwa kurs update 1x/hari (bukan real-time trading rate)
- Tidak ada kebutuhan menyimpan data user secara permanen
- Project ini untuk pembelajaran/portofolio, bukan aplikasi finansial produksi skala besar

---

## 10. Pertanyaan Terbuka (untuk didiskusikan sebelum/selama development)

- [ ] Apakah perlu daftar semua mata uang dari Frankfurter (~30) atau dibatasi ke beberapa saja (misal 10 mata uang paling umum) untuk UI yang lebih ringkas?
- [ ] Apakah perlu dukungan bahasa Indonesia & Inggris di UI, atau salah satu saja?
- [ ] Apakah nama/branding aplikasi sudah ditentukan?
