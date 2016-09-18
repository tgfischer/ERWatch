$(document).ready(function() {
  $('select').material_select();
  $('select').on('change', function(e) {
    $('#spinner').removeClass('hide');
    $('.statistic').addClass('hide');

    $.post('/get_wait_time', {
      hospitalId: $('select.hospital-select').val()
    }, function(res) {
      if (res.err) {
        // Throw a modal up
      } else {
        $('.small.statistic .number').text(res.waitTime);
      }

      $('#spinner').addClass('hide');
      $('.statistic').removeClass('hide');
    });
  });
  Materialize.updateTextFields();

  $('#submit-button').click(function(e) {
    window.location.href = '/v/' + $('#code-field').val();

    return true;
  });
});
