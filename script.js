// script.js - Logika aplikasi dengan integrasi Chart.js

// Elemen DOM
const amountInput = document.getElementById('amount');
const resultDisplay = document.getElementById('result');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const fromCodeDisplay = document.getElementById('fromCodeDisplay');
const toCodeDisplay = document.getElementById('toCodeDisplay');
const fromSymbol = document.getElementById('fromSymbol');
const toSymbol = document.getElementById('toSymbol');
const swapBtn = document.getElementById('swapBtn');
const exchangeRateInfo = document.getElementById('exchange-rate-info');
const lastUpdateSpan = document.getElementById('last-update');
const themeToggle = document.getElementById('themeToggle');

// State Aplikasi
let currenciesData = {};
let currentRate = 0;
let chartInstance = null;

// Mengambil daftar mata uang
async function fetchCurrencies() {
    try {
        const response = await fetch('https://api.frankfurter.dev/v1/currencies');
        currenciesData = await response.json();
        populateDropdowns();
        // Set default value
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'IDR';
        updateCurrencyDisplay();
        await calculate();
    } catch (error) {
        console.error('Gagal mengambil daftar mata uang:', error);
        exchangeRateInfo.textContent = 'Gagal memuat mata uang. Periksa koneksi internet.';
    }
}

// Mengisi pilihan dropdown
function populateDropdowns() {
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';

    for (const currencyCode in currenciesData) {
        const currencyName = currenciesData[currencyCode];
        
        const optionFrom = document.createElement('option');
        optionFrom.value = currencyCode;
        // Di dropdown asli yang muncul di sistem, kita tampilkan teks panjang
        optionFrom.textContent = `${currencyCode} - ${currencyName}`;
        fromCurrencySelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = currencyCode;
        optionTo.textContent = `${currencyCode} - ${currencyName}`;
        toCurrencySelect.appendChild(optionTo);
    }
}

// Objek untuk memetakan simbol mata uang (beberapa yang umum)
const currencySymbols = {
    "USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥", "AUD": "A$", 
    "CAD": "C$", "CHF": "Fr", "CNY": "¥", "SEK": "kr", "NZD": "$", 
    "IDR": "Rp", "INR": "₹", "BRL": "R$", "RUB": "₽", "ZAR": "R",
    "SGD": "S$", "HKD": "HK$", "MYR": "RM", "THB": "฿", "PHP": "₱"
};

// Memperbarui teks dan simbol yang terlihat di UI
function updateCurrencyDisplay() {
    const fromCode = fromCurrencySelect.value;
    const toCode = toCurrencySelect.value;
    
    fromCodeDisplay.textContent = fromCode;
    toCodeDisplay.textContent = toCode;
    
    fromSymbol.textContent = currencySymbols[fromCode] || '';
    toSymbol.textContent = currencySymbols[toCode] || '';
}

// Memformat angka agar rapi (misal: 1000.5 -> 1.000,50)
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    }).format(num);
}

// Menghitung konversi
async function calculate() {
    const amount = amountInput.value;
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;

    if (amount === '' || isNaN(amount)) {
        resultDisplay.textContent = '0';
        return;
    }

    if (from === to) {
        resultDisplay.textContent = formatNumber(amount);
        exchangeRateInfo.textContent = `1 ${from} = 1 ${to}`;
        updateChartData(from, to);
        return;
    }

    try {
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();

        currentRate = data.rates[to];
        const convertedAmount = amount * currentRate;

        // Tampilkan hasil dengan animasi fade
        resultDisplay.textContent = formatNumber(convertedAmount);
        resultDisplay.classList.remove('fade-update');
        void resultDisplay.offsetWidth; // trigger reflow
        resultDisplay.classList.add('fade-update');

        // Tampilkan info rate dan tanggal
        exchangeRateInfo.textContent = `1 ${from} = ${formatNumber(currentRate)} ${to}`;
        lastUpdateSpan.textContent = data.date;
        
        // Update Grafik
        updateChartData(from, to);

    } catch (error) {
        console.error('Error saat menghitung:', error);
        resultDisplay.textContent = 'Error';
    }
}

// Mencegah input huruf e, +, - pada input angka
amountInput.addEventListener('keydown', (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault();
    }
});

// Event Listeners
amountInput.addEventListener('input', calculate);

fromCurrencySelect.addEventListener('change', () => {
    updateCurrencyDisplay();
    calculate();
});

toCurrencySelect.addEventListener('change', () => {
    updateCurrencyDisplay();
    calculate();
});

swapBtn.addEventListener('click', () => {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    
    updateCurrencyDisplay();
    calculate();
});

// --- FITUR GRAFIK (CHART.JS) ---

function getPastDate(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0]; // Format YYYY-MM-DD
}

async function updateChartData(from, to) {
    if (from === to) {
        // Jika mata uang sama, kosongkan atau gambar garis lurus
        renderChart([], []);
        return;
    }

    const startDate = getPastDate(30);
    // API Frankfurter menggunakan /v1/ untuk endpoint rentang waktu
    const url = `https://api.frankfurter.dev/v1/${startDate}..?base=${from}&symbols=${to}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Chart API Error');
        const data = await response.json();
        
        const labels = Object.keys(data.rates); // Tanggal
        const values = labels.map(date => data.rates[date][to]); // Nilai kurs
        
        renderChart(labels, values);
    } catch (error) {
        console.error('Gagal memuat data grafik', error);
    }
}

function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        line: isDark ? '#d8cc54' : '#c6d126', // Warna kuning senada swap btn
        text: isDark ? '#aaaaaa' : '#666666',
        grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
    };
}

function renderChart(labels, data) {
    const ctx = document.getElementById('rateChart').getContext('2d');
    const colors = getChartColors();

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai Tukar',
                data: data,
                borderColor: colors.line,
                backgroundColor: 'transparent',
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                tension: 0.3 // Membuat garis sedikit melengkung (smooth)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: colors.text, maxTicksLimit: 6 }
                },
                y: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// --- TEMA GELAP / TERANG ---

themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Render ulang grafik agar warnanya ikut berubah
    if (chartInstance) {
        const colors = getChartColors();
        chartInstance.data.datasets[0].borderColor = colors.line;
        chartInstance.options.scales.x.ticks.color = colors.text;
        chartInstance.options.scales.y.ticks.color = colors.text;
        chartInstance.options.scales.y.grid.color = colors.grid;
        chartInstance.update();
    }
});

// Cek tema tersimpan saat load
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
} else {
    // Default tema terang untuk desain baru
    document.documentElement.setAttribute('data-theme', 'light');
}

// Inisialisasi awal
fetchCurrencies();
