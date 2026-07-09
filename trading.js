// trading.js - Logika untuk Trading Kalkulator

// Elemen DOM
const coinAmountInput = document.getElementById('coinAmount');
const buyPriceInput = document.getElementById('buyPrice');
const sellPriceInput = document.getElementById('sellPrice');

const pnlAmountDisplay = document.getElementById('pnlAmount');
const pnlPercentageDisplay = document.getElementById('pnlPercentage');
const totalInvestmentDisplay = document.getElementById('totalInvestment');
const totalReturnDisplay = document.getElementById('totalReturn');

// Theme Toggle logic (Sama seperti kurs kalkulator)
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Format Angka
function formatMoney(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(num);
}

function updateFontSize(element, text) {
    const len = text.length;
    if (len > 18) {
        element.style.fontSize = 'clamp(1.5rem, 3vw, 2rem)';
    } else if (len > 12) {
        element.style.fontSize = 'clamp(2rem, 4.5vw, 2.8rem)';
    } else if (len > 8) {
        element.style.fontSize = 'clamp(2.5rem, 5.5vw, 3.5rem)';
    } else {
        element.style.fontSize = ''; // fallback
    }
}

// Fungsi Menghitung Profit/Loss
function calculateTrading() {
    const amount = parseFloat(coinAmountInput.value) || 0;
    const buyPrice = parseFloat(buyPriceInput.value) || 0;
    const sellPrice = parseFloat(sellPriceInput.value) || 0;

    const totalInvestment = amount * buyPrice;
    const totalReturn = amount * sellPrice;
    const pnlAmount = totalReturn - totalInvestment;
    
    let pnlPercentage = 0;
    if (totalInvestment > 0) {
        pnlPercentage = (pnlAmount / totalInvestment) * 100;
    }

    // Update Text
    const sign = pnlAmount >= 0 ? '+' : '';
    pnlAmountDisplay.textContent = `${sign}${formatMoney(pnlAmount)}`;
    pnlPercentageDisplay.textContent = `${sign}${pnlPercentage.toFixed(2)}%`;
    totalInvestmentDisplay.textContent = formatMoney(totalInvestment);
    totalReturnDisplay.textContent = formatMoney(totalReturn);

    // Update Font Size untuk PnL
    updateFontSize(pnlAmountDisplay, pnlAmountDisplay.textContent);
    updateFontSize(pnlPercentageDisplay, pnlPercentageDisplay.textContent);

    // Update Warna (Hijau/Merah)
    if (pnlAmount >= 0) {
        pnlAmountDisplay.className = 'result-display text-green fade-update';
        pnlPercentageDisplay.className = 'result-display text-green fade-update';
    } else {
        pnlAmountDisplay.className = 'result-display text-red fade-update';
        pnlPercentageDisplay.className = 'result-display text-red fade-update';
    }
    
    // Trigger Reflow untuk animasi
    void pnlAmountDisplay.offsetWidth;
}

// Mencegah input huruf e, +, - pada input angka
[coinAmountInput, buyPriceInput, sellPriceInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    input.addEventListener('input', () => {
        updateFontSize(input, input.value);
        calculateTrading();
    });
});

// Jalankan pertama kali
calculateTrading();
