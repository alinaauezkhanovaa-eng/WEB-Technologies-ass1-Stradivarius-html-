$(function () {
  'use strict';
 
  const STORAGE_KEY = 'stradivarius_cart';
 
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  }
 
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  }
 
  function itemKey(item) {
    return item.id + '|' + item.size;
  }
 
  function formatPrice(number) {
    return number.toLocaleString('ru-RU') + '\u00a0\u20b8';
  }
 
  function updateCartBadge() {
    const cart = getCart();
    let totalQty = 0;
    $.each(cart, function (index, item) {
      totalQty += item.qty;
    });
 
    $('#nav-cart-link').each(function () {
      const $link = $(this);
      let $badge = $link.find('.cart-badge');
 
      if (totalQty > 0) {
        if ($badge.length === 0) {
          $badge = $('<span>').addClass('cart-badge badge bg-danger rounded-pill ms-1').appendTo($link);
        }
        $badge.text(totalQty);
      } else {
        $badge.remove();
      }
    });
  }
 
  function showSizeError($select) {
    let $error = $select.next('.size-error');    
    if ($error.length === 0) {
      $error = $('<div>')
        .addClass('size-error text-danger small mb-2')
        .text('Please choose a size first.')
        .hide()
        .insertAfter($select);
    }
    $error.slideDown(150);
  }
 
  function initCatalog() {
    const $addButtons = $('[id^="add-"]');         
 
    if ($addButtons.length === 0) {
      return;
    }
 
    $addButtons.on('click', function () {
      const $btn = $(this);
      const $card = $btn.closest('.product-card'); 
      const $select = $card.find('select');
      const size = $select.val();
 
      if ($select.length > 0 && !size) {
        $select.addClass('is-invalid');
        showSizeError($select);
        return;
      }
 
      const cart = getCart();
      const newItem = {
        id: $card.attr('id'),
        name: $card.find('.card-title').text().trim(),
        price: parseInt($card.find('.fw-bold').first().text().replace(/[^0-9]/g, ''), 10) || 0,
        img: $card.find('img').attr('src'),
        size: size,
        qty: 1
      };
 
      const existing = $.grep(cart, function (item) {
        return itemKey(item) === itemKey(newItem);
      })[0];
 
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push(newItem);
      }
      saveCart(cart);
 
      if (!$btn.data('label')) {
        $btn.data('label', $btn.text());
      }
      $btn.text('Added! \u2713').removeClass('btn-dark').addClass('btn-success');
 
      setTimeout(function () {
        $btn.text($btn.data('label')).removeClass('btn-success').addClass('btn-dark');
      }, 1200);
    });
 
    $('#product-list').on('change', 'select', function () {
      $(this).removeClass('is-invalid').next('.size-error').slideUp(150);
    });
  }
 
 
  function initCartPage() {
    const $filled = $('#cart-filled');
    const $empty = $('#cart-empty');
    const $list = $('#cart-items');
 
    if ($filled.length === 0 || $empty.length === 0) {
      return;
    }
 
    function buildItem(item) {
      const $li = $('<li>')
        .addClass('d-flex gap-3 py-3 border-bottom')
        .attr('data-key', itemKey(item));
 
      $('<img>')
        .addClass('cart-thumb rounded')
        .attr({ src: item.img, alt: item.name, width: 96, height: 96 })
        .appendTo($li);
 
      const $body = $('<div>').addClass('flex-grow-1').appendTo($li);
      const $head = $('<div>').addClass('d-flex justify-content-between gap-2').appendTo($body);
      const $titles = $('<div>').appendTo($head);
 
      $('<h2>').addClass('h6 mb-1').text(item.name).appendTo($titles);
      $('<p>').addClass('small text-muted mb-0').text('Size: ' + (item.size || 'N/A')).appendTo($titles);
      $('<button>')
        .addClass('btn-close')
        .attr({ type: 'button', 'aria-label': 'Remove ' + item.name })
        .appendTo($head);
 
      const $foot = $('<div>').addClass('d-flex justify-content-between align-items-center mt-2').appendTo($body);
      const $qty = $('<div>')
        .addClass('btn-group btn-group-sm')
        .attr({ role: 'group', 'aria-label': 'Quantity' })
        .appendTo($foot);
 
      $('<button>')
        .addClass('btn btn-outline-dark cart-dec')
        .attr({ type: 'button', 'aria-label': 'Decrease quantity' })
        .html('&minus;')
        .appendTo($qty);
      $('<span>').addClass('btn btn-outline-dark disabled px-3 opacity-100').text(item.qty).appendTo($qty);
      $('<button>')
        .addClass('btn btn-outline-dark cart-inc')
        .attr({ type: 'button', 'aria-label': 'Increase quantity' })
        .text('+')
        .appendTo($qty);
 
      $('<strong>').addClass('text-nowrap').text(formatPrice(item.price * item.qty)).appendTo($foot);
 
      return $li;
    }
 
    function render() {
      const cart = getCart();
      let totalPrice = 0;
      let totalCount = 0;
 
      $filled.toggle(cart.length > 0);
      $empty.toggle(cart.length === 0);
      if (cart.length > 0) {
        $('.order-confirmation').remove();
      }
 
      $list.empty();
      $.each(cart, function (index, item) {
        totalPrice += item.price * item.qty;
        totalCount += item.qty;
        buildItem(item).appendTo($list);
      });
 
      $('#cart-total, #sum-products').text(formatPrice(totalPrice));
      $('#sum-count').text(totalCount);
      $('#order-submit-btn').text('Place order \u2022 ' + totalCount + ' pcs');
    }
 
    function removeRow($li) {
      const key = $li.attr('data-key');
 
      $li.slideUp(250, function () {
        saveCart($.grep(getCart(), function (item) {
          return itemKey(item) !== key;
        }));
        render();
      });
    }
 
    function changeQty($li, delta) {
      const key = $li.attr('data-key');
      const cart = getCart();
      const item = $.grep(cart, function (entry) {
        return itemKey(entry) === key;
      })[0];
 
      if (item === undefined) {
        return;
      }
      if (item.qty + delta < 1) {
        removeRow($li);
        return;
      }
      item.qty += delta;
      saveCart(cart);
      render();
    }
    $list.on('click', '.btn-close', function () {
      removeRow($(this).closest('li'));
    });
 
    $list.on('click', '.cart-inc', function () {
      changeQty($(this).closest('li'), 1);
    });
 
    $list.on('click', '.cart-dec', function () {
      changeQty($(this).closest('li'), -1);
    });
 
    $('#cart-clear-btn').on('click', function (event) {
      event.preventDefault();
      saveCart([]);
      render();
    });
 
    $('#order-form').on('submit', function (event) {
      event.preventDefault();
      if (getCart().length === 0) {
        return;
      }
 
      saveCart([]);
      $(this).trigger('reset');
      render();
 
      $('<p>')
        .addClass('order-confirmation alert-success-custom fw-bold')
        .text('Order placed! We hold your items for 48 hours at Stradivarius, Mega Silkway.')
        .hide()
        .prependTo($empty)
        .fadeIn(400);
    });
 
    render();
  }
 
  updateCartBadge();
  initCatalog();
  initCartPage();
});
