// script.js - File ini menangani logika aplikasi "Dusk Exchange"

// 1. Pemilihan Elemen DOM Baru
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const swapBtn = document.getElementById('swap-btn');
const conversionResultText = document.getElementById('conversion-result');
const exchangeRateInfoText = document.getElementById('exchange-rate-info');
const lastUpdateText = document.getElementById('last-update');

// Elemen Toggle Tema
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlTag = document.documentElement;

// Caching API agar hemat kuota/request
let currenciesData = {};
let cachedRates = {};

// Fungsi untuk mengganti tema (Terang / Gelap)
function toggleTheme() {
    const currentTheme = htmlTag.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Ubah atribut html untuk memicu perubahan CSS
    htmlTag.setAttribute('data-theme', newTheme);
    
    // Simpan pilihan di browser memori
    localStorage.setItem('theme', newTheme);
}

// Mengecek apakah sebelumnya pengguna pernah memilih tema di sesi sebelumnya
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlTag.setAttribute('data-theme', savedTheme);
}
themeToggleBtn.addEventListener('click', toggleTheme);

// Fungsi format angka (pakai pemisah titik/koma)
function formatCurrency(amount) {
    // Memformat angka sesuai gaya Indonesia, tapi TANPA simbol uang 
    // karena nama mata uang sudah ada di dropdown sampingnya.
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

// Memicu animasi "fade & slide" pada teks hasil (Sesuai DESIGN.md section 7)
function triggerResultAnimation() {
    // Menghapus dan menaruh kelas CSS berulang-ulang untuk memicu ulang animasinya
    conversionResultText.classList.remove('fade-slide');
    void conversionResultText.offsetWidth; // Trik ajaib JS untuk mereset animasi CSS
    conversionResultText.classList.add('fade-slide');
}

// 2. Mengambil daftar SEMUA mata uang dari Frankfurter API (v1)
async function fetchCurrencies() {
    try {
        const response = await fetch('https://api.frankfurter.dev/v1/currencies');
        if (!response.ok) throw new Error('Gagal memuat mata uang');
        
        currenciesData = await response.json();
        populateDropdowns();
        calculate();

    } catch (error) {
        console.error('Error:', error);
        conversionResultText.textContent = "Error";
        exchangeRateInfoText.textContent = "Gagal memuat info kurs.";
    }
}

// 3. Memasukkan daftar mata uang ke dropdown tipe baru (chip)
function populateDropdowns() {
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';

    for (const currencyCode in currenciesData) {
        const currencyName = currenciesData[currencyCode];
        
        const optionFrom = document.createElement('option');
        optionFrom.value = currencyCode;
        optionFrom.textContent = `${currencyCode} - ${currencyName}`;
        fromCurrencySelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = currencyCode;
        optionTo.textContent = `${currencyCode} - ${currencyName}`;
        toCurrencySelect.appendChild(optionTo);
    }

    if (currenciesData['USD']) fromCurrencySelect.value = 'USD';
    if (currenciesData['IDR']) toCurrencySelect.value = 'IDR';
}

// 4. Fungsi Utama untuk Mengambil Kurs dan Menghitung Konversi
async function calculate() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (!fromCurrency || !toCurrency) return;

    if (isNaN(amount) || amount === 0) {
        conversionResultText.textContent = '0';
        exchangeRateInfoText.textContent = `1 ${fromCurrency} = - ${toCurrency}`;
        return;
    }

    if (fromCurrency === toCurrency) {
        conversionResultText.textContent = formatCurrency(amount);
        exchangeRateInfoText.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
        triggerResultAnimation();
        return;
    }

    try {
        if (!cachedRates[fromCurrency] || !cachedRates[fromCurrency].rates[toCurrency]) {
            exchangeRateInfoText.textContent = 'Mengambil data kurs...';
            const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${fromCurrency}`);
            if (!response.ok) throw new Error('Gagal');
            cachedRates[fromCurrency] = await response.json();
        }

        const rateData = cachedRates[fromCurrency];
        const rate = rateData.rates[toCurrency];
        
        // Memecah format tanggal YYYY-MM-DD menjadi lebih mudah dibaca (misal 9 Jul 2026)
        const dateObj = new Date(rateData.date);
        lastUpdateText.textContent = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

        const result = amount * rate;

        conversionResultText.textContent = formatCurrency(result);
        triggerResultAnimation(); // Mainkan animasi memudar/geser
        
        // Memformat nilai kurs agar rapi (max 4 angka di belakang koma)
        const formattedRate = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(rate);
        exchangeRateInfoText.textContent = `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;

    } catch (error) {
        conversionResultText.textContent = "Error";
        exchangeRateInfoText.textContent = "Gagal mengambil kurs.";
    }
}

// 5. Menambahkan "pendengar" agar aplikasi merespon input
// Memblokir huruf seperti 'e', '+', dan '-' yang bawaannya diizinkan oleh HTML untuk angka sains
amountInput.addEventListener('keydown', (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault();
    }
});

// Otomatis menghitung ulang ketika nilai berubah
amountInput.addEventListener('input', calculate);
fromCurrencySelect.addEventListener('change', calculate);
toCurrencySelect.addEventListener('change', calculate);

// 6. Logika Tombol Swap (Tukar Mata Uang)
swapBtn.addEventListener('click', () => {
    // Animasi putar orb sudah di-handle penuh oleh hover/active CSS,
    // di sini kita hanya perlu menukar isi datanya.
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    calculate();
});

// Mulai aplikasi
fetchCurrencies();
