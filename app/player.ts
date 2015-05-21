// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    //import assert = require('assert');
}

module kisaragi {
    export class Player extends Entity {
        svrSock: ServerSocket;
        cliSock: SocketIOClient.Socket;

        constructor(id: number, role: Role) {
            super(id);

            this.category = Category.Player;
            this.role = role;
        }

        static createClientEntity(id: number, sock: SocketIOClient.Socket) {
            var player = new Player(id, Role.Client);
            player.cliSock = sock;
            return player;
        }
        static createServerEntity(id: number, sock: ServerSocket) {
            var player = new Player(id, Role.Server);
            player.svrSock = sock;

            // sock - user는 서로 연결시켜놓기. sock != socket io object
            if (sock) {
                sock.user = player;
            }

            return player;
        }

        connect(world: GameWorld, packet: ConnectPacket) {
            var self = this;
            world.addUser(self);

            var loginPacket = PacketFactory.login(
                this.movableId,
                this.x,
                this.y,
                world.level.width,
                world.level.height
            );
            self.svrSock.send(loginPacket);

            var newObjectPacket = PacketFactory.newObject(this.movableId, this.category, this.x, this.y);
            self.svrSock.broadcast(newObjectPacket);
    
            // give dynamic object's info to new user
            _.each(world.allObjectList(), function (ent: Entity) {
                var newObjectPacket = PacketFactory.newObject(ent.movableId, ent.category, ent.x, ent.y);
                self.svrSock.send(newObjectPacket);
            });
        };

        disconnect(world: GameWorld, packet: DisconnectPacket) {
            var self = this;
            world.removeUser(self);
            
            var removePacket = PacketFactory.removeObject(self.movableId);
            self.svrSock.send(removePacket);
        };

        c2s_requestMap(world: GameWorld, packet: RequestMapPacket) {
            var self = this;
            
            var responseMapPacket = PacketFactory.responseMap(world.level);
            self.svrSock.send(responseMapPacket);
        };

        // move function
        moveOneTile(dx: number, dy: number) {
            var self = this;
            //assert(self.role === Role.Client);

            var isLeft = (dx === -1 && dy === 0);
            var isRight = (dx === 1 && dy === 0);
            var isUp = (dx === 0 && dy === 1);
            var isDown = (dx === 0 && dy === -1);

            // allow only one tile move
            if (!(isLeft || isRight || isUp || isDown)) {
                return false;
            }

            var x = self.x + dx;
            var y = self.y + dy;
            self.requestMoveTo(x, y);

            return true;
        };

        moveLeft() {
            this.moveOneTile(-1, 0);
        };
        moveRight() {
            this.moveOneTile(1, 0);
        };
        moveUp() {
            this.moveOneTile(0, 1);
        };
        moveDown() {
            this.moveOneTile(0, -1);
        };

        requestMoveTo(x: number, y: number) {
            var self = this;
            if (self.world && !self.world.isMovablePos(x, y)) {
                return;
            }
            var packet:RequestMovePacket = PacketFactory.requestMove(this.movableId, x, y);
            self.cliSock.emit(packet.command, packet.toJson());
        };

        c2s_requestMove(world: GameWorld, packet: RequestMovePacket) {
            if (world.isMovablePos(packet.x, packet.y)) {
                this.targetPos = new Coord(packet.x, packet.y);
            }
        };
    }
}

if (typeof exports !== 'undefined') {
    exports.Player = kisaragi.Player;
}

