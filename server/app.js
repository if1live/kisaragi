// constants
var HTTP_PORT = 3000;

// code start
var express = require('express')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

// all environments
app.set('port', HTTP_PORT);
app.use(express.static(__dirname + '/publish'));

// TODO Game World
var g_count = 0;

//app.get('/', function(req, res) {
//  g_count += 1;
//  res.send("hello world = " + g_count);
//});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg) {
    console.log('message : ' + msg);
    io.emit('chat message', {"msg": msg});
  });
});


http.listen(app.get('port'), function() {
  console.log('http listening on *:' + app.get('port'));
});
