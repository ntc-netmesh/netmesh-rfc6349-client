$(function () {
  $('#uname').focus();

  $('#loginForm').submit(function () {
    $('#btnLogIn').attr('disabled', true);
    $('#btnLogIn .spinner-border').removeClass('d-none');
  });
});
