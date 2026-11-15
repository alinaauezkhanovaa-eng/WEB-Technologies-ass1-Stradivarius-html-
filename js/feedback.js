$(function () {
  'use strict';

  var COMMENT_MIN = 10;
  var COMMENT_MAX = 300;

  var DEPARTMENT_LABELS = { women: "Women's clothing", accessories: 'Accessories' };

  var $form = $('#feedback-form');
  var $msg = $('#form-response-message');
  if ($form.length === 0 || $msg.length === 0) { return; }

  var fields = {
    fullname: $('#fullname'),
    email: $('#email'),
    date: $('#visit-date'),
    rating: $('#rating-group'),
    comment: $('#comment'),
    agree: $('#agree')
  };

  $form.prop('noValidate', true);
  $msg.attr('aria-live', 'polite');

  // feedback is about a visit that already happened
  fields.date.attr('max', FormUtils.todayString());

  function validateDate(value) {
    if (value === '') { return 'Please choose the date of your visit.'; }
    if (value > FormUtils.todayString()) {
      return 'Choose the date of a visit that already happened (today or earlier).';
    }
    return '';
  }

  function validateRating(value) {
    return value === '' ? 'Please choose a rating from 1 to 5.' : '';
  }

  function validateComment(value) {
    if (value.length < COMMENT_MIN) {
      return 'Please write at least ' + COMMENT_MIN + ' characters about your visit.';
    }
    if (value.length > COMMENT_MAX) {
      return 'Feedback is too long (maximum ' + COMMENT_MAX + ' characters).';
    }
    return '';
  }

  function validateAgree(checked) {
    return checked ? '' : 'Please agree to the processing of your data.';
  }

  function readValues() {
    return {
      fullname: FormUtils.trimmed(fields.fullname),
      email: FormUtils.trimmed(fields.email),
      date: fields.date.val(),
      department: $('#department').val(),
      rating: $form.find('input[name="rating"]:checked').val() || '',
      comment: FormUtils.trimmed(fields.comment),
      agree: fields.agree.prop('checked')
    };
  }

  function showSummary(values) {
    var lines = [
      'Visit date: ' + new Date(values.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      'Rating: ' + values.rating + ' / 5',
      'Name: ' + values.fullname,
      'Email: ' + values.email
    ];
    if (values.department !== '') { lines.push('Department: ' + DEPARTMENT_LABELS[values.department]); }
    lines.push('Feedback: ' + values.comment);
    lines.push('Demo reference: FB-' + Math.floor(1000 + Math.random() * 9000));

    FormUtils.showMessage($msg, 'success', 'Thank you for your feedback (demonstration)!', lines,
      'This is a front-end demonstration: no data is sent to a server.');
  }

  $form.on('submit', function (event) {
    event.preventDefault();

    var v = readValues();
    var checks = [
      [fields.fullname, FormUtils.checkName(v.fullname)],
      [fields.email, FormUtils.checkEmail(v.email)],
      [fields.date, validateDate(v.date)],
      [fields.rating, validateRating(v.rating), $('#rating-1')],
      [fields.comment, validateComment(v.comment)],
      [fields.agree, validateAgree(v.agree)]
    ];

    if (!FormUtils.applyChecks(checks, $msg)) { return; }

    this.reset();
    showSummary(v);
  });

  $form.on('input change', 'input, select, textarea', function () {
    if (this.name === 'rating') {
      FormUtils.clearError(fields.rating);
    } else {
      FormUtils.clearError($(this));
    }
  });

  $form.on('reset', function () {
    FormUtils.clearAll($form);
    FormUtils.clearMessage($msg);
  });
});
