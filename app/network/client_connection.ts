 // Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    enum ClientConnectionCategory {
        SocketIO,
        Mock
    }

    interface HandlerFunc {
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
            handler(packet);
        }

        registerHandler(category: PacketType, handler: HandlerFunc) {
            this.handlerTable[category] = handler;
        }

        static mock(): MockClientConnection {
            return new MockClientConnection();
        }
        static socketIO(sock: SocketIOClient.Socket) {
            return new ClientConnection_SocketIO(sock);
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

        registerHandler(category: PacketType, handler: HandlerFunc) {
            var self = this;
            this.handlerTable[category] = handler;

            var command = PacketFactory.toCommand(category)
            this.sock.on(command, function (data) {
                var packet = PacketFactory.createFromJson(data);
                self.handle(packet);
            });
        }
    }

}

if (typeof exports !== 'undefined') {
    exports.ClientConnection = kisaragi.ClientConnection;
    exports.MockClientConnection = kisaragi.MockClientConnection;
}

