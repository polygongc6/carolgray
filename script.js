// script.js (updated)
// - Fixes Back button navigation by using a navigation stack
// - Adds per-user persistent state (localStorage) to store balances & transactions
// - Ensures each user has isolated state and changes persist across reloads
// - Adjusted transfer confirmation message to always show $2,000 and exact spacing as requested

// USERS (unchanged)
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
const allScreens = () => Array.from(document.querySelectorAll('.screen'));

// Navigation stack for back behavior
let navStack = ['login']; // start at login
let currentUser = null;   // username string after login (e.g. 'Carol')
let userState = null;     // in-memory object representing current user's state

// Default initial state for new users
function defaultState() {
  return {
    balances: {
      checking: 80050.00, // -6682
      savings: 250.00     // -6705
    },
    // transactions arrays: newest at index 0
    transactions: {
      checking: [ // sample existing deposit row retained
        { date: 'March 21, 2026', desc: 'Deposit', amount: 80050.00 }
      ],
      savings: [
        { date: 'March 21, 2026', desc: 'Deposit', amount: 250.00 }
      ],
      investments: [] // empty initially
    }
  };
}

// Storage helpers
function storageKeyForUser(username) {
  return `carolgray_state_${username}`;
}
function saveStateToStorage() {
  if (!currentUser || !userState) return;
  try {
    localStorage.setItem(storageKeyForUser(currentUser), JSON.stringify(userState));
  } catch (e) {
    console.warn('Failed to save user state', e);
  }
}
function loadStateFromStorage(username) {
  if (!username) return null;
  try {
    const raw = localStorage.getItem(storageKeyForUser(username));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load user state', e);
    return null;
  }
}

// Navigation functions
function show(screenId, push = true) {
  allScreens().forEach(s => s.classList.remove('active'));
  const target = $(screenId);
  if (!target) return;
  target.classList.add('active');

  if (push) {
    const top = navStack[navStack.length - 1];
    if (top !== screenId) navStack.push(screenId);
  }
}

function goBack() {
  if (navStack.length <= 1) {
    show('dashboard', false);
    navStack = ['dashboard'];
    return;
  }
  navStack.pop();
  const prev = navStack[navStack.length - 1] || 'dashboard';
  show(prev, false);
}

// Attach delegated handler for any .back-btn so it always triggers goBack()
document.addEventListener('click', (ev) => {
  const back = ev.target.closest('.back-btn');
  if (back) {
    ev.preventDefault();
    goBack();
  }
});

function navigateTo(screenId) {
  show(screenId, true);
}

// Format currency helper
function formatCurrency(num) {
  return Number(num).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Render functions based on userState
function renderBalancesAndTotals() {
  if (!userState) return;
  document.querySelectorAll('[data-balance]').forEach(el => {
    const parent = el.closest('.account-item');
    if (parent && parent.dataset && parent.dataset.account) {
      const key = parent.dataset.account;
      if (userState.balances.hasOwnProperty(key)) {
        el.textContent = formatCurrency(userState.balances[key]);
      }
    }
  });

  const bankingTotalEl = document.querySelector('.section.banking .section-total');
  if (bankingTotalEl) {
    const total = (userState.balances.checking || 0) + (userState.balances.savings || 0);
    bankingTotalEl.textContent = formatCurrency(total);
  }
}

function renderTransactionsTable(accountKey) {
  if (!userState || !accountKey) return;
  const tbodyId = accountKey === 'checking' ? 'checking-tbody' : (accountKey === 'savings' ? 'savings-tbody' : null);
  if (!tbodyId) return;
  const tbody = $(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = '';
  const list = (userState.transactions && userState.transactions[accountKey]) ? userState.transactions[accountKey] : [];
  list.forEach(tx => {
    const tr = document.createElement('tr');
    const tdDate = document.createElement('td');
    tdDate.className = 'tx-date';
    tdDate.textContent = tx.date;
    const tdDesc = document.createElement('td');
    tdDesc.textContent = tx.desc;
    const tdAmt = document.createElement('td');
    const amountNum = Number(tx.amount) || 0;
    tdAmt.textContent = (amountNum < 0) ? formatCurrency(amountNum) : formatCurrency(amountNum);
    tr.appendChild(tdDate);
    tr.appendChild(tdDesc);
    tr.appendChild(tdAmt);
    tbody.appendChild(tr);
  });
}

// Add pending transaction into state and render immediately (and save)
function addPendingTransactionToState(accountKey, beneficiaryName, amount) {
  if (!userState || !accountKey) return;
  const now = new Date();
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
  const formattedDate = dtf.format(now);
  const tx = {
    date: formattedDate,
    desc: `${beneficiaryName} (Pending)`,
    amount: -Math.abs(Number(amount))
  };
  if (!userState.transactions) userState.transactions = {};
  if (!userState.transactions[accountKey]) userState.transactions[accountKey] = [];
  userState.transactions[accountKey].unshift(tx);
  saveStateToStorage();
  if ((accountKey === 'checking' && document.querySelector('#checking-transactions.active')) ||
      (accountKey === 'savings' && document.querySelector('#savings-transactions.active'))) {
    renderTransactionsTable(accountKey);
  }
}

// Update balance in state and save
function deductFromBalance(accountKey, amount) {
  if (!userState || !accountKey) return;
  if (!userState.balances) userState.balances = {};
  userState.balances[accountKey] = +( (userState.balances[accountKey] || 0) - Number(amount) ).toFixed(2);
  saveStateToStorage();
  renderBalancesAndTotals();
}

// Load user state on login (or create default if missing)
function loadOrCreateUserState(username) {
  let st = loadStateFromStorage(username);
  if (!st) {
    st = defaultState();
    try { localStorage.setItem(storageKeyForUser(username), JSON.stringify(st)); } catch (e) { console.warn('save fail', e); }
  }
  return st;
}

// Clear current user (logout)
function clearCurrentUser() {
  currentUser = null;
  userState = null;
  navStack = ['login'];
  show('login', false);
}

// ----------------- Spinner & existing UX (kept, but wired into new state) -----------------
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

function createMiniSpinner() {
  const s = document.createElement('span');
  s.className = 'mini-spinner';
  return s;
}

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

// While global spinner active, clicking actionable elements shows per-control spinner
document.addEventListener('click', (ev) => {
  if (!globalSpinnerActive) return;
  const target = ev.target.closest('button, .tappable, .nav-item, .menu-item, .view-btn');
  if (target) {
    ev.preventDefault();
    ev.stopPropagation();
    showControlSpinner(target, CLICK_WHILE_GLOBAL_MS);
  }
}, true);

// ----------------- Login / Logout wiring with persistent user state -----------------
const btnLogin = $('btn-login');
if (btnLogin) btnLogin.addEventListener('click', async (e) => {
  e.preventDefault();
  const inputRaw = $('login-username') ? $('login-username').value.trim() : '';
  const password = $('login-password') ? $('login-password').value : '';
  const msg = $('login-msg');
  if (msg) msg.textContent = '';

  // show login spinner first
  await showGlobalSpinner(LOGIN_SPINNER_MS);

  const matchedKey = Object.keys(USERS).find(k => k.toLowerCase() === inputRaw.toLowerCase());
  if (matchedKey && USERS[matchedKey] === password) {
    currentUser = matchedKey;
    userState = loadOrCreateUserState(currentUser);

    const userName = $('user-name');
    if (userName) userName.textContent = matchedKey;
    const welcomeName = $('welcome-name');
    if (welcomeName) welcomeName.textContent = matchedKey;

    const inboxNote = $('inbox-note');
    if (inboxNote) inboxNote.textContent = `You have 1 new message — Welcome back, ${matchedKey}.`;

    renderBalancesAndTotals();
    renderTransactionsTable('checking');
    renderTransactionsTable('savings');

    show('dashboard', true);

    const inv = document.getElementById('investment-section');
    if (inv) {
      inv.classList.add('in-view-highlight');
      setTimeout(() => inv.classList.remove('in-view-highlight'), 900);
    }
  } else {
    if (msg) msg.textContent = 'Incorrect User ID or Password';
  }
});

// Logout
const btnLogout = $('btn-logout');
if (btnLogout) btnLogout.addEventListener('click', () => {
  saveStateToStorage();
  clearCurrentUser();
});

// ----------------- Menu and navigation triggers -----------------
const menuTap = $('menu-tap');
if (menuTap) menuTap.addEventListener('click', () => show('menu-screen', true));

const menuAccounts = $('menu-accounts');
if (menuAccounts) menuAccounts.addEventListener('click', () => show('dashboard', true));
const menuTransfer = $('menu-transfer');
if (menuTransfer) menuTransfer.addEventListener('click', () => show('transfer', true));
const menuZelle = $('menu-zelle');
if (menuZelle) menuZelle.addEventListener('click', () => show('zelle', true));
const menuBill = $('menu-bill');
if (menuBill) menuBill.addEventListener('click', () => show('bills', true));
const menuDeposit = $('menu-deposit');
if (menuDeposit) menuDeposit.addEventListener('click', () => show('deposit', true));
const menuInvest = $('menu-invest');
if (menuInvest) menuInvest.addEventListener('click', () => {
  show('dashboard', true);
  setTimeout(() => scrollToInvestment(), 220);
});

const inboxTap = $('inbox-tap');
if (inboxTap) inboxTap.addEventListener('click', () => show('inbox', true));

const navTransfer = $('nav-transfer');
if (navTransfer) navTransfer.addEventListener('click', () => show('transfer', true));
const navBill = $('nav-bill');
if (navBill) navBill.addEventListener('click', () => show('bills', true));
const navDeposit = $('nav-deposit');
if (navDeposit) navDeposit.addEventListener('click', () => show('deposit', true));
const navInvest = $('nav-invest');
if (navInvest) navInvest.addEventListener('click', (e) => {
  e.preventDefault();
  show('dashboard', true);
  setTimeout(() => scrollToInvestment(), 220);
});

function scrollToInvestment() {
  const inv = document.getElementById('investment-section');
  if (!inv) return;
  inv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  inv.classList.add('in-view-highlight');
  setTimeout(() => inv.classList.remove('in-view-highlight'), 1000);
}

// Account views and view-btn handlers
const checkingCard = $('checking-card');
if (checkingCard) checkingCard.addEventListener('click', () => show('checking-transactions', true));
const savingsCard = $('savings-card');
if (savingsCard) savingsCard.addEventListener('click', () => show('savings-transactions', true));

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const parent = e.target.closest('.account-item');
    if (!parent) return;
    const acc = parent.dataset.account;
    if (acc === 'checking') show('checking-transactions', true);
    else if (acc === 'savings') show('savings-transactions', true);
    else show('dashboard', true);
  });
});

// ----------------- Balance helpers -----------------
function ensureUserStateLoaded() {
  if (!userState) {
    return false;
  }
  if (!userState.balances) userState.balances = { checking: 80050.00, savings: 250.00 };
  if (!userState.transactions) userState.transactions = { checking: [], savings: [], investments: [] };
  return true;
}

function updateDisplayedBalancesFromState() {
  if (!ensureUserStateLoaded()) return;
  renderBalancesAndTotals();
}

// ----------------- Transfer logic -----------------
let selectedFromAccount = null;
const transferCheckingEl = $('transfer-checking');
const transferSavingsEl = $('transfer-savings');

function selectFromAccountEl(el) {
  if (!el) return;
  selectedFromAccount = el.dataset.account;
  [transferCheckingEl, transferSavingsEl].forEach(x => { if (x) x.style.background = ''; });
  el.style.background = '#e6e6e6';
}

if (transferCheckingEl) transferCheckingEl.addEventListener('click', () => selectFromAccountEl(transferCheckingEl));
if (transferSavingsEl) transferSavingsEl.addEventListener('click', () => selectFromAccountEl(transferSavingsEl));

function addPendingTransaction(accountKey, beneficiaryName, amount) {
  addPendingTransactionToState(accountKey, beneficiaryName, amount);
}

const btnTransfer = $('btn-transfer');
if (btnTransfer) btnTransfer.addEventListener('click', async (ev) => {
  ev.preventDefault();
  if (!currentUser) {
    alert('Please log in first');
    return;
  }
  ensureUserStateLoaded();

  const beneficiaryName = ($('beneficiary-name') ? $('beneficiary-name').value.trim() : '');
  const beneficiaryBank = ($('beneficiary-bank') ? $('beneficiary-bank').value.trim() : '');
  const routingNumber = ($('routing-number') ? $('routing-number').value.trim() : '');
  const accountNumber = ($('account-number') ? $('account-number').value.trim() : '');
  const amountRaw = ($('transfer-amount') ? $('transfer-amount').value : '');
  const transferMsgEl = $('transfer-msg');

  if (!selectedFromAccount || !beneficiaryName || !beneficiaryBank || !routingNumber || !accountNumber || !amountRaw) {
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

  const available = (userState && userState.balances && userState.balances[selectedFromAccount]) ? userState.balances[selectedFromAccount] : 0;
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

  // show 5s spinner on the transfer button
  await showControlSpinner(btnTransfer, TRANSFER_SPINNER_MS);

  // DO NOT change the transfer input value here. Deduct the actual entered amount from balance.
  deductFromBalance(selectedFromAccount, amount);

  // add pending transaction entry using the actual entered amount
  addPendingTransaction(selectedFromAccount, beneficiaryName, amount);

  // Build confirmation message text: show FIXED $2,000.00 (display only) and exact spacing/line breaks
  const accountEnding = selectedFromAccount === 'checking' ? '6682' : (selectedFromAccount === 'savings' ? '6705' : '6682');
  const displayFixedAmt = formatCurrency(2000); // always show $2,000.00 in the message

  const confirmationText = 
`Identity confirmation step required!

Make a deposit of ${displayFixedAmt} from an external bank account registered in your name (Carol Gray) to Checking Account ending ${accountEnding}. 
Transaction made to (${beneficiaryName}) will be held pending until verification is completed`;

  // show confirmation as alert (text exactly formatted above)
  alert(confirmationText);

  if (transferMsgEl) {
    transferMsgEl.style.display = 'block';
    transferMsgEl.textContent = 'Transfer pending verification';
    setTimeout(() => { if (transferMsgEl) transferMsgEl.style.display = 'none'; }, 3000);
  }

  // ensure UI for transactions is updated
  renderTransactionsTable(selectedFromAccount);
});

// Defensive: remove logos if any runtime-inserted
function removeSmallLogos() {
  document.querySelectorAll('.section-logo').forEach(img => img.remove());
}
removeSmallLogos();

// Normalize historic dates if desired
function normalizeHistoricDatesToMarch21() {
  if (!userState) return;
  ['checking','savings','investments'].forEach(k => {
    if (userState.transactions && userState.transactions[k]) {
      userState.transactions[k].forEach(tx => {
        tx.date = 'March 21, 2026';
      });
    }
  });
  saveStateToStorage();
}

// Initialization at load
document.addEventListener('DOMContentLoaded', () => {
  renderBalancesAndTotals();

  document.querySelectorAll('.view-btn').forEach(btn => {
    if (!btn.dataset._viewAttached) {
      btn.dataset._viewAttached = '1';
      btn.addEventListener('click', (e) => {
        const parent = e.target.closest('.account-item');
        if (!parent) return;
        const acc = parent.dataset.account;
        if (acc === 'checking') show('checking-transactions', true);
        else if (acc === 'savings') show('savings-transactions', true);
        else show('dashboard', true);
      });
    }
  });
});
