// Ŭnicode please
///<reference path="../app.d.ts"/>

if (typeof module !== 'undefined') {
    _ = require('underscore');
}

module kisaragi {
    var COOLTIME_THINK: number = 0.5;
    var COOLTIME_MOVE: number = 0.3;

    var ENEMY_HP: number = 2;

    enum EnemyFSMState {
        Idle,
        Move,
        Attack,
    }
    
    export class Enemy extends Entity {
        thinkCooltime: number;
        hp: number;
        state: EnemyFSMState;

        constructor(id: number, role: Role, pos: Coord) {
            super(id, COOLTIME_MOVE);
            this.category = Category.Enemy;
            this.role = role;
            this.pos = pos;

            this.hp = ENEMY_HP;
            this.thinkCooltime = 0;

            this.state = EnemyFSMState.Idle;
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
            switch (this.state) {
                case EnemyFSMState.Idle:
                    this.think_idle();
                    break;
                case EnemyFSMState.Move:
                    this.think_move();
                    break;
                case EnemyFSMState.Attack:
                    this.think_attack();
                    break;
            }
        }

        think_idle() {
            var player = this.findTargetPlayer();
            if (!player) {
                return;
            }
            
            this.state = EnemyFSMState.Move;
        }

        think_attack() {
            var player = this.findTargetPlayer();
            if (!player) {
                this.state = EnemyFSMState.Idle;
                return;
            }

            var gridDist = this.pos.gridDistance(player.pos);
            if (gridDist > 1) {
                this.state = EnemyFSMState.Move;
                return;
            }

            this.targetPos = null;
            
            // attack
            var factory = new PacketFactory();

            if (player.hp > 0) {
                player.hp -= 1;
                var attackNotifyPacket = factory.attackNotify(this.movableId, player.movableId, 1);
                player.svrConn.broadcast(attackNotifyPacket);
            }

            if(player.hp <= 0) {
                player.hp = 0;

                console.log(`[Player=${player.movableId}] player dead`);
                // 플레이어를 떼버리면 연결이 무효화되어서 꼬일수있다
                // 플레이어 연결을 상태로 기반으로 유지하도록 설계 수정할것
                var removeObjectPacket = factory.removeObject(player.movableId);
                player.svrConn.broadcast(removeObjectPacket);
                this.world.remove(player);
            }
        }

        think_move() {
            var player = this.findTargetPlayer();
            if (!player) {
                this.state = EnemyFSMState.Idle;
                return;
            }

            var gridDist = this.pos.gridDistance(player.pos);
            if (gridDist == 1) {
                this.state = EnemyFSMState.Attack;
                return;
            }

            var nextPos = player.pos;
            this.targetPos = nextPos;
        }

        findTargetPlayer(): Player {
            var DETECTABLE_DIST = 5;

            // 가장 가까운 플레이어를 찾기. 
            var playerList = this.zoneEntityMgr.findAll({ category: Category.Player });
            if (playerList.length == 0) {
                return;
            }

            var minDist = 99999;
            var closestPlayer: Player = null;
            for (var i = 0; i < playerList.length; i += 1) {
                var player = <Player> playerList[i];
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
