// constants
var HTTP_PORT = 3000;

// code start
var serveStatic = require('serve-static');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gameloop = require('node-gameloop');

var game = require('./lib/game');
var network = require('./lib/network');

// all environments
app.set('port', HTTP_PORT);
app.set('view engine', 'ejs');
app.use(serveStatic(__dirname + '/static'));
app.use(serveStatic(__dirname + '/publish'));
// http://stackoverflow.com/questions/12488930/dump-an-object-in-ejs-templates-from-express3-x-views
app.locals.inspect = require('util').inspect;

// Game World
var server = new network.Server(io);
var world = new game.World();

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/admin', function(req, res) {
  res.render('admin', {
    world: world,
    server: server,
    helper: new game.AdminHelper()
  });
});


io.on('connection', function(socket) {
  var client = server.connectClient(socket);
  var user = world.createUser(client);
  client.onEvent('connect', world, user, {});
  console.log(`[User=${user.id}] connected`);

  socket.on('disconnect', function() {
    var client = server.findClient({socket: socket});
    var user = client.user;
    client.onEvent('disconnect', world, user, {});

    server.disconnectClient(user);
    console.log(`[User=${user.id}] disconnected`);
  });


  var cmdList = [
    // for game

    // for development
    'ping',
    'echo'
  ];

  function registerCommand(cmd) {
    socket.on(cmd, function(obj) {
      var client = server.findClient({socket: socket});
      client.onEvent(cmd, world, client.user, obj);
    });
  }
  for(var i = 0 ; i < cmdList.length ; i += 1) {
    registerCommand(cmdList[i]);
  }
});

http.listen(app.get('port'), function() {
  console.log('http listening on *:' + app.get('port'));
});

// game loop
var loopId = gameloop.setGameLoop(function(delta) {
  world.update(delta);
}, 1000/60);
