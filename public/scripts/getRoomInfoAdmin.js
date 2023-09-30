//Script che coordina la gestione di una stanza dell'admin
//aggiunta dati stanza
$(document).ready(function(){
  caricaDati();
  const stanzaId = localStorage.getItem('stanza_id');
  const stanzaScheda = localStorage.getItem('stanza_scheda');
  const roomDetails = $('#roomDetails');
  roomDetails.html = `
  <strong>ID Stanza:</strong> ${stanzaId}<br>
  <strong>Scheda Stanza:</strong> ${stanzaScheda}<br>
  `;
});
$(document).ready(function() {
  $('#inputs').hide();
  $('#menu').change(function() {
    var selectedOption = $(this).val();

    if (selectedOption === 'opzione3') {
      $('#inputs').show();
    } else {
      $('#inputs').hide();
    }
  });
});
//div monitoraggio  
$(document).ready(function() {
    $('#monitoraggio').hide(); 
    $('#roomDetails').hide();
    $('#hmonitoraggio').click(function() {
        $('#monitoraggio').toggle(); 
        if ($('#monitoraggio').is(':visible')) {
          $('#hmonitoraggio').css('background-color', '#3399ff');
          $('#hmonitoraggio').css('color', 'white');
        } else {
          $('#hmonitoraggio').css('background-color', 'white');
          $('#hmonitoraggio').css('color', 'black');
        }
    });
    $('#hsettings').click(function() {
        $('#roomDetails').toggle();
        if ($('#roomDetails').is(':visible')) {
          $('#hsettings').css('background-color', '#3399ff');
          $('#hsettings').css('color', 'white');
        } else {
          $('#hsettings').css('background-color', 'white');
          $('#hsettings').css('color', 'black');
        }
    });
});  
function caricaDati(){
  const stanzaId = localStorage.getItem('stanza_id');
  $.ajax({
    url: '/api/listusers_room', 
    type: 'POST', 
    dataType: 'json',
    data: {id_stanza: stanzaId},
    success: function(response) {
      if (response.length === 0) {
        $('#husers').html('Stanza non assegnata');
      } else {
        $('#husers').html('Stanza assegnata');
      }
    },
    error: function() {
      console.error('Errore nella richiesta AJAX');
    }
  });
}
//messaggi in tempo reale da scheda

const socket = io('http://localhost:5000'); 
socket.on('connection')
const stanzaScheda = localStorage.getItem('stanza_scheda');
const fulltopic_alerts = '$aws/things/'+stanzaScheda+ '/shadow/name/alerts';
const fulltopic_sensors = '$aws/things/'+stanzaScheda+'/shadow/name/sensors';
socket.on('mqtt_message', function (message) { 
  const { topic, message: msg } = message;
  if(topic === fulltopic_alerts){
    let splits = msg.split("_");
    const split0 = splits[0];
    const split1 = splits[1];
    const split2 = splits[2];  
    if(split0){
      $("#modalità").text('Modalità: automatica');
    }
    else{
    $("#modalità").text('Modalità: manuale');
    }
    if(split1){
    $("#ventilatore").text('Ventilatore: acceso');
    }
    else{
    $("#ventilatore").text('Ventilatore: spento');
    }
    if(split2==0){
    $("#soglia").text('Soglia: estiva');
    }else if(split2==1){
    $("#soglia").text('Soglia: invernale');
    }else{
    $("#soglia").text('Soglia: custom');   
    }       
  }
  else if(topic === fulltopic_sensors){
    let splits = msg.split("C°");
    let temperature = splits[0];  // Parte prima (temperatura)
    let humidity = splits[1]; // Parte seconda (umidità e %)
    humidity = humidity.replace("%","");
    $("#umidità").text("Umidità: "+humidity+"%");
    $("#temperatura").text("Temperatura: "+temperature+"C°");
    $('#mqttMessageTempHum').text(msg);
  }  
});

socket.on('connect', function () {
  console.log('Connessione WebSocket stabilita con il server');
});

socket.on('connect_error', function (error) {
  console.error('Errore di connessione WebSocket:', error);
});



  