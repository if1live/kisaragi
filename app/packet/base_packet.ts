 // Ŭnicode please
module kisaragi {
    export class BasePacket {
        packetType: PacketType;

        constructor(packetType: PacketType) {
            this.packetType = packetType;
        }
        _generateJson(): any {
            return {};
        }
        toJson(): any {
            var data = this._generateJson();
            data.packetType = this.packetType;
            return data;
        }
        loadJson(data: any) { }

        get command(): string {
            return null;
        }
    }

    export enum ServerSendablePacketType {
        Send,
        Broadcast
    }
    
    export class ServerSendablePacket {
        sendType: ServerSendablePacketType;
        packet: BasePacket;
        conn: ServerConnection;
        
        constructor(sendableType: ServerSendablePacketType, packet: BasePacket, conn: ServerConnection) {
            this.sendType = sendableType;
            this.packet = packet;
            this.conn = conn;
        }
        
        static send(packet: BasePacket, conn: ServerConnection) {
            return new ServerSendablePacket(ServerSendablePacketType.Send, packet, conn);
        }
        static broadcast(packet: BasePacket, conn: ServerConnection) {
            return new ServerSendablePacket(ServerSendablePacketType.Broadcast, packet, conn);
        }
    }
    
    export class ServerReceivedPacket {
        packet: BasePacket;
        conn: ServerConnection;
        
        constructor(packet: BasePacket, conn: ServerConnection) {
            this.packet = packet;
            this.conn = conn;
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.BasePacket = kisaragi.BasePacket;
    exports.ServerSendablePacketType = kisaragi.ServerSendablePacketType;
    exports.ServerSendablePacket = kisaragi.ServerSendablePacket;
    exports.ServerReceivedPacket = kisaragi.ServerReceivedPacket;
    
}

