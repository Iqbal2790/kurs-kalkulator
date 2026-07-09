# design.md — Kalkulator Kurs

> Dibaca oleh agent AI (Antigravity dkk.) sebelum membuat/mengubah tampilan.
> Ini bukan cuma daftar warna — ikuti token & spesifikasi di sini secara konsisten,
> jangan tebak-tebak sendiri saat implementasi.

---

## 1. Konsep & Mood

**Nama arah desain: "Dusk Exchange"** — perasaan seperti melihat papan kurs di bandara
saat senja: tenang, sedikit mewah, tapi datanya jelas terbaca. Alih-alih gaya "fintech"
generik (biru korporat, kartu putih datar), kita pakai **panel kaca (glass) yang mengambang
di atas gradasi langit senja**, dengan aksen warna **emas/amber** — merujuk ke koin/nilai
tukar, bukan sekadar dekorasi.

Prinsip:
- Satu elemen yang jadi "signature": **tombol swap berbentuk orb kaca** di tengah, dengan
  animasi putar halus saat ditekan (lihat Section 7 & 9)
- Angka (jumlah uang, kurs) pakai font monospace tabular — kesan papan ticker/departure board
- Tidak ada bayangan tajam/flat design biasa — semua permukaan pakai efek kaca (blur + border tipis)

---

## 2. Palet Warna

Base warna sama di kedua mode, hanya token semantic yang berubah nilai lewat `data-theme`.

### Warna Inti (tidak berubah antar mode)
| Token | Hex | Dipakai untuk |
|---|---|---|
| `--color-amber` | `#F2B84B` | Aksen utama, tombol utama, highlight kurs |
| `--color-amber-deep` | `#C8862A` | Hover/active state aksen |
| `--color-indigo-deep` | `#161334` | Background dasar dark mode |
| `--color-plum` | `#2D1B4E` | Gradasi background dark mode |
| `--color-mist` | `#EEF1FB` | Gradasi background light mode |
| `--color-lavender` | `#E4DEFB` | Gradasi background light mode |
| `--color-success` | `#3DBE8B` | Indikator kurs naik / positif |
| `--color-danger` | `#E2607A` | Indikator kurs turun / error |

### Token Semantic — Dark Mode (`data-theme="dark"`)
```css
--bg-gradient: radial-gradient(circle at 20% 0%, var(--color-plum), var(--color-indigo-deep) 60%);
--surface-glass: rgba(255, 255, 255, 0.06);
--surface-glass-strong: rgba(255, 255, 255, 0.10);
--border-glass: rgba(255, 255, 255, 0.14);
--text-primary: #F5F3FF;
--text-secondary: rgba(245, 243, 255, 0.64);
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.35);
```

### Token Semantic — Light Mode (`data-theme="light"`)
```css
--bg-gradient: radial-gradient(circle at 20% 0%, var(--color-lavender), var(--color-mist) 60%);
--surface-glass: rgba(255, 255, 255, 0.55);
--surface-glass-strong: rgba(255, 255, 255, 0.72);
--border-glass: rgba(255, 255, 255, 0.9);
--text-primary: #211A3D;
--text-secondary: rgba(33, 26, 61, 0.62);
--shadow-glass: 0 8px 32px rgba(45, 27, 78, 0.12);
```

> Catatan kontras: `--text-secondary` di light mode sudah dicek ≥ 4.5:1 di atas `--surface-glass-strong`.
> Jangan turunkan opacity teks lebih dari ini tanpa cek ulang kontras.

---

## 3. Tipografi

| Peran | Font | Fallback | Catatan |
|---|---|---|---|
| Display (judul, angka besar hasil konversi) | `"Space Grotesk"` | `sans-serif` | Google Fonts, weight 500–700 |
| Body (label, teks UI) | `"Inter"` | `sans-serif` | weight 400–500 |
| Angka/data (kurs, jumlah input) | `"JetBrains Mono"` | `monospace` | **wajib** `font-variant-numeric: tabular-nums` |

Skala tipe (mobile-first, mengecil di layar kecil via `clamp()`):
```css
--fs-display: clamp(2rem, 8vw, 3rem);      /* hasil konversi */
--fs-heading: clamp(1.125rem, 4vw, 1.5rem);/* judul kartu */
--fs-body: 1rem;
--fs-caption: 0.8125rem;                   /* label kecil, timestamp update */
```

---

## 4. Layout & Struktur

**Mobile-first, satu kartu kaca di tengah layar, tidak ada sidebar/nav kompleks.**

```
┌─────────────────────────────┐
│  Kalkulator Kurs      [🌙/☀️]│  ← header: judul + toggle theme
│                              │
│  ╭─── glass card ─────────╮  │
│  │  Jumlah                │  │
│  │  ┌──────────────────┐  │  │
│  │  │ 100            ▾ │  │  │  ← input angka + dropdown currency (From)
│  │  │ USD               │  │
│  │  └──────────────────┘  │  │
│  │                         │  │
│  │        ⟲ (swap orb)     │  │  ← signature element, di tengah
│  │                         │  │
│  │  ┌──────────────────┐  │  │
│  │  │ 1.620.000      ▾ │  │  │  ← hasil (read-only) + dropdown currency (To)
│  │  │ IDR               │  │
│  │  └──────────────────┘  │  │
│  │                         │  │
│  │  1 USD = 16.200 IDR     │  │  ← info rate
│  │  Update: 9 Jul 2026     │  │  ← caption kecil, jujur soal data harian
│  ╰─────────────────────────╯  │
└─────────────────────────────┘
```

- Breakpoint: di atas `768px`, card diberi `max-width: 480px` dan tetap center — **jangan**
  melebar penuh mengikuti layar desktop, karena ini bukan dashboard, ini kalkulator personal
- Padding card mobile: `24px`; desktop: `32px`
- Container utama pakai `min-height: 100dvh` (bukan `100vh`, untuk hindari masalah mobile browser bar)

---

## 5. Komponen

### 5.1 Glass Card (container utama)
```css
background: var(--surface-glass);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border: 1px solid var(--border-glass);
border-radius: 28px;
box-shadow: var(--shadow-glass);
```

### 5.2 Input Jumlah + Dropdown Mata Uang
- Digabung jadi satu "baris" dalam satu sub-panel kaca (`--surface-glass-strong`), border-radius `20px`
- Input angka: font `--fs-display`, `text-align: left`, tanpa border/outline default browser
- Dropdown mata uang: tampil sebagai chip kecil (bendera/kode 3 huruf + ikon panah bawah),
  border-radius penuh (`border-radius: 999px`), **bukan** dropdown HTML polos yang terlihat default
- Saat difokuskan: border glow tipis pakai `--color-amber` (`box-shadow: 0 0 0 3px rgba(242,184,75,0.25)`)

### 5.3 Tombol Swap (Signature Element)
- Bentuk lingkaran (orb) diameter `48px`, posisi absolut di tengah, "menembus" batas dua sub-panel
- Background: gradient kecil dari `--color-amber` ke `--color-amber-deep`
- Ikon panah dua arah (ↅ atau serupa), warna putih/gelap kontras
- Saat hover/tap: `transform: rotate(180deg)` dengan transisi (lihat Section 7)

### 5.4 Toggle Light/Dark
- Bentuk pill kecil di pojok kanan atas header, ikon matahari/bulan yang geser (mirip iOS switch)
- Perubahan tema: transisi `background` dan `color` saja (bukan properti layout), durasi 300ms

### 5.5 Info Rate & Timestamp
- Teks kecil (`--fs-caption`), warna `--text-secondary`
- Format wajib: `"1 [FROM] = [angka] [TO]"` lalu baris kedua `"Update: [tanggal]"` —
  **tidak boleh** hilang, ini bagian dari aturan kejujuran data di `AGENTS.md`

---

## 6. Efek Glassmorphism — Aturan Teknis

```css
/* Pola dasar untuk SEMUA permukaan kaca di app ini */
.glass-surface {
  background: var(--surface-glass);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid var(--border-glass);
}
```
- Blur minimum `16px`, maksimum `24px` — di bawah itu efek kaca tidak terasa, di atas itu berat di HP low-end
- **Fallback wajib:** jika browser tidak dukung `backdrop-filter` (`@supports not (backdrop-filter: blur(1px))`),
  turunkan ke background solid `var(--surface-glass-strong)` tanpa blur — jangan biarkan card jadi transparan penuh/tak terbaca
- Background gradient utama (`--bg-gradient`) taruh di `<body>`, bukan di card, supaya efek "kaca mengambang di atas sesuatu" terasa

---

## 7. Motion & Animasi

Sesuai `AGENTS.md`: semua animasi pakai `transform`/`opacity` saja, easing
`cubic-bezier(0.16, 1, 0.3, 1)`, dan **wajib** dibungkus:
```css
@media (prefers-reduced-motion: no-preference) {
  /* animasi taruh di sini */
}
```

| Interaksi | Animasi |
|---|---|
| Swap ditekan | `transform: rotate(180deg)`, durasi 400ms, lalu nilai From/To bertukar |
| Hasil konversi berubah | Angka fade+slide kecil (`opacity 0→1`, `transform: translateY(4px)→0`), durasi 200ms |
| Toggle theme | Cross-fade warna 300ms, ikon matahari/bulan geser dengan `transform: translateX()` |
| Card pertama kali muncul (load) | `opacity 0→1` + `transform: translateY(12px)→0`, durasi 350ms, sekali saja saat mount |

Jangan tambah animasi di luar tabel ini tanpa alasan — sesuai prinsip "restraint" di
`frontend-design` skill: satu signature element (swap orb) yang paling menonjol, sisanya tenang.

---

## 8. Aksesibilitas

- Semua input punya `<label>` (boleh visually-hidden tapi tetap ada di DOM)
- Dropdown mata uang harus bisa dioperasikan keyboard (native `<select>` dibungkus styling,
  **jangan** buat dropdown custom dari `<div>` tanpa role/aria yang benar)
- Toggle theme punya `aria-label="Ganti mode terang/gelap"`
- Kontras teks vs background: minimum 4.5:1 di kedua mode (sudah dicek di Section 2)
- Fokus terlihat jelas (jangan `outline: none` tanpa pengganti visual)

---

## 9. Signature Element — Detail

**Swap orb** adalah satu-satunya elemen yang boleh terasa "berani": warna solid amber di
tengah panel yang serba transparan, sedikit "mengambang" keluar dari batas card (pakai
`margin` negatif atau posisi absolut), dengan bayangan lembut supaya terlihat seperti benda
fisik kecil di atas kaca — bukan ikon flat biasa.

Semua elemen lain sengaja dibuat tenang (glass transparan, teks secondary redup) supaya
orb ini yang pertama kali menarik perhatian mata saat halaman dibuka.
