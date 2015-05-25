var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../app.d.ts"/>
var kisaragi;
(function (kisaragi) {
    var PacketFactory = (function (_super) {
        __extends(PacketFactory, _super);
        function PacketFactory() {
            _super.apply(this, arguments);
        }
        PacketFactory.prototype.requestMove = function (movableId, x, y) {
            var packet = new kisaragi.RequestMovePacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            return packet;
        };
        PacketFactory.prototype.newObject = function (movableId, category, x, y) {
            var packet = new kisaragi.NewObjectPacket();
            packet.movableId = movableId;
            packet.category = category;
            packet.x = x;
            packet.y = y;
            return packet;
        };
        PacketFactory.prototype.removeObject = function (movableId) {
            var packet = new kisaragi.RemoveObjectPacket();
            packet.movableId = movableId;
            return packet;
        };
        PacketFactory.prototype.moveNotify = function (movableId, x, y) {
            var packet = new kisaragi.MoveNotifyPacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            return packet;
        };
        PacketFactory.prototype.echo = function (data) {
            var packet = new kisaragi.EchoPacket();
            packet.data = data;
            return packet;
        };
        PacketFactory.prototype.echoAll = function (data) {
            var packet = new kisaragi.EchoAllPacket();
            packet.data = data;
            return packet;
        };
        PacketFactory.prototype.ping = function () {
            var packet = new kisaragi.PingPacket();
            packet.timestamp = Date.now();
            return packet;
        };
        PacketFactory.prototype.login = function (movableId, x, y, width, height) {
            var packet = new kisaragi.LoginPacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            packet.width = width;
            packet.height = height;
            return packet;
        };
        PacketFactory.prototype.responseMap = function (level) {
            var packet = new kisaragi.ResponseMapPacket();
            packet.data = level.data;
            packet.width = level.width;
            packet.height = level.height;
            return packet;
        };
        return PacketFactory;
    })(kisaragi.BasePacketFactory);
    kisaragi.PacketFactory = PacketFactory;
})(kisaragi || (kisaragi = {}));
if (typeof exports !== 'undefined') {
    exports.PacketFactory = kisaragi.PacketFactory;
}
