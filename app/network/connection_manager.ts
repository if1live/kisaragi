// Ŭnicode please
///<reference path="../app.d.ts"/>

if (typeof module !== 'undefined') {
    var uuid = require('node-uuid');
}

module kisaragi {
    export class ConnectionManager {
        sendQueue: Queue<ServerSendablePacket>;
        recvQueue: Queue<ServerReceivedPacket>;
       
        io: SocketIO.Server;
        connList: ServerConnection[];
        
        constructor(io: SocketIO.Server) {
            this.sendQueue = new Queue<ServerSendablePacket>();
            this.recvQueue = new Queue<ServerReceivedPacket>();
            
            this.io = io;
            this.connList = [];
        }
        addSendPacket(svrPacket: ServerSendablePacket) {
            this.sendQueue.push(svrPacket);
        }
        addRecvPacket(svrPacket: ServerReceivedPacket) {
            this.recvQueue.push(svrPacket);
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
        
        send(svrPacket: ServerSendablePacket) {
            var conn = svrPacket.conn;
            if(svrPacket.sendType === ServerSendablePacketType.Send) {
                conn.sendImmediate(svrPacket.packet);
            } else if(svrPacket.sendType === ServerSendablePacketType.Broadcast) {
                conn.broadcastImmediate(svrPacket.packet);
            } else {
                throw "not valid packet type";
            }
        }
        
        registerConnectionHandler(conn: ServerConnection) {
            var self = this;
            for(var i = 0 ; i < allPacketTypeList.length ; i += 1) {
                var packetType = allPacketTypeList[i];
                conn.registerHandler(packetType, function (data) {
                    var packet = PacketFactory.createFromJson(data);
                    var svrPacket = new ServerReceivedPacket(packet, conn);
                    //var msg = "Receive[id=" + conn.userId + "] ";
                    //msg += packet.command + " : " + JSON.stringify(packet.toJson());
                    //console.log(msg);
                    self.addRecvPacket(svrPacket);
                });
            }
        }
        
        flushSendQueue() {
            while(this.sendQueue.isEmpty() === false) {
                var svrPacket = this.sendQueue.pop();
                this.send(svrPacket);
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