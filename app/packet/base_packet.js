// Ŭnicode please
var kisaragi;
(function (kisaragi) {
    var BasePacket = (function () {
        function BasePacket(packetType) {
            this.packetType = packetType;
        }
        BasePacket.prototype._generateJson = function () {
            return {};
        };
        BasePacket.prototype.toJson = function () {
            var data = this._generateJson();
            data.packetType = this.packetType;
            return data;
        };
        BasePacket.prototype.loadJson = function (data) { };
        Object.defineProperty(BasePacket.prototype, "command", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        return BasePacket;
    })();
    kisaragi.BasePacket = BasePacket;
    (function (ServerSendablePacketType) {
        ServerSendablePacketType[ServerSendablePacketType["Send"] = 0] = "Send";
        ServerSendablePacketType[ServerSendablePacketType["Broadcast"] = 1] = "Broadcast";
    })(kisaragi.ServerSendablePacketType || (kisaragi.ServerSendablePacketType = {}));
    var ServerSendablePacketType = kisaragi.ServerSendablePacketType;
    var ServerSendablePacket = (function () {
        function ServerSendablePacket(sendableType, packet, conn) {
            this.sendType = sendableType;
            this.packet = packet;
            this.conn = conn;
        }
        ServerSendablePacket.send = function (packet, conn) {
            return new ServerSendablePacket(ServerSendablePacketType.Send, packet, conn);
        };
        ServerSendablePacket.broadcast = function (packet, conn) {
            return new ServerSendablePacket(ServerSendablePacketType.Broadcast, packet, conn);
        };
        return ServerSendablePacket;
    })();
    kisaragi.ServerSendablePacket = ServerSendablePacket;
    var ServerReceivedPacket = (function () {
        function ServerReceivedPacket(packet, conn) {
            this.packet = packet;
            this.conn = conn;
        }
        return ServerReceivedPacket;
    })();
    kisaragi.ServerReceivedPacket = ServerReceivedPacket;
})(kisaragi || (kisaragi = {}));
if (typeof exports !== 'undefined') {
    exports.BasePacket = kisaragi.BasePacket;
    exports.ServerSendablePacketType = kisaragi.ServerSendablePacketType;
    exports.ServerSendablePacket = kisaragi.ServerSendablePacket;
    exports.ServerReceivedPacket = kisaragi.ServerReceivedPacket;
}
