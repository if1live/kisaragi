// Ŭnicode please
///<reference path="../app.d.ts"/>
module kisaragi {
    export class EntityHelper {
        static categoryToString(category: Category) {
            var table = {};
            table[Category.Enemy] = "enemy";
            table[Category.Player] = "player";
            table[Category.Item] = "item";
            return table[category];
        }
    }

    export class Entity {
        // core attribute
        category: Category;
        movableId: number;
        
        world: GameWorld;

        // position
        pos: Coord;
        
        // zone
        _zoneId: number;
        _zone: Zone;

        // server/client
        role: Role;

        // movable
        targetPos: Coord;
        moveCooltime: number;    
        currMoveCooltime: number;

        // renderable
        sprite: Phaser.Sprite;

        constructor(id: number, moveCooltime: number) {
            this.movableId = id;
            this.pos = new Coord(-1, -1);
            this._zone = null;
            this._zoneId = 0;
            this.targetPos = null;
            this.world = null;
            this.sprite = null;
            
            this.moveCooltime = moveCooltime;
            this.currMoveCooltime = 0;
        }
        get x(): number {
            return this.pos.x;
        }
        get y(): number {
            return this.pos.y;
        }
        set x(val: number) {
            this.pos.x = val;
        }
        set y(val: number) {
            this.pos.y = val;
        }
        
        get zoneId(): number {
            if(this._zone) {
                return this._zone.zoneId.id;
            } else {
                return this._zoneId;
            }
        }
        set zoneId(id: number) {
            if(this._zone) {
                this._zone.zoneId.id = id;
            } else {
                this._zoneId = id;
            }
        }
        get zone(): Zone {
            return this._zone;
        }
        set zone(zone: Zone) {
            if(zone) {
                this._zone = zone;
                this._zoneId = zone.id;
            } else {
                this._zone = null;
                this._zoneId = 0;
            }
        }
        get zoneEntityMgr(): EntityManager {
            if (this._zone) {
                return this._zone.entityMgr;
            } else {
                return null;
            }
        }
        get globalEntityMgr(): EntityManager {
            if (this.world) {
                return this.world.entityMgr;
            } else {
                return null;
            }
        }

        get simpleName(): string {
            var categoryName = EntityHelper.categoryToString(this.category);
            var text = `${categoryName}:${this.movableId}`;
            return text;
        }

        moveNotify() {
            var self = this;
            var factory = new PacketFactory();
            // send move notify to closed user
            var userList = this.zoneEntityMgr.findAll({ category: Category.Player});
            _.each(userList, function (user: Player) {
                //TODO how to calculate distance?
                var maxDist = 1000000;
                var dist = Math.abs(self.x - user.x) + Math.abs(self.y - user.y);
                if (dist < maxDist) {
                    var packet = factory.moveNotify(self.movableId, self.x, self.y);
                    user.svrConn.send(packet);
                }
            });
        };

        update(delta: number) {
            this.updatePre(delta);
            this.updateMove(delta);
            this.updatePost(delta);
        }

        updatePre(delta: number) {
        }

        updatePost(delta: number) {
        }

        updateMove(delta: number) {
            var self = this;

            this.currMoveCooltime -= delta;
            if (this.currMoveCooltime < 0) {
                this.currMoveCooltime = 0;
            }

            var zone  = this.zone;
            if (this.targetPos !== null && this.currMoveCooltime === 0) {
                var nextPos = zone.level.findNextPos(self.pos, self.targetPos, zone);
                if (!nextPos) {
                    self.targetPos = null;
                    return;
                }

                this.pos = nextPos;
                this.moveNotify();

                if (self.pos.x === self.targetPos.x && self.pos.y === self.targetPos.y) {
                    self.targetPos = null;
                }

                this.currMoveCooltime = this.moveCooltime;
            }
        }

        updateSpritePosition() {
            if (!this.sprite) {
                throw "sprite not exist";
            }

            var tileX = this.pos.x;
            var tileY = this.zone.level.height - this.pos.y - 1;
            var x = tileX * TILE_SIZE;
            var y = tileY * TILE_SIZE;
            this.sprite.position.x = x;
            this.sprite.position.y = y;
        }

        updateMoveAnimation(delta: number) {
            var tileX = this.pos.x;
            var tileY = this.zone.level.height - this.pos.y - 1;
            var targetX = tileX * TILE_SIZE;
            var targetY = tileY * TILE_SIZE;

            var currX = this.sprite.position.x;
            var currY = this.sprite.position.y;

            if (targetX == currX && targetY == currY) {
                return;
            }

            var speed = 1 / this.moveCooltime * TILE_SIZE;
            var diff = speed * delta;

            var dx = targetX - currX;
            var dy = targetY - currY;
            var dirLength = Math.sqrt(dx * dx + dy * dy);
            dx = dx / dirLength * diff;
            dy = dy / dirLength * diff;

            var nextX = currX + dx;
            var nextY = currY + dy;

            // 목적지 근처에서 진동하는거 방지
            // 이전...목적지...계산된 목적지
            // 와 같은 순서로 위치할 경우 강제로 목적지로 정렬
            if (currX <= targetX && targetX <= nextX) {
                nextX = targetX;
            } else if (nextX <= targetX && targetX <= currX) {
                nextX = targetX;
            }
            if (currY <= targetY && targetY <= nextY) {
                nextY = targetY;
            } else if (nextY <= targetY && targetY <= currY) {
                nextY = targetY;
            }

            this.sprite.position.x = nextX;
            this.sprite.position.y = nextY;

        }
    };

    interface SearchOption {
        x?: number;
        y?: number;
        id?: number;
        floor?: number;
        zoneId?: number;
        category?: Category;
    }

    export class EntityManager {
        table: Object;

        constructor() {
            this.table = {};
        }

        add(ent: Entity) {
            this.table[ent.movableId] = ent;
            //console.log(`[Entity=${ent.movableId}][Zone=${ent.zone.id}] added`);
        }

        removeId(movableId: number) {
            var ent = this.table[movableId]
            if (ent) {
                //console.log(`[Entity=${ent.movableId}][Zone=${ent.zone.id}] deleted`);
                delete this.table[movableId];
            }
        }

        remove(opts: SearchOption) {
            var self = this;
            var elemList: Entity[] = self.findAll(opts);
            _.each(elemList, function (ent) {
                self.removeId(ent.movableId);
            });
        }

        findAll(opts: SearchOption): Entity[] {
            var predList = [];
            var elemList: Entity[] = _.values(this.table);

            if ('id' in opts) {
                predList.push((ent: Entity) => {
                    return ent.movableId === opts.id;
                });
            }
            if ('x' in opts) {
                predList.push((ent: Entity) => {
                    return ent.x === opts.x;
                });
            }
            if ('y' in opts) {
                predList.push((ent: Entity) => {
                    return ent.y === opts.y;
                });
            }
            if('floor' in opts) {
                predList.push((ent: Entity) => {
                    var zoneId = new ZoneID(ent.zoneId);
                    return zoneId.floor == opts.floor; 
                });
            }
            if('zoneId' in opts) {
                predList.push((ent: Entity) => {
                    return ent.zoneId == opts.zoneId; 
                });
            }
            if('category' in opts) {
                predList.push((ent: Entity) => {
                    return ent.category == opts.category; 
                });
            }

            _.each(predList, function (pred) {
                elemList = _.filter(elemList, pred);
            });

            return elemList;
        }

        find(opts: SearchOption): Entity {
            var elemList: Entity[] = this.findAll(opts);
            if (elemList.length) {
                return elemList[0];
            } else {
                return null;
            }
        }
        
        all(): Entity[] {
            return _.values(this.table);
        }
    };
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Entity = kisaragi.Entity;
    exports.EntityHelper = kisaragi.EntityHelper;
    exports.EntityManager = kisaragi.EntityManager;
}
