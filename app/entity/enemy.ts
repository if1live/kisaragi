// Ŭnicode please
///<reference path="../app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
}

module kisaragi {
    var COOLTIME_THINK: number = 1.0;
    var COOLTIME_MOVE: number = 0.3;
    
    export class Enemy extends Entity {
        thinkCooltime: number;

        constructor(id: number, role: Role, pos: Coord) {
            super(id, COOLTIME_MOVE);
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

            var player = this.findTargetPlayer();
            if (player) {
                var gridDist = this.pos.gridDistance(player.pos);
                if (gridDist == 1) {
                    this.targetPos = null;
                }
            }
        }

        think() {
            var player = this.findTargetPlayer();
            if (!player) {
                return;
            }

            var gridDist = this.pos.gridDistance(player.pos);
            if (gridDist == 1) {
                // attack. 이동정지
                // 이동을 한번 더 하면 캐릭터-적이 겹치는것처럼 되서 어색하다
                this.targetPos = null;
            } else {
                var nextPos = player.pos;
                this.targetPos = nextPos;
            }
        }

        findTargetPlayer(): Entity {
            var DETECTABLE_DIST = 5;

            // 가장 가까운 플레이어를 찾기. 
            var playerList = this.zoneEntityMgr.findAll({ category: Category.Player });
            if (playerList.length == 0) {
                return;
            }

            var minDist = 99999;
            var closestPlayer: Entity = null;
            for (var i = 0; i < playerList.length; i += 1) {
                var player = playerList[i];
                var dist = this.pos.distance(player.pos);
                if (dist < minDist) {
                    closestPlayer = player;
                    minDist = dist;
                }
            }

            if (minDist > DETECTABLE_DIST) {
                return null;
            }

            return closestPlayer;
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Enemy = kisaragi.Enemy;
}
