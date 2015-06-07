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
        PacketType[PacketType["RequestAttack"] = 7] = "RequestAttack";
        PacketType[PacketType["RequestEntityStatus"] = 8] = "RequestEntityStatus";
        PacketType[PacketType["ResponseEntityStatus"] = 9] = "ResponseEntityStatus";
        PacketType[PacketType["AttackNotify"] = 10] = "AttackNotify";
        PacketType[PacketType["NewObject"] = 11] = "NewObject";
        PacketType[PacketType["RemoveObject"] = 12] = "RemoveObject";
        PacketType[PacketType["Login"] = 13] = "Login";
        PacketType[PacketType["RequestMap"] = 14] = "RequestMap";
        PacketType[PacketType["ResponseMap"] = 15] = "ResponseMap";
        PacketType[PacketType["RequestJumpZone"] = 16] = "RequestJumpZone";
        PacketType[PacketType["GameRestart"] = 17] = "GameRestart";
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
        PacketType.RequestAttack,
        PacketType.RequestEntityStatus,
        PacketType.ResponseEntityStatus,
        PacketType.AttackNotify,
        PacketType.NewObject,
        PacketType.RemoveObject,
        PacketType.Login,
        PacketType.RequestMap,
        PacketType.ResponseMap,
        PacketType.RequestJumpZone,
        PacketType.GameRestart,
    ];
})(kisaragi || (kisaragi = {}));
if (typeof exports !== 'undefined') {
    exports.PacketType = kisaragi.PacketType;
    exports.allPacketTypeList = kisaragi.allPacketTypeList;
}
