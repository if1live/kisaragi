// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    //import assert = require('assert');
}

module kisaragi {
    export class Player extends Entity {
        svrConn: ServerConnection;
        cliConn: ClientConnection;

        constructor(id: number, role: Role) {
            super(id);

            this.category = Category.Player;
            this.role = role;
        }

        static createClientEntity(id: number, conn: ClientConnection) {
            var player = new Player(id, Role.Client);
            player.cliConn = conn;
            return player;
        }
        static createServerEntity(id: number, conn: ServerConnection) {
            var player = new Player(id, Role.Server);
            player.svrConn = conn;

            // sock - user는 서로 연결시켜놓기. sock != socket io object
            if (conn) {
                conn.user = player;
            }

            return player;
        }

        connect(world: GameWorld, packet: ConnectPacket) {
            var self = this;
            world.addUser(self);

            var factory = new PacketFactory();
            var loginPacket = factory.login(
                this.movableId,
                this.x,
                this.y,
                this.floor,
                world.level.width,
                world.level.height
            );
            self.svrConn.send(loginPacket);

            var newObjectPacket = factory.newObject(this.movableId, this.category, this.x, this.y, this.floor);
            self.svrConn.broadcast(newObjectPacket);
    
            // give dynamic object's info to new user
            _.each(world.allObjectList(), function (ent: Entity) {
                var newObjectPacket = factory.newObject(ent.movableId, ent.category, ent.x, ent.y, ent.floor);
                self.svrConn.send(newObjectPacket);
            });
        };

        disconnect(world: GameWorld, packet: DisconnectPacket) {
            var self = this;
            world.removeUser(self);
            
            var factory = new PacketFactory();
            var removePacket = factory.removeObject(self.movableId);
            self.svrConn.broadcast(removePacket);
        };

        c2s_requestMap(world: GameWorld, packet: RequestMapPacket) {
            var self = this;
            var factory = new PacketFactory();
            var responseMapPacket = factory.responseMap(world.level, this.floor);
            self.svrConn.send(responseMapPacket);
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
            var factory = new PacketFactory();
            var packet:RequestMovePacket = factory.requestMove(this.movableId, x, y);
            self.cliConn.send(packet);
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

