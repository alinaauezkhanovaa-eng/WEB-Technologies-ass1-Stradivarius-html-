$(function () {
  'use strict';

  var QUESTION_MAX = 300;

  var $title = $('#care-guide-title');
  var $steps = $('.care-steps');
  var $hint = $('<small>', { 'class': 'text-muted ms-2' }).text('(click to hide)').appendTo($title);
  $title.attr('aria-expanded', 'true');

  $title.on('click keyup', function (event) {
    if (event.type === 'keyup' && event.key !== 'Enter') { return; }

    $progress.slideToggle(300);
    $steps.slideToggle(300, function () {
      var open = $(this).is(':visible');
      $title.attr('aria-expanded', String(open));
      $hint.text(open ? '(click to hide)' : '(click to show)');
    });
  });

  // Checklist: every step can be marked as done; a progress line shows how many.
  var $stepBoxes = $('.care-step');
  var $progress = $('<p>', { 'class': 'small text-muted mt-2', 'aria-live': 'polite' }).insertAfter($steps);

  $stepBoxes.attr({ role: 'checkbox', tabindex: '0', 'aria-checked': 'false', title: 'Click to mark as done' });

  function updateProgress() {
    var done = $stepBoxes.filter('.active-state').length;
    $progress.text('Steps done: ' + done + ' of ' + $stepBoxes.length);
  }

  function toggleStep($step) {
    $step.toggleClass('active-state');
    $step.attr('aria-checked', String($step.hasClass('active-state')));
    updateProgress();
  }

  $steps.on('click', '.care-step', function () { toggleStep($(this)); });
  $steps.on('keydown', '.care-step', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleStep($(this));
    }
  });
  updateProgress();
});
