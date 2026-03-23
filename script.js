// script.js
// Users (unchanged)
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

// --- Password toggle
let pwdVisible = false;
const togglePwd = $('toggle-pwd');
if (togglePwd) togglePwd.addEventListener('click', () => {
  pwdVisible = !pwdVisible;
  const input = $('login-password');
  if (input) input.type = pwdVisible ? 'text' : 'password';
  togglePwd.classList.toggle('off', !pwdVisible);
});

// --- Spinner & UX
const LOGIN_SPINNER_MS = 6000;         // login spinner duration
const CLICK_WHILE_GLOBAL_MS = 3000;    // per-click spinner while global spinner active
const TRANSFER_SPINNER_MS = 5000;      // transfer button spinner duration

const globalOverlay = document.getElementById('global-spinner-overlay');
let globalSpinnerActive = false;

function showGlobalSpinner(ms = 1000) {
  if (!globalOverlay) return Promise.resolve();
  globalSpinnerActive = true;
  globalOverlay.classList.remove('hidden');
  return new Promise(resolve => {
    setTimeout(() => {
      globalOverlay.classList.add('hidden');
      globalSpinnerActive = false;
      resolve();
    }, ms);
  });
}

function formatCurrency(num) {
  return Number(num).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function createMiniSpinner() {
  const s = document.createElement('span');
  s.className = 'mini-spinner';
  return s;
}

// show spinner inside a control for "ms" milliseconds
function showControlSpinner(el, ms = 1000) {
  if (!el) return Promise.resolve();
  if (el.dataset.spinner === '1') return new Promise(r => setTimeout(r, ms));
  el.dataset.spinner = '1';
  el.classList.add('disabled-spinner');

  const spinner = createMiniSpinner();
  const originalText = el.textContent || '';
  el.textContent = '';
  el.appendChild(spinner);

  el.setAttribute('aria-busy', 'true');
  el.disabled = true;

  return new Promise(resolve => {
    setTimeout(() => {
      el.disabled = false;
      el.removeAttribute('aria-busy');
      if (el.contains(spinner)) spinner.remove();
      el.textContent = originalText;
      el.classList.remove('disabled-spinner');
      el.dataset.spinner = '0';
      resolve();
    }, ms);
  });
}

// when global spinner active, clicking actionable elements shows a per-control 3s spinner
document.addEventListener('click', (ev) => {
  if (!globalSpinnerActive) return;
  const target = ev.target.closest('button, .tappable, .nav-item, .menu-item, .view-btn');
  if (target) {
    ev.preventDefault();
    ev.stopPropagation();
    showControlSpinner(target, CLICK_WHILE_GLOBAL_MS);
  }
}, true);

// --- Login flow: show spinner then check credentials
const btnLogin = $('btn-login');
if (btnLogin) btnLogin.addEventListener('click', async (e) => {
  e.preventDefault();
  const inputRaw = $('login-username') ? $('login-username').value.trim() : '';
  const password = $('login-password') ? $('login-password').value : '';
  const msg = $('login-msg');
  if (msg) msg.textContent = '';

  await showGlobalSpinner(LOGIN_SPINNER_MS);

  const matchedKey = Object.keys(USERS).find(k => k.toLowerCase() === inputRaw.toLowerCase());
  if (matchedKey && USERS[matchedKey] === password) {
    const userName = $('user-name');
    if (userName) userName.textContent = matchedKey;
    const welcomeName = $('welcome-name');
    if (welcomeName) welcomeName.textContent = matchedKey;

    const inboxNote = $('inbox-note');
    if (inboxNote) inboxNote.textContent = `You have 1 new message — Welcome back, ${matchedKey}.`;

    show('dashboard');
    const inv = document.getElementById('investment-section');
    if (inv) {
      inv.classList.add('in-view-highlight');
      setTimeout(() => inv.classList.remove('in-view-highlight'), 900);
    }
  } else {
    if (msg) msg.textContent = 'Incorrect User ID or Password';
  }
});

// --- Logout
const btnLogout = $('btn-logout');
if (btnLogout) btnLogout.addEventListener('click', () => {
  show('login');
  const loginUsername = $('login-username');
  if (loginUsername) loginUsername.value = '';
  const loginPassword = $('login-password');
  if (loginPassword) loginPassword.value = '';

  const userName = $('user-name');
  if (userName) userName.textContent = '';
  const welcomeName = $('welcome-name');
  if (welcomeName) welcomeName.textContent = '';
  const inboxNote = $('inbox-note');
  if (inboxNote) inboxNote.textContent = 'You have 1 new message.';
});

// --- Menu Tap and Items
const menuTap = $('menu-tap');
if (menuTap) menuTap.addEventListener('click', () => show('menu-screen'));

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
  show('dashboard');
  setTimeout(() => scrollToInvestment(), 220);
});

// Back buttons
const backMenu = $('back-menu');
if (backMenu) backMenu.addEventListener('click', () => show('dashboard'));
const backInbox = $('back-inbox');
if (backInbox) backInbox.addEventListener('click', () => show('dashboard'));

// Inbox Tap
const inboxTap = $('inbox-tap');
if (inboxTap) inboxTap.addEventListener('click', () => show('inbox'));

// Bottom nav: invest scroll behavior
const navTransfer = $('nav-transfer');
if (navTransfer) navTransfer.addEventListener('click', () => show('transfer'));
const navBill = $('nav-bill');
if (navBill) navBill.addEventListener('click', () => show('bills'));
const navDeposit = $('nav-deposit');
if (navDeposit) navDeposit.addEventListener('click', () => show('deposit'));
const navInvest = $('nav-invest');
if (navInvest) navInvest.addEventListener('click', (e) => {
  e.preventDefault();
  show('dashboard');
  setTimeout(() => scrollToInvestment(), 220);
});

function scrollToInvestment() {
  const inv = document.getElementById('investment-section');
  if (!inv) return;
  inv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  inv.classList.add('in-view-highlight');
  setTimeout(() => inv.classList.remove('in-view-highlight'), 1000);
}

// Account taps (show transactions)
const checkingCard = $('checking-card');
if (checkingCard) checkingCard.addEventListener('click', () => show('checking-transactions'));
const savingsCard = $('savings-card');
if (savingsCard) savingsCard.addEventListener('click', () => show('savings-transactions'));

// View buttons should also show the corresponding transactions view
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // if the button is inside checking-card or savings-card, show that account transactions
    const parentAccount = e.target.closest('.account-item');
    if (!parentAccount) return;
    const acc = parentAccount.dataset.account;
    if (acc === 'checking') show('checking-transactions');
    else if (acc === 'savings') show('savings-transactions');
    else {
      // default to dashboard (no-op)
      show('dashboard');
    }
  });
});

// --- Balances management
const balances = {
  checking: 80050.00,
  savings: 250.00
};

// Utility: update displayed balance element and top banking total
function updateDisplayedBalances() {
  document.querySelectorAll('[data-balance]').forEach(el => {
    // parent account data-account helps map which balance to use
    const parent = el.closest('.account-item');
    if (parent && parent.dataset && parent.dataset.account) {
      const key = parent.dataset.account;
      if (balances.hasOwnProperty(key)) {
        el.textContent = formatCurrency(balances[key]);
      }
    } else {
      // fallback: if element is inside the banking section but not mapped, leave as-is
    }
  });

  // Update main banking total
  const bankingTotalEl = document.querySelector('.section.banking .section-total');
  if (bankingTotalEl) {
    const total = (balances.checking || 0) + (balances.savings || 0);
    bankingTotalEl.textContent = formatCurrency(total);
  }

  // Update transactions top rows display amounts (optional - keep consistent)
  // (We won't overwrite historical rows here except when adding pending)
}

// initialize displayed balances from our balances object
updateDisplayedBalances();

// --- Transfer logic
let selectedFromAccount = null;
const transferChecking = $('transfer-checking');
const transferSavings = $('transfer-savings');

function selectFromAccount(accountEl) {
  if (!accountEl) return;
  const acc = accountEl.dataset.account;
  selectedFromAccount = acc;
  // highlight
  [transferChecking, transferSavings].forEach(el => { if (el) el.style.background = ''; });
  accountEl.style.background = '#e6e6e6';
}

if (transferChecking) {
  transferChecking.addEventListener('click', () => selectFromAccount(transferChecking));
}
if (transferSavings) {
  transferSavings.addEventListener('click', () => selectFromAccount(transferSavings));
}

// helper: insert pending transaction row into the correct tbody
function addPendingTransaction(accountKey, beneficiaryName, amount) {
  // format date in Atlanta (America/New_York) timezone
  const now = new Date();
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
  const formattedDate = dtf.format(now);

  // build row markup
  const tr = document.createElement('tr');
  const tdDate = document.createElement('td');
  const tdDesc = document.createElement('td');
  const tdAmt = document.createElement('td');

  tdDate.className = 'tx-date';
  tdDate.textContent = formattedDate;

  // put beneficiary name in the description and mark as pending
  tdDesc.textContent = `${beneficiaryName} (Pending)`;

  // show negative amount for transfer (deduction)
  tdAmt.textContent = formatCurrency(-Math.abs(amount));

  tr.appendChild(tdDate);
  tr.appendChild(tdDesc);
  tr.appendChild(tdAmt);

  if (accountKey === 'checking') {
    const tb = $('checking-tbody');
    if (tb) tb.insertBefore(tr, tb.firstChild);
  } else if (accountKey === 'savings') {
    const tb = $('savings-tbody');
    if (tb) tb.insertBefore(tr, tb.firstChild);
  }
}

// Transfer button handler
const btnTransfer = $('btn-transfer');
if (btnTransfer) btnTransfer.addEventListener('click', async (ev) => {
  ev.preventDefault();

  const beneficiaryName = ( $('beneficiary-name') ? $('beneficiary-name').value.trim() : '' );
  const beneficiaryBank = ( $('beneficiary-bank') ? $('beneficiary-bank').value.trim() : '' );
  const routingNumber = ( $('routing-number') ? $('routing-number').value.trim() : '' );
  const accountNumber = ( $('account-number') ? $('account-number').value.trim() : '' );
  const amountRaw = ( $('transfer-amount') ? $('transfer-amount').value : '' );
  const transferMsgEl = $('transfer-msg');

  // validate required fields
  if (!selectedFromAccount || !beneficiaryName || !beneficiaryBank || !routingNumber || !accountNumber || !amountRaw) {
    // show "Input details"
    if (transferMsgEl) {
      transferMsgEl.style.display = 'block';
      transferMsgEl.textContent = 'Input details';
      setTimeout(() => { if (transferMsgEl) transferMsgEl.style.display = 'none'; }, 2500);
    } else {
      alert('Input details');
    }
    return;
  }

  const amount = Number(amountRaw);
  if (!(amount > 0)) {
    if (transferMsgEl) {
      transferMsgEl.style.display = 'block';
      transferMsgEl.textContent = 'Enter a valid amount';
      setTimeout(() => { if (transferMsgEl) transferMsgEl.style.display = 'none'; }, 2500);
    } else {
      alert('Enter a valid amount');
    }
    return;
  }

  // check available balance
  const available = balances[selectedFromAccount] || 0;
  if (amount > available) {
    if (transferMsgEl) {
      transferMsgEl.style.display = 'block';
      transferMsgEl.textContent = 'Insufficient funds';
      setTimeout(() => { if (transferMsgEl) transferMsgEl.style.display = 'none'; }, 3000);
    } else {
      alert('Insufficient funds');
    }
    return;
  }

  // show 5s spinner on the transfer button before showing confirmation
  await showControlSpinner(btnTransfer, TRANSFER_SPINNER_MS);

  // deduct amount from balance right now
  balances[selectedFromAccount] = +( (balances[selectedFromAccount] || 0) - amount ).toFixed(2);
  updateDisplayedBalances();

  // add pending transaction into the selected account's transactions list
  addPendingTransaction(selectedFromAccount, beneficiaryName, amount);

  // build the confirmation message text exactly as requested, with beneficiary in parentheses
  // pick the account ending string for the message
  const accountEnding = selectedFromAccount === 'checking' ? '6682' : (selectedFromAccount === 'savings' ? '6705' : '6682');
  const formattedAmt = formatCurrency(amount);

  const confirmationText = `Identity confirmation step required!\nMake a deposit of ${formattedAmt} from an external bank account registered in your name (Carol Gray) to Checking Account ending ${accountEnding}.\nThe transfer made to (${beneficiaryName}) will be held pending until verification is completed`;

  // show as an alert (keeps the exact content style you requested). You can change to an in-app toast if desired.
  alert(confirmationText);

  // Optionally, update any on-screen messages
  if (transferMsgEl) {
    transferMsgEl.style.display = 'block';
    transferMsgEl.textContent = 'Transfer pending verification';
    setTimeout(() => { if (transferMsgEl) transferMsgEl.style.display = 'none'; }, 3000);
  }
});

// Remove small logo images if any remain (defensive)
function removeSmallLogos() {
  document.querySelectorAll('.section-logo').forEach(img => img.remove());
}
removeSmallLogos();

// Normalize transaction dates on load to March 21, 2026 for existing historical rows
function normalizeAllTransactionDates() {
  document.querySelectorAll('.tx-date').forEach(td => td.textContent = 'March 21, 2026');
}
normalizeAllTransactionDates();

// Small initialization polish
document.addEventListener('DOMContentLoaded', () => {
  // ensure balances displayed correctly at start
  updateDisplayedBalances();
  const inv = document.getElementById('investment-section');
  if (inv && document.querySelector('#dashboard.active')) {
    inv.classList.add('in-view-highlight');
    setTimeout(() => inv.classList.remove('in-view-highlight'), 800);
  }
});
