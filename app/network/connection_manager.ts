// Ŭnicode please
///<reference path="../app.d.ts"/>

if (typeof module !== 'undefined') {
    var uuid = require('node-uuid');
}

module kisaragi {
    export class ConnectionManager {
        sendQueue: Queue<BaseServerCommand>;
        recvQueue: Queue<Request>;
       
        io: SocketIO.Server;
        connList: ServerConnection[];
        
        constructor(io: SocketIO.Server) {
            this.sendQueue = new Queue<BaseServerCommand>();
            this.recvQueue = new Queue<Request>();
            
            this.io = io;
            this.connList = [];
        }
        addSendPacket(res: BaseServerCommand) {
            this.sendQueue.push(res);
        }
        addRecvPacket(req: Request) {
            this.recvQueue.push(req);
        }
        
        create_socketIO(socket: SocketIO.Socket): ServerConnection {
            var conn = ServerConnection.socketIO(uuid.v1(), socket, this.io);
            conn.mgr = this;
            this.registerConnectionHandler(conn);
            
            this.connList.push(conn);
            return conn;
        }
        create_mock(): MockServerConnection {
            var uuid_val = uuid.v1();
            var conn = ServerConnection.mock(uuid_val);
            conn.mgr = this;
            this.registerConnectionHandler(conn);
            
            this.connList.push(conn);
            return conn;
        }
        
        send(res: Response) {
            res.conn.sendImmediate(res.packet);
        }
        broadcast(res: Broadcast) {
            res.conn.broadcastImmediate(res.packet);
        }
        
        registerConnectionHandler(conn: ServerConnection) {
            var self = this;
            for(var i = 0 ; i < allPacketTypeList.length ; i += 1) {
                var packetType = allPacketTypeList[i];
                conn.registerHandler(packetType, function (data) {
                    var packet = PacketFactory.createFromJson(data);
                    var req = new Request(packet, conn);
                    //var msg = "Receive[id=" + conn.userId + "] ";
                    //msg += packet.command + " : " + JSON.stringify(packet.toJson());
                    //console.log(msg);
                    self.addRecvPacket(req);
                });
            }
        }
        
        flushSendQueue() {
            while(this.sendQueue.isEmpty() === false) {
                var cmd = this.sendQueue.pop();
                if(cmd.cmdType == ServerCommandType.Response) {
                    this.send(cmd);
                } else if(cmd.cmdType == ServerCommandType.Broadcast) {
                    this.broadcast(cmd);
                } else {
                    throw "not valid";
                }
            }
        }

        find(opts): ServerConnection {
            var self = this;

            var filterTable = {
                'uuid': (conn: ServerConnection) => {
                    return conn.uuid === opts.uuid;
                },
                'socket_io': (conn: ServerConnection) => {
                    if (conn.category == ServerConnectionCategory.SocketIO) {
                        var x = <ServerConnection_SocketIO> conn;
                        return x.socket === opts.socket_io;
                    } else {
                        return false;
                    }
                }
            };

            for (var key in filterTable) {
                if (opts[key] !== undefined) {
                    var filtered = self.connList.filter(filterTable[key]);
                    return (filtered.length > 0) ? filtered[0] : null;
                }
            }
            return null;
        }

        destroy(conn: ServerConnection) {
            if (conn == null) {
                return false;
            }
            this.connList = _.reject(this.connList, function (x) { return x === conn; });
            return true;
        }
    }
}

declare var exports: any;
if(typeof exports !== 'undefined') {
    exports.ConnectionManager = kisaragi.ConnectionManager;
}