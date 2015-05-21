///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
}

module kisaragi {
    export class GameWorld {
        role: Role;
        tickCount: number;
        initialTime: number;
        nextClientId: number;

        objectListTable: any;
        level: Level;

        constructor(role: Role) {
            var self = this;
            self.role = role;
            self.tickCount = 0;
            self.initialTime = Date.now();

            self.nextClientId = 1;

            // TODO 나중에 quad tree 같은거 붙여서 검색 가속
            // 일단은 구현 간단하게 리스트
            self.objectListTable = {};

            // 프로토타입의 구현은 간단하게 무식한 격자 배열로 구성
            self.level = new Level();
        }

        loadLevelFile(filename: string) {
            this.level.loadFromFile(filename);
        };

        getNextId(): number {
            var self = this;
            var retval = self.nextClientId;
            self.nextClientId += 1;
            return retval;
        };

        getRunningTime(): number {
            var self = this;
            var now = Date.now();
            return (now - self.initialTime) / 1000;
        };

        // General Game Object Access Function Start
        objectList(category: Category): Entity[] {
            var self = this;
            if (self.objectListTable[category] === undefined) {
                self.objectListTable[category] = [];
            }
            return self.objectListTable[category];
        };

        objectListHelper(category: Category): EntityListHelper {
            return new EntityListHelper(this.objectList(category));
        };

        allObjectList(): Entity[] {
            var self = this;
            var objList = [];
            _.each(_.values(self.objectListTable), function (list, idx) {
                objList = objList.concat(list);
            });
            return objList;
        };

        addObject(obj: Entity): boolean {
            var self = this;
            if (!obj.world) {
                obj.world = self;
            }

            if (obj.movableId === null || obj.movableId === undefined) {
                obj.movableId = self.getNextId();    
                return self.objectListHelper(obj.category).add(obj);
            } else {
                return false;
            }
        };

        attachObject(obj: Entity): boolean {
            var self = this;
            if (!obj.world) {
                obj.world = self;
            }

            if (obj.movableId === null || obj.movableId === undefined) {
                return false;
            }
            self.objectListHelper(obj.category).add(obj);
            return true;
        };

        removeObject(obj: Entity) {
            if (obj.sprite) {
                obj.sprite.parent.removeChild(obj.sprite);
                obj.sprite.destroy();
            }
            this.objectListHelper(obj.category).removeEntity(obj);
        };

        removeId(pk: number) {
            var self = this;
            var obj = self.findObject(pk);
            if (obj) {
                self.removeObject(obj);
            }
        };

        findObject(pk: number): Entity {
            var filtered = _.map(_.values(this.objectListTable), function (list) {
                var helper = new EntityListHelper(list);
                return helper.find(pk);
            });
            filtered = _.filter(filtered, function (obj) {
                return obj !== null;
            });
            return filtered[0];
        };

        getObject(x: number, y: number): Entity {
            var self = this;
            // if object exist, return object(user, enemy,...)
            var pred = function (el: Entity) {
                return (el.pos.x === x && el.pos.y === y);
            };
            var filtered = _.filter(self.allObjectList(), pred);
            if (filtered.length > 0) {
                return filtered[0];
            }
            return null;
        };

        // Game Object
        findAnyEmptyPos(): Coord {
            // 빈자리 적당히 찾기
            // 야매로 될때까지 생성. 설마 100번 동안 삽질하겠어?
            // TODO 나중에 제대로 고치기
            var self = this;
            for (var i = 0; i < 100; i += 1) {
                // 유저를 적당한 곳에 배치하기
                var y = Math.floor(Math.random() * self.level.height);
                var x = Math.floor(Math.random() * self.level.width);
                if (self.level.isEmptyTile(x, y) === false) {
                    continue;
                }
                var obj = self.getObject(x, y);
                if (obj === null) {
                    return new Coord(x, y);
                }
            }
            return new Coord(-1, -1);
        };

        // User 
        getUserCount(): number {
            return this.objectList(Category.Player).length;
        }

        createUser(sock: ServerSocket): Player {
            var user = Player.createServerEntity(null, sock);
            return user;
        }

        addUser(user: Player) {
            var self = this;
            // 유저를 적당한 곳에 배치하기
            var pos = self.findAnyEmptyPos();
            user.pos = pos;
            self.addObject(user);
        }

        findUser(pk: number) {
            return this.objectListHelper(Category.Player).find(pk);
        }

        removeUser(user: Player) {
            var self = this;
            self.removeObject(user);
        }

        // Enemy
        generateEnemy(): Enemy {
            var self = this;
            var pos = self.findAnyEmptyPos();
            var enemy = new Enemy(null, Role.Server, pos);
            self.addObject(enemy);
            return enemy;
        }
  
        // level
        // can i go there?
        isMovablePos(x: number, y: number): boolean {
            var self = this;
            // level range check
            var pos = self.level.filterPosition(x, y);
            if (pos[0] !== x || pos[1] !== y) {
                return false;
            }
            // empty tile?
            if (self.level.isEmptyTile(pos[0], pos[1]) === false) {
                return false;
            }
            // prev object exist?
            var prevObj = self.getObject(pos[0], pos[1]);
            if (prevObj) {
                return false;
            }
            return true;
        }

        // Game Logic
        update(delta: number) {
            var self = this;
            self.tickCount += 1;
            //console.log('Hi there! (frame=%s, delta=%s)', self.frameCount++, delta);
    
            var userList = self.objectList(Category.Player);
            _.each(userList, function (user: Entity) {
                user.update(delta);
            });

            _.each(self.objectList(Category.Enemy), function (enemy: Entity) {
                enemy.update(delta);
            });
    
            // fill enemy
            while (self.objectList(Category.Enemy).length <= 2) {
                self.generateEnemy();
            }
        }
    }
}

declare var exports: any;
if (typeof exports != 'undefined') {
    exports.GameWorld = kisaragi.GameWorld;
}
