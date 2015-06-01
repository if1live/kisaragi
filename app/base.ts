// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
}


module kisaragi {
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
if (typeof exports !== 'undefined') {
    exports.Entity = kisaragi.Entity;
    exports.EntityManager = kisaragi.EntityManager;
    exports.EntityListHelper = kisaragi.EntityListHelper;
}
