let display = document.getElementById('result');

function appendValue(value) {
    if (display.value === "0") display.value = value;
    else display.value += value;
}

function clearDisplay() {
    display.value = "0";
}

function toggleScientific() {
    const sciKeys = document.getElementById('scientific-keys');
    sciKeys.classList.toggle('hidden');
}

function calculate() {
    try {
        // O eval resolve as operações básicas e potências (**)
        display.value = eval(display.value);
    } catch (e) {
        display.value = "Erro";
    }
}

function percentage() {
    display.value = eval(display.value) / 100;
}

function sqrt() {
    display.value = Math.sqrt(eval(display.value));
}

function factorial() {
    let n = parseInt(eval(display.value));
    if (n < 0) return display.value = "Erro";
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    display.value = res;
}

function appendFunction(type) {
    let val = eval(display.value);
    // Convertendo graus para radianos para sin/cos/tan
    let rad = val * (Math.PI / 180);
    
    switch(type) {
        case 'sin': display.value = Math.sin(rad).toFixed(8); break;
        case 'cos': display.value = Math.cos(rad).toFixed(8); break;
        case 'tan': display.value = Math.tan(rad).toFixed(8); break;
    }
}