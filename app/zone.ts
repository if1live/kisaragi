// Ŭnicode please
///<reference path="app.d.ts"/>

module kisaragi {
    export class Zone {
        zoneId: ZoneID;

        entityMgr: EntityManager;
        level: Level;

        constructor(id: number) {
            this.zoneId = new ZoneID(id);
            this.entityMgr = new EntityManager();
            this.level = new Level();
            this.level.reset(10, 10);
        }
        
        get id(): number {
            if(this.zoneId) {
                return this.zoneId.id;
            } else {
                return -1;
            }
        }
        
        getObject(x: number, y: number): Entity {
            var found = this.entityMgr.find({
                x: x,
                y: y
            });
            return found;
        }

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
        }
        
        attach(ent: Entity) {
            if(ent.zone != null) { throw "zone#attach : detach entity first"; }
            if(!ent.movableId) { throw "zone#attach : movable id not exist"; }
            
            ent.zone = this;
            ent.zoneEntityMgr = this.entityMgr;
            this.entityMgr.add(ent);
        }
        
        detach(ent: Entity) {
            if(ent.zone == null) { throw "zone#detach : not attched entity"; }
            if(ent.zone != this) { throw "zone#detach : parent zone is not curr zone"; }
            
            this.entityMgr.removeId(ent.movableId);
            ent.zone = null;
            ent.zoneEntityMgr = null;
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
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Zone = kisaragi.Zone;
}