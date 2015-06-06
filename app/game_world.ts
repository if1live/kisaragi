// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
}

module kisaragi {
    export class GameWorld {
        role: Role;
        tickCount: number;
        initialTime: number;
        nextEntityId: number;

        zones: Zone[];
        entityMgr: EntityManager;

        constructor(role: Role) {
            var self = this;
            self.role = role;
            self.tickCount = 0;
            self.initialTime = Date.now();

            self.nextEntityId = 1;
            
            this.entityMgr = new EntityManager();

            // world contains many level(=zone)
            // create some zone
            self.zones = [];
            for(var i = 0 ; i < 10 ; i += 1) {
                var zoneId = ZoneID.buildId(0, 0, i);
                var zone = new Zone(zoneId);
                self.zones.push(zone);
            }
        }
        
        zone(zoneId: number): Zone {
            return this.zones[zoneId];
        }

        getNextId(): number {
            var self = this;
            var retval = self.nextEntityId;
            self.nextEntityId += 1;
            return retval;
        };

        getRunningTime(): number {
            var self = this;
            var now = Date.now();
            return (now - self.initialTime) / 1000;
        };

        add(ent: Entity): boolean {
            if(ent.world) { return false; }
            if(ent.zone) { return false; }
            if(!ent.movableId) {
                ent.movableId = this.getNextId();
            }
            
            var zone = _.filter(this.zones, (zone: Zone) => { return zone.id == ent.zoneId; })[0];
            zone.attach(ent);

            ent.world = this;
            this.entityMgr.add(ent);
            
            return true;
        };

        attach(ent: Entity): boolean {
            if(ent.world) { return false; }
            if(ent.zone) { return false; }
            if(!ent.movableId) { return false; }

            var zone = _.filter(this.zones, (zone: Zone) => { return zone.id == ent.zoneId; })[0];
            zone.attach(ent);
                        
            ent.world = this;
            this.entityMgr.add(ent);

            return true;
        };

        remove(ent: Entity) {
            if (ent.sprite) {
                ent.sprite.parent.removeChild(ent.sprite);
                ent.sprite.destroy();
            }
            this.entityMgr.removeId(ent.movableId);
            ent.zone.detach(ent);
        };

        removeId(pk: number) {
            var self = this;
            var obj = self.findObject(pk);
            if (obj) {
                self.remove(obj);
            }
        };

        findObject(pk: number): Entity {
            var found = this.entityMgr.find({id: pk});
            return found;
        };

        getObject(x: number, y: number): Entity {
            return this.entityMgr.find({x: x, y: y});
        };

        // User 
        getUserCount(): number {
            return this.entityMgr.findAll({category: Category.Player}).length;
        }

        createUser(sock: ServerConnection): Player {
            var user = Player.createServerEntity(null, sock);
            return user;
        }

        addUser(user: Player): Player {
            var pos = this.zone(user.zoneId).level.getSpecialCoord(TileCode.LevelStart);
            user.pos = pos;
            this.add(user);
            return user;
        }

        findUser(pk: number) {
            var found = this.entityMgr.find({
                category: Category.Player,
                id: pk
            });
            return found;
        }

        removeUser(user: Player) {
            var self = this;
            self.remove(user);
        }

        // Enemy
        generateEnemy(zone: Zone): Enemy {
            var pos = zone.findAnyEmptyPos();
            var enemy = new Enemy(null, Role.Server, pos);
            enemy.zoneId = zone.id;
            
            this.add(enemy);
            return enemy;
        }

        // Game Logic
        update(delta: number) {
            var self = this;
            self.tickCount += 1;
            //console.log('Hi there! (frame=%s, delta=%s)', self.frameCount++, delta);
            
            _.each(this.zones, (zone: Zone) => {
                zone.update(delta);
            });
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.GameWorld = kisaragi.GameWorld;
}
