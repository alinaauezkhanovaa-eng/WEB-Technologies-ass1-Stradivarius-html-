$(function () {
  'use strict';
 
  const $search = $('#catalog-search');
 
  if ($search.length === 0) {
    return;
  }
  const $noResults = $('<p>')
    .addClass('text-muted')
    .text('No items match your search.')
    .hide()
    .insertAfter($search.closest('.mb-4'));
 
  $search.on('input', function () {
    const query = $(this).val().trim().toLowerCase();
 
    $('#product-list .product-card').each(function () {
      const title = $(this).find('.card-title').text().toLowerCase();
      $(this).closest('.col').toggle(title.includes(query));
    });
    $('#product-list h3').each(function () {
      const $heading = $(this);
      $heading.toggle($heading.next('div').find('.col:visible').length > 0);
    });
 
    $noResults.toggle($('#product-list .col:visible').length === 0);
  });
});
 
