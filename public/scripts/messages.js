$(document).ready(function() {
  $('#formSoglie').submit(function(event) {
    event.preventDefault();
    const stanza = localStorage.getItem('stanza_scheda');
    const selezione = $('#menu').val();

    const dati = {
      selezione: selezione
    };

    if (selezione === 'opzione3') {
      const temperatura = $('#tempe').val();
      const umidita = $('#umidita').val();
      dati.temperatura = temperatura;
      dati.umidita = umidita;
      
    }
    const formData = { dati, stanza };
    $.ajax({
      url: '/mqtt/setSoglia', 
      method: 'POST', 
      data: JSON.stringify(formData), 
      success: function(response) {
        console.log('Risposta dal server:', response);
      },
      error: function(xhr, status, error) {
        console.error('Si è verificato un errore:', error);
      }
    });
  });
});

$(document).ready(function() {
  $('#formVent').submit(function(event) {
    console.log("Evento submit");
    event.preventDefault(); 
    const stanza = localStorage.getItem('stanza_scheda');
    const selectedOption = $('input[name="opzioneven"]:checked').val();
    console.log('Opzione selezionata:', selectedOption);
    console.log(stanza);
    const formData = { selectedOption, stanza };
    
    $.ajax({
      type: 'POST',
      url: '/mqtt/setVent',
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function(data) {
        console.log('Risposta dal server:', data);
      },
      error: function(error) {
        console.error('Errore:', error);
      }
    });
  });
});

$(document).ready(function() {
  $('#formModVent').submit(function(event) {
    console.log("Evento submit");
    event.preventDefault(); 
    const stanza = localStorage.getItem('stanza_scheda');
    const selectedOption = $('input[name="opzionemod"]:checked').val();
    console.log('Opzione selezionata:', selectedOption);
    console.log(stanza);
      
    const formData = { selectedOption, stanza };
    
    $.ajax({
      type: 'POST',
      url: '/mqtt/setMode', 
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function(data) {
        console.log('Risposta dal server:', data);
      },
      error: function(error) {
        console.error('Errore:', error);
      }
    });
  });
});
 
