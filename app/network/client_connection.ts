// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    export enum ClientConnectionCategory {
        SocketIO,
        Local,
        Mock
    }

    interface ClientHandlerFunc {
        (packet: BasePacket);
    }

    export class ClientConnection {
        category: ClientConnectionCategory;
        handlerTable: any;

        constructor(category: ClientConnectionCategory) {
            this.category = category;
            this.handlerTable = {};
        }

        send(packet: BasePacket) { }
        
        handle(packet: BasePacket) {
            var handler = this.handlerTable[packet.packetType];
            if (typeof handler !== 'undefined') {
                handler(packet);
            }
        }

        registerHandlerPreHook(category: PacketType, handler: ClientHandlerFunc) { }
        registerHandlerPostHook(category: PacketType, handler: ClientHandlerFunc) { }

        registerHandler(category: PacketType, handler: ClientHandlerFunc) {
            this.registerHandlerPreHook(category, handler);
            this.handlerTable[category] = handler;
            this.registerHandlerPostHook(category, handler);
        }

        static mock(): MockClientConnection {
            return new MockClientConnection();
        }
        static socketIO(sock: SocketIOClient.Socket) {
            return new ClientConnection_SocketIO(sock);
        }
        static local() {
            return new ClientConnection_Local();
        }
    }

    export class MockClientConnection extends ClientConnection {
        // for unit test
        sendedPacket: BasePacket;
        
        constructor() {
            super(ClientConnectionCategory.Mock);
            this.sendedPacket = null;
        }
        send(packet: BasePacket) {
            this.sendedPacket = packet;
        }
    }

    class ClientConnection_SocketIO extends ClientConnection {
        sock: SocketIOClient.Socket;

        constructor(sock: SocketIOClient.Socket) {
            super(ClientConnectionCategory.SocketIO);
            this.sock = sock;
        }

        send(packet: BasePacket) {
            this.sock.emit(packet.command, packet.toJson());
        }

        registerHandlerPostHook(category: PacketType, handler: ClientHandlerFunc) {
            var self = this;
            var command = PacketFactory.toCommand(category)
            this.sock.on(command, function (data) {
                var packet = PacketFactory.createFromJson(data);
                self.handle(packet);
            });
        }
    }

    export class ClientConnection_Local extends ClientConnection {
        sendQueue: Queue<BasePacket>;

        constructor() {
            super(ClientConnectionCategory.Local);
            this.sendQueue = new Queue<BasePacket>();
        }
        send(packet: BasePacket) {
            this.sendQueue.push(packet);
        }
    }
}

if (typeof exports !== 'undefined') {
    exports.ClientConnectionCategory = kisaragi.ClientConnectionCategory;
    exports.ClientConnection = kisaragi.ClientConnection;
    exports.MockClientConnection = kisaragi.MockClientConnection;
    exports.ClientConnection_Local = kisaragi.ClientConnection_Local;
}

