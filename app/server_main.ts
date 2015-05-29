﻿// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    var express = require('express');
    var serveStatic = require('serve-static');
    var gameloop = require('node-gameloop');
    var http = require('http');
    var socketio = require('socket.io');
}

module kisaragi {
    export class ServerMain {
        app: any;
        http: any;
        io_http: any;

        connMgr: ConnectionManager;
        world: GameWorld;

        constructor() {
            this.app = express();
            this.http = http.Server(this.app);
            this.io_http = socketio(this.http);

            this.connMgr = new ConnectionManager(this.io_http);
            this.world = new GameWorld(Role.Server);
            this.world.loadLevelFile(__dirname + '/../res/map.txt');

            this.registerView();
            this.registerSocketIO();
        }

        registerView() {
            // all environments
            this.app.set('port', HTTP_PORT);
            this.app.set('view engine', 'ejs');
            this.app.use('/static', serveStatic(__dirname + '/../static'));
            this.app.use(serveStatic(__dirname + '/../publish'));
            this.app.use(serveStatic(__dirname + '/../lib'));
            // http://stackoverflow.com/questions/12488930/dump-an-object-in-ejs-templates-from-express3-x-views
            this.app.locals.inspect = require('util').inspect;


            this.app.get('/', (req, res) => {
                res.render('pages/index');
            });

            this.app.get('/game', (req, res) => {
                res.render('pages/game');
            });

            this.app.get('/admin', (req, res) => {
                res.render('pages/admin', {
                    world: this.world,
                    connMgr: this.connMgr,
                    helper: new AdminHelper()
                });
            });
        }

        registerSocketIO() {
            var self = this;
            var factory = new PacketFactory();
            
            this.io_http.on('connection', (socket) => {
                self.registerSocketIO_ConnectHandler(socket);
                self.registerSocketIO_DisconnectHandler(socket);
                self.registerSocketIO_CommonHandler(socket);
            });
        }

        registerSocketIO_ConnectHandler(socket: SocketIO.Socket) {
            // 이름을 다른것과 맞추려고 handler라고 했지만
            // 즉시 처리되기 때문에 핸들러라고 할수 없다
            var self = this;
            var factory = new PacketFactory();

            var conn = self.connMgr.create_socketIO(socket);
            var user = self.world.createUser(conn);
            var packet = factory.createConnect();
            conn.onEvent(packet, self.world, user);
            console.log(`[User=${user.movableId}] connected`);
        }

        registerSocketIO_DisconnectHandler(socket: SocketIO.Socket) {
            var self = this;
            var factory = new PacketFactory();

            socket.on(PacketFactory.toCommand(PacketType.Disconnect), function () {
                var conn = self.connMgr.find({ socket_io: socket });
                var user = conn.user;
                var packet = factory.createDisconnect();
                conn.onEvent(packet, self.world, user);

                self.connMgr.destroy(conn);
                console.log(`[User=${user.movableId}] disconnected`);
            });
        }

        registerSocketIO_CommonHandler(socket: SocketIO.Socket) {
            var self = this;
            function registerCommand(cmd) {
                socket.on(cmd, function (obj) {
                    var packet = PacketFactory.createFromJson(obj);
                    if (packet == null) {
                        return;
                    }

                    var conn = self.connMgr.find({ socket_io: socket })
                    //var msg = "Receive[id=" + conn.userId + "] ";
                    //msg += packet.command + " : " + JSON.stringify(packet.toJson());
                    //console.log(msg);
                    conn.onEvent(packet, self.world, conn.user);
                });
            }

            for (var i = 0; i < allPacketTypeList.length; i += 1) {
                var packetType = allPacketTypeList[i];
                var cmd = PacketFactory.toCommand(packetType);
                registerCommand(cmd);
            }
        }

        update(delta: number) {
            this.world.update(delta);
        }

        run() {
            var self = this;

            this.http.listen(self.app.get('port'), function () {
                console.log('http listening on *:' + self.app.get('port'));
            });
            //create game loop
            var loopId = gameloop.setGameLoop(function (delta: number) {
                self.update(delta);
            }, 1000.0 / TARGET_FPS);
        }
    }
}

if (typeof exports !== 'undefined') {
    exports.ServerMain = kisaragi.ServerMain;
}

