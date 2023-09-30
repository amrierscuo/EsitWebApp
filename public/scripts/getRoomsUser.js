$(document).ready(function() {
  // Carica le stanze per l'utente
  loadRoomsForUser();

  // Carica i dettagli dell'utente
  loadUserDetails();
  $("#rooms").hide();  
  // Gestione del clic sull'elemento h1 per mostrare/nascondere le stanze
  $("h1.hdash").click(function() {
    $(this).next("ul.cardboard-room").toggle();
    if ($(this).next("ul.cardboard-room").is(":visible")) {
      $(this).css("background-color", "#3399ff");
      $(this).css("color", "white");
    } else {
      $(this).css("background-color", "white");
      $(this).css("color", "black");
    }
  });

  // Gestione del clic sull'elemento h1 per mostrare/nascondere i dati dell'utente
  $('#datiutente').hide();
  $('#hdatiutente').click(function() {
    $('#datiutente').toggle();
    if ($('#datiutente').is(':visible')) {
      $('#hdatiutente').css('background-color', '#3399ff');
      $('#hdatiutente').css('color', 'white');
    } else {
      $('#hdatiutente').css('background-color', 'white');
      $('#hdatiutente').css('color', 'black');
    }
  });
});

function loadRoomsForUser() {
  $.ajax({
    url: 'http://localhost:5000/api/user_rooms_id',
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      const datas = $('#rooms');
      data.forEach(function(row) {
      const listItem = $('<li>').addClass('room-card');
      listItem.html('<strong>ID Stanza:</strong> ' + row.id_stanza);
      listItem.on('click', function() {
      localStorage.setItem('stanza_id', row.id_stanza);
      localStorage.setItem('stanza_scheda',row.scheda);
      window.location.assign('room_dashboard_user.html');
  });      
  datas.append(listItem);
  });
  },
    error: function(error) {
    console.error('Errore durante la richiesta:', error);
    }
  });
}

function loadUserDetails(){
  $.ajax({
    url: '/api/user_infos',
    type: 'POST', // Utilizziamo il metodo POST
    dataType: 'json', // Assicurati che il server restituisca dati JSON
    success: function(data) {
      $('#nome').text("Nome: "+data[0].nome);
      $('#email').text("Email: "+data[0].email);
      $('#password').text("Password: "+data[0].password);
    },
    error: function() {
      console.error('Errore nella richiesta AJAX');
    }
  });
}