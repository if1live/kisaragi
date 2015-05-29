///<reference path="../app.d.ts"/>
/*
Auto generated code
*/

module kisaragi {
    export class BasePacketFactory {
        static toCommand(packetType: PacketType): string {
            var packet = PacketFactory.create(packetType);
            return packet.command;
        }

        static createFromJson(data: any): BasePacket {
            var packetType: PacketType = data.packetType;
            var packet = PacketFactory.create(packetType);
            if (packet == null) {
                // 연결종료할때
                // data = transport close
                // 가 되면서 packet파싱에 실패, packet가 null이 된다
                var factory = new PacketFactory();
                packet = factory.createDisconnect();
            } else {
                packet.loadJson(data);
            }
            return packet;
        }

        static create(packetType: PacketType): BasePacket {
            var packetClassList = [

                PingPacket,
                EchoPacket,
                EchoAllPacket,
                ConnectPacket,
                DisconnectPacket,
                RequestMovePacket,
                MoveNotifyPacket,
                NewObjectPacket,
                RemoveObjectPacket,
                LoginPacket,
                RequestMapPacket,
                ResponseMapPacket,
            ];
            for (var i = 0; i < packetClassList.length; ++i) {
                var packetClass = packetClassList[i];
                var packet = <BasePacket> new packetClass();
                if (packetType === packet.packetType) {
                    return packet;
                }
            }
            return null;
        }

        createPing(): PingPacket {
            return new PingPacket();
        }
        createEcho(): EchoPacket {
            return new EchoPacket();
        }
        createEchoAll(): EchoAllPacket {
            return new EchoAllPacket();
        }
        createConnect(): ConnectPacket {
            return new ConnectPacket();
        }
        createDisconnect(): DisconnectPacket {
            return new DisconnectPacket();
        }
        createRequestMove(): RequestMovePacket {
            return new RequestMovePacket();
        }
        createMoveNotify(): MoveNotifyPacket {
            return new MoveNotifyPacket();
        }
        createNewObject(): NewObjectPacket {
            return new NewObjectPacket();
        }
        createRemoveObject(): RemoveObjectPacket {
            return new RemoveObjectPacket();
        }
        createLogin(): LoginPacket {
            return new LoginPacket();
        }
        createRequestMap(): RequestMapPacket {
            return new RequestMapPacket();
        }
        createResponseMap(): ResponseMapPacket {
            return new ResponseMapPacket();
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.BasePacketFactory = kisaragi.BasePacketFactory;
}
