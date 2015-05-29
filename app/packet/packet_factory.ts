 ///<reference path="../app.d.ts"/>
module kisaragi {
    export class PacketFactory extends BasePacketFactory {
        requestMove(movableId: number, x: number, y: number): RequestMovePacket {
            var packet = new RequestMovePacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            return packet;
        }

        newObject(movableId: number, category: Category, x: number, y: number, floor: number): NewObjectPacket {
            var packet = new NewObjectPacket();
            packet.movableId = movableId;
            packet.category = category;
            packet.x = x;
            packet.y = y;
            packet.floor = floor;
            return packet;
        }
        removeObject(movableId: number): RemoveObjectPacket {
            var packet = new RemoveObjectPacket();
            packet.movableId = movableId;
            return packet;
        }
        moveNotify(movableId: number, x: number, y: number): MoveNotifyPacket {
            var packet = new MoveNotifyPacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            return packet;
        }

        echo(data: any): EchoPacket {
            var packet = new EchoPacket();
            packet.data = data;
            return packet;
        }

        echoAll(data: any): EchoAllPacket {
            var packet = new EchoAllPacket();
            packet.data = data;
            return packet;
        }

        ping(): PingPacket {
            var packet = new PingPacket();
            packet.timestamp = Date.now();
            return packet;
        }

        login(movableId: number, x: number, y: number, floor: number, width: number, height: number) {
            var packet = new LoginPacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            packet.floor = floor;
            packet.width = width;
            packet.height = height;
            return packet;
        }

        responseMap(level: Level, floor: number): ResponseMapPacket {
            var packet = new ResponseMapPacket();
            packet.data = level.data;
            packet.width = level.width;
            packet.height = level.height;
            packet.floor = floor;
            return packet;
        }
        
        requestMap(floor: number): RequestMapPacket {
            var packet = new RequestMapPacket();
            packet.floor = floor;
            return packet;
        }
    }
}
declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.PacketFactory = kisaragi.PacketFactory;
}

