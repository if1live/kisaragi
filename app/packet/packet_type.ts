///<reference path="../app.d.ts"/>
/*
Auto generated code
*/

module kisaragi {
    export enum PacketType {

        Ping,
        Echo,
        EchoAll,
        Connect,
        Disconnect,
        RequestMove,
        MoveNotify,
        NewObject,
        RemoveObject,
        Login,
        RequestMap,
        ResponseMap,
        RequestJumpZone,
    }
    
    export var allPacketTypeList = [

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
}


declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.PacketType = kisaragi.PacketType;
    exports.allPacketTypeList = kisaragi.allPacketTypeList;
}


