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
    
    export class BasePacket {
        packetType: PacketType;
        
        constructor(packetType: PacketType) {
            this.packetType = packetType;
        }
        generateJson(): any { 
            return {};
        }
        toJson(): any {
            var data = this.generateJson();
            data.packetType = this.packetType;
            return data;
        }
        loadJson(data: any) { }
        
        get command(): string {
            return null;
        }
        
        static createFromJson(data: any): BasePacket {
            var packetClassList = [
                NewObjectPacket,
                RemoveObjectPacket,
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
            
            var packetType:PacketType = data.packetType;
            var packet:BasePacket = null;
            for(var i = 0 ; i < packetClassList.length ; ++i) {
                var packetClass = packetClassList[i];
                packet = <BasePacket> new packetClass(); 
                if(packetType === packet.packetType) {
                    packet.loadJson(data);
                    return packet;
                }
            }
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
        
        static create(movableId: number, x: number, y: number): RequestMovePacket {
            var packet = new RequestMovePacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            return packet;
        }
        
        static get commandName(): string {
            return 'c2s_requestMove';
        }
        get command(): string {
            return RequestMovePacket.commandName;
        }
        
        generateJson(): any {
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
        static create(movableId: number, category: Category, x: number, y: number): NewObjectPacket {
            var packet = new NewObjectPacket();
            packet.movableId = movableId;
            packet.category = category;
            packet.x = x;
            packet.y = y;
            return packet;
        }
        
        static get commandName(): string {
            return 's2c_newObject';
        }
        get command(): string {
            return NewObjectPacket.commandName;
        }
        
        generateJson(): any {
            return {
                movableId: this.movableId,
                category: this.category,
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
        static create(movableId: number) {
            var packet = new RemoveObjectPacket();
            packet.movableId = movableId;
            return packet;
        }
        
        static get commandName(): string {
            return 's2c_removeObject';
        }
        get command(): string {
            return RemoveObjectPacket.commandName;
        }
        generateJson(): any {
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
        static create(movableId: number, x: number, y: number) {
            var packet = new MoveNotifyPacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            return packet;
        }
        
        static get commandName(): string {
            return 's2c_moveNotify';
        }
        get command(): string {
            return MoveNotifyPacket.commandName;
        }
        
        generateJson(): any {
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
        
        static create(movableId: number, x: number, y: number, width: number, height: number) {
            var packet = new LoginPacket();
            packet.movableId = movableId;
            packet.x = x;
            packet.y = y;
            packet.width = width;
            packet.height = height;
            return packet;
        }
        static get commandName(): string {
            return 's2c_login';
        }
        get command(): string {
            return LoginPacket.commandName;
        }
        
        generateJson(): any {
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
        static create(level: Level): ResponseMapPacket {
            var packet = new ResponseMapPacket();
            packet.data = level.data;
            packet.width = level.width;
            packet.height = level.height;
            return packet;
        }
        static get commandName(): string {
            return 's2c_responseMap';
        }
        get command(): string {
            return ResponseMapPacket.commandName;
        }
        generateJson(): any {
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
        static create(): RequestMapPacket {
            var packet = new RequestMapPacket();
            return packet;
        }
        static get commandName(): string {
            return 'c2s_requestMap';
        }
        get command(): string {
            return RequestMapPacket.commandName;
        }
    }
    
    export class ConnectPacket extends BasePacket {
        constructor() {
            super(PacketType.Connect);
        }
        static create(): ConnectPacket {
            return new ConnectPacket();
        }
        static get commandName(): string {
            return 'connect';
        }
        get command(): string {
            return ConnectPacket.commandName;
        }
    }
    export class DisconnectPacket extends BasePacket {
        constructor() {
            super(PacketType.Disconnect);
        }
        static create(): DisconnectPacket {
            return new DisconnectPacket();
        }
        static get commandName(): string {
            return 'disconnect';
        }
        get command(): string {
            return DisconnectPacket.commandName;
        }
    }
    export class PingPacket extends BasePacket {
        timestamp: number;
        
        constructor() {
            super(PacketType.Ping);
        }
        static create(): PingPacket {
            var packet = new PingPacket();
            packet.timestamp = Date.now();
            return packet;
        }
        static get commandName(): string {
            return 'ping';
        }
        get command(): string {
            return PingPacket.commandName;
        }
        generateJson(): any {
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
        static create(data: any): EchoPacket {
            var packet = new EchoPacket();
            packet.data = data;
            return packet;
        }
        static get commandName(): string {
            return 'echo';
        }
        get command(): string {
            return EchoPacket.commandName;
        }
        generateJson(): any {
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
        static create(data: any): EchoAllPacket {
            var packet = new EchoAllPacket();
            packet.data = data;
            return packet;
        }
        static get commandName(): string {
            return 'echoAll';
        }
        get command(): string {
            return EchoAllPacket.commandName;
        }
        generateJson(): any {
            return this.data;
        }
        loadJson(data: any) {
            this.data = data;
        }
    }
}