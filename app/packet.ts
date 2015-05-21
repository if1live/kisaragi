// Ŭnicode please
module kisaragi {
    export enum PacketType {
        Ping,
        Echo,
        EchoAll,

        RequestMove,
        MoveNotify,

        NewObject,
        RemoveObject,

        Login,
        RequestMap,
        ResponseMap,

        Connect,
        Disconnect,
    }
    
    export class PacketFactory {
        static toCommand(packetType: PacketType): string {
            var packet = PacketFactory.create(packetType);
            return packet.command;
        }

        static create(packetType: PacketType): BasePacket {
            var packetClassList = [
                NewObjectPacket,
                RemoveObjectPacket,
                RequestMovePacket,
                MoveNotifyPacket,
                LoginPacket,
                ResponseMapPacket,
                RequestMapPacket,
                ConnectPacket,
                DisconnectPacket,
                PingPacket,
                EchoPacket,
                EchoAllPacket,
            ];
            for (var i = 0; i < packetClassList.length; ++i) {
                var packetClass = packetClassList[i];
                var packet = <BasePacket> new packetClass();
                if (packetType === packet.packetType) {
                    return packet;
                }
            }
            return null;
        }

        static createFromJson(data: any): BasePacket {
            var packetType: PacketType = data.packetType;
            var packet = PacketFactory.create(packetType);
            packet.loadJson(data);
            return packet;
        }

        static requestMove(movableId: number, x: number, y: number): RequestMovePacket {
            var packet = new RequestMovePacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            return packet;
        }

        static newObject(movableId: number, category: Category, x: number, y: number): NewObjectPacket {
            var packet = new NewObjectPacket();
            packet.movableId = movableId;
            packet.category = category;
            packet.x = x;
            packet.y = y;
            return packet;
        }
        static removeObject(movableId: number): RemoveObjectPacket {
            var packet = new RemoveObjectPacket();
            packet.movableId = movableId;
            return packet;
        }
        static moveNotify(movableId: number, x: number, y: number): MoveNotifyPacket {
            var packet = new MoveNotifyPacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            return packet;
        }

        static echo(data: any): EchoPacket {
            var packet = new EchoPacket();
            packet.data = data;
            return packet;
        }

        static echoAll(data: any): EchoAllPacket {
            var packet = new EchoAllPacket();
            packet.data = data;
            return packet;
        }

        static ping(): PingPacket {
            var packet = new PingPacket();
            packet.timestamp = Date.now();
            return packet;
        }
        static requestMap(): RequestMapPacket {
            var packet = new RequestMapPacket();
            return packet;
        }

        static login(movableId: number, x: number, y: number, width: number, height: number) {
            var packet = new LoginPacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            packet.width = width;
            packet.height = height;
            return packet;
        }

        static responseMap(level: Level): ResponseMapPacket {
            var packet = new ResponseMapPacket();
            packet.data = level.data;
            packet.width = level.width;
            packet.height = level.height;
            return packet;
        }

        static connect(): ConnectPacket {
            return new ConnectPacket();
        }
        static disconnect(): DisconnectPacket {
            return new DisconnectPacket();
        }
    }

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
    
    export class RequestMovePacket extends BasePacket {
        movableId: number;
        x: number;
        y: number;
        
        constructor() {
            super(PacketType.RequestMove);
        }
        
        get command(): string {
            return 'c2s_requestMove';
        }
        
        _generateJson(): any {
            return {
                movableId: this.movableId,
                x: this.x,
                y: this.y
            };
        }
        loadJson(data: any) {
            this.x = data.x;
            this.y = data.y;
            this.movableId = data.movableId;
        }
    }
    
    export class NewObjectPacket extends BasePacket {
        movableId: number;
        category: Category;
        x: number;
        y: number;
        
        constructor() {
            super(PacketType.NewObject);
        }
        
        get command(): string {
            return 's2c_newObject';
        }
        
        _generateJson(): any {
            var categoryName = '';
            if (this.category === Category.Enemy) {
                categoryName = "enemy";
            } else if (this.category === Category.Item) {
                categoryName = "item";
            } else if (this.category === Category.Player) {
                categoryName = "player";
            }

            return {
                movableId: this.movableId,
                category: this.category,
                categoryName: categoryName,
                x: this.x,
                y: this.y
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
        }
        
        get command(): string {
            return 's2c_removeObject';
        }
        _generateJson(): any {
            return {
                movableId: this.movableId
            };
        }
        loadJson(data: any) {
            this.movableId = data.movableId;
        }
    }
    
    export class MoveNotifyPacket extends BasePacket {
        movableId: number;
        x: number;
        y: number;
        
        constructor() {
            super(PacketType.MoveNotify);
        }
        
        get command(): string {
            return 's2c_moveNotify';
        }
        
        _generateJson(): any {
            return {
                movableId: this.movableId,
                x: this.x,
                y: this.y
            };
        }
        loadJson(data: any) {
            this.movableId = data.movableId;
            this.x = data.x;
            this.y = data.y;
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
                height: this.height
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
    
    export class ResponseMapPacket extends BasePacket {
        data: Array<Array<TileCode>>;
        width: number;
        height: number;
        
        constructor() {
            super(PacketType.ResponseMap);
        }
        
        get command(): string {
            return 's2c_responseMap';
        }
        _generateJson(): any {
            return {
                data: this.data,
                width: this.width,
                height: this.height
            };
        }
        loadJson(data: any) {
            this.data = data.data;
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
    }
    
    export class ConnectPacket extends BasePacket {
        constructor() {
            super(PacketType.Connect);
        }
        get command(): string {
            return 'connect';
        }
    }
    export class DisconnectPacket extends BasePacket {
        constructor() {
            super(PacketType.Disconnect);
        }
        get command(): string {
            return 'disconnect';
        }
    }
    export class PingPacket extends BasePacket {
        timestamp: number;
        
        constructor() {
            super(PacketType.Ping);
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
        }
        
        get command(): string {
            return 'echo';
        }
        _generateJson(): any {
            return this.data;
        }
        loadJson(data: any) {
            this.data = data;
        }
    }
    
    export class EchoAllPacket extends BasePacket {
        data: any;
        
        constructor() {
            super(PacketType.EchoAll);
        }
        
        get command(): string {
            return 'echoAll';
        }
        _generateJson(): any {
            return this.data;
        }
        loadJson(data: any) {
            this.data = data;
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.PacketFactory = kisaragi.PacketFactory;
    exports.PacketType = kisaragi.PacketType;
}

