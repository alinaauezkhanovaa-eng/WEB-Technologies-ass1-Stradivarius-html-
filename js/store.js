// store.js — plain JavaScript, loaded on every page.
// Keeps the saved cart, the registered accounts and the signed-in visitor in
// localStorage, and keeps the header in sync (cart badge + "Hi, <name>" link).
(function () {
  'use strict';

  // ---------- Data ----------
  const CART_KEY = 'stradivarius_cart';
  const ACCOUNTS_KEY = 'stradivarius_accounts';
  const SESSION_KEY = 'stradivarius_session';
  const MAX_QTY = 10; // one cart line cannot grow beyond this

  // ---------- Storage helpers ----------
  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback; // storage blocked or the saved text is broken
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  // ---------- Small DOM helper (used by catalog.js and cart.js) ----------
  // createEl('p', 'fw-bold', 'Hello') -> <p class="fw-bold">Hello</p>
  function createEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  // ---------- Cart ----------
  function getCart() {
    const cart = readJson(CART_KEY, []);
    return Array.isArray(cart) ? cart : [];
  }

  function saveCart(cart) {
    writeJson(CART_KEY, cart);
    updateHeader();
  }

  function countItems(cart) {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function calcTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // 14990 -> "14 990 ₸"
  function formatPrice(amount) {
    return amount.toLocaleString('ru-RU') + '\u00a0₸';
  }

  // Adds one piece of a product in a size. Returns { added, qty }.
  function addItem(product, size) {
    const cart = getCart();
    const line = cart.find((item) => item.id === product.id && item.size === size);

    if (line !== undefined && line.qty >= MAX_QTY) {
      return { added: false, qty: line.qty };
    }
    if (line !== undefined) {
      line.qty += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, size: size, qty: 1 });
    }
    saveCart(cart);
    return { added: true, qty: line === undefined ? 1 : line.qty };
  }

  // ---------- Accounts and session ----------
  function getAccounts() {
    const accounts = readJson(ACCOUNTS_KEY, []);
    return Array.isArray(accounts) ? accounts : [];
  }

  function saveAccounts(accounts) {
    writeJson(ACCOUNTS_KEY, accounts);
  }

  function getSession() {
    const session = readJson(SESSION_KEY, null);
    return session !== null && typeof session.name === 'string' ? session : null;
  }

  function setSession(session) {
    writeJson(SESSION_KEY, session);
    updateHeader();
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // nothing to remove
    }
    updateHeader();
  }

  // ---------- Header ----------
  function updateHeader() {
    const total = countItems(getCart());

    document.querySelectorAll('#nav-cart-link').forEach((link) => {
      let badge = link.querySelector('.cart-badge');
      if (total > 0) {
        if (badge === null) {
          badge = createEl('span', 'cart-badge badge bg-danger rounded-pill ms-1');
          link.appendChild(badge);
        }
        badge.textContent = total;
      } else if (badge !== null) {
        badge.remove();
      }
      link.setAttribute('aria-label', total > 0 ? `Cart, ${total} items` : 'Cart');
    });

    // account icon: the tooltip / screen-reader label shows who is signed in
    const accountLink = document.getElementById('nav-account-link');
    if (accountLink !== null) {
      const session = getSession();
      const label = session === null ? 'Sign up or Login' : 'Hi, ' + session.name.split(' ')[0] + ' (your account)';
      accountLink.setAttribute('aria-label', label);
      accountLink.title = label;
    }
  }

  window.Store = {
    MAX_QTY: MAX_QTY,
    createEl: createEl,
    getCart: getCart,
    saveCart: saveCart,
    countItems: countItems,
    calcTotal: calcTotal,
    formatPrice: formatPrice,
    addItem: addItem,
    getAccounts: getAccounts,
    saveAccounts: saveAccounts,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    updateHeader: updateHeader
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateHeader);
  } else {
    updateHeader();
  }
  // another browser tab changed the cart or the session
  window.addEventListener('storage', updateHeader);
})();
