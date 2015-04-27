// constants
var HTTP_PORT = 3000;

// code start
var serveStatic = require('serve-static');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var game = require('./lib/game');

// all environments
app.set('port', HTTP_PORT);
app.set('view engine', 'ejs');
app.use(serveStatic(__dirname + '/static'));
app.use(serveStatic(__dirname + '/publish'));

// Game World
var server = new game.Server(io);
var world = new game.World();

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/admin', function(req, res) {
  res.render('admin');
});


io.on('connection', function(socket) {
  var client = server.connectClient(socket);
  console.log(`[Client=${client.uid}] connected`);

  var user = world.createUser(client);
  world.addUser(user);

  socket.on('ping', function(obj) {
    socket.emit('ping', obj);
  });

  socket.on('echo', function(obj) {
    socket.emit('echo', obj);
  });

  socket.on('disconnect', function(x) {
    var client = server.findClient({socket: socket});
    var user = world.findUser(function(x) { return x === client; });
    world.removeUser(user);
    server.disconnectClient(client);

    console.log(`[Client=${client.uid}] disconnected`);
  });
});


http.listen(app.get('port'), function() {
  console.log('http listening on *:' + app.get('port'));
});
