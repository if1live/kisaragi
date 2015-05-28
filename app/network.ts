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
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Server = kisaragi.Server;
    
    exports.createMockSocketIOServer = kisaragi.createMockSocketIOServer;
    exports.createMockSocketIOClient = kisaragi.createMockSocketIOClient;

    
}

