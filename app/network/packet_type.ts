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
    }
}


declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.PacketType = kisaragi.PacketType;
}


