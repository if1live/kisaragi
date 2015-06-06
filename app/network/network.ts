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
        Response,
        Broadcast,
        GlobalBroadcast,
    }
    export class BaseResponse {
        resType: ResponseType;
        packet: BasePacket;
        conn: ServerConnection;
        
        constructor(resType: ResponseType, packet: BasePacket, conn: ServerConnection) {
            if(packet == null) { throw "response : null packet"; }
            this.resType = resType;
            this.packet = packet;
            this.conn = conn;
        }
    }
    
    export class Broadcast extends BaseResponse {
        players: Player[];

        constructor(packet: BasePacket, conn: ServerConnection) {
            super(ResponseType.Broadcast, packet, conn);
            var zone = conn.user.zone;
            
            var self = this;
            this.players = [];
            _.each(zone.entityMgr.findAll({ category: Category.Player }), (ent: Player) => {
                self.players.push(ent);
            });
        }
    }
    
    export class Response extends BaseResponse {
        constructor(packet: BasePacket, conn: ServerConnection) {
            super(ResponseType.Response, packet, conn);
        }
    }

    export class GlobalBroadcast extends BaseResponse {
        constructor(packet: BasePacket, conn: ServerConnection) {
            super(ResponseType.GlobalBroadcast, packet, conn);
        }
    }
    
    export class Request {
        packet: BasePacket;
        conn: ServerConnection;
        
        constructor(packet: BasePacket, conn: ServerConnection) {
            if(packet == null) { throw "request : null packet"; }
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
    exports.BaseResponse = kisaragi.BaseResponse;
    exports.GlobalBroadcast = kisaragi.GlobalBroadcast;
    exports.Broadcast = kisaragi.Broadcast;
    exports.Response = kisaragi.Response;
    exports.Request = kisaragi.Request;
}

