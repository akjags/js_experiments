// IMPORT MODULES 
const express = require('express');
const app = express();
const fs = require('fs'); 
const mongo_client = require('mongodb').MongoClient;
const { MongoClient } = require('mongodb');
const assert = require('assert');
const https = require('https');
const socket_io = require('socket.io');



// set database and collection we'll be using
const database_name = 'tutorial'
const collection_name = 'jsPsych_demo'
 
// set base directory across modules 
global.__base = __dirname + '/';

// SETUP TRAFFIC PERMISSIONS (MONGO/HTTPS/firewall)

// firewall permitted port we'll use
const external_port = 8888; 
// location of ssl and mongo credentials
const credentials = '../credentials/'
// extract relevant info from SSL key and certification
const options = {
  key:  fs.readFileSync(credentials + "ssl_privatekey"),
  cert: fs.readFileSync(credentials + "ssl_certificate")
};


// setup server-side port using credentials 
const server = https.createServer(options,app)
const io = socket_io(server)
// extract mongo authentification keys
const db_key = JSON.parse(fs.readFileSync(credentials + 'mongo_keys')); 
// construct string from port and authentification data
const mongo_url = `mongodb://${db_key.user}:${db_key.pwd}@127.0.0.1:27017`;
//console.log('mongo_url:', mongo_url)
const client = new MongoClient(mongo_url);

// DEFINE SERVER SIDE OPERATIONS

// open port on the serverd 
server.listen(external_port, function() {
  // server side console log
  console.log('running on port ', external_port) 
})

// listen to incoming requests
app.get('/*', function (req, res) {
  // client response protocol
  // give everyone everything
  serve_file(req, res) 
});

// protocol for returning files to client
var serve_file = function(req, res) {
  // extract name of file requested
  var file_name = req.params[0];
   // server side console log
  console.log('\t :: express :: file requested: ' + file_name);
  // return file to client
  return res.sendFile(file_name, {root: __base});
};

// set up connection to listen for client
io.on('connection', function (socket) {
  // insertion protocol on hearing 'insert' from client
  socket.on('insert', function(user_input) {
    // server side console log
    console.log('server side: data received:\n ' + JSON.stringify(user_input));
    // call function to insert data into mongo 
    db_insert(user_input);
  }); 
  // extraction procotol on hearing 'extract' from client
  socket.on('extract', function() {
    // call function to extract data from mongo
    db_extract();
  });
});

// insert into database function
var db_insert = async function(trial_data) {
  // connect to mongo server
  await client.connect();
  if (typeof(trial_data) == 'string') { 
    // convert string to a JSON object
    var formatted_data = { text_input: trial_data}
  } else {
    var formatted_data = trial_data
  }
  const db = client.db(database_name);
  const collection = db.collection(collection_name);
  collection.insertOne(formatted_data, function(err, res) {
    console.log('\t  :: mongodb :: document inserted');
    client.close();
  });

};



// extract from database function
var db_extract = async function() {
  // connect to mongo server
  await client.connect();
  if (typeof(trial_data) == 'string') { 
    // convert string to a JSON object
    var formatted_data = { text_input: trial_data}
  } else {
    var formatted_data = trial_data
  }
  const db = client.db(database_name);
  const collection = db.collection(collection_name);

  collection.find().toArray(function(err, docs){
    // set index of random document 
    var random_document = Math.round(Math.random()*(docs.length-1))
    // server side console log
    console.log('server side: document extracted from mongodb:\n', docs[random_document])
    // send document to client
    io.emit('return_document_from_database', docs[random_document])
  });
};
