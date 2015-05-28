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
        sendQueue: Queue<BasePacket>;
        recvQueue: Queue<BasePacket>;

        constructor(category: ClientConnectionCategory) {
            this.category = category;
            this.handlerTable = {};
            this.sendQueue = new Queue<BasePacket>();
            this.recvQueue = new Queue<BasePacket>();
        }

        send(packet: BasePacket) {
            this.sendQueue.push(packet);
        }
        sendImmediate(packet: BasePacket) { }

        flushSend() {
            while (this.sendQueue.isEmpty() === false) {
                var packet = this.sendQueue.pop();
                this.sendImmediate(packet);
            }
        }

        registerHandler(category: PacketType, handler: HandlerFunc) {
            this.registerHandler[category] = handler;
        }

        static mock(): ClientConnection {
            return new ClientConnection_Mock();
        }
        static socketIO(sock: SocketIOClient.Socket) {
            return new ClientConnection_SocketIO(sock);
        }
    }

    class ClientConnection_Mock extends ClientConnection {
        constructor() {
            super(ClientConnectionCategory.Mock);
        }
    }

    class ClientConnection_SocketIO extends ClientConnection {
        sock: SocketIOClient.Socket;

        constructor(sock: SocketIOClient.Socket) {
            super(ClientConnectionCategory.SocketIO);
            this.sock = sock;
        }

        sendImmediate(packet: BasePacket) {
            this.sock.emit(packet.command, packet.toJson());
        }

        registerHandler(category: PacketType, handler: HandlerFunc) {
            this.registerHandler[category] = handler;

            var command = PacketFactory.toCommand(category)
            this.sock.on(command, function (data) {
                var packet = PacketFactory.createFromJson(data);
                handler(packet);
            });
        }
    }

}

if (typeof exports !== 'undefined') {
    exports.ClientConnection = kisaragi.ClientConnection;
}

