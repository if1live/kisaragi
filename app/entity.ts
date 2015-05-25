// Ŭnicode please
///<reference path="app.d.ts"/>
module kisaragi {
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
            this.moveCooltime = kisaragi.COOLTIME_MOVE;
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
            var factory = new PacketFactory();
            // send move notify to closed user
            var userList = world.objectList(Category.Player);
            _.each(userList, function (user: Player) {
                //TODO how to calculate distance?
                var maxDist = 1000000;
                var dist = Math.abs(self.x - user.x) + Math.abs(self.y - user.y);
                if (dist < maxDist) {
                    var packet = factory.moveNotify(self.movableId, self.x, self.y);
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

            if (this.targetPos !== null && this.moveCooltime === 0) {
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
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Entity = kisaragi.Entity;
    exports.EntityManager = kisaragi.EntityManager;
}
