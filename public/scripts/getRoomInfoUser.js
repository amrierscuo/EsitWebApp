$(document).ready(function() {
  const stanzaId = localStorage.getItem('stanza_id');
  const stanzaScheda = localStorage.getItem('stanza_scheda');
  console.log(localStorage.getItem('stanza_scheda'));
  const userDetails = $('#userroomDetails');
  userDetails.html(`
    
    <h3>Stanza:</h3> ${stanzaScheda}<br>
  `);

  const socket = io('http://localhost:5000'); // Specifica l'URL del server con la porta corretta

  socket.on('connection');
  const fulltopic_alerts = '$aws/things/' + stanzaScheda + '/shadow/name/alerts';
  const fulltopic_sensors = '$aws/things/' + stanzaScheda + '/shadow/name/sensors';
  console.log(fulltopic_alerts);

  socket.on('mqtt_message', function (message) { 
    const { topic, message: msg } = message;
    console.log(message);
    if(topic === fulltopic_alerts){
      let splits = msg.split("_");
      const split0 = splits[0];
      const split1 = splits[1];
      const split2 = splits[2];  
      if(split0){
        $("#umodalità").text('Modalità: automatica');
      }
      else{
      $("#umodalità").text('Modalità: manuale');
      }
      if(split1){
      $("#uventilatore").text('Ventilatore: acceso');
      }
      else{
      $("#uventilatore").text('Ventilatore: spento');
      }
      if(split2==0){
      $("#usoglia").text('Soglia: estiva');
      }else if(split2==1){
      $("#usoglia").text('Soglia: invernale');
      }else{
      $("#usoglia").text('Soglia: custom');   
      }       
    }
    else if(topic === fulltopic_sensors){
      let splits = msg.split("C°");
      let temperature = splits[0];  // Parte prima (temperatura)
      let humidity = splits[1]; // Parte seconda (umidità e %)
      humidity = humidity.replace("%","");
      $("#uumidità").text("Umidità: "+humidity+"%");
      $("#utemperatura").text("Temperatura: "+temperature+"C°");
      $('#umqttMessageTempHum').text(msg);
    }  
  });

  socket.on('connect', function() {
    console.log('Connessione WebSocket stabilita con il server');
  });

  socket.on('connect_error', function(error) {
    console.error('Errore di connessione WebSocket:', error);
  });
});
//gestisce il frontend dell'imposta soglie
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


