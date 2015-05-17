///<reference path="app.d.ts"/>

// constants
var HTTP_PORT: number = 8001;

import serveStatic = require('serve-static');
import express = require('express');
var app = express();
var http = require('http').Server(app);
var io: SocketIO.Server = require('socket.io')(http);
var gameloop = require('node-gameloop');


// all environments
app.set('port', HTTP_PORT);
app.set('view engine', 'ejs');
app.use(serveStatic(__dirname + '/../static'));
app.use(serveStatic(__dirname + '/../publish'));
app.use(serveStatic(__dirname + '/../lib'));
// http://stackoverflow.com/questions/12488930/dump-an-object-in-ejs-templates-from-express3-x-views
app.locals.inspect = require('util').inspect;

if (typeof module !== 'undefined') {
    var kisaragi = require('./kisaragi');
}

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
    client.onEvent('connect', world, user, {});
    console.log(`[User=${user.movableId}] connected`);

    socket.on('disconnect', function () {
        var client = server.find({ socket_io: socket });
        var user = client.user;
        client.onEvent('disconnect', world, user, {});

        server.disconnectSocketIO(socket);
        console.log(`[User=${user.movableId}] disconnected`);
    });


    var cmdList = [
        // for game
        // 게임 기본 정보 요청
        'c2s_requestMap',

        // 이동
        'c2s_requestMove',

        // for development
        'c2s_ping',
        'c2s_echo',
        'c2s_echoAll'
    ];

    function registerCommand(cmd) {
        socket.on(cmd, function (obj) {
            var client = server.find({ socket_io: socket });
            client.onEvent(cmd, world, client.user, obj);
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
var TARGET_FPS = 60;
var loopId = gameloop.setGameLoop(function (delta) {
    world.update(delta);
}, 1000.0 / TARGET_FPS);
