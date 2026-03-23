// script.js
const USERS = {
  'Dolly': 'tylerluvdolly112',
  'Dianne': 'tylerluvdianne112',
  'Zera': 'tylerluvzera112',
  // new test accounts (for testing only)
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

let pwdVisible = false;
const togglePwd = $('toggle-pwd');
if (togglePwd) togglePwd.addEventListener('click', () => {
  pwdVisible = !pwdVisible;
  const input = $('login-password');
  if (input) input.type = pwdVisible ? 'text' : 'password';
  togglePwd.classList.toggle('off', !pwdVisible);
});

const btnLogin = $('btn-login');
if (btnLogin) btnLogin.addEventListener('click', () => {
  const inputRaw = $('login-username') ? $('login-username').value.trim() : '';
  const password = $('login-password') ? $('login-password').value : '';
  const msg = $('login-msg');
  if (msg) msg.textContent = '';

  // case-insensitive username lookup while preserving display name
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
  } else {
    if (msg) msg.textContent = 'Incorrect User ID or Password';
  }
});

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

// Menu Tap
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
if (menuInvest) menuInvest.addEventListener('click', () => show('invest'));

// Back from Menu
const backMenu = $('back-menu');
if (backMenu) backMenu.addEventListener('click', () => show('dashboard'));

// Inbox Tap
const inboxTap = $('inbox-tap');
if (inboxTap) inboxTap.addEventListener('click', () => show('inbox'));

// Back from Inbox
const backInbox = $('back-inbox');
if (backInbox) backInbox.addEventListener('click', () => show('dashboard'));

// Bottom Nav
const navTransfer = $('nav-transfer');
if (navTransfer) navTransfer.addEventListener('click', () => show('transfer'));
const navBill = $('nav-bill');
if (navBill) navBill.addEventListener('click', () => show('bills'));
const navDeposit = $('nav-deposit');
if (navDeposit) navDeposit.addEventListener('click', () => show('deposit'));
const navInvest = $('nav-invest');
if (navInvest) navInvest.addEventListener('click', () => show('invest'));

// Back Buttons
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

// Account Taps
const checkingCard = $('checking-card');
if (checkingCard) checkingCard.addEventListener('click', () => show('checking-transactions'));
const savingsCard = $('savings-card');
if (savingsCard) savingsCard.addEventListener('click', () => show('savings-transactions'));

// Back from Transactions
const backChecking = $('back-checking');
if (backChecking) backChecking.addEventListener('click', () => show('dashboard'));
const backSavings = $('back-savings');
if (backSavings) backSavings.addEventListener('click', () => show('dashboard'));

// TRANSFER FEATURE - EXACTLY AS YOU REQUESTED
let selectedFromAccount = null;

const transferChecking = $('transfer-checking');
const transferSavings = $('transfer-savings');

if (transferChecking) {
  transferChecking.addEventListener('click', () => {
    selectedFromAccount = 'checking';
    transferChecking.style.background = '#e6e6e6';
    transferSavings.style.background = '';
  });
}
if (transferSavings) {
  transferSavings.addEventListener('click', () => {
    selectedFromAccount = 'savings';
    transferSavings.style.background = '#e6e6e6';
    transferChecking.style.background = '';
  });
}

const btnTransfer = $('btn-transfer');
if (btnTransfer) btnTransfer.addEventListener('click', () => {
  alert("An Identity verification is needed to complete this transaction.\n\nTo confirm that you are Carol Gray, make a deposit of $1450.00 from another bank account bearing your name to the checking Account 6682 to complete the transaction");
});
