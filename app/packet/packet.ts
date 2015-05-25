///<reference path="../app.d.ts"/>
/*
Auto generated code
*/

module kisaragi {
    
    export class PingPacket extends BasePacket {
        
        timestamp: number;        
        
        constructor() {
            super(PacketType.Ping);
            
            this.timestamp = 0;            
        }
        
        get command(): string {
            return 'ping';
        }
        _generateJson(): any {
            return {
                
                timestamp: this.timestamp,                 
            };
        }
        loadJson(data: any) {
            
            this.timestamp = data.timestamp;             
        }
    }
    
    export class EchoPacket extends BasePacket {
        
        data: any;        
        
        constructor() {
            super(PacketType.Echo);
            
            this.data = null;            
        }
        
        get command(): string {
            return 'echo';
        }
        _generateJson(): any {
            return {
                
                data: this.data,                 
            };
        }
        loadJson(data: any) {
            
            this.data = data.data;             
        }
    }
    
    export class EchoAllPacket extends BasePacket {
        
        data: any;        
        
        constructor() {
            super(PacketType.EchoAll);
            
            this.data = null;            
        }
        
        get command(): string {
            return 'echoAll';
        }
        _generateJson(): any {
            return {
                
                data: this.data,                 
            };
        }
        loadJson(data: any) {
            
            this.data = data.data;             
        }
    }
    
    export class ConnectPacket extends BasePacket {
        
        
        constructor() {
            super(PacketType.Connect);
            
        }
        
        get command(): string {
            return 'connect';
        }
        _generateJson(): any {
            return {
                
            };
        }
        loadJson(data: any) {
            
        }
    }
    
    export class DisconnectPacket extends BasePacket {
        
        
        constructor() {
            super(PacketType.Disconnect);
            
        }
        
        get command(): string {
            return 'disconnect';
        }
        _generateJson(): any {
            return {
                
            };
        }
        loadJson(data: any) {
            
        }
    }
    
    export class RequestMovePacket extends BasePacket {
        
        movableId: number;        
        x: number;        
        y: number;        
        
        constructor() {
            super(PacketType.RequestMove);
            
            this.movableId = 0;            
            this.x = 0;            
            this.y = 0;            
        }
        
        get command(): string {
            return 'c2s_requestMove';
        }
        _generateJson(): any {
            return {
                
                movableId: this.movableId,                 
                x: this.x,                 
                y: this.y,                 
            };
        }
        loadJson(data: any) {
            
            this.movableId = data.movableId;             
            this.x = data.x;             
            this.y = data.y;             
        }
    }
    
    export class MoveNotifyPacket extends BasePacket {
        
        movableId: number;        
        x: number;        
        y: number;        
        
        constructor() {
            super(PacketType.MoveNotify);
            
            this.movableId = 0;            
            this.x = 0;            
            this.y = 0;            
        }
        
        get command(): string {
            return 's2c_moveNotify';
        }
        _generateJson(): any {
            return {
                
                movableId: this.movableId,                 
                x: this.x,                 
                y: this.y,                 
            };
        }
        loadJson(data: any) {
            
            this.movableId = data.movableId;             
            this.x = data.x;             
            this.y = data.y;             
        }
    }
    
    export class NewObjectPacket extends BasePacket {
        
        movableId: number;        
        category: Category;        
        x: number;        
        y: number;        
        
        constructor() {
            super(PacketType.NewObject);
            
            this.movableId = 0;            
            this.category = null;            
            this.x = 0;            
            this.y = 0;            
        }
        
        get command(): string {
            return 's2c_newObject';
        }
        _generateJson(): any {
            return {
                
                movableId: this.movableId,                 
                category: this.category,                 
                x: this.x,                 
                y: this.y,                 
            };
        }
        loadJson(data: any) {
            
            this.movableId = data.movableId;             
            this.category = data.category;             
            this.x = data.x;             
            this.y = data.y;             
        }
    }
    
    export class RemoveObjectPacket extends BasePacket {
        
        movableId: number;        
        
        constructor() {
            super(PacketType.RemoveObject);
            
            this.movableId = 0;            
        }
        
        get command(): string {
            return 's2c_removeObject';
        }
        _generateJson(): any {
            return {
                
                movableId: this.movableId,                 
            };
        }
        loadJson(data: any) {
            
            this.movableId = data.movableId;             
        }
    }
    
    export class LoginPacket extends BasePacket {
        
        movableId: number;        
        x: number;        
        y: number;        
        width: number;        
        height: number;        
        
        constructor() {
            super(PacketType.Login);
            
            this.movableId = 0;            
            this.x = 0;            
            this.y = 0;            
            this.width = 0;            
            this.height = 0;            
        }
        
        get command(): string {
            return 's2c_login';
        }
        _generateJson(): any {
            return {
                
                movableId: this.movableId,                 
                x: this.x,                 
                y: this.y,                 
                width: this.width,                 
                height: this.height,                 
            };
        }
        loadJson(data: any) {
            
            this.movableId = data.movableId;             
            this.x = data.x;             
            this.y = data.y;             
            this.width = data.width;             
            this.height = data.height;             
        }
    }
    
    export class RequestMapPacket extends BasePacket {
        
        
        constructor() {
            super(PacketType.RequestMap);
            
        }
        
        get command(): string {
            return 'c2s_requestMap';
        }
        _generateJson(): any {
            return {
                
            };
        }
        loadJson(data: any) {
            
        }
    }
    
    export class ResponseMapPacket extends BasePacket {
        
        data: Array<Array<TileCode>>;        
        width: number;        
        height: number;        
        
        constructor() {
            super(PacketType.ResponseMap);
            
            this.data = null;            
            this.width = 0;            
            this.height = 0;            
        }
        
        get command(): string {
            return 's2c_requestMap';
        }
        _generateJson(): any {
            return {
                
                data: this.data,                 
                width: this.width,                 
                height: this.height,                 
            };
        }
        loadJson(data: any) {
            
            this.data = data.data;             
            this.width = data.width;             
            this.height = data.height;             
        }
    }
    
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    
    exports.PingPacket = kisaragi.PingPacket;    
    exports.EchoPacket = kisaragi.EchoPacket;    
    exports.EchoAllPacket = kisaragi.EchoAllPacket;    
    exports.ConnectPacket = kisaragi.ConnectPacket;    
    exports.DisconnectPacket = kisaragi.DisconnectPacket;    
    exports.RequestMovePacket = kisaragi.RequestMovePacket;    
    exports.MoveNotifyPacket = kisaragi.MoveNotifyPacket;    
    exports.NewObjectPacket = kisaragi.NewObjectPacket;    
    exports.RemoveObjectPacket = kisaragi.RemoveObjectPacket;    
    exports.LoginPacket = kisaragi.LoginPacket;    
    exports.RequestMapPacket = kisaragi.RequestMapPacket;    
    exports.ResponseMapPacket = kisaragi.ResponseMapPacket;    
}

