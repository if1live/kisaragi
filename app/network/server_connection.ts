// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    export enum ServerConnectionCategory {
        SocketIO,
        Mock,
    }
    
    interface ServerHandlerFunc {
        (req: Request, packet: BasePacket, world: GameWorld);
    }

    export class ServerConnection {
        uuid: string;
        category: ServerConnectionCategory;
        user: Player;
        mgr: ConnectionManager;
        handlerTable: any;

        constructor(category: ServerConnectionCategory, uuid_val: string) {
            this.category = category;
            this.uuid = uuid_val;
            this.user = null;
            this.mgr = null;
            this.handlerTable = {};
        }

        get userId(): number {
            if (this.user) {
                return this.user.movableId;
            } else {
                return -1;
            }
        }

        send(packet: BasePacket) {
            var elem = new Response(packet, this);
            this.mgr.addSendPacket(elem);
        }
        broadcast(packet: BasePacket) {
            var elem = new Broadcast(packet, this);
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

        
        registerHandler(category: PacketType, handler: ServerHandlerFunc) {
            this.handlerTable[category] = handler;
        }
        
        initializeHandler() {
            var self = this;
            
            this.registerHandler(PacketType.Ping, (req: Request, packet: PingPacket, world: GameWorld) => {
                var serverPing = new ServerPing();
                serverPing.handle(req);
            });
            
            this.registerHandler(PacketType.Echo, (req: Request, packet: EchoPacket, world: GameWorld) => {
                var serverEcho = new ServerEcho();
                serverEcho.handle(req);
            });
                
            this.registerHandler(PacketType.EchoAll, (req: Request, packet: EchoAllPacket, world: GameWorld) => {
                var serverEcho = new ServerEcho();
                serverEcho.handle(req);
            });
                
            this.registerHandler(PacketType.Connect, (req: Request, packet: ConnectPacket, world: GameWorld) => {
                var user = world.createUser(self);
                self.user = user;
                world.addUser(user);
                console.log(`[User=${self.user.movableId}] connected`);
                self.user.connect(world, packet);
            });
            
            this.registerHandler(PacketType.Disconnect, (req: Request, packet: DisconnectPacket, world: GameWorld) => {
                self.user.disconnect(world, packet);
                self.mgr.destroy(self);
                console.log(`[User=${self.user.movableId}] disconnected`);
            });
                
            this.registerHandler(PacketType.RequestMap, (req: Request, packet: RequestMapPacket, world: GameWorld) => {
                self.user.c2s_requestMap(world, packet);
            });
            
            this.registerHandler(PacketType.RequestMove, (req: Request, packet: RequestMovePacket, world: GameWorld) => {
                self.user.c2s_requestMove(world, packet);
            });
            
            this.registerHandler(PacketType.RequestJumpZone, (req: Request, packet: RequestJumpZonePacket, world: GameWorld) => {
                self.user.c2s_requestJumpZone(world, packet);
            })
        }

        getAddress() {
            return '127.0.0.1';
        }

        handle(req: Request, world: GameWorld) {
            var handler = this.handlerTable[req.packet.packetType];
            if(typeof handler == 'undefined') {
                return;
            }
            handler(req, req.packet, world);
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
    export class ServerConnection_SocketIO extends ServerConnection {
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
        
        registerHandler(category: PacketType, handler: ServerHandlerFunc) {
            var self = this;
            self.handlerTable[category] = handler;
            
            var command = PacketFactory.toCommand(category)
            this.socket.on(command, function(data) {
                var packet = PacketFactory.createFromJson(data);
                var req = new Request(packet, self);
                //var msg = "Receive[id=" + conn.userId + "] ";
                //msg += packet.command + " : " + JSON.stringify(packet.toJson());
                //console.log(msg);
                self.mgr.addRecvPacket(req);
            });
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
    exports.ServerConnectionCategory = kisaragi.ServerConnectionCategory;
    exports.ServerConnection = kisaragi.ServerConnection;
    exports.MockServerConnection = kisaragi.MockServerConnection;
    exports.ServerConnection_SocketIO = kisaragi.ServerConnection_SocketIO;
}