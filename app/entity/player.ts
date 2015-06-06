// Ŭnicode please
///<reference path="../app.d.ts"/>

if (typeof module !== 'undefined') {
    //import assert = require('assert');
}

module kisaragi {
    var COOLTIME_MOVE: number = 0.1;
    //var PLAYER_HP: number = 10;
    var PLAYER_HP: number = 3;

    export class Player extends Entity {
        svrConn: ServerConnection;
        cliConn: ClientConnection;

        hp: number;

        constructor(id: number, role: Role) {
            super(id, COOLTIME_MOVE);

            this.category = Category.Player;
            this.role = role;
            this.hp = PLAYER_HP;
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

            // 이미 플레이어가 죽은 경우는 다른 유저들이 알고있어서 특별한 대응을 할 필요 없다
            if (self.zone == null) {
                return;
            }
            
            var factory = new PacketFactory();
            var removePacket = factory.removeObject(self.movableId);
            self.svrConn.broadcast(removePacket);

            world.removeUser(self);
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
        
        requestJumpZone() {
            var factory = new PacketFactory();
            var packet = factory.requestJumpZone();
            this.cliConn.send(packet);
        }
        
        c2s_requestJumpZone(world: GameWorld, packet: RequestJumpZonePacket) {
            // jump 처리하는 함수
            // 귀찮아서 서버/클라 검증 구분없이 전부 떄려박음. 나중에 분리할것
            // 최초 구현은 zone id를 패킷으로 입력받았지만 유니티 구현때문에 인자 없이 서버에서 판정하게 변경

            var self = this;
            
            var prevZone = this.zone;

            // 플레이어가 현재 서있는 위치가 점프 가능한 영역인가?
            var prevZoneFloorUpPos = prevZone.level.getSpecialCoord(TileCode.FloorUp);
            var prevZoneFloorDownPos = prevZone.level.getSpecialCoord(TileCode.FloorDown);
            var prevZoneFloorLeftPos = prevZone.level.getSpecialCoord(TileCode.FloorLeft);
            var prevZoneFloorRightPos = prevZone.level.getSpecialCoord(TileCode.FloorRight);
            var prevZoneFloorTopPos = prevZone.level.getSpecialCoord(TileCode.FloorTop);
            var prevZoneFloorBottomPos = prevZone.level.getSpecialCoord(TileCode.FloorBottom);
            
            var nextZoneId = 0;
            if (prevZoneFloorUpPos && prevZoneFloorUpPos.encoded == this.pos.encoded) {
                nextZoneId = ZoneID.buildId(prevZone.zoneId.x, prevZone.zoneId.y + 1, prevZone.zoneId.z);
            } else if (prevZoneFloorDownPos && prevZoneFloorDownPos.encoded == this.pos.encoded) {
                nextZoneId = ZoneID.buildId(prevZone.zoneId.x, prevZone.zoneId.y - 1, prevZone.zoneId.z);
            } else if (prevZoneFloorLeftPos && prevZoneFloorLeftPos.encoded == this.pos.encoded) {
                nextZoneId = ZoneID.buildId(prevZone.zoneId.x - 1, prevZone.zoneId.y, prevZone.zoneId.z);
            } else if (prevZoneFloorRightPos && prevZoneFloorRightPos.encoded == this.pos.encoded) {
                nextZoneId = ZoneID.buildId(prevZone.zoneId.x + 1, prevZone.zoneId.y, prevZone.zoneId.z);
            } else if (prevZoneFloorTopPos && prevZoneFloorTopPos.encoded == this.pos.encoded) {
                nextZoneId = ZoneID.buildId(prevZone.zoneId.x, prevZone.zoneId.y, prevZone.zoneId.z + 1);
            } else if (prevZoneFloorBottomPos && prevZoneFloorBottomPos.encoded == this.pos.encoded) {
                nextZoneId = ZoneID.buildId(prevZone.zoneId.x, prevZone.zoneId.y, prevZone.zoneId.z - 1);
            } else {
                return;
            }


            var nextZone = world.zone(nextZoneId);

            var dstPos: Coord;
            var srcPos: Coord;

            var prevZoneX = prevZone.zoneId.x;
            var nextZoneX = nextZone.zoneId.x;
            var prevZoneY = prevZone.zoneId.y;
            var nextZoneY = nextZone.zoneId.y;
            var prevZoneZ = prevZone.zoneId.z;
            var nextZoneZ = nextZone.zoneId.z;

            if (prevZoneX < nextZoneX) {
                // jump right
                srcPos = prevZone.level.getSpecialCoord(TileCode.FloorRight);
                dstPos = nextZone.level.getSpecialCoord(TileCode.FloorLeft);
            } else if (prevZoneX > nextZoneX) {
                // jump left
                srcPos = prevZone.level.getSpecialCoord(TileCode.FloorLeft);
                dstPos = nextZone.level.getSpecialCoord(TileCode.FloorRight);
            }
            if (prevZoneY < nextZoneY) {
                // jump up
                srcPos = prevZone.level.getSpecialCoord(TileCode.FloorUp);
                dstPos = nextZone.level.getSpecialCoord(TileCode.FloorDown);
            } else if (prevZoneY > nextZoneY) {
                // jump down
                srcPos = prevZone.level.getSpecialCoord(TileCode.FloorDown);
                dstPos = nextZone.level.getSpecialCoord(TileCode.FloorUp);
            }
            if (prevZoneZ < nextZoneZ) {
                // jump top
                srcPos = prevZone.level.getSpecialCoord(TileCode.FloorTop);
                dstPos = nextZone.level.getSpecialCoord(TileCode.FloorBottom);
            } else if (prevZoneZ > nextZoneZ) {
                // jump bottom
                srcPos = prevZone.level.getSpecialCoord(TileCode.FloorBottom);
                dstPos = nextZone.level.getSpecialCoord(TileCode.FloorTop);
            }

            // 점프 도착지가 정의되어있는가?
            if (!dstPos) {
                return;
            }
            // 점프 시작 위치에 현재 플레이어가 있는가?
            if (srcPos.x != this.pos.x || srcPos.y != this.pos.y) {
                return;
            }

            //now allow too long zone jump
            var diffZoneX = Math.abs(prevZoneX - nextZoneX);
            var diffZoneY = Math.abs(prevZoneY - nextZoneY);
            var diffZoneZ = Math.abs(prevZoneZ - nextZoneZ);
            if (diffZoneX + diffZoneY + diffZoneZ > 1) {
                return;
            }

            var factory = new PacketFactory();
            
            // send remove packet to previous zone user
            var prevZoneUsers = prevZone.entityMgr.findAll({category: Category.Player});
            _.each(prevZoneUsers, function(ent: Player) {
                var packet = factory.removeObject(self.movableId);
                self.svrConn.broadcast(packet);
            })
            prevZone.detach(this);
            
            nextZone.attach(this);
            this.pos = dstPos;

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

