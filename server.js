const mongo = require('mongodb').MongoClient;
// const client = require('socket.io').listen(4000).sockets;
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = 3000;
const app = express();
const server = http.Server(app);

app.use(express.static('client'))

server.listen(port);

const io = socketIo(server);

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/del', function(req, res) {
  mongo.connect('mongodb://localhost/mongo-chat', function(err, db) {
    if(err) {
      throw err;
    }
      let chat = db.collection('chats');
      chat.remove({}, function() {
        if (err) {
          res.send('An error occurred.')
          console.log(err);
        }
        // Emit cleared
        // socket.emit('cleared');
        console.log('Chat history deleted.');
        res.send('Done.')
      });
    });
});


// // Connect to Mongo
mongo.connect('mongodb://localhost/mongo-chat', function(err, db) {
  if(err) {
    throw err;
  }
  console.log('MongoDB connected...');

  // Connect to Socket.io
  io.on('connection', function(socket) {
    let chat = db.collection('chats');

    // Create function to send status
    sendStatus = function(s){
      socket.emit('status', s);
    }

    // Get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if(err) {
        throw err;
      }

      // Emit the messages
      socket.emit('output', res);
    });

    socket.on('input', function(data) {
      let name = data.name;
      let message = data.message;
      let time = data.time;

      // Check for name and message
      if(name == '' || message == ''){
        // Send ERROR status
        sendStatus('Please enter a name and message.')
      } else {
        // Insert message
        chat.insert({name: name, message: message, time: time}, function(){
          io.emit('output', [data]);

          // Send SUCCESS status object
          sendStatus({
            message: 'Message sent.',
            clear: true
          });
        });
      }
    });

    // Handle Clear
    socket.on('clear', function(data){
      // Remove all chats from the colleciton
      chat.remove({}, function(){
        // Emit cleared
        socket.emit('cleared');
      });
    });

    // Handle Disconnect
    socket.on('disconnect', function() {
      console.log('Disconnected socket!');
      socket.disconnect();
      socket = null;

    });

  });
});
