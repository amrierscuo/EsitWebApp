// Script che verifica l'autenticazione dell'utente
$(document).ready(function() {
    $.ajax({
      url: '/verifica-autenticazione',
      method: 'GET',
      success: function(response) {
        $('#contenuto').text('Benvenuto nella pagina protetta!');
        console.log("isauth");
      },
      error: function(error) {
        console.log("errore");
        window.location.href = 'login.html';
      }
    });
});
  