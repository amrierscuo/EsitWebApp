//Script per disegnare i grafici
$(document).ready(function () {
    var canvasTemp = document.getElementById('myChartTemp');
    var canvasHum = document.getElementById('myChartHum');
    const scheda_withdots = localStorage.getItem('stanza_scheda');
    const scheda_without= scheda_withdots.replace(/:/g, '');
    console.log(scheda_without);
    const temperatureArray=[];
    const humidityArray=[];
    $.ajax({
        url: '/api/queryDynamoDB',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            data.forEach((dato, index) => {
                temperatureArray.push(parseFloat(dato.temperature));
                humidityArray.push(parseFloat(dato.humidity));
              });
       }
    }
    );

    const times = ['1','2','3','4','5'];
    var dataTemp = {
        labels : times,
        datasets: [{
            label: 'Andamento temperatura',
            data: temperatureArray,
            showLine: true, 
            fill: false,   
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 2
        }]
    };

    var options = {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom'
            },
            y: {
                beginAtZero: true
            }
        }
    };

    var ctxTemp = document.getElementById('myChartTemp').getContext('2d');
    var myChartTem = new Chart(ctxTemp, {
        type: 'line',
        data: dataTemp,
        options: options
    });

    var dataHum = {
        labels: times,
        datasets: [{
            label: 'Andamento umidità',
            data: humidityArray,
            showLine: true, 
            fill: false,    
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2
        }]
    };
    
    var options = {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom'
            },
            y: {
                beginAtZero: true
            }
        }
    };

    var ctxHum = document.getElementById('myChartHum').getContext('2d');
    var myChartHum = new Chart(ctxHum, {
        type: 'line',
        data: dataHum,
        options: options
    });
});