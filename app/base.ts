///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
}


module kisaragi {
    export enum Role {
        Server,
        Client
    };

    export enum Category {
        Enemy,
        Player,
        Item,
    };

    export enum TileCode {
        Empty,
        Obstacle,
        Player,
        Enemy,
    }

    var COOLTIME_MOVE: number = 0.1;

    export class Coord {
        x: number;
        y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    export class Entity {
        // core attribute
        category: Category;
        movableId: number;
        entityMgr: EntityManager;

        world: GameWorld;

        // position
        pos: Coord;

        // server/client
        role: Role;

        // movable
        targetPos: Coord;
        moveCooltime: number;    

        // renderable
        sprite: Phaser.Sprite;
    
        constructor(id: number) {
            this.movableId = id;
            this.pos = new Coord(-1, -1);
            this.targetPos = null;
            this.world = null;
            this.moveCooltime = COOLTIME_MOVE;
            this.sprite = null;
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

        moveNotify(world: GameWorld) {
            var self = this;
            // send move notify to closed user
            var userList = world.objectList(Category.Player);
            _.each(userList, function (user: Player) {
                //TODO how to calculate distance?
                var maxDist = 1000000;
                var dist = Math.abs(self.x - user.x) + Math.abs(self.y - user.y);
                if (dist < maxDist) {
                    var packet = MoveNotifyPacket.create(self.movableId, self.x, self.y);
                    user.svrSock.send(packet);
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
            
            this.moveCooltime -= delta;
            if (this.moveCooltime < 0) {
                this.moveCooltime = 0;
            }

            //console.log(this.targetPos + '/' + this.moveCooltime);
            if (this.targetPos !== null && this.moveCooltime == 0) {
                var nextPos = self.world.level.findNextPos(self.pos, self.targetPos, self.world);
                if (!nextPos) {
                    self.targetPos = null;
                    return;
                }

                this.pos = nextPos;
                this.moveNotify(self.world);

                if (self.pos.x === self.targetPos.x && self.pos.y === self.targetPos.y) {
                    self.targetPos = null;
                }

                this.moveCooltime = COOLTIME_MOVE;
            }
        };
    };

    interface SearchOption {
        x?: number;
        y?: number;
        id?: number;
    }

    export class EntityManager {
        table: Object;

        constructor() {
            this.table = {};
        }

        add(ent: Entity) {
            this.table[ent.movableId] = ent;
        }

        removeId(movableId: number) {
            delete this.table[movableId];
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
                    return ent.movableId == opts.id;
                });
            }
            if ('x' in opts) {
                predList.push((ent: Entity) => {
                    return ent.x == opts.x;
                });
            }
            if ('y' in opts) {
                predList.push((ent: Entity) => {
                    return ent.y == opts.y;
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
    };

    export class EntityListHelper {
        list: Entity[];

        constructor(list: Entity[]) {
            var self = this;
            self.list = list;
        }

        get length(): number {
            return this.list.length;
        }

        add(ent: Entity): boolean {
            var self = this;
            if (ent === null) {
                return false;
            }
            var prev = self.find(ent.movableId);
            if (prev) {
                return false;
            }
            self.list.push(ent);
            return true;
        }

        find(pk: number): Entity {
            var filtered = _.filter(this.list, function (obj) {
                return obj.movableId === pk;
            });
            if (filtered.length === 0) {
                return null;
            } else {
                return filtered[0];
            }
        };

        removeId(pk: number): boolean {
            var self = this;
            for (var i = 0; i < self.list.length; i += 1) {
                if (self.list[i].movableId === pk) {
                    self.list.splice(i, 1);
                    return true;
                }
            }
            return false;
        };

        removeEntity(ent: Entity): boolean {
            var self = this;
            if (!ent) {
                return false;
            }
            return self.removeId(ent.movableId);
        };
    }
}


declare var exports: any;
if (typeof exports != 'undefined') {
    exports.Role = kisaragi.Role;
    exports.Category = kisaragi.Category;
    exports.TileCode = kisaragi.TileCode;
    exports.Coord = kisaragi.Coord;
    exports.Entity = kisaragi.Entity;
    exports.EntityManager = kisaragi.EntityManager;
    exports.EntityListHelper = kisaragi.EntityListHelper;
}
