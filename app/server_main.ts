// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    var express = require('express');
    var serveStatic = require('serve-static');
    var app = express();
    var http = require('http').Server(app);
    var io_http = require('socket.io')(http);
    var gameloop = require('node-gameloop');
}

module kisaragi {
    export class ServerMain {
        main() {
            // all environments
            app.set('port', HTTP_PORT);
            app.set('view engine', 'ejs');
            app.use('/static', serveStatic(__dirname + '/../static'));
            app.use(serveStatic(__dirname + '/../publish'));
            app.use(serveStatic(__dirname + '/../lib'));
            // http://stackoverflow.com/questions/12488930/dump-an-object-in-ejs-templates-from-express3-x-views
            app.locals.inspect = require('util').inspect;

            // Game World
            var server = new Server(io_http);
            var world = new GameWorld(Role.Server);
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
                    helper: new AdminHelper()
                });
            });

            var factory = new PacketFactory();

            io_http.on('connection', (socket) => {
                var client = server.connectSocketIO(socket);
                var user = world.createUser(client);
                var packet = factory.createConnect();
                client.onEvent(packet, world, user);
                console.log(`[User=${user.movableId}] connected`);

                socket.on(PacketFactory.toCommand(PacketType.Disconnect), function () {
                    var client = server.find({ socket_io: socket });
                    var user = client.user;
                    var packet = factory.createDisconnect();
                    client.onEvent(packet, world, user);

                    server.disconnectSocketIO(socket);
                    console.log(`[User=${user.movableId}] disconnected`);
                });


                var cmdList = [
                    // for development
                    PacketFactory.toCommand(PacketType.Ping),
                    PacketFactory.toCommand(PacketType.Echo),
                    PacketFactory.toCommand(PacketType.EchoAll),
        
                    // for game
                    PacketFactory.toCommand(PacketType.RequestMap),
                    PacketFactory.toCommand(PacketType.RequestMove),
                ];

                function registerCommand(cmd) {
                    socket.on(cmd, function (obj) {
                        var client = server.find({ socket_io: socket });
                        var packet = PacketFactory.createFromJson(obj);
                        //console.log("Receive[id=" + client.userId + "] " + packet.command + " : " + JSON.stringify(packet.toJson()));
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
            }, 1000.0 / TARGET_FPS);
        }
    }
}
if (typeof exports !== 'undefined') {
    exports.ServerMain = kisaragi.ServerMain;
}

