// Ŭnicode please
///<reference path="app.d.ts"/>

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

        send(packet: BasePacket) { }
        broadcast(packet: BasePacket) { }
        onEvent(packet: BasePacket, world: GameWorld, user: Player) { }

        static mockServerSocket(uuid_val: string) {
            if (!!uuid_val) {
                uuid_val = uuid.v1();
            }
            return new ServerSocket_Mock(uuid_val);
        }

        static socketIO(uuid_val: string, socket: SocketIO.Socket, io: SocketIO.Server) {
            var sock = new ServerSocket_SocketIO(uuid_val, socket, io);
            return sock;
        }
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

        onEvent(packet: BasePacket, world: GameWorld, user: Player) {
            var self = this;
            var cmd = packet.command;
            
            // for development
            if (cmd === PacketFactory.toCommand(PacketType.Ping)) {
                return self.send(packet);
            } else if (cmd === PacketFactory.toCommand(PacketType.Echo)) {
                return self.send(packet);
            } else if (cmd === PacketFactory.toCommand(PacketType.EchoAll)) {
                return self.broadcast(packet);
            }

            if (user === null) {
                console.log("User is null!!!!");
                return;
            }

            // handle event
            if (cmd === PacketFactory.toCommand(PacketType.Connect)) {
                user.connect(world, <ConnectPacket> packet);
            } else if (cmd === PacketFactory.toCommand(PacketType.Disconnect)) {
                user.disconnect(world, <DisconnectPacket> packet);
            } else if (cmd === PacketFactory.toCommand(PacketType.RequestMap)) {
                user.c2s_requestMap(world, <RequestMapPacket> packet);
            } else if (cmd === PacketFactory.toCommand(PacketType.RequestMove)) {
                user.c2s_requestMove(world, <RequestMovePacket> packet);
            } else {
                console.log('cmd:' + cmd + ' is unknown command');
            }
        }

        send(packet: BasePacket) {
            var self = this;
            return self.socket.emit(packet.command, packet.toJson());
        }

        broadcast(packet: BasePacket) {
            var self = this;
            return self.io.emit(packet.command, packet.toJson());
        }
    }

    class ServerSocket_Mock extends ServerSocket {
        constructor(uuid_val: string) {
            super(ServerSocketCategory.Mock, uuid_val);
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.ServerSocket = kisaragi.ServerSocket;
}