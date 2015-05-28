// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
	export class ClientEcho {
        socket: SocketIOClient.Socket;

        constructor(socket: SocketIOClient.Socket, callbacks) {
            var self = this;
            self.socket = socket;

            var echoCallback = (ctx) => {
                var packet = <EchoPacket> PacketFactory.createFromJson(ctx);
                self.dumpCommunication(packet.command, packet.data);
            };
            var echoAllCallback = (ctx) => {
                var packet = <EchoAllPacket> PacketFactory.createFromJson(ctx);
                self.dumpCommunication(packet.command, packet.data);
            };

            if (callbacks !== undefined) {
                if (callbacks.echo) {
                    echoCallback = callbacks.echo;
                }
                if (callbacks.echoAll) {
                    echoAllCallback = callbacks.echoAll;
                }
            }

            socket.on(PacketFactory.toCommand(PacketType.Echo), echoCallback);
            socket.on(PacketFactory.toCommand(PacketType.EchoAll), echoAllCallback);
        }

        dumpCommunication(cmd, obj) {
            console.log(cmd + " : " + JSON.stringify(obj));
        }

        echo(ctx) {
            var factory = new PacketFactory();
            var packet = factory.echo(ctx);
            this.socket.emit(packet.command, packet.toJson());
        }

        echoAll(ctx) {
            var factory = new PacketFactory();
            var packet = factory.echoAll(ctx);
            this.socket.emit(packet.command, packet.toJson());
        }
    }
}

declare var exports: any;
if(typeof exports !== 'undefined') {
    exports.ClientEcho = kisaragi.ClientEcho;
}