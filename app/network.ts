///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
    var uuid = require('node-uuid');
    var MockSocketIO = require('mock-socket.io');
}


module kisaragi {
    enum ServerSocketCategory {
        SocketIO,
        Mock,
    }

    export class ServerSocket {
        uuid: string;
        category: ServerSocketCategory;
        user: Entity;

        constructor(category: ServerSocketCategory, uuid_val: string) {
            this.category = category;
            this.uuid = uuid_val;
            this.user = null;
        }

        send(cmd: string, ctx) { }
        broadcast(cmd: string, ctx) { }
        onEvent(cmd: string, world, user, obj) { }
    }

    /*
    client socket for server
    */
    class ServerSocket_SocketIO extends ServerSocket {
        socket: SocketIO.Socket;
        io: SocketIO.Server;

        constructor(uuid_val: string, socket: SocketIO.Socket, io: SocketIO.Server) {
            super(ServerSocketCategory.SocketIO, uuid_val);

            var self = this;
            self.socket = socket;
            self.io = io;

            socket.on('error', function (err) {
                console.log("Socket Error Occur");
                console.error(err.stack);
            });
        }

        getAddress() {
            var self = this;
            var remoteAddr = self.socket.request.connection.remoteAddress;
            return remoteAddr.replace('::ffff:', '');
        }

        onEvent(cmd: string, world: GameWorld, user: Player, obj) {
            var self = this;
            // for development
            if (cmd === 'c2s_ping') {
                return self.send('s2c_ping', obj);
            } else if (cmd === 'c2s_echo') {
                return self.send('s2c_echo', obj);
            } else if (cmd === 'c2s_echoAll') {
                return self.broadcast('s2c_echoAll', obj);
            } 
            if (user == null) {
                console.log("User is null!!!!");
                return;
            }

            // handle event
            if (cmd == 'connect') {
                user.connect(world, obj);
            } else if (cmd == 'disconnect') {
                user.disconnect(world, obj);
            } else if (cmd == 'c2s_requestMap') {
                user.c2s_requestMap(world, obj);
            } else if (cmd == 'c2s_requestMove') {
                user.c2s_requestMove(world, obj);
            } else {
                console.log('cmd:' + cmd + ' is unknown command');
            }
        }

        send(cmd: string, ctx) {
            var self = this;
            return self.socket.emit(cmd, ctx);
        }

        broadcast(cmd: string, ctx) {
            var self = this;
            return self.io.emit(cmd, ctx);
        }
    }

    class ServerSocket_Mock extends ServerSocket {
        constructor(uuid_val: string) {
            super(ServerSocketCategory.Mock, uuid_val);
        }
    }

    export function createMockServerSocket(uuid_val: string) {
        if (uuid_val == null) {
            uuid_val = uuid.v1();
        }
        return new ServerSocket_Mock(uuid_val);
    }

    export class Server {
        io: SocketIO.Server;
        sockList: ServerSocket[];

        constructor(io: SocketIO.Server) {
            var self = this;
            self.io = io;

            self.sockList = [];
        }

        connectSocketIO(socket: SocketIO.Socket): ServerSocket {
            var self = this;
            var sock = new ServerSocket_SocketIO(uuid.v1(), socket, self.io);
            self.sockList.push(sock);
            return sock;
        };

        find(opts): ServerSocket {
            var self = this;

            var filterTable = {
                'uuid': (sock: ServerSocket) => {
                    return sock.uuid == opts.uuid;
                },
                'socket_io': (sock) => {
                    return sock.socket == opts.socket_io;
                }
            };

            for (var key in filterTable) {
                if (opts[key] !== undefined) {
                    var filtered = self.sockList.filter(filterTable[key]);
                    return (filtered.length > 0) ? filtered[0] : null;
                }
            }
            return null;
        }

        disconnectSocketIO(socket: SocketIO.Socket): boolean {
            var self = this;
            var sock = self.find({ socket_io: socket });
            if (sock == null) {
                return false;
            }
            self.sockList = _.reject(self.sockList, function (x) { return x === sock; });
            return true;
        }
    }

    // mock
    export function createMockSocketIOServer() {
        var MockSocketIOServer = MockSocketIO.Server;
        return new MockSocketIOServer();
    }
    export function createMockSocketIOClient(io: SocketIO.Server) {
        var MockSocketIOClient = MockSocketIO.Client;
        return new MockSocketIOClient(io);
    }

    interface IPingRenderer {
        render(count: number, curr: number, average: number, min: number, max: number);
    }

    export class HtmlPingRenderer implements IPingRenderer {
        displayId: string;

        constductor(displayId: string) {
            this.displayId = displayId;
        }

        render(count: number, curr: number, average: number, min: number, max: number) {
            var self = this;
            var root = document.getElementById(self.displayId);
            if (!root) {
                return;
            }
            var table = [
                { name: '.ping-count', val: count },
                { name: '.ping-curr', val: curr },
                { name: '.ping-average', val: average },
                { name: '.ping-min', val: min },
                { name: '.ping-max', val: max }
            ];
            _.each(table, (elem) => {
                var node = root.querySelector(elem.name);
                if (node) {
                    node.textContent = elem.val.toString();
                }
            });
        }
    }

    export class ClientPing {
        logs: number[] = [];
        socket: SocketIOClient.Socket = null;
        duration: number = 2000;
        windowSize: number = 30;
        count: number = 0;

        renderer: IPingRenderer = null;

        constructor(socket: SocketIOClient.Socket) {
            var self = this;
            self.socket = socket;

            socket.on('s2c_ping', function (obj) {
                self.count += 1;
                var now = Date.now();
                var prev = obj.timestamp;
                var diff = now - prev;
                if (self.logs.length < self.windowSize) {
                    self.logs.push(diff);
                } else {
                    self.logs.splice(0, 1);
                    self.logs.push(diff);
                }

                if (self.renderer !== null) {
                    self.renderer.render(self.count, self.last(), self.average(), self.min(), self.max());
                }

                setTimeout(function () {
                    self.ping();
                }, self.duration);
                //console.log("ping : " + diff + "ms");
            });
        }

        ping() {
            var self = this;
            var timestamp = Date.now();
            self.socket.emit('c2s_ping', { timestamp: timestamp });
        }

        max() {
            if (this.logs.length === 0) {
                return 0;
            }
            return _.max(this.logs);
        }

        min() {
            if (this.logs.length === 0) {
                return 0;
            }
            return _.min(this.logs);
        }

        last() {
            if (this.logs.length === 0) {
                return 0;
            }
            return this.logs[this.logs.length - 1];
        }

        average() {
            if (this.logs.length === 0) {
                return 0;
            }
            var sum = _.reduce(this.logs, (memo: number, num: number) => { return memo + num; }, 0);
            var average = sum / this.logs.length;
            return Math.ceil(average);
        }
    }

    export class ClientEcho {
        socket: SocketIOClient.Socket;

        constructor(socket: SocketIOClient.Socket, callbacks) {
            var self = this;
            self.socket = socket;

            var echoCallback = (ctx) => {
                self.dumpCommunication('echo', ctx);
            };
            var echoAllCallback = (ctx) => {
                self.dumpCommunication('echoAll', ctx);
            };

            if (callbacks !== undefined) {
                if (callbacks.echo) {
                    echoCallback = callbacks.echo;
                }
                if (callbacks.echoAll) {
                    echoAllCallback = callbacks.echoAll;
                }
            }

            socket.on('s2c_echo', echoCallback);
            socket.on('s2c_echoAll', echoAllCallback);
        }

        dumpCommunication(cmd, obj) {
            console.log(cmd + " : " + JSON.stringify(obj));
        }

        echo(ctx) {
            this.socket.emit('c2s_echo', ctx);
        }

        echoAll(ctx) {
            this.socket.emit('c2s_echoAll', ctx);
        }
    }
}

declare var exports: any;
if (typeof exports != 'undefined') {
    exports.Enemy = kisaragi.Enemy;
    exports.ServerSocket = kisaragi.ServerSocket;
    exports.Server = kisaragi.Server;
    
    exports.createMockSocketIOServer = kisaragi.createMockSocketIOServer;
    exports.createMockSocketIOClient = kisaragi.createMockSocketIOClient;

    exports.HtmlPingRenderer = kisaragi.HtmlPingRenderer;
    exports.ClientPing = kisaragi.ClientPing;
    exports.ClientEcho = kisaragi.ClientEcho;
}

