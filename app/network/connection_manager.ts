// Ŭnicode please
///<reference path="../app.d.ts"/>

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
        
        createConnection_socketIO(socket: SocketIO.Socket): ServerConnection {
            var conn = ServerConnection.socketIO(uuid.v1(), socket, this.io);
            conn.mgr = this;
            this.registerConnectionHandler(conn);
            
            this.connList.push(conn);
            return conn;
        }
        createConnection_mock(): ServerConnection {
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
                conn.registerHandler(packetType, function(data) {
                    var packet = PacketFactory.createFromJson(data);
                    var svrPacket = new ServerReceivedPacket(packet, conn);
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
    }
}

declare var exports: any;
if(typeof exports !== 'undefined') {
    exports.ConnectionManager = kisaragi.ConnectionManager;
}