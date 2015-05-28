// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    export class ServerEcho {
    }
    
    export class ClientEcho {
        conn: ClientConnection;
        
        // response check
        echoReceivedPacket: EchoPacket;
        echoAllReceivedPacket: EchoAllPacket;
        
        constructor(conn: ClientConnection) {
            var self = this;
            this.conn = conn;
            this.reset();
            
            conn.registerHandler(PacketType.Echo, function(packet: EchoPacket) {
                self.echoReceivedPacket = packet;
                console.log(packet.command + " : " + JSON.stringify(packet.data));
            });
            conn.registerHandler(PacketType.EchoAll, function(packet: EchoAllPacket) {
                self.echoAllReceivedPacket = packet;
                console.log(packet.command + " : " + JSON.stringify(packet.data));
            });
        }
        
        reset() {
            this.echoReceivedPacket = null;
            this.echoAllReceivedPacket = null;
        }
        
        echo(data: any) {
            var factory = new PacketFactory();
            var packet = factory.echo(data);
            this.conn.send(packet);
        }
        echoAll(data: any) {
            var factory = new PacketFactory();
            var packet = factory.echoAll(data);
            this.conn.send(packet);
        }
    }
}

declare var exports: any;
if(typeof exports !== 'undefined') {
    exports.ClientEcho = kisaragi.ClientEcho;
    exports.ServerEcho = kisaragi.ServerEcho;
}