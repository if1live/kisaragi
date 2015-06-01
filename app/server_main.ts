// Ŭnicode please
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
            this.world.zone(0).loadLevelFile(__dirname + '/../res/map-0.txt');
            this.world.zone(1).loadLevelFile(__dirname + '/../res/map-1.txt');
            this.world.zone(2).loadLevelFile(__dirname + '/../res/map-2.txt');

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
                var factory = new PacketFactory();
                var conn = self.connMgr.create_socketIO(socket);
                conn.initializeHandler();

                var packet = factory.createConnect();
                var req = new Request(packet, conn);
                self.connMgr.addRecvPacket(req);
            });
        }

        update(delta: number) {
            var recvQueue = this.connMgr.recvQueue;
            while (recvQueue.isEmpty() == false) {
                var recv = recvQueue.pop();
                recv.conn.handle(recv, this.world);
            }

            this.world.update(delta);

            this.connMgr.flushSendQueue();
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

