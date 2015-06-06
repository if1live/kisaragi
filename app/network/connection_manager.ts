// Ŭnicode please
///<reference path="../app.d.ts"/>

if (typeof module !== 'undefined') {
    var uuid = require('node-uuid');
}

module kisaragi {
    export class ConnectionManager {
        sendQueue: Queue<BaseResponse>;
        recvQueue: Queue<Request>;
       
        io: SocketIO.Server;
        connList: ServerConnection[];
        
        constructor(io: SocketIO.Server) {
            this.sendQueue = new Queue<BaseResponse>();
            this.recvQueue = new Queue<Request>();
            
            this.io = io;
            this.connList = [];
        }
        addSendPacket(res: BaseResponse) {
            this.sendQueue.push(res);
        }
        addRecvPacket(req: Request) {
            this.recvQueue.push(req);
        }
        
        create_socketIO(socket: SocketIO.Socket): ServerConnection {
            var conn = ServerConnection.socketIO(uuid.v1(), socket, this.io);
            conn.mgr = this;
            
            this.connList.push(conn);
            return conn;
        }
        create_mock(): MockServerConnection {
            var uuid_val = uuid.v1();
            var conn = ServerConnection.mock(uuid_val);
            conn.mgr = this;
            
            this.connList.push(conn);
            return conn;
        }
        create_local(): ServerConnection {
            var conn = ServerConnection.local();
            conn.mgr = this;

            this.connList.push(conn);
            return conn;
        }
        
        send(res: Response) {
            res.conn.sendImmediate(res.packet);
        }
        broadcast(res: Broadcast) {
            res.conn.broadcastImmediate(res.packet, res.zoneId);
        }
        globalBroadcast(res: GlobalBroadcast) {
            res.conn.globalBroadcastImmediate(res.packet);
        }
                
        flushSendQueue() {
            while(this.sendQueue.isEmpty() === false) {
                var cmd = this.sendQueue.pop();
                if (cmd.resType == ResponseType.Response) {
                    this.send(<Response> cmd);
                } else if (cmd.resType == ResponseType.Broadcast) {
                    this.broadcast(<Broadcast> cmd);
                } else if (cmd.resType == ResponseType.GlobalBroadcast) {
                    this.globalBroadcast(<GlobalBroadcast> cmd);
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