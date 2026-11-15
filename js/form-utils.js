window.FormUtils = (function ($) {
  'use strict';

  var ERROR_CLASS = 'is-invalid';
  var MESSAGE_CLASS = 'form-error';
  var NAME_MAX = 60;

  var EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  var NAME_PATTERN = /^[\p{L}][\p{L}\s'\u2019.-]*$/u;
  var PHONE_PATTERN = /^\+?[\d\s()-]+$/;

  function trimmed($field) {
    var value = $field.val();
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function checkName(name) {
    if (name === '') { return 'Please enter your name.'; }
    if (name.length < 2) { return 'Name must be at least 2 characters long.'; }
    if (name.length > NAME_MAX) { return 'Name is too long (maximum ' + NAME_MAX + ' characters).'; }
    if (!NAME_PATTERN.test(name)) { return 'Name may contain only letters, spaces, hyphens and apostrophes.'; }
    return '';
  }

  function checkEmail(email) {
    if (email === '') { return 'Please enter your email.'; }
    if (!EMAIL_PATTERN.test(email)) { return 'Enter a valid email, for example name@example.com.'; }
    return '';
  }

  function checkPhone(phone) {
    if (phone === '') { return 'Please enter your phone number.'; }
    if (!PHONE_PATTERN.test(phone)) {
      return 'Phone may contain only digits, spaces, brackets, hyphens and a leading +.';
    }
    var digits = phone.replace(/\D/g, '').length;
    if (digits < 10 || digits > 15) { return 'Phone must contain from 10 to 15 digits.'; }
    return '';
  }

  // ---------- Kazakhstan phone: +77 and 11 digits in total ----------
  // Valid: +7 (7XX) XXX-XX-XX  ->  digits "77XXXXXXXXX" (11 digits, starts with 77).
  var KZ_PHONE_CHARS = /^[+\d\s()-]+$/;

  function checkKzPhone(phone) {
    if (phone === '') { return 'Please enter your phone number.'; }
    if (!KZ_PHONE_CHARS.test(phone)) {
      return 'Phone may contain only digits, spaces, brackets, hyphens and a leading +.';
    }
    var digits = phone.replace(/\D/g, '');
    if (digits.length !== 11) {
      return 'Kazakhstan number: +7 and 10 more digits (11 digits in total), for example +7 (777) 123-45-67.';
    }
    if (digits.slice(0, 2) !== '77') {
      return 'The number must start with +77 (Kazakhstan mobile number).';
    }
    return '';
  }

  // "8777..." / "7777..." / "777..." / "+7 777..." -> "+7 (777) 123-45-67" while typing.
  // Separators appear only when a digit follows them, so Backspace always works.
  function formatKzPhone(raw) {
    var digits = String(raw).replace(/\D/g, '');
    if (digits === '') { return ''; }
    if (digits.charAt(0) === '8') {
      digits = '7' + digits.slice(1);
    } else if (digits.charAt(0) !== '7') {
      digits = '7' + digits;
    }
    digits = digits.slice(0, 11);

    var rest = digits.slice(1);
    var out = '+7';
    if (rest.length > 0) { out += ' (' + rest.slice(0, 3); }
    if (rest.length > 3) { out += ') ' + rest.slice(3, 6); }
    if (rest.length > 6) { out += '-' + rest.slice(6, 8); }
    if (rest.length > 8) { out += '-' + rest.slice(8, 10); }
    return out;
  }

  function attachKzPhoneMask($field) {
    $field.attr({ inputmode: 'tel', maxlength: 18, placeholder: '+7 (7XX) XXX-XX-XX' });
    $field.on('input', function () {
      var formatted = formatKzPhone($field.val());
      if (formatted !== $field.val()) { $field.val(formatted); }
    });
    $field.on('focus', function () {
      if ($field.val() === '') { $field.val('+7 (7'); }
    });
    $field.on('blur', function () {
      if ($field.val() === '+7 (7' || $field.val() === '+7') { $field.val(''); }
    });
  }

  function todayString() {
    var now = new Date();
    function pad(number) { return (number < 10 ? '0' : '') + number; }
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  }

  function clearError($field) {
    var $error = $field.data('errorEl');
    if ($error) {
      $error.remove();
      $field.removeData('errorEl');
    }
    $field.removeClass(ERROR_CLASS).removeAttr('aria-invalid');
  }

  function showError($field, message) {
    clearError($field);

    var $anchor = $field.closest('.form-check');
    if ($anchor.length === 0) { $anchor = $field; }

    var $error = $('<div>', { 'class': 'invalid-feedback d-block ' + MESSAGE_CLASS, role: 'alert' })
      .text(message)
      .insertAfter($anchor);

    $field.addClass(ERROR_CLASS).attr('aria-invalid', 'true').data('errorEl', $error);
  }

  function clearMessage($msg) {
    $msg.stop(true, true).hide().empty().removeClass('alert-success-custom alert-danger-custom');
  }

  function clearAll($form) {
    $form.find('.' + MESSAGE_CLASS).remove();
    $form.find('.' + ERROR_CLASS).removeClass(ERROR_CLASS).removeAttr('aria-invalid').removeData('errorEl');
  }

  function applyChecks(checks, $msg) {
    clearMessage($msg);

    var $firstInvalid = null;
    $.each(checks, function (index, check) {
      var $field = check[0];
      var message = check[1];

      if (message === '') {
        clearError($field);
        return;
      }
      showError($field, message);
      if ($firstInvalid === null) { $firstInvalid = check[2] || $field; }
    });

    if ($firstInvalid !== null) {
      $firstInvalid.trigger('focus');
      return false;
    }
    return true;
  }

  function showMessage($msg, type, title, lines, note) {
    $msg.stop(true, true)
      .removeClass('alert-success-custom alert-danger-custom')
      .addClass(type === 'success' ? 'alert-success-custom' : 'alert-danger-custom')
      .empty();

    $('<p>', { 'class': 'fw-bold mb-1' }).text(title).appendTo($msg);

    if (lines && lines.length > 0) {
      var $list = $('<ul>', { 'class': 'mb-1' }).appendTo($msg);
      $.each(lines, function (index, line) { $('<li>').text(line).appendTo($list); });
    }
    if (note) { $('<p>', { 'class': 'small mb-0' }).text(note).appendTo($msg); }

    $msg.hide().fadeIn(400, function () {
      $(this).attr('tabindex', '-1').trigger('focus');
    });
  }

  return {
    trimmed: trimmed,
    checkName: checkName,
    checkEmail: checkEmail,
    checkPhone: checkPhone,
    checkKzPhone: checkKzPhone,
    formatKzPhone: formatKzPhone,
    attachKzPhoneMask: attachKzPhoneMask,
    todayString: todayString,
    showError: showError,
    clearError: clearError,
    clearAll: clearAll,
    applyChecks: applyChecks,
    showMessage: showMessage,
    clearMessage: clearMessage
  };
})(jQuery);
