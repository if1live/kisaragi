///<reference path="../app.d.ts"/>
/*
Auto generated code
*/
var kisaragi;
(function (kisaragi) {
    var BasePacketFactory = (function () {
        function BasePacketFactory() {
        }
        BasePacketFactory.toCommand = function (packetType) {
            var packet = kisaragi.PacketFactory.create(packetType);
            return packet.command;
        };
        BasePacketFactory.createFromJson = function (data) {
            var packetType = data.packetType;
            var packet = kisaragi.PacketFactory.create(packetType);
            if (packet == null) {
                // 연결종료할때
                // data = transport close
                // 가 되면서 packet파싱에 실패, packet가 null이 된다
                var factory = new kisaragi.PacketFactory();
                packet = factory.createDisconnect();
            }
            else {
                packet.loadJson(data);
            }
            return packet;
        };
        BasePacketFactory.create = function (packetType) {
            var packetClassList = [
                kisaragi.PingPacket,
                kisaragi.EchoPacket,
                kisaragi.EchoAllPacket,
                kisaragi.ConnectPacket,
                kisaragi.DisconnectPacket,
                kisaragi.RequestMovePacket,
                kisaragi.MoveNotifyPacket,
                kisaragi.NewObjectPacket,
                kisaragi.RemoveObjectPacket,
                kisaragi.LoginPacket,
                kisaragi.RequestMapPacket,
                kisaragi.ResponseMapPacket,
            ];
            for (var i = 0; i < packetClassList.length; ++i) {
                var packetClass = packetClassList[i];
                var packet = new packetClass();
                if (packetType === packet.packetType) {
                    return packet;
                }
            }
            return null;
        };
        BasePacketFactory.prototype.createPing = function () {
            return new kisaragi.PingPacket();
        };
        BasePacketFactory.prototype.createEcho = function () {
            return new kisaragi.EchoPacket();
        };
        BasePacketFactory.prototype.createEchoAll = function () {
            return new kisaragi.EchoAllPacket();
        };
        BasePacketFactory.prototype.createConnect = function () {
            return new kisaragi.ConnectPacket();
        };
        BasePacketFactory.prototype.createDisconnect = function () {
            return new kisaragi.DisconnectPacket();
        };
        BasePacketFactory.prototype.createRequestMove = function () {
            return new kisaragi.RequestMovePacket();
        };
        BasePacketFactory.prototype.createMoveNotify = function () {
            return new kisaragi.MoveNotifyPacket();
        };
        BasePacketFactory.prototype.createNewObject = function () {
            return new kisaragi.NewObjectPacket();
        };
        BasePacketFactory.prototype.createRemoveObject = function () {
            return new kisaragi.RemoveObjectPacket();
        };
        BasePacketFactory.prototype.createLogin = function () {
            return new kisaragi.LoginPacket();
        };
        BasePacketFactory.prototype.createRequestMap = function () {
            return new kisaragi.RequestMapPacket();
        };
        BasePacketFactory.prototype.createResponseMap = function () {
            return new kisaragi.ResponseMapPacket();
        };
        return BasePacketFactory;
    })();
    kisaragi.BasePacketFactory = BasePacketFactory;
})(kisaragi || (kisaragi = {}));
if (typeof exports !== 'undefined') {
    exports.BasePacketFactory = kisaragi.BasePacketFactory;
}
