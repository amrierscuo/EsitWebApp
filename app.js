
const express = require('express');
const session = require('express-session');
const pg = require('pg');
const AWS = require('aws-sdk');
const port = process.env.PORT || 5000;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server,{cors: {origin: "*"}});
const awsIot = require('aws-iot-device-sdk');


const dynamodb = new AWS.DynamoDB.DocumentClient();

//credenziali aws(tutte le credenziali nel codice son sostituite da XXXXXX)
AWS.config.update({
  region: 'eu-central-1', 
  accessKeyId: 'XXXXXX', 
  secretAccessKey: 'XXXXXX'
});

//API MIDDLEWARES
app.use(express.json());//accept data in json format
app.use(express.urlencoded());//decode the data send through html form
app.use(express.static('public'));
//CONNESSIONE AL DB
const pool = new pg.Pool({
  user: 'XXXXXX',
  password: 'XXXXXX',
  host: 'XXXXXX',
  port: XXXXXX,
  database: 'XXXXXX',
});
// Middleware per gestire le sessioni degli utenti. 
app.use(
  session({
    secret: 'chiavi', // Chiave segreta per la firma delle sessioni
    resave: false,
    saveUninitialized: true,
  })
);



//API ROUTES
app.get('/login',(req,res)=>{
  res.sendFile(__dirname+'/public/index.html');
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(__dirname+ '/public/user_dashboard.html');
});

app.get('/admin_dashboard', requireAdmin, (req, res) => {
  res.sendFile(__dirname+ '/public/admin_dashboard.html');
});

app.get('/error',(req,res)=>{
  res.sendFile(__dirname+'/public/error.html');
});
// Questa API ritorna un elenco di tutte le stanze disponibili.
app.get('/api/list_rooms', requireAdmin, (req, res) => {
  pool.query('SELECT * FROM stanze', (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.json(result.rows);
  });
});
// Questa API ritorna un elenco di tutte le associazioni tra utenti e stanze.
app.get('/api/user_rooms', requireAdmin, (req, res) => {
  pool.query('SELECT utenti.id AS utente_id, utenti.nome AS utente_nome, stanze.id AS stanza_id, stanze.scheda AS stanza_scheda FROM stanze_utenti JOIN utenti ON stanze_utenti.id_utente = utenti.id JOIN stanze ON stanze_utenti.id_stanza = stanze.id', (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.json(result.rows);
  });
});
app.get('/api/room/:id', requireAdmin, (req, res) => {
  const roomId = req.params.id;
  pool.query('SELECT * FROM stanze WHERE id = $1', [roomId], (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.sendStatus(404);
    }
  });
});
app.post('/api/rooms', requireAdmin, (req, res) => {
  const { scheda } = req.body;
  pool.query('INSERT INTO stanze (scheda) VALUES ($1)', [scheda], (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200); 
  });
});
app.get('/api/user_rooms_user', requireAdmin, (req, res) => {
  pool.query('SELECT utenti.id AS utente_id, utenti.nome AS utente_nome, stanze.id AS stanza_id, stanze.scheda AS stanza_scheda FROM stanze_utenti JOIN utenti ON stanze_utenti.id_utente = utenti.id JOIN stanze ON stanze_utenti.id_stanza = stanze.id', (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.json(result.rows);
  });
});
//questa api restituisce tutte le stanze assegnate a un utente loggato
app.get('/api/user_rooms_id', requireAuth, (req, res) => {
  const idutente = req.session.userId;
  pool.query('SELECT * FROM stanze join stanze_utenti on stanze.id = stanze_utenti.id_stanza WHERE id_utente = $1',[idutente], (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    console.log(result.rows);
    res.json(result.rows);
  });
});
//api che restituisce le informazioni di un utente loggato
app.post('/api/user_infos',requireAuth,(req,res)=>{
  const idutente = req.session.userId;
  pool.query('SELECT * FROM utenti WHERE id = $1',[idutente], (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.json(result.rows);
  });
});
//questa api restituisce tutte le stanze assegnate a un utente
app.post('/api/user_rooms_admin', requireAuth, (req, res) => {
  const idutente = req.body.id_utente;
  pool.query('select id_stanza,scheda from stanze_utenti left join stanze ON stanze.id = stanze_utenti.id_stanza where id_utente = $1',[idutente], (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.json(result.rows);
  });
});
//questa api permette la registrazione di un utente
app.post('/signinForm',(req,res)=>{
  const {nome,email,password,confirmpassword} = req.body;
  if(password===confirmpassword){
    insertUser(nome,email,password)
    .then(() => {
      res.redirect('/login');
    })
    .catch((err) => {
      console.error('Errore durante l\'inserimento nella tabella users:', err);
      res.redirect('/error');
    });}
  else{
    res.redirect('/error');
  }
});

app.post('/loginForm',(req,res)=>{
  const {email,password} = req.body;
  //verifica che sia un admin
  pool.query('SELECT * FROM admin WHERE username = $1 AND password = $2', [email, password], (err, result) => {
    if (result.rows.length > 0) {
      req.session.authenticated = true;
      req.session.admin = true; 
      req.session.userId = result.rows[0].id;
      res.redirect('/admin_dashboard');
      return;
    }

    //verifica che sia un user
  pool.query('SELECT * FROM utenti WHERE email = $1 AND password = $2', [email, password], (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }

    if (result.rows.length > 0) {
      //CREDENZIALI VALIDE, CREA LA SESSIONE
      req.session.authenticated = true;
      req.session.userId = result.rows[0].id;
      res.redirect('/dashboard');
    } else {
      //CREDENZIALI NON VALIDE
      res.sendFile(__dirname+'/public/error.html');
    }
  });
  });
});
//api per assegnare una stanza a un utente
app.post('/api/assign_room', requireAdmin, (req, res) => {
  const selectedUtente = req.body.utenti;
  const selectedStanza = req.body.stanze;
  console.log(selectedUtente);
  console.log(selectedStanza);
  pool.query('INSERT INTO stanze_utenti (id_utente, id_stanza) VALUES ($1, $2)', [selectedUtente, selectedStanza], (err, result) => {
     if (err) {
       console.error('Errore durante la query:', err);
       res.sendStatus(500);
       return;
     }
   });
});
//api che restituisce la lista di tutti gli utenti
app.post('/api/list_users', requireAdmin, (req, res) => {
  pool.query('SELECT * FROM utenti', (err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.json(result.rows);
  });
});
//api che restituisce le stanze non assegnate a un utente specifico
app.post('/api/notuser_rooms',requireAdmin,(req,res)=>{
  const id_utente = req.body.id_utente;
  pool.query(
    'SELECT stanze.* FROM stanze WHERE stanze.id NOT IN (SELECT id_stanza FROM stanze_utenti WHERE id_utente = $1);',
    [id_utente] ,(err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.json(result.rows);
  });
});
//api per creare una nuova stanze
app.post('/api/create_room', requireAdmin,(req,res) => {
  const scheda = req.body.scheda;
  console.log(scheda);
  pool.query(
    'INSERT INTO stanze (scheda) VALUES ($1)',[scheda],(err, result) => {
      if (err) {
        console.error("Errore nell'aggiunta di una nuova stanza", err);
      } else {
        console.log("Stanza aggiunta con successo", result);
        res.sendStatus(200);
      }
    }
  );

});
//api per rimuovere una stanza a un utente
app.post('/api/disassign_room',requireAdmin,(req, res) => {
  const selectedUtente = req.body.utenti;
  const selectedStanza = req.body.stanze;
  console.log(selectedUtente);
  console.log(selectedStanza);
  pool.query('delete from stanze_utenti where id_stanza = $1 and id_utente = $2', [selectedStanza,selectedUtente], (err, result) => {
     if (err) {
       console.error('Errore durante la query:', err);
       res.sendStatus(500);
       return;
     }
   });  
});
//api che restituisce tutti gli utenti a cui è stata assegnata una stanza specifica
app.post('/api/listusers_room',requireAdmin,(req,res)=>{
  const id_stanza = req.body.id_stanza;
  pool.query(
    'select stanze_utenti.id_utente, utenti.nome from stanze_utenti left join utenti on stanze_utenti.id_utente = utenti.id where id_stanza = $1',
    [id_stanza] ,(err, result) => {
    if (err) {
      console.error('Errore durante la query:', err);
      res.sendStatus(500);
      return;
    }
    res.json(result.rows);
  });
});

// Middleware che verifica se l'utente è autenticato. Se non lo è, reindirizza all'URL di login.
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    //SESSIONE OK
    console.log("Authentication ok");
    next();
  } else {
    //RILOGGA
    res.redirect('/login');
  }
}
// Middleware che verifica se l'utente è un admin. Se non lo è, reindirizza all'URL di login.
function requireAdmin(req, res, next) {
  if (req.session.authenticated && req.session.admin) {
    // l'utente è un admin
    next();
  } else {
    // non è un admin, reindirizza al login
    res.redirect('/login');
  }
}
const insertUser = async (nome, email, password) => {
  try {
    const query = 'INSERT INTO utenti (nome, email, password) VALUES ($1, $2, $3)';
    const values = [nome, email, password];

    const client = await pool.connect();
    await client.query(query, values);
    client.release();

    console.log('Elemento inserito con successo nella tabella users');
  } catch (err) {
    throw err;
  }
};
//api che verifica se è presente una scheda nel db
app.post('/api/verifica_scheda', (req, res) => {
  const scheda = req.body.scheda;
  pool.query('SELECT COUNT(*) AS count FROM stanze WHERE scheda = $1', [scheda], (err, result) => {
    if (err) {
      console.error('Errore durante la verifica della scheda:', err);
      res.sendStatus(500);
    } else {
      const count = parseInt(result.rows[0].count, 10);
      if (count > 0) {
        res.status(400).send('La scheda è già presente nel database');
      } else {
        res.status(200).send('La scheda non è presente nel database');
      }
    }
  });
});
// Verifica l'autenticazione prima di consentire l'accesso alla pagina protetta
app.get('/pagina-protetta', requireAuth, function(req, res) {
  // L'utente è autenticato, restituisci la pagina HTML protetta
  res.sendFile(path.join(__dirname, 'user_dashboard.html'));
});

app.get('/pagina-di-accesso', function(req, res) {
  res.sendFile(__dirname+'/public/login.html');
});
app.get('/verifica-autenticazione', function(req, res) {
  // Controlla lo stato di autenticazione dell'utente
  if (req.session && req.session.authenticated) {
    // L'utente è autenticato
    res.status(200).send('Utente autenticato');
  } else {
    // L'utente non è autenticato
    res.status(401).send('Utente non autenticato');
  }
});
app.get('/verifica-autenticazione-admin', function(req, res) {
  // Controlla lo stato di autenticazione dell'utente
  if (req.session && req.session.authenticated && req.session.admin)  {
    // L'utente è autenticato
    res.status(200).send('Admin autenticato');
  } else {
    // L'utente non è autenticato
    res.status(401).send('Admin non autenticato');
  }
});

server.listen(5000,()=>{
  console.log("Server listening");
  startServer();
})

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log("Errore durante la distruzione della sessione:", err);
    } else {
      res.redirect('/login'); // Reindirizza alla pagina di login dopo il logout
    }
  });
});

app.get('/api/queryDynamoDB', (req, res) => {
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: '84F3EB76E99B',
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan. Error:", JSON.stringify(err, null, 2));
      res.status(500).json({ error: 'Unable to retrieve data' });
    } else {
      
      data.Items.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      const formattedData = data.Items.slice(0, 5).map(item => {
        const parts = item.payload.reported.split('C°');
        const temperature = parts[0];
        const humidity = parts[1].match(/\d+\.\d+/g)[0];
        return {
          temperature: temperature,
          humidity: parseFloat(humidity),
        };
      });
      res.json(formattedData);
    }
  });
});

io.on('connection', (socket)=>{console.log(socket.id);});
async function getTopicsFromDatabase() {
  try {
    const queryResult = await pool.query('SELECT scheda FROM stanze');
    console.log(queryResult.rows.map(row=>row.scheda));
    return queryResult.rows.map(row => row.scheda);
  } catch (err) {
    console.error('Error executing query:', err.message);
    throw err;
  } finally {
    
  }
}

async function startServer() {
  const topics = await getTopicsFromDatabase();
  const device = awsIot.device({
    keyPath: 'XXXXXX',
    certPath: 'XXXXXX',
    caPath: 'XXXXXX',
    clientId: 'XXXXXX',
    host: 'XXXXXX'
  });
  console.log(topics);
  //Connessione al broker MQTT di AWS
  device.on('connect', function () {
    topics.forEach(topic => {
      const fulltopic_alerts = '$aws/things/'+topic+ '/shadow/name/alerts';
      const fulltopic_sensors = '$aws/things/'+topic+'/shadow/name/sensors';
      device.subscribe(fulltopic_alerts);
      device.subscribe(fulltopic_sensors);
      });
  });

  // Ricezione dei messaggi MQTT e invio al client web
  device.on('message', function (topic, message) {
    const jsonObject = JSON.parse(message);
    if(topic.includes('/shadow/name/alerts')){
    message = jsonObject.automatic+'_'+jsonObject.on+'_'+jsonObject.soglia;
    console.log(message);
    }  
    if(topic.includes('/shadow/name/sensors')){
    message = jsonObject.reported;
    console.log(message);  
    }
    io.emit('mqtt_message', { topic, message
    }
    );
  });
 }

app.post('/mqtt/setVent', function(req, res) {
  const device = awsIot.device({
    keyPath: 'XXXXXX',
    certPath: 'XXXXXX',
    caPath: 'XXXXXX',
    clientId: 'XXXXXX',
    host: 'XXXXXX'
  });
  const {selectedOption, stanza}  = req.body;
  const arrived = selectedOption;
  
  console.log(req.body);
  const topic = '$aws/things/'+stanza+'/shadow/name/alerts';
  const message = {
    message: arrived
  };
  device.publish(topic, JSON.stringify(message), function(err) {
    if (err) {
      console.error('Errore durante la pubblicazione del messaggio:', err);
    } 
    device.end();
  });
});

app.post('/mqtt/setMode', function(req, res) {
  const device = awsIot.device({
    keyPath: 'XXXXXX',
    certPath: 'XXXXXX',
    caPath: 'XXXXXX',
    clientId: 'XXXXXX',
    host: 'XXXXXX'
  });
  const {selectedOption, stanza}  = req.body;
  const arrived = selectedOption;
  
  console.log(req.body);
  const topic = '$aws/things/'+stanza+'/shadow/name/alerts';
  const message = {
    message: arrived
  };
  device.publish(topic, JSON.stringify(message), function(err) {
    if (err) {
      console.error('Errore durante la pubblicazione del messaggio:', err);
    } 
    device.end();
  });
});

app.post('/mqtt/setSoglia', function(req,res){
  const device = awsIot.device({
    keyPath: 'XXXXXX',
    certPath: 'XXXXXX',
    caPath: 'XXXXXX',
    clientId: 'XXXXXX',
    host: 'XXXXXX'
  })
  const requestDataKey = Object.keys(req.body)[0];
  
try {
  const requestData = JSON.parse(requestDataKey);
  console.log(requestData);

  const dati = requestData.dati;
  const stanza = requestData.stanza;

  const selezione = dati.selezione;
  const temperatura = dati.temperatura;
  const umidita = dati.umidita;
  const topic = '$aws/things/'+stanza+'/shadow/name/alerts';
  console.log(selezione);
  console.log(temperatura);
  console.log(umidita);
  console.log(stanza);
  var message;
  if(selezione === 'opzione3'){
    message = {
      message: "soglia_custom",
      temp: temperatura,
      hum: umidita
    };
  }
  else if(selezione === 'opzione1'){
    message = {
      message: "soglia_estiva"
    }
  }
  else if(selezione === 'opzione2'){
    message = {
      message: "soglia_invernale"
    }
  }
  console.log(message);
  device.publish(topic, JSON.stringify(message), function(err) {
    if (err) {
      console.error('Errore durante la pubblicazione del messaggio:', err);
    } 
    device.end();
  });
  res.status(200).json({ messaggio: 'Dati ricevuti e processati con successo' });
} catch (error) {
  console.error('Si è verificato un errore:', error);
  res.status(400).json({ errore: 'Errore nella richiesta' });
}
});


  
