// script.js
// -- Users (unchanged) --
const USERS = {
  'Dolly': 'tylerluvdolly112',
  'Dianne': 'tylerluvdianne112',
  'Zera': 'tylerluvzera112',
  'Petrina': 'anthonyluvpetrina',
  'Tanisha': 'anthonyluvtanisha',
  'Dennis': 'anthonyluvdennis',
  'Wendy': 'anthonyluvwendy',
  'Carol': 'tylerluvcarol112'
};

const $ = id => document.getElementById(id);
const show = id => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');
};

// --- Password toggle (unchanged)
let pwdVisible = false;
const togglePwd = $('toggle-pwd');
if (togglePwd) togglePwd.addEventListener('click', () => {
  pwdVisible = !pwdVisible;
  const input = $('login-password');
  if (input) input.type = pwdVisible ? 'text' : 'password';
  togglePwd.classList.toggle('off', !pwdVisible);
});

// --- Spinner & UX configuration
const LOGIN_SPINNER_MS = 6000;         // login spinner duration
const CLICK_WHILE_GLOBAL_MS = 3000;    // per-click spinner while global spinner active
const TRANSFER_SPINNER_MS = 5000;      // transfer button spinner duration

const globalOverlay = document.getElementById('global-spinner-overlay');
let globalSpinnerActive = false;

// show global spinner for ms milliseconds (visual only; allows clicks to show per-control spinner)
function showGlobalSpinner(ms = 1000) {
  if (!globalOverlay) return Promise.resolve();
  globalSpinnerActive = true;
  globalOverlay.classList.remove('hidden');
  // use pointer-events: none in CSS so users can still interact with underlying controls
  return new Promise(resolve => {
    setTimeout(() => {
      globalOverlay.classList.add('hidden');
      globalSpinnerActive = false;
      resolve();
    }, ms);
  });
}

function createMiniSpinner() {
  const s = document.createElement('span');
  s.className = 'mini-spinner';
  return s;
}

// Show a spinner inside a control element for ms milliseconds
function showControlSpinner(el, ms = 1000) {
  if (!el) return Promise.resolve();
  // Prevent stacking
  if (el.dataset.spinner === '1') return new Promise(r => setTimeout(r, ms));
  el.dataset.spinner = '1';
  el.classList.add('disabled-spinner');
  // create and attach mini spinner
  const spinner = createMiniSpinner();
  // if button has text, hide it visually while spinner shows (preserve layout)
  const label = document.createElement('span');
  label.className = 'hidden-label';
  label.textContent = el.textContent || '';
  // Keep original text hidden for accessibility but maintain spacing
  el._originalText = el.textContent;
  el.textContent = '';
  el.appendChild(spinner);
  el.appendChild(label);
  el.setAttribute('aria-busy', 'true');
  el.disabled = true;
  return new Promise(resolve => {
    setTimeout(() => {
      el.disabled = false;
      el.removeAttribute('aria-busy');
      // cleanup
      if (el.contains(spinner)) spinner.remove();
      if (el.contains(label)) label.remove();
      el.textContent = el._originalText || '';
      delete el._originalText;
      el.classList.remove('disabled-spinner');
      el.dataset.spinner = '0';
      resolve();
    }, ms);
  });
}

// While global spinner is active, clicking any button or .tappable element will show a 3s spinner on it
document.addEventListener('click', (ev) => {
  if (!globalSpinnerActive) return;
  // find the actionable element
  const target = ev.target.closest('button, .tappable, .nav-item, .menu-item, .view-btn');
  if (target) {
    ev.preventDefault();
    ev.stopPropagation();
    showControlSpinner(target, CLICK_WHILE_GLOBAL_MS);
  }
}, true);

// --- Login flow: show 6s spinner, then validate and navigate
const btnLogin = $('btn-login');
if (btnLogin) btnLogin.addEventListener('click', async (e) => {
  e.preventDefault();
  const inputRaw = $('login-username') ? $('login-username').value.trim() : '';
  const password = $('login-password') ? $('login-password').value : '';
  const msg = $('login-msg');
  if (msg) msg.textContent = '';

  // show the login spinner for configured duration
  await showGlobalSpinner(LOGIN_SPINNER_MS);

  // After spinner finishes, proceed with authentication (case-insensitive lookup)
  const matchedKey = Object.keys(USERS).find(k => k.toLowerCase() === inputRaw.toLowerCase());
  if (matchedKey && USERS[matchedKey] === password) {
    // set visible names
    const userName = $('user-name');
    if (userName) userName.textContent = matchedKey;
    const welcomeName = $('welcome-name');
    if (welcomeName) welcomeName.textContent = matchedKey;

    // set inbox note (personalized)
    const inboxNote = $('inbox-note');
    if (inboxNote) inboxNote.textContent = `You have 1 new message — Welcome back, ${matchedKey}.`;

    show('dashboard');
    // small settle highlight for the investment section if present
    const inv = document.getElementById('investment-section');
    if (inv) {
      inv.classList.add('in-view-highlight');
      setTimeout(() => inv.classList.remove('in-view-highlight'), 900);
    }
  } else {
    if (msg) msg.textContent = 'Incorrect User ID or Password';
  }
});

// --- Logout (unchanged)
const btnLogout = $('btn-logout');
if (btnLogout) btnLogout.addEventListener('click', () => {
  show('login');
  const loginUsername = $('login-username');
  if (loginUsername) loginUsername.value = '';
  const loginPassword = $('login-password');
  if (loginPassword) loginPassword.value = '';

  // clear displayed names and inbox note
  const userName = $('user-name');
  if (userName) userName.textContent = '';
  const welcomeName = $('welcome-name');
  if (welcomeName) welcomeName.textContent = '';
  const inboxNote = $('inbox-note');
  if (inboxNote) inboxNote.textContent = 'You have 1 new message.';
});

// --- Menu Tap and Menu Items (unchanged behavior)
const menuTap = $('menu-tap');
if (menuTap) menuTap.addEventListener('click', () => show('menu-screen'));

// Menu Items
const menuAccounts = $('menu-accounts');
if (menuAccounts) menuAccounts.addEventListener('click', () => show('dashboard'));
const menuTransfer = $('menu-transfer');
if (menuTransfer) menuTransfer.addEventListener('click', () => show('transfer'));
const menuZelle = $('menu-zelle');
if (menuZelle) menuZelle.addEventListener('click', () => show('zelle'));
const menuBill = $('menu-bill');
if (menuBill) menuBill.addEventListener('click', () => show('bills'));
const menuDeposit = $('menu-deposit');
if (menuDeposit) menuDeposit.addEventListener('click', () => show('deposit'));
const menuInvest = $('menu-invest');
if (menuInvest) menuInvest.addEventListener('click', () => {
  // animate to investment area inside dashboard
  show('dashboard');
  setTimeout(() => scrollToInvestment(), 220);
});

// --- Back buttons
const backMenu = $('back-menu');
if (backMenu) backMenu.addEventListener('click', () => show('dashboard'));
const backInbox = $('back-inbox');
if (backInbox) backInbox.addEventListener('click', () => show('dashboard'));

// --- Inbox Tap
const inboxTap = $('inbox-tap');
if (inboxTap) inboxTap.addEventListener('click', () => show('inbox'));

// --- Bottom Nav behavior (including Invest animated scroll)
const navTransfer = $('nav-transfer');
if (navTransfer) navTransfer.addEventListener('click', () => show('transfer'));
const navBill = $('nav-bill');
if (navBill) navBill.addEventListener('click', () => show('bills'));
const navDeposit = $('nav-deposit');
if (navDeposit) navDeposit.addEventListener('click', () => show('deposit'));
const navInvest = $('nav-invest');
if (navInvest) navInvest.addEventListener('click', (e) => {
  e.preventDefault();
  // show dashboard then animate scroll to investment area
  show('dashboard');
  setTimeout(() => scrollToInvestment(), 220);
});

// helper: smooth scroll and highlight investment section
function scrollToInvestment() {
  const inv = document.getElementById('investment-section');
  if (!inv) return;
  // smooth scroll to center of viewport (if inside the app container)
  inv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  inv.classList.add('in-view-highlight');
  setTimeout(() => inv.classList.remove('in-view-highlight'), 1000);
}

// --- Back from Inbox and other places (unchanged)
const backZelle = $('back-zelle');
if (backZelle) backZelle.addEventListener('click', () => show('dashboard'));
const backTransfer = $('back-transfer');
if (backTransfer) backTransfer.addEventListener('click', () => show('dashboard'));
const backDeposit = $('back-deposit');
if (backDeposit) backDeposit.addEventListener('click', () => show('dashboard'));
const backBills = $('back-bills');
if (backBills) backBills.addEventListener('click', () => show('dashboard'));
const backInvest = $('back-invest');
if (backInvest) backInvest.addEventListener('click', () => show('dashboard'));

// --- Account taps
const checkingCard = $('checking-card');
if (checkingCard) checkingCard.addEventListener('click', () => show('checking-transactions'));
const savingsCard = $('savings-card');
if (savingsCard) savingsCard.addEventListener('click', () => show('savings-transactions'));

// Back from Transactions
const backChecking = $('back-checking');
if (backChecking) backChecking.addEventListener('click', () => show('dashboard'));
const backSavings = $('back-savings');
if (backSavings) backSavings.addEventListener('click', () => show('dashboard'));

// TRANSFER FEATURE
let selectedFromAccount = null;

const transferChecking = $('transfer-checking');
const transferSavings = $('transfer-savings');

if (transferChecking) {
  transferChecking.addEventListener('click', () => {
    selectedFromAccount = 'checking';
    transferChecking.style.background = '#e6e6e6';
    if (transferSavings) transferSavings.style.background = '';
  });
}
if (transferSavings) {
  transferSavings.addEventListener('click', () => {
    selectedFromAccount = 'savings';
    transferSavings.style.background = '#e6e6e6';
    if (transferChecking) transferChecking.style.background = '';
  });
}

const btnTransfer = $('btn-transfer');
if (btnTransfer) btnTransfer.addEventListener('click', async (ev) => {
  ev.preventDefault();
  // show 5s spinner on the transfer button then show the existing alert message
  await showControlSpinner(btnTransfer, TRANSFER_SPINNER_MS);

  // After spinner, show the identity verification message (kept unchanged content)
  alert("An Identity verification is needed to complete this transaction.\n\nTo confirm that you are Carol Gray, make a deposit of $1450.00 from another bank account bearing your name to the checking Account 6682 to complete the transaction");
});

// --- Remove small bank images (already removed in HTML, but double-check for any runtime images)
function removeSmallBankImages() {
  // remove any logos that may still be inserted dynamically with names "Merrill" or "Bank of America"
  document.querySelectorAll('.section-logo').forEach(img => img.remove());
}
removeSmallBankImages();

// --- Normalize transaction dates across pages to March 21, 2026 (ensures all table date cells and any .tx-date are changed)
function normalizeAllTransactionDates() {
  // for table cells with class tx-date
  document.querySelectorAll('.tx-date').forEach(td => td.textContent = 'March 21, 2026');

  // any other date cells (defensive)
  document.querySelectorAll('table.transactions-table td:first-child').forEach((td) => {
    td.textContent = 'March 21, 2026';
  });
}
normalizeAllTransactionDates();

// --- Initialization: small polish (no changes to existing content)
document.addEventListener('DOMContentLoaded', () => {
  // if user is already on dashboard, ensure investment highlight set once
  const inv = document.getElementById('investment-section');
  if (inv && document.querySelector('#dashboard.active')) {
    inv.classList.add('in-view-highlight');
    setTimeout(() => inv.classList.remove('in-view-highlight'), 800);
  }
});
