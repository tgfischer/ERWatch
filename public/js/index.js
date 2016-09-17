$(document).ready(function() {
  $('#submit-button').click(function(e) {
    window.location.href = '/v/' + $('#code-field').val();

    return true;
  });
});
