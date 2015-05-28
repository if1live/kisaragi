// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    enum ServerConnectionCategory {
        SocketIO,
        Mock,
    }

    export class ServerConnection {
        uuid: string;
        category: ServerConnectionCategory;
        user: Player;
        mgr: ConnectionManager;

        constructor(category: ServerConnectionCategory, uuid_val: string) {
            this.category = category;
            this.uuid = uuid_val;
            this.user = null;
            this.mgr = null;
        }

        get userId(): number {
            if (this.user) {
                return this.user.movableId;
            } else {
                return -1;
            }
        }

        send(packet: BasePacket) {
            var elem = ServerSendablePacket.send(packet, this);
            this.mgr.addSendPacket(elem);
        }
        broadcast(packet: BasePacket) {
            var elem = ServerSendablePacket.broadcast(packet, this);
            this.mgr.addSendPacket(elem);
        }

        sendImmediate(packet: BasePacket) {
            //console.log("Send[id=" + this.userId + "] " + packet.command + " : " + JSON.stringify(packet.toJson()));
            this._sendImpl(packet);
        }
        broadcastImmediate(packet: BasePacket) {
            //console.log("Broadcast[id=" + this.userId + "] " + packet.command + " : " + JSON.stringify(packet.toJson()));
            this._broadcastImpl(packet);
        }

        _sendImpl(packet: BasePacket) { }
        _broadcastImpl(packet: BasePacket) { }

        
        registerHandler(category: PacketType, handler: any) { }

        getAddress() {
            return '127.0.0.1';
        }

        onEvent(packet: BasePacket, world: GameWorld, user: Player) {
            var self = this;
            var cmd = packet.command;
            
            // for development
            if (cmd === PacketFactory.toCommand(PacketType.Ping)) {
                self.sendImmediate(packet);
                return;
            } else if (cmd === PacketFactory.toCommand(PacketType.Echo)) {
                self.sendImmediate(packet);
                return;
            } else if (cmd === PacketFactory.toCommand(PacketType.EchoAll)) {
                self.broadcastImmediate(packet);
                return;
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

        static mock(uuid_val: string) {
            return new MockServerConnection(uuid_val);
        }

        static socketIO(uuid_val: string, socket: SocketIO.Socket, io: SocketIO.Server) {
            var sock = new ServerConnection_SocketIO(uuid_val, socket, io);
            return sock;
        }
    }

    /*
    client socket for server
    */
    class ServerConnection_SocketIO extends ServerConnection {
        socket: SocketIO.Socket;
        io: SocketIO.Server;

        constructor(uuid_val: string, socket: SocketIO.Socket, io: SocketIO.Server) {
            super(ServerConnectionCategory.SocketIO, uuid_val);

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

        _sendImpl(packet: BasePacket) {
            return this.socket.emit(packet.command, packet.toJson());
        }
        _broadcastImpl(packet: BasePacket) {
            return this.io.emit(packet.command, packet.toJson());
        }
        
        registerHandler(category: PacketType, handler: any) {
            var command = PacketFactory.toCommand(category)
            this.socket.on(command, handler);
        }
    }

    export class MockServerConnection extends ServerConnection {
        sendedPacket: BasePacket;
        broadcastedPacket: BasePacket;

        constructor(uuid_val: string) {
            super(ServerConnectionCategory.Mock, uuid_val);
            this.sendedPacket = null;
            this.broadcastedPacket = null;
        }

        _sendImpl(packet: BasePacket) {
            this.sendedPacket = packet;
        }
        _broadcastImpl(packet: BasePacket) {
            this.broadcastedPacket = packet;
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.ServerConnection = kisaragi.ServerConnection;
    exports.MockServerConnection = kisaragi.MockServerConnection;
}