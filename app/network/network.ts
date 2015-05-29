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
    
    export enum ResponseType {
        Send,
        Broadcast
    }
    
    export class Response {
        resType: ResponseType;
        packet: BasePacket;
        conn: ServerConnection;
        
        constructor(resType: ResponseType, packet: BasePacket, conn: ServerConnection) {
            this.resType = resType;
            this.packet = packet;
            this.conn = conn;
        }
        
        static send(packet: BasePacket, conn: ServerConnection) {
            return new Response(ResponseType.Send, packet, conn);
        }
        static broadcast(packet: BasePacket, conn: ServerConnection) {
            return new Response(ResponseType.Broadcast, packet, conn);
        }
    }
    
    export class Request {
        packet: BasePacket;
        conn: ServerConnection;
        
        constructor(packet: BasePacket, conn: ServerConnection) {
            this.packet = packet;
            this.conn = conn;
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.createMockSocketIOServer = kisaragi.createMockSocketIOServer;
    exports.createMockSocketIOClient = kisaragi.createMockSocketIOClient;
    
    exports.ResponseType = kisaragi.ResponseType;
    exports.Response = kisaragi.Response;
    exports.Request = kisaragi.Request;
}

