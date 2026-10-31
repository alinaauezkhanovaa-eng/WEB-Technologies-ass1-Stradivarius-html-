$(function () {
  'use strict';
 
  const MAX_GUESTS = 10;
  const COMMENT_MIN_FEEDBACK = 10;
  const COMMENT_MAX = 300;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
  const FIELD_KEYS = ['fullname', 'email', 'phone', 'visitors', 'visit-date', 'purpose', 'agree', 'comment'];
 
  const PURPOSE_LABELS = {
    fitting: 'Fitting',
    consult: 'Consultation',
    feedback: 'Leave feedback'
  };
 
  const DEPARTMENT_LABELS = {
    women: "Women's clothing",
    accessories: 'Accessories'
  };
 
  const $form = $('#visit-form');      
  const $message = $('#form-response-message');
 
  if ($form.length === 0 || $message.length === 0) {
    return;
  }
 
  const fields = {};
 
  $.each(FIELD_KEYS, function (index, key) {
    let $mark;
    let $focus;
    let $box;
 
    if (key === 'purpose') {
      $focus = $('#purpose-fitting');
      $mark = $focus.closest('fieldset');
      $box = $mark;
    } else {
      $mark = $('#' + key);
      $focus = $mark;
      $box = $mark.parent();
    }
 
    const $error = $('<div>')
      .attr('id', key + '-error')
      .addClass('text-danger small')
      .hide()
      .appendTo($box);
 
    $focus.attr('aria-describedby', $error.attr('id'));
    fields[key] = { $mark: $mark, $focus: $focus, $error: $error };
  });
 
  function getTodayString() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
 
  function formatDate(isoDate) {
    const date = new Date(`${isoDate}T00:00:00`);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function createReference() {
    return `VR-${Math.floor(1000 + Math.random() * 9000)}`;
  }
 
 
  function validateFullName(value) {
    if (value === '') {
      return 'Please enter your full name.';
    }
    if (value.length < 2) {
      return 'Name must be at least 2 characters long.';
    }
    return '';
  }
 
  function validateEmail(value) {
    if (value === '') {
      return 'Please enter your email.';
    }
    if (!EMAIL_PATTERN.test(value)) {
      return 'Enter an email like name@example.com.';
    }
    return '';
  }
 
  function validatePhone(value) {
    const digits = value.replace(/\D/g, '');
    if (value === '') {
      return 'Please enter your phone number.';
    }
    if (!/^[78]\d{10}$/.test(digits)) {
      return 'Enter a phone number like +7 701 123 45 67.';
    }
    return '';
  }
 
  function validateVisitors(value) {
    if (value === '') {
      return 'Please enter the number of guests.';
    }
    const count = Number(value);
    if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) {
      return `Number of guests: a whole number from 1 to ${MAX_GUESTS}.`;
    }
    return '';
  }
 
  function validatePurpose(value) {
    return value === '' ? 'Please choose the purpose of your visit.' : '';
  }
 
  function validateDate(value, purpose) {
    if (value === '') {
      return 'Please choose a date.';
    }
    const today = getTodayString();
    if (purpose === 'feedback' && value > today) {
      return 'For feedback, choose the date of a visit that already happened (today or earlier).';
    }
    if (purpose !== '' && purpose !== 'feedback' && value < today) {
      return 'Please choose today or a future date.';
    }
    return '';
  }
 
  function validateAgree(checked) {
    return checked ? '' : 'Please agree to the processing of your data.';
  }
 
  function validateComment(value, purpose) {
    if (purpose === 'feedback' && value.length < COMMENT_MIN_FEEDBACK) {
      return `Please write at least ${COMMENT_MIN_FEEDBACK} characters about your visit.`;
    }
    if (value.length > COMMENT_MAX) {
      return `Comment is too long (maximum ${COMMENT_MAX} characters).`;
    }
    return '';
  }
  function validateForm(values) {
    const checks = {
      fullname: validateFullName(values.fullname),
      email: validateEmail(values.email),
      phone: validatePhone(values.phone),
      visitors: validateVisitors(values.visitors),
      'visit-date': validateDate(values['visit-date'], values.purpose),
      purpose: validatePurpose(values.purpose),
      agree: validateAgree(values.agree),
      comment: validateComment(values.comment, values.purpose)
    };
 
    const errors = {};
    $.each(checks, function (key, text) {
      if (text !== '') {
        errors[key] = text;
      }
    });
    return errors;
  }
 
 
  function showError(key, text) {
    const field = fields[key];
    field.$mark.addClass('is-invalid');
    field.$focus.attr('aria-invalid', 'true');
    field.$error.stop(true, true).text(text).slideDown(150);
  }
 
  function clearError(key) {
    const field = fields[key];
    field.$mark.removeClass('is-invalid');
    field.$focus.removeAttr('aria-invalid');
    field.$error.stop(true, true).slideUp(150, function () {
      $(this).text('');
    });
  }
 
  function clearAllErrors() {
    $.each(FIELD_KEYS, function (index, key) {
      clearError(key);
    });
  }
 
  function clearMessage() {
    $message
      .stop(true, true)
      .empty()
      .removeClass('alert-success-custom alert-danger-custom')
      .removeAttr('tabindex');
  }
 
  function showErrorMessage(count) {
    const word = count === 1 ? 'field' : 'fields';
    clearMessage();
    $message
      .addClass('alert-danger-custom')
      .text(`Please fix the ${count} highlighted ${word} below and submit again.`)
      .hide()
      .fadeIn(200);
  }
 
  function showSummary(values) {
    clearMessage();
    $message.addClass('alert-success-custom');
 
    $('<p>').addClass('fw-bold mb-2').text('Thank you! Here is your request (demonstration):').appendTo($message);
 
    const lines = [
      `Purpose: ${PURPOSE_LABELS[values.purpose]}`,
      `Date: ${formatDate(values['visit-date'])}`,
      `Guests: ${values.visitors}`,
      `Name: ${values.fullname}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`
    ];
    if (values.department !== '') {
      lines.push(`Department: ${DEPARTMENT_LABELS[values.department]}`);
    }
    if (values.comment !== '') {
      lines.push(`Comment: ${values.comment}`);
    }
    lines.push(`Demo reference: ${createReference()}`);
 
    $.each(lines, function (index, line) {
      $('<p>').addClass('mb-1').text(line).appendTo($message);
    });
 
    $('<p>')
      .addClass('mt-2 mb-0 small')
      .text('This is a front-end demonstration: no data is sent to a server and no real booking or visit is created.')
      .appendTo($message);
 
    $message.hide().fadeIn(400, function () {
      $(this).attr('tabindex', '-1').trigger('focus');
    });
  }
 
  function readValues() {
    return {
      fullname: $('#fullname').val().trim(),
      email: $('#email').val().trim(),
      phone: $('#phone').val().trim(),
      visitors: $('#visitors').val(),
      'visit-date': $('#visit-date').val(),
      department: $('#department').val(),
      purpose: $('input[name="purpose"]:checked').val() || '',
      agree: $('#agree').prop('checked'),
      comment: $('#comment').val().trim()
    };
  }
 
 
  function handleSubmit(event) {
    event.preventDefault();
    clearMessage();
 
    const values = readValues();
    const errors = validateForm(values);
    const invalidKeys = $.grep(FIELD_KEYS, function (key) {
      return errors[key] !== undefined;
    });
 
    $.each(FIELD_KEYS, function (index, key) {
      if (errors[key] !== undefined) {
        showError(key, errors[key]);
      } else {
        clearError(key);
      }
    });
 
    if (invalidKeys.length > 0) {
      fields[invalidKeys[0]].$focus.trigger('focus');
      showErrorMessage(invalidKeys.length);
      return;
    }
 
    $form.trigger('reset');
    showSummary(values);
  }
 
  function handleFieldChange() {
    const key = $(this).attr('name');
 
    if (fields[key] === undefined) {
      return;
    }
 
    clearError(key);  
    if (key === 'purpose') {
      clearError('visit-date');
      clearError('comment');
    }
  }
 
  function handleReset() {
    clearAllErrors();
    clearMessage();
  }
  $form.prop('noValidate', true);
  $message.attr('aria-live', 'polite');
 
  $form.on('submit', handleSubmit);
  $form.on('input change', '[name]', handleFieldChange);
  $form.on('reset', handleReset);
});
