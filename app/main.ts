// Ŭnicode please
///<reference path="app.d.ts"/>

import serveStatic = require('serve-static');
import express = require('express');
var app = express();
var http = require('http').Server(app);
var io: SocketIO.Server = require('socket.io')(http);
var gameloop = require('node-gameloop');

if (typeof module !== 'undefined') {
    var kisaragi = require('./kisaragi');
}

// all environments
app.set('port', kisaragi.HTTP_PORT);
app.set('view engine', 'ejs');
app.use('/static', serveStatic(__dirname + '/../static'));
app.use(serveStatic(__dirname + '/../publish'));
app.use(serveStatic(__dirname + '/../lib'));
// http://stackoverflow.com/questions/12488930/dump-an-object-in-ejs-templates-from-express3-x-views
app.locals.inspect = require('util').inspect;

// Game World
var server = new kisaragi.Server(io);
var world = new kisaragi.GameWorld(kisaragi.Role.Server);
world.loadLevelFile(__dirname + '/../res/map.txt');

app.get('/', (req, res) => {
    res.render('pages/index');
});

app.get('/game', (req, res) => {
    res.render('pages/game');
});

app.get('/admin', (req, res) => {
    res.render('pages/admin', {
        world: world,
        server: server,
        helper: new kisaragi.AdminHelper()
    });
});


io.on('connection', (socket) => {
    var client = server.connectSocketIO(socket);
    var user = world.createUser(client);
    var packet = kisaragi.PacketFactory.connect();
    client.onEvent(packet, world, user);
    console.log(`[User=${user.movableId}] connected`);

    socket.on(kisaragi.PacketFactory.toCommand(kisaragi.PacketType.Disconnect), function () {
        var client = server.find({ socket_io: socket });
        var user = client.user;
        var packet = kisaragi.PacketFactory.disconnect();
        client.onEvent(packet, world, user);

        server.disconnectSocketIO(socket);
        console.log(`[User=${user.movableId}] disconnected`);
    });


    var cmdList = [
        // for development
        kisaragi.PacketFactory.toCommand(kisaragi.PacketType.Ping),
        kisaragi.PacketFactory.toCommand(kisaragi.PacketType.Echo),
        kisaragi.PacketFactory.toCommand(kisaragi.PacketType.EchoAll),
        
        // for game
        kisaragi.PacketFactory.toCommand(kisaragi.PacketType.RequestMap),
        kisaragi.PacketFactory.toCommand(kisaragi.PacketType.RequestMove),
    ];

    function registerCommand(cmd) {
        socket.on(cmd, function (obj) {
            var client = server.find({ socket_io: socket });
            var packet = kisaragi.PacketFactory.createFromJson(obj);
            client.onEvent(packet, world, client.user);
        });
    }
    for (var i = 0; i < cmdList.length; i += 1) {
        registerCommand(cmdList[i]);
    }
});


http.listen(app.get('port'), function () {
    console.log('http listening on *:' + app.get('port'));
});

// game loop
var loopId = gameloop.setGameLoop(function (delta) {
    world.update(delta);
}, 1000.0 / kisaragi.TARGET_FPS);
