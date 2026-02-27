const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');

let displayValue = '0';
let firstOperand = null;
let currentOperator = null;
let waitingForSecondOperand = false;
let isScientific = false;
let history = [];

function updateDisplay() {
  resultEl.textContent = displayValue;
  updatePreview();
}

function updatePreview() {
  if (currentOperator && !waitingForSecondOperand && displayValue !== '-' && displayValue !== 'Erro') {
    try {
      const currentNum = parseFloat(displayValue);
      if (isNaN(currentNum)) {
        resultEl.textContent = displayValue;
        return;
      }

      let preview;
      if (currentOperator === '+') preview = firstOperand + currentNum;
      else if (currentOperator === '-') preview = firstOperand - currentNum;
      else if (currentOperator === '×') preview = firstOperand * currentNum;
      else if (currentOperator === '÷') {
        if (currentNum === 0) {
          resultEl.textContent = 'Erro';
          return;
        }
        preview = firstOperand / currentNum;
      }

      if (isNaN(preview) || !isFinite(preview)) {
        resultEl.textContent = 'Erro';
      } else {
        resultEl.textContent = parseFloat(preview.toFixed(8)).toString();
      }
    } catch {
      resultEl.textContent = displayValue;
    }
  } else {
    // Sem operação pendente → mostra só o número atual
    resultEl.textContent = displayValue;
  }
}

function inputDigit(digit) {
  if (displayValue === 'Erro') displayValue = '0';

  if (waitingForSecondOperand) {
    displayValue = digit;
    waitingForSecondOperand = false;
  } else {
    displayValue = displayValue === '0' && digit !== '0' ? digit : displayValue + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (displayValue === 'Erro') displayValue = '0';

  if (waitingForSecondOperand) {
    displayValue = '0.';
    waitingForSecondOperand = false;
  } else if (!displayValue.includes('.')) {
    displayValue += '.';
  }
  updateDisplay();
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(displayValue);

  // Permite - no início ou após operador (para número negativo)
  if (nextOperator === '-' && (displayValue === '0' || waitingForSecondOperand)) {
    if (waitingForSecondOperand) {
      displayValue = '-';
    } else {
      displayValue = displayValue === '0' ? '-' : displayValue + '-';
    }
    waitingForSecondOperand = false;
    updateDisplay();
    return;
  }

  // Bloqueia outros operadores no início ou sem número válido
  if ((firstOperand === null && displayValue === '0') || isNaN(inputValue)) {
    if (nextOperator !== '-') return;
  }

  if (currentOperator && waitingForSecondOperand) {
    currentOperator = nextOperator;
    expressionEl.textContent = `${firstOperand} ${currentOperator}`;
    updateDisplay();
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (currentOperator) {
    const result = performCalculation(inputValue);
    if (isNaN(result) || !isFinite(result)) {
      resultEl.textContent = 'Erro';
      setTimeout(() => {
        clearDisplay();
      }, 1200);
      return;
    }
    displayValue = String(parseFloat(result.toFixed(8)));
    firstOperand = result;
    updateDisplay();
  }

  waitingForSecondOperand = true;
  currentOperator = nextOperator;
  expressionEl.textContent = `${firstOperand} ${currentOperator}`;
}

function performCalculation(secondOperand) {
  if (currentOperator === '+') return firstOperand + secondOperand;
  if (currentOperator === '-') return firstOperand - secondOperand;
  if (currentOperator === '×') return firstOperand * secondOperand;
  if (currentOperator === '÷') return secondOperand === 0 ? NaN : firstOperand / secondOperand;
  return secondOperand;
}

function calculate() {
  if (currentOperator === null || waitingForSecondOperand) return;

  let inputValue = parseFloat(displayValue);

  // Trata caso o display esteja em "-" (incompleto)
  if (isNaN(inputValue)) {
    if (displayValue === '-') inputValue = 0;
    else return;
  }

  let result = performCalculation(inputValue);

  if (isNaN(result) || !isFinite(result)) {
    resultEl.textContent = 'Erro';
    setTimeout(clearDisplay, 1200);
    return;
  }

  // Adiciona ao histórico
  const entry = `${firstOperand} ${currentOperator} ${inputValue} = ${parseFloat(result.toFixed(8))}`;
  history.unshift(entry);
  if (history.length > 15) history.pop();
  renderHistory();

  expressionEl.textContent = `${firstOperand} ${currentOperator} ${inputValue} =`;
  displayValue = String(parseFloat(result.toFixed(8)));
  firstOperand = result;
  currentOperator = null;
  waitingForSecondOperand = false;

  updateDisplay();  // Mostra o resultado final
}

function handlePercent() {
  if (displayValue === '0' || displayValue === '-' || isNaN(parseFloat(displayValue))) return;
  let value = parseFloat(displayValue) / 100;
  displayValue = String(parseFloat(value.toFixed(8)));
  updateDisplay();
}

// === FUNÇÕES CIENTÍFICAS ===
function scientificFunc(type) {
  if (displayValue === 'Erro' || displayValue === '-') return;
  let val = parseFloat(displayValue);
  let result;

  switch(type) {
    case 'sqrt': result = Math.sqrt(val); break;
    case 'square': result = val * val; break;
    case 'sin': result = Math.sin(val * Math.PI / 180); break;
    case 'cos': result = Math.cos(val * Math.PI / 180); break;
    case 'tan': result = Math.tan(val * Math.PI / 180); break;
    case 'log': result = val > 0 ? Math.log10(val) : NaN; break;
    case 'ln':  result = val > 0 ? Math.log(val)  : NaN; break;
  }

  displayValue = isNaN(result) || !isFinite(result) ? 'Erro' : String(parseFloat(result.toFixed(8)));
  updateDisplay();
}

function inputPi() {
  displayValue = '3.1415926535';
  if (waitingForSecondOperand) waitingForSecondOperand = false;
  updateDisplay();
}

// === HISTÓRICO ===
function renderHistory() {
  historyList.innerHTML = history.map(item => `<li>${item}</li>`).join('');
}

function toggleHistory() {
  historyPanel.classList.toggle('show');
}

function clearHistory() {
  history = [];
  renderHistory();
}

// === TOGGLE CIENTÍFICO ===
function toggleScientific() {
  isScientific = !isScientific;
  document.querySelector('.calculator').classList.toggle('scientific', isScientific);
  document.getElementById('sci-toggle').textContent = isScientific ? 'Básica' : 'Científica';
}

// === DELETE E CLEAR ===
function deleteDigit() {
  if (displayValue === 'Erro' || waitingForSecondOperand) return;

  if (displayValue === '-' || displayValue.length <= 1) {
    displayValue = '0';
  } else {
    displayValue = displayValue.slice(0, -1);
  }
  updateDisplay();
}

function clearDisplay() {
  displayValue = '0';
  firstOperand = null;
  currentOperator = null;
  waitingForSecondOperand = false;
  expressionEl.textContent = '';
  updateDisplay();
}

// === TECLADO ===
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  if (e.key === '.') inputDecimal();
  if (e.key === '+') handleOperator('+');
  if (e.key === '-') handleOperator('-');
  if (e.key === '*') handleOperator('×');
  if (e.key === '/') handleOperator('÷');
  if (e.key === 'Enter' || e.key === '=') calculate();
  if (e.key === 'Backspace') deleteDigit();
  if (e.key === 'Escape' || e.key.toLowerCase() === 'c') clearDisplay();
  if (e.key === '%') handlePercent();
});

// Inicializa
clearDisplay();
