'use strict';
const HIDDEN_CLASS = 'hidden';  
const EAGER_IMAGES = 3;        
const SIZES = {
  clothing: ['XS', 'S', 'M', 'L', 'XL'],
  footwear: ['36', '37', '38', '39', '40', '41']
};

const CATEGORIES = [
  { id: 'top', label: 'Top', sizes: SIZES.clothing },
  { id: 'bottom', label: 'Bottom', sizes: SIZES.clothing },
  { id: 'outerwear', label: 'Outerwear', sizes: SIZES.clothing },
  { id: 'footwear', label: 'Footwear', sizes: SIZES.footwear }
];

const PRODUCTS = [
  { id: 'top-1', category: 'top', name: 'Plaid shirt', price: 14990, image: 'images/клетка_рубашка.jpg' },
  { id: 'top-2', category: 'top', name: 'Striped top', price: 11990, image: 'images/линии_кофта.jpg' },
  { id: 'top-3', category: 'top', name: 'Striped long-sleeve', price: 9990, image: 'images/полоска_лонг.jpg' },
  { id: 'bottom-1', category: 'bottom', name: 'Capris', price: 17990, image: 'images/капри.jpg' },
  { id: 'bottom-2', category: 'bottom', name: 'Grey trousers', price: 19990, image: 'images/серые_штаны.jpg' },
  { id: 'bottom-3', category: 'bottom', name: 'Checked trousers', price: 15990, image: 'images/клетчактые.jpg' },
  { id: 'outerwear-1', category: 'outerwear', name: 'White coat', price: 14990, image: 'images/белое_пальто.jpg' },
  { id: 'outerwear-2', category: 'outerwear', name: 'Leather jacket', price: 11990, image: 'images/кожанка.jpg' },
  { id: 'outerwear-3', category: 'outerwear', name: 'Yellow trench coat', price: 29990, image: 'images/тренч_желтый.jpg' },
  { id: 'footwear-1', category: 'footwear', name: 'Sneakers', price: 32990, image: 'images/сникерсы.jpg' },
  { id: 'footwear-2', category: 'footwear', name: 'Burgundy heels', price: 24990, image: 'images/бордо_каблук.jpg' },
  { id: 'footwear-3', category: 'footwear', name: 'Sneakerinas', price: 22990, image: 'images/корич_балетки.jpg' }
];

const PRICE_LIMITS = [
  { value: 0, label: 'Any price' },       
  { value: 15000, label: 'Up to 15000' },
  { value: 25000, label: 'Up to 25000' }
];

const SORT_MODES = [
  { value: 'default', label: 'Default order' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' }
];

const state = { query: '', category: 'all', maxPrice: 0, sort: 'default' };
const columns = new Map();   
const chips = new Map();   
let searchInput = null;
let sortSelect = null;
let priceSelect = null;
let summaryText = null;
let emptyMessage = null;

function formatPrice(amount) {
  return amount.toLocaleString('ru-RU') + '\u00A0\u20B8';
}

function createEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) { element.className = className; }
  if (text !== undefined) { element.textContent = text; }
  return element;
}

function getVisible(query, category, maxPrice) {
  return PRODUCTS.filter(function (product) {
    const matchesName = product.name.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || product.category === category;
    const matchesPrice = maxPrice === 0 || product.price <= maxPrice;
    return matchesName && matchesCategory && matchesPrice;
  });
}

function sortProducts(list, mode) {
  const copy = list.slice();
  if (mode === 'price-asc') {
    copy.sort(function (a, b) { return a.price - b.price; });
  } else if (mode === 'price-desc') {
    copy.sort(function (a, b) { return b.price - a.price; });
  }
  return copy;
}

function buildSelect(id, labelText, options) {
  const column = createEl('div', 'col-12 col-sm-6');
  const label = createEl('label', 'form-label small mb-1', labelText);
  label.htmlFor = id;
  const select = createEl('select', 'form-select');
  select.id = id;
  options.forEach(function (option) {
    select.add(new Option(option.label, option.value));
  });
  column.append(label, select);
  return column;
}

function buildCard(product, index) {
  const category = CATEGORIES.find(function (item) { return item.id === product.category; });

  const column = createEl('div', 'col');
  const card = createEl('article', 'card h-100 product-card');
  card.id = 'product-' + product.id;
  card.dataset.price = product.price;   

  const image = createEl('img', 'card-img-top product-img');
  image.src = product.image;
  image.alt = product.name;
  image.width = 400;
  image.height = 300;
  image.decoding = 'async';
  if (index >= EAGER_IMAGES) { image.loading = 'lazy'; }

  const body = createEl('div', 'card-body d-flex flex-column');
  const title = createEl('h4', 'h5 card-title', product.name);
  const price = createEl('p', 'fw-bold mt-auto', formatPrice(product.price));

  const label = createEl('label', 'form-label small mb-1', 'Size:');
  label.htmlFor = 'size-' + product.id;
  const select = createEl('select', 'form-select mb-2');
  select.id = 'size-' + product.id;
  select.name = 'size-' + product.id;
  select.add(new Option('Choose size', ''));
  category.sizes.forEach(function (size) { select.add(new Option(size, size)); });

  const button = createEl('button', 'btn btn-dark', 'Add to cart');
  button.type = 'button';
  button.id = 'add-' + product.id + '-btn';

  body.append(title, price, label, select, button);
  card.append(image, body);
  column.append(card);
  return column;
}

function renderProducts() {
  PRODUCTS.forEach(function (product, index) {
    const column = buildCard(product, index);
    columns.set(product.id, column);
    document.getElementById('category-' + product.category).append(column);
  });
}

function buildToolbar(anchor) {
  const toolbar = createEl('div', 'mb-3');

  const chipRow = createEl('div', 'd-flex flex-wrap gap-2 mb-3');
  [{ id: 'all', label: 'All' }].concat(CATEGORIES).forEach(function (category) {
    const button = createEl('button', 'btn btn-sm btn-outline-dark');
    button.type = 'button';
    button.id = 'chip-' + category.id;
    button.dataset.category = category.id;
    chips.set(category.id, { button: button, label: category.label });
    chipRow.append(button);
  });
  chipRow.addEventListener('click', onChipClick);

  const selectRow = createEl('div', 'row g-2 mb-3');
  const priceOptions = PRICE_LIMITS.map(function (limit) {
    return { value: limit.value, label: limit.value === 0 ? limit.label : 'Up to ' + formatPrice(limit.value) };
  });
  const priceColumn = buildSelect('catalog-max-price', 'Maximum price:', priceOptions);
  const sortColumn = buildSelect('catalog-sort', 'Sort by:', SORT_MODES);
  priceSelect = priceColumn.querySelector('select');
  sortSelect = sortColumn.querySelector('select');
  selectRow.append(priceColumn, sortColumn);
  selectRow.addEventListener('change', onSelectChange);

  const summaryRow = createEl('div', 'd-flex justify-content-between align-items-center gap-2');
  summaryText = createEl('p', 'small text-muted mb-0');
  summaryText.setAttribute('aria-live', 'polite');
  const resetButton = createEl('button', 'btn btn-sm btn-outline-secondary', 'Reset filters');
  resetButton.type = 'button';
  resetButton.id = 'catalog-reset-btn';
  resetButton.addEventListener('click', resetFilters);
  summaryRow.append(summaryText, resetButton);

  toolbar.append(chipRow, selectRow, summaryRow);
  anchor.after(toolbar);
}

function updateChips() {
  chips.forEach(function (chip, categoryId) {
    const count = getVisible(state.query, categoryId, state.maxPrice).length;
    chip.button.textContent = chip.label + ' (' + count + ')';
    const isActive = state.category === categoryId;
    chip.button.classList.toggle('active', isActive);
    chip.button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateSummary(visible) {
  if (visible.length === 0) {
    const typed = searchInput.value.trim();
    emptyMessage.textContent = typed === ''
      ? 'No items match the selected filters. Try another category or price.'
      : 'Nothing found for "' + typed + '". Try another word or reset the filters.';
    emptyMessage.classList.remove(HIDDEN_CLASS);
    summaryText.textContent = 'Showing 0 of ' + PRODUCTS.length + ' items';
    return;
  }

  emptyMessage.classList.add(HIDDEN_CLASS);
  const byPrice = sortProducts(visible, 'price-asc');
  const lowest = byPrice[0].price;
  const highest = byPrice[byPrice.length - 1].price;
  const range = lowest === highest ? formatPrice(lowest) : formatPrice(lowest) + ' \u2013 ' + formatPrice(highest);
  summaryText.textContent = 'Showing ' + visible.length + ' of ' + PRODUCTS.length + ' items \u00B7 ' + range;
}

function applyFilters() {
  const visible = getVisible(state.query, state.category, state.maxPrice);
  const visibleIds = new Set(visible.map(function (product) { return product.id; }));

  CATEGORIES.forEach(function (category) {
    const container = document.getElementById('category-' + category.id);
    const heading = document.getElementById(category.id);
    const inCategory = PRODUCTS.filter(function (product) { return product.category === category.id; });

    sortProducts(inCategory, state.sort).forEach(function (product) {
      const column = columns.get(product.id);
      column.classList.toggle(HIDDEN_CLASS, !visibleIds.has(product.id));
      container.append(column);  
    });

    const hasVisible = inCategory.some(function (product) { return visibleIds.has(product.id); });
    heading.classList.toggle(HIDDEN_CLASS, !hasVisible);
    container.classList.toggle(HIDDEN_CLASS, !hasVisible);
  });

  updateChips();
  updateSummary(visible);
}

function resetFilters() {
  state.query = '';
  state.category = 'all';
  state.maxPrice = 0;
  state.sort = 'default';
  searchInput.value = '';
  priceSelect.value = '0';
  sortSelect.value = 'default';
  applyFilters();
}

function onSearchInput(event) {
  state.query = event.target.value.trim().toLowerCase();
  applyFilters();
}

function onChipClick(event) {
  const button = event.target.closest('button[data-category]');
  if (button === null) { return; }
  state.category = button.dataset.category;
  applyFilters();
}

function onSelectChange(event) {
  const select = event.target;
  if (select.id === 'catalog-sort') {
    state.sort = select.value;
  } else if (select.id === 'catalog-max-price') {
    state.maxPrice = Number(select.value);
  }
  applyFilters();
}

function init() {
  const list = document.getElementById('product-list');
  searchInput = document.getElementById('catalog-search');
  if (list === null || searchInput === null) { return; }

  renderProducts();
  buildToolbar(searchInput.closest('.mb-4') || searchInput.parentElement);

  emptyMessage = createEl('p', 'text-muted lead ' + HIDDEN_CLASS);
  emptyMessage.setAttribute('role', 'status');
  list.after(emptyMessage);

  searchInput.addEventListener('input', onSearchInput);
  applyFilters();

  if (location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target !== null) { target.scrollIntoView(); }
  }
}

document.addEventListener('DOMContentLoaded', init);
