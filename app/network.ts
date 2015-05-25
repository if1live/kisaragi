// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
    var uuid = require('node-uuid');
    var MockSocketIO = require('mock-socket.io');
}


module kisaragi {
    // browser는 mock-socket.io를 사용할수 없다
    // 그래서 간단한 mock을 따로 만들어야한다
    class MockBrowserSocketIOClient {
        constructor(server: any) {
        }
        on(cmd: string, func: any) {
        }
        emit(cmd: string, data: any) {
        }
    }
    
    class MockBrowserSocketIOServer {
        on(cmd: string, func: any) {
        }
        emit(cmd: string, data: any) {
        }
    }

    export class Server {
        io: SocketIO.Server;
        sockList: ServerConnection[];

        constructor(io) {
            var self = this;
            self.io = io;

            self.sockList = [];
        }

        connectSocketIO(socket: SocketIO.Socket): ServerConnection {
            var self = this;
            var sock = ServerConnection.socketIO(uuid.v1(), socket, self.io);
            self.sockList.push(sock);
            return sock;
        };

        find(opts): ServerConnection {
            var self = this;

            var filterTable = {
                'uuid': (sock: ServerConnection) => {
                    return sock.uuid === opts.uuid;
                },
                'socket_io': (sock) => {
                    return sock.socket === opts.socket_io;
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
            if (sock === null) {
                return false;
            }
            self.sockList = _.reject(self.sockList, function (x) { return x === sock; });
            return true;
        }
    }

    // mock
    export function createMockSocketIOServer() {
        if (typeof module !== 'undefined') {
            var MockSocketIOServer = MockSocketIO.Server;
            return new MockSocketIOServer();
        } else {
            return new MockBrowserSocketIOServer();
        }
    }
    export function createMockSocketIOClient(io: SocketIO.Server) {
        if (typeof module !== 'undefined') {
            var MockSocketIOClient = MockSocketIO.Client;
            return new MockSocketIOClient(io);
        } else {
            return new MockBrowserSocketIOClient(io);
        }
    }

    interface IPingRenderer {
        render(count: number, curr: number, average: number, min: number, max: number);
    }

    export class HtmlPingRenderer implements IPingRenderer {
        displayId: string;

        constructor(displayId: string) {
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

            socket.on(PacketFactory.toCommand(PacketType.Ping), function (obj) {
                var packet = <PingPacket> PacketFactory.createFromJson(obj);
                
                self.count += 1;
                var now = Date.now();
                var prev = packet.timestamp;
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
            var factory = new PacketFactory();
            var packet = factory.ping();
            self.socket.emit(packet.command, packet.toJson());
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
                var packet = <EchoPacket> PacketFactory.createFromJson(ctx);
                self.dumpCommunication(packet.command, packet.data);
            };
            var echoAllCallback = (ctx) => {
                var packet = <EchoAllPacket> PacketFactory.createFromJson(ctx);
                self.dumpCommunication(packet.command, packet.data);
            };

            if (callbacks !== undefined) {
                if (callbacks.echo) {
                    echoCallback = callbacks.echo;
                }
                if (callbacks.echoAll) {
                    echoAllCallback = callbacks.echoAll;
                }
            }

            socket.on(PacketFactory.toCommand(PacketType.Echo), echoCallback);
            socket.on(PacketFactory.toCommand(PacketType.EchoAll), echoAllCallback);
        }

        dumpCommunication(cmd, obj) {
            console.log(cmd + " : " + JSON.stringify(obj));
        }

        echo(ctx) {
            var factory = new PacketFactory();
            var packet = factory.echo(ctx);
            this.socket.emit(packet.command, packet.toJson());
        }

        echoAll(ctx) {
            var factory = new PacketFactory();
            var packet = factory.echoAll(ctx);
            this.socket.emit(packet.command, packet.toJson());
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.ServerConnection = kisaragi.ServerConnection;
    exports.Server = kisaragi.Server;
    
    exports.createMockSocketIOServer = kisaragi.createMockSocketIOServer;
    exports.createMockSocketIOClient = kisaragi.createMockSocketIOClient;

    exports.HtmlPingRenderer = kisaragi.HtmlPingRenderer;
    exports.ClientPing = kisaragi.ClientPing;
    exports.ClientEcho = kisaragi.ClientEcho;
}

