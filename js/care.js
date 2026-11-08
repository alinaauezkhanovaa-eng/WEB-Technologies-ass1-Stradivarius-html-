$(function () {
  'use strict';

  var QUESTION_MAX = 300;
  var STYLE_SUGGESTIONS = {
    autumn: { hash: 'outerwear', label: 'outerwear' },
    denim: { hash: 'bottom', label: 'bottoms' },
    office: { hash: 'top', label: 'tops' }
  };

  var $steps = $('.care-steps');

  var $stepBoxes = $('.care-step');
  var $tracker = $('<div>', { 'class': 'mt-3' }).insertAfter($steps);
  var $progress = $('<p>', { 'class': 'small text-muted mb-2', 'aria-live': 'polite' }).appendTo($tracker);
  var $done = $('<div>', { 'class': 'alert-success-custom p-2' })
    .text('All steps done \u2014 your eco-leather jacket is cared for.')
    .hide()
    .appendTo($tracker);

  $stepBoxes.attr({ title: 'Click to mark as done', role: 'button', tabindex: 0, 'aria-pressed': 'false' });

  function updateProgress() {
    var doneCount = $stepBoxes.filter('.active-state').length;
    $progress.text(doneCount + ' of ' + $stepBoxes.length + ' steps done');
    if (doneCount === $stepBoxes.length) {
      $done.stop(true, true).slideDown(250);
    } else {
      $done.stop(true, true).slideUp(200);
    }
  }
  updateProgress();

  $steps.on('click keyup', '.care-step', function (event) {
    if (event.type === 'keyup' && event.key !== 'Enter' && event.key !== ' ') { return; }

    var $step = $(this);
    $step.toggleClass('active-state');
    $step.attr('aria-pressed', String($step.hasClass('active-state')));
    updateProgress();
  });

  var $title = $('#care-guide-title');
  var $hint = $('<small>', { 'class': 'text-muted ms-2' }).text('(click to hide)').appendTo($title);
  $title.attr('aria-expanded', 'true');

  $title.on('click keyup', function (event) {
    if (event.type === 'keyup' && event.key !== 'Enter') { return; }

    $tracker.slideToggle(300);
    $steps.slideToggle(300, function () {
      var open = $(this).is(':visible');
      $title.attr('aria-expanded', String(open));
      $hint.text(open ? '(click to hide)' : '(click to show)');
    });
  });

  var $form = $('#style-inquiry-form');
  var $msg = $('#form-response-message');
  if ($form.length === 0 || $msg.length === 0) { return; }

  var fields = { name: $('#visitor-name'), email: $('#visitor-email'), message: $('#visitor-message') };

  $form.prop('noValidate', true);
  $msg.attr('aria-live', 'polite');

  var $counter = $('<div>', { 'class': 'form-text' }).insertAfter(fields.message);
  function updateCounter() {
    $counter.text(fields.message.val().length + ' / ' + QUESTION_MAX + ' characters');
  }
  updateCounter();
  fields.message.on('keyup input', updateCounter);

  $form.on('submit', function (event) {
    event.preventDefault();

    var name = FormUtils.trimmed(fields.name);
    var message = FormUtils.trimmed(fields.message);
    var checks = [
      [fields.name, FormUtils.checkName(name)],
      [fields.email, FormUtils.checkEmail(FormUtils.trimmed(fields.email))],
      [fields.message, message.length > QUESTION_MAX ? 'Question is too long (maximum ' + QUESTION_MAX + ' characters).' : '']
    ];
    if (!FormUtils.applyChecks(checks, $msg)) { return; }

    var vibe = $('#preferred-style option:selected').text();
    var suggestion = STYLE_SUGGESTIONS[$('#preferred-style').val()];
    this.reset();
    updateCounter();
    FormUtils.showMessage($msg, 'success', 'Thank you, ' + name + '! Your inquiry was received.',
      ['Preferred vibe: ' + vibe],
      'Front-end demonstration: nothing is sent to a server.');
    if (suggestion) {
      $('<a>', { href: 'catalog.html#' + suggestion.hash, 'class': 'alert-link' })
        .text('See ' + suggestion.label + ' in the collection')
        .appendTo($('<p>', { 'class': 'mt-2 mb-0' }).appendTo($msg));
    }
  });

  $form.on('input change', 'input, select, textarea', function () {
    FormUtils.clearError($(this));
  });
});
