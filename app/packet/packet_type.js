///<reference path="../app.d.ts"/>
/*
Auto generated code
*/
var kisaragi;
(function (kisaragi) {
    (function (PacketType) {
        PacketType[PacketType["Ping"] = 0] = "Ping";
        PacketType[PacketType["Echo"] = 1] = "Echo";
        PacketType[PacketType["EchoAll"] = 2] = "EchoAll";
        PacketType[PacketType["Connect"] = 3] = "Connect";
        PacketType[PacketType["Disconnect"] = 4] = "Disconnect";
        PacketType[PacketType["RequestMove"] = 5] = "RequestMove";
        PacketType[PacketType["MoveNotify"] = 6] = "MoveNotify";
        PacketType[PacketType["NewObject"] = 7] = "NewObject";
        PacketType[PacketType["RemoveObject"] = 8] = "RemoveObject";
        PacketType[PacketType["Login"] = 9] = "Login";
        PacketType[PacketType["RequestMap"] = 10] = "RequestMap";
        PacketType[PacketType["ResponseMap"] = 11] = "ResponseMap";
        PacketType[PacketType["RequestJumpZone"] = 12] = "RequestJumpZone";
    })(kisaragi.PacketType || (kisaragi.PacketType = {}));
    var PacketType = kisaragi.PacketType;
    kisaragi.allPacketTypeList = [
        PacketType.Ping,
        PacketType.Echo,
        PacketType.EchoAll,
        PacketType.Connect,
        PacketType.Disconnect,
        PacketType.RequestMove,
        PacketType.MoveNotify,
        PacketType.NewObject,
        PacketType.RemoveObject,
        PacketType.Login,
        PacketType.RequestMap,
        PacketType.ResponseMap,
        PacketType.RequestJumpZone,
    ];
})(kisaragi || (kisaragi = {}));
if (typeof exports !== 'undefined') {
    exports.PacketType = kisaragi.PacketType;
    exports.allPacketTypeList = kisaragi.allPacketTypeList;
}
