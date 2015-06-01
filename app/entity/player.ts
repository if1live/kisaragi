// Ŭnicode please
///<reference path="../app.d.ts"/>

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

            var zone = this.zone;
            
            var factory = new PacketFactory();
            var loginPacket = factory.login(
                this.movableId,
                this.x,
                this.y,
                zone.zoneId.id,
                zone.level.width,
                zone.level.height
            );
            self.svrConn.send(loginPacket);

            var newObjectPacket = factory.newObject(this.movableId, this.category, this.x, this.y, zone.id);
            self.svrConn.broadcast(newObjectPacket);
    
            // give dynamic object's info to new user
            _.each(this.zone.entityMgr.all(), function (ent: Entity) {
                var newObjectPacket = factory.newObject(ent.movableId, ent.category, ent.x, ent.y, ent.zone.id);
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
            var zone = world.zone(packet.zoneId);
            var responseMapPacket = factory.responseMap(zone.level, zone.id);
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
            if (self.world && !self.zone.isMovablePos(x, y)) {
                return;
            }
            var factory = new PacketFactory();
            var packet:RequestMovePacket = factory.requestMove(this.movableId, x, y);
            self.cliConn.send(packet);
        };

        c2s_requestMove(world: GameWorld, packet: RequestMovePacket) {
            if (this.zone.isMovablePos(packet.x, packet.y)) {
                this.targetPos = new Coord(packet.x, packet.y);
            }
        };
        
        requestJumpZone(zoneId: number) {
            var factory = new PacketFactory();
            var packet = factory.requestJumpZone(zoneId);
            this.cliConn.send(packet);
        }
        
        c2s_requestJumpZone(world: GameWorld, packet: RequestJumpZonePacket) {
            var self = this;
            if(this.zoneId == packet.zoneId) {
                return;
            }
            
            var prevZone = this.zone;
            var nextZone = world.zone(packet.zoneId);

            var factory = new PacketFactory();
            
            // send remove packet to previous zone user
            var prevZoneUsers = prevZone.entityMgr.findAll({category: Category.Player});
            _.each(prevZoneUsers, function(ent: Player) {
                var packet = factory.removeObject(self.movableId);
                self.svrConn.broadcast(packet);
            })
            prevZone.detach(this);
            
            nextZone.attach(this);
            // 적당한 빈자리로 이동
            // TODO nextZone의 리스폰 지점으로 교체할것
            this.pos = nextZone.findAnyEmptyPos();

            // send next map info
            var mapPacket = factory.responseMap(nextZone.level, nextZone.zoneId.id);
            this.svrConn.send(mapPacket);
            
            // send new object notify to next zone
            var nextZoneUsers = nextZone.entityMgr.findAll({category: Category.Player});
            _.each(nextZoneUsers, function (ent: Player) {
                var packet = factory.newObject(self.movableId, self.category, self.x, self.y, nextZone.id);
                self.svrConn.broadcast(packet);
            });

            _.each(this.zone.entityMgr.all(), function (ent: Entity) {
                var newObjectPacket = factory.newObject(ent.movableId, ent.category, ent.x, ent.y, ent.zone.id);
                self.svrConn.send(newObjectPacket);
            });
        }
    }
}

if (typeof exports !== 'undefined') {
    exports.Player = kisaragi.Player;
}

