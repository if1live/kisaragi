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

        sendQueue: Queue<ServerSendablePacket>;
        recvQueue: Queue<BasePacket>;

        constructor(category: ServerConnectionCategory, uuid_val: string) {
            this.category = category;
            this.uuid = uuid_val;
            this.user = null;

            this.sendQueue = new Queue<ServerSendablePacket>();
            this.recvQueue = new Queue<BasePacket>();
        }

        send(packet: BasePacket) {
            var elem = ServerSendablePacket.send(packet, this);
            this.sendQueue.push(elem);
        }
        broadcast(packet: BasePacket) {
            var elem = ServerSendablePacket.broadcast(packet, this);
            this.sendQueue.push(elem);
        }

        sendImmediate(packet: BasePacket) { }
        broadcastImmediate(packet: BasePacket) { }
        
        flushSendQueue() {
            while (this.sendQueue.isEmpty() === false) {
                var sendPacket = this.sendQueue.pop();
                if (sendPacket.sendType === ServerSendablePacketType.Send) {
                    this.sendImmediate(sendPacket.packet);
                } else if (sendPacket.sendType === ServerSendablePacketType.Broadcast) {
                    this.broadcastImmediate(sendPacket.packet);
                }
            }
        }

        flushRecvQueue(world: GameWorld, user: Player) {
            while (this.recvQueue.isEmpty() === false) {
                var packet = this.recvQueue.pop();
                this.onEvent(packet, world, user);
            }
        }

        onEvent(packet: BasePacket, world: GameWorld, user: Player) { }

        static mock(uuid_val: string) {
            if (!!uuid_val) {
                uuid_val = uuid.v1();
            }
            return new ServerConnection_Mock(uuid_val);
        }

        static socketIO(uuid_val: string, socket: SocketIO.Socket, io: SocketIO.Server) {
            var sock = new ServerConnection_SocketIO(uuid_val, socket, io);
            return sock;
        }

        get userId(): number {
            if (this.user) {
                return this.user.movableId;
            } else {
                return -1;
            }
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

        sendImmediate(packet: BasePacket) {
            //console.log("Send[id=" + this.userId + "] " + packet.command + " : " + JSON.stringify(packet.toJson()));
            return this.socket.emit(packet.command, packet.toJson());
        }

        broadcastImmediate(packet: BasePacket) {
            //console.log("Broadcast[id=" + this.userId + "] " + packet.command + " : " + JSON.stringify(packet.toJson()));
            return this.io.emit(packet.command, packet.toJson());
        }
    }

    class ServerConnection_Mock extends ServerConnection {
        constructor(uuid_val: string) {
            super(ServerConnectionCategory.Mock, uuid_val);
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.ServerConnection = kisaragi.ServerConnection;
}