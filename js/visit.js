$(function () {
  'use strict';

  var MAX_GUESTS = 10;
  var COMMENT_MAX = 300;

  var PURPOSE_LABELS = { fitting: 'Fitting', consult: 'Consultation' };
  var DEPARTMENT_LABELS = { women: "Women's clothing", accessories: 'Accessories' };

  var $form = $('#visit-form');
  var $msg = $('#form-response-message');
  if ($form.length === 0 || $msg.length === 0) { return; }

  var fields = {
    fullname: $('#fullname'),
    email: $('#email'),
    phone: $('#phone'),
    visitors: $('#visitors'),
    date: $('#visit-date'),
    purpose: $('#purpose-fitting').closest('fieldset'),
    agree: $('#agree'),
    comment: $('#comment')
  };

  $form.prop('noValidate', true);
  $msg.attr('aria-live', 'polite');

  // a booking is for today or a future day
  fields.date.attr('min', FormUtils.todayString());
  FormUtils.attachKzPhoneMask(fields.phone);

  function validateVisitors(value) {
    if (value === '') { return 'Please enter the number of guests.'; }
    var count = Number(value);
    if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) {
      return 'Number of guests: a whole number from 1 to ' + MAX_GUESTS + '.';
    }
    return '';
  }

  function validatePurpose(value) {
    return value === '' ? 'Please choose the purpose of your visit.' : '';
  }

  function validateDate(value) {
    if (value === '') { return 'Please choose a date.'; }
    if (value < FormUtils.todayString()) { return 'Please choose today or a future date.'; }
    return '';
  }

  function validateAgree(checked) {
    return checked ? '' : 'Please agree to the processing of your data.';
  }

  function validateComment(value) {
    return value.length > COMMENT_MAX
      ? 'Comment is too long (maximum ' + COMMENT_MAX + ' characters).'
      : '';
  }

  function readValues() {
    return {
      fullname: FormUtils.trimmed(fields.fullname),
      email: FormUtils.trimmed(fields.email),
      phone: FormUtils.trimmed(fields.phone),
      visitors: fields.visitors.val(),
      date: fields.date.val(),
      department: $('#department').val(),
      purpose: $form.find('input[name="purpose"]:checked').val() || '',
      agree: fields.agree.prop('checked'),
      comment: FormUtils.trimmed(fields.comment)
    };
  }

  function showSummary(values) {
    var lines = [
      'Purpose: ' + PURPOSE_LABELS[values.purpose],
      'Date: ' + new Date(values.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      'Guests: ' + values.visitors,
      'Name: ' + values.fullname,
      'Email: ' + values.email,
      'Phone: ' + values.phone
    ];
    if (values.department !== '') { lines.push('Department: ' + DEPARTMENT_LABELS[values.department]); }
    if (values.comment !== '') { lines.push('Comment: ' + values.comment); }

    lines.push('Demo reference: VR-' + Math.floor(1000 + Math.random() * 9000));

    FormUtils.showMessage($msg, 'success', 'Thank you! Here is your visit request (demonstration):', lines,
      'This is a front-end demonstration: no data is sent to a server and no real booking is created.');
  }

  $form.on('submit', function (event) {
    event.preventDefault();

    var v = readValues();
    var checks = [
      [fields.fullname, FormUtils.checkName(v.fullname)],
      [fields.email, FormUtils.checkEmail(v.email)],
      [fields.phone, FormUtils.checkKzPhone(v.phone)],
      [fields.visitors, validateVisitors(v.visitors)],
      [fields.date, validateDate(v.date)],
      [fields.purpose, validatePurpose(v.purpose), $('#purpose-fitting')],
      [fields.agree, validateAgree(v.agree)],
      [fields.comment, validateComment(v.comment)]
    ];

    if (!FormUtils.applyChecks(checks, $msg)) { return; }

    this.reset();
    showSummary(v);
  });

  $form.on('input change', 'input, select, textarea', function () {
    if (this.name === 'purpose') {
      FormUtils.clearError(fields.purpose);
    } else {
      FormUtils.clearError($(this));
    }
  });

  $form.on('reset', function () {
    FormUtils.clearAll($form);
    FormUtils.clearMessage($msg);
  });
});
