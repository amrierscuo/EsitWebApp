//carica tutte le stanze
function loadRooms() {
  fetch('http://localhost:5000/api/list_rooms')
    .then(response => response.json())
    .then(data => {
      const datas = document.getElementById('rooms');
      // Itera attraverso i risultati e crea gli elementi HTML
      data.forEach(row => {
        const listItem = document.createElement('li');
        listItem.classList.add('room-card');
        listItem.innerHTML = `
          <strong>ID Stanza:</strong> ${row.id}<br>
          <strong>Scheda Stanza:</strong> ${row.scheda}<br>
        `;
        // Aggiungi un listener per il clic sull'elemento della lista
        listItem.addEventListener('click', () => {
          //Memorizza i dati nel Local Storage
          console.log(row.id);
          localStorage.setItem('stanza_id', row.id);
          localStorage.setItem('stanza_scheda', row.scheda);

          // Reindirizza alla pagina successiva
          window.location.assign('room_dashboard_admin.html');
        });
        datas.appendChild(listItem); // Usa "datas" per aggiungere l'elemento alla lista
      });
    })
    .catch(error => console.error('Errore durante la richiesta:', error));
}
//gestore frontend lista stanze
$(document).ready(function(){
  $("#rooms").hide();
  $("h1.hdash").click(function(){
    $(this).next("ul.cardboard-room").toggle();
    if ($(this).next("ul.cardboard-room").is(":visible")) {
      $(this).css("background-color", "#3399ff");
      $(this).css("color", "white");
    } else {
      $(this).css("background-color", "white");
      $(this).css("color", "black");
    }
  });
});
//Gestore frontend
$(document).ready(function(){
  $('#assign').hide();
  $('#createroom').hide();
  $('#disassign').hide();
  $('#hcreateroom').click(function() {
    $('#createroom').toggle(); 
    if ($('#createroom').is(':visible')) {
      $('#hcreateroom').css('background-color', '#3399ff');
      $('#hcreateroom').css('color', 'white');
    } else {
      $('#hcreateroom').css('background-color', 'white');
      $('#hcreateroom').css('color', 'black');
    }
  });
  $('#hassign').click(function() {
    $('#assign').toggle(); 
    if ($('#assign').is(':visible')) {
      $('#hassign').css('background-color', '#3399ff');
      $('#hassign').css('color', 'white');
    } else {
      $('#hassign').css('background-color', 'white');
      $('#hassign').css('color', 'black');
    }
  });
  $('#hdisassign').click(function() {
    $('#disassign').toggle(); 
    if ($('#disassign').is(':visible')) {
      $('#hdisassign').css('background-color', '#3399ff');
      $('#hdisassign').css('color', 'white');
    } else {
      $('#hdisassign').css('background-color', 'white');
      $('#hdisassign').css('color', 'black');
    }
  });
});
// Crea una nuova stanza
$("#createRoomForm").submit(function(e) {
  e.preventDefault();
  var scheda = $("#scheda").val();
  $.post("/api/rooms", { scheda }, function() {
    // refreshes le stanze
    $.get("/api/rooms", function(data) {
      $("#rooms").empty();
      data.forEach(function(room) {
        $("#rooms").append(`<p>Room ID: ${room.id}, Scheda: ${room.scheda}</p>`);
      });
    });
  });
});

// Recupera le stanze associate al caricamento della pagina
$.get("/api/user_rooms", function(data) {
// visualizza le stanze associate
$("#userRooms").empty();
data.forEach(function(userRoom) {
  $("#userRooms").append(`<p>User ID: ${userRoom.utente_id}, User Name: ${userRoom.utente_nome}, Room ID: ${userRoom.stanza_id}, Scheda: ${userRoom.stanza_scheda}</p>`);
});
});
//recupera lista utenti per l'assegnamento/disassegnamento della stanza
$(document).ready(function() {
  $.ajax({
      url: "/api/list_users",
      method: "POST", 
      success: function(utenti) {
          var select = $("#utenti");
          $.each(utenti, function(index, utente) {
              select.append($("<option>", {
                  value: utente.id,
                  text: "Nome: "+utente.nome + ", Id:" + utente.id
              }));
          });
          var selectd = $("#utentid");
          $.each(utenti, function(index, utente) {
            selectd.append($("<option>", {
                value: utente.id,
                text: "Nome: "+utente.nome + ", Id:" + utente.id
            }));
        });
      },
      error: function() {
          alert("Errore durante il recupero della lista di utenti.");
      }
  });
});
//recupera stanze non assegnate a un utente
$(document).ready(function() {
  $("#utenti").change(function() {
      var selectedValue = $(this).val();
      $.ajax({
          url: "/api/notuser_rooms", // Endpoint del server
          method: "POST",
          data: { id_utente: selectedValue }, // Dati da inviare al server
          success: function(response) {
            var stanze = $("#stanze");
            stanze.empty(); // Rimuove le opzioni precedenti (se presenti)
            // Popola la seconda select con i nuovi valori
            $.each(response, function(index, stanza) {
                stanze.append($("<option>", {
                    value: stanza.id,
                    text: "Scheda: "+stanza.scheda+ " ID: "+stanza.id
                }));
            });
        },
        error: function() {
            alert("Non puoi assegnare stanze a quest'utente.");
        }
      });
  });
});
//recupera stanze assegnate a un utente
$(document).ready(function() {
  $("#utentid").change(function() {
      var selectedValue = $(this).val();
      $.ajax({
          url: "/api/user_rooms_admin", // Endpoint del server
          method: "POST",
          data: { id_utente: selectedValue }, // Dati da inviare al server
          success: function(response) {
            var stanze = $("#stanzed");
            stanze.empty(); // Rimuove le opzioni precedenti (se presenti)
            // Popola la seconda select con i nuovi valori
            $.each(response, function(index, stanza) {
                stanze.append($("<option>", {
                    value: stanza.id_stanza,
                    text: "Scheda: "+stanza.scheda+ " ID: "+stanza.id_stanza
                }));
            });
        },
        error: function() {
            alert("Non puoi assegnare stanze a quest'utente.");
        }
      });
  });
});
//validazione parametri e assegnamento stanza
$(document).ready(function() {
  $("#assignRoomForm").submit(function(event) {
    var selectedUtente = $("#utenti").val();
    var selectedStanza = $("#stanze").val();
    console.log(selectedUtente);
    console.log(selectedStanza);

    if (selectedUtente === "utente" || selectedStanza === "stanza") {
      alert("Seleziona valori validi per Utente e Stanza.");
      event.preventDefault(); 
    } else{
      $.ajax({
        url: "/api/assign_room",
        method: "POST",
        data: { utenti: selectedUtente, stanze: selectedStanza },
        success: function(response) {
          
        },
        error: function() {
          alert("Errore durante l'assegnamento della stanza");
        }
      });
    }
  });
  
});
//validazione parametri e disassegnamento stanza
$(document).ready(function() {
  $("#disassociateRoomForm").submit(function(event) {
    var selectedUtente = $("#utentid").val();
    var selectedStanza = $("#stanzed").val();
    console.log(selectedUtente);
    console.log(selectedStanza);
    if (selectedUtente === "utente" || selectedStanza === "stanza") {
      alert("Seleziona valori validi per Utente e Stanza.");
      event.preventDefault(); 
    } else{
      $.ajax({
        url: "/api/disassign_room",
        method: "POST",
        data: { utenti: selectedUtente, stanze: selectedStanza },
        success: function(response) {
          alert("stanza disassegnata con successo");
        },
        error: function() {
          alert("Errore durante la disassociazione della stanza");
        }
      });
    }
  });
  
});
//Aggiungi stanza nel database controllando che non ce ne sia una con la stessa scheda
$(document).ready(function() {
  $("#createRoomForm").submit(function(event) {
    event.preventDefault();
    var scheda = $("#scheda").val();
    $.ajax({
      url: "/api/verifica_scheda",
      method: "POST",
      data: { scheda: scheda },
      success: function(response) {
        $.ajax({
          url: "/api/create_room",
          method: "POST",
          data: { scheda: scheda },
          success: function(response) {
            // Gestisci la risposta della richiesta di inserimento
          },
          error: function() {
            alert("Errore durante la registrazione della stanza");
          }
        });
      },
      error: function() {
        alert("La scheda è già presente nel database");
      }
    });
  });
});



document.addEventListener('DOMContentLoaded', loadRooms);


  

 