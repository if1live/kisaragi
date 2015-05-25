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
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.BasePacket = kisaragi.BasePacket;
}

