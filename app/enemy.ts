// Ŭnicode please
///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
}

module kisaragi {
    var COOLTIME_THINK: number = 1.0;
    
    export class Enemy extends Entity {
        thinkCooltime: number;

        constructor(id: number, role: Role, pos: Coord) {
            super(id);
            this.category = Category.Enemy;
            this.role = role;
            this.pos = pos;

            this.thinkCooltime = 0;
        }

        updatePre(delta: number) {
            this.thinkCooltime -= delta;
            if (this.thinkCooltime < 0) {
                this.thinkCooltime = 0;
            }

            if (this.thinkCooltime === 0) {
                this.think();
                this.thinkCooltime = COOLTIME_THINK;
            }
        }

        think() {
            var nextPos = this.zone.findAnyEmptyPos();
            this.targetPos = nextPos;
        }
    };
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Enemy = kisaragi.Enemy;
}
