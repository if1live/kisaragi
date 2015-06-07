// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    export enum ServerConnectionCategory {
        SocketIO,
        Local,
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
        globalBroadcast(packet: BasePacket) {
            var elem = new GlobalBroadcast(packet, this);
            this.mgr.addSendPacket(elem);
        }

        sendImmediate(packet: BasePacket) {
            //console.log("Send[id=" + this.userId + "] " + packet.command + " : " + JSON.stringify(packet.toJson()));
            this._sendImpl(packet);
        }
        broadcastImmediate(packet: BasePacket, players: Player[]) {
            //console.log("Broadcast[id=" + this.userId + "] " + packet.command + " : " + JSON.stringify(packet.toJson()));
            this._broadcastImpl(packet, players);
        }
        globalBroadcastImmediate(packet: BasePacket) {
            //console.log("GlobalBroadcast[id=" + this.userId + "] " + packet.command + " : " + JSON.stringify(packet.toJson()));
            this._globalBroadcastImpl(packet);
        }

        _sendImpl(packet: BasePacket) { }
        _broadcastImpl(packet: BasePacket, players: Player[]) { }
        _globalBroadcastImpl(packet: BasePacket) { }

        
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

            this.registerHandler(PacketType.GameRestart, (req: Request, packet: GameRestartPacket, world: GameWorld) => {
                if (self.user) {
                    // remove previous user
                    var factory = new PacketFactory();
                    var removeObjectPacket = factory.removeObject(self.user.movableId);
                    self.broadcast(removeObjectPacket);
                    world.remove(self.user);
                    self.user = null;
                }

                var user = world.createUser(self);
                self.user = user;
                world.addUser(user);
                console.log(`[User=${self.user.movableId}] restart`);
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

            this.registerHandler(PacketType.RequestAttack, (req: Request, packet: RequestAttackPacket, world: GameWorld) => {
                self.user.c2s_requestAttack(world, packet);
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
        static local() {
            return new ServerConnection_Local();
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
            this.socket.emit(packet.command, packet.toJson());
        }
        _broadcastImpl(packet: BasePacket, players: Player[]) {
            // 같은 구역한테만 알림 보내기
            // user room
            _.each(players, (player: Player) => {
                player.svrConn._sendImpl(packet);
            });
        }
        _globalBroadcastImpl(packet: BasePacket) {
            this.io.emit(packet.command, packet.toJson());
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

    export class ServerConnection_Local extends ServerConnection {
        sendQueue: Queue<BasePacket>

        constructor() {
            // 싱글 플레이니까 uuid가 없어도된다
            super(ServerConnectionCategory.Local, '');
            this.sendQueue = new Queue<BasePacket>();
        }
        _sendImpl(packet: BasePacket) {
            this.sendQueue.push(packet);
        }
        _broadcastImpl(packet: BasePacket, players: Player[]) {
            this.sendQueue.push(packet);
        }
        _globalBroadcastImpl(packet: BasePacket) {
            this.sendQueue.push(packet);
        }
    }

    export class MockServerConnection extends ServerConnection {
        sendedPacket: BasePacket;
        broadcastedPacket: BasePacket;
        globalBroadcastedPacket: BasePacket;

        constructor(uuid_val: string) {
            super(ServerConnectionCategory.Mock, uuid_val);
            this.sendedPacket = null;
            this.broadcastedPacket = null;
            this.globalBroadcastedPacket = null;
        }

        _sendImpl(packet: BasePacket) {
            this.sendedPacket = packet;
        }
        _broadcastImpl(packet: BasePacket, players: Player[]) {
            this.broadcastedPacket = packet;
        }
        _globalBroadcastImpl(packet: BasePacket) {
            this.globalBroadcastedPacket = packet;
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.ServerConnectionCategory = kisaragi.ServerConnectionCategory;
    exports.ServerConnection = kisaragi.ServerConnection;
    exports.MockServerConnection = kisaragi.MockServerConnection;
    exports.ServerConnection_SocketIO = kisaragi.ServerConnection_SocketIO;
    exports.ServerConnection_Local = kisaragi.ServerConnection_Local;
}