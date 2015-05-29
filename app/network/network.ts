// Ŭnicode please
///<reference path="../app.d.ts"/>

if (typeof module !== 'undefined') {
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
    exports.createMockSocketIOServer = kisaragi.createMockSocketIOServer;
    exports.createMockSocketIOClient = kisaragi.createMockSocketIOClient;
}

