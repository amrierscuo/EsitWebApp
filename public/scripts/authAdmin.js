//Script che verifica l'autenticazione dell'admin
$(document).ready(function() {
    $.ajax({
      url: '/verifica-autenticazione-admin',
      method: 'GET',
      success: function(response) {
        console.log("isauth");
      },
      error: function(error) {
        console.log("errore");
        window.location.href = 'error.html';
      }
    });
});
  