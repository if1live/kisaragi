// Ŭnicode please
/// <reference path="../app.d.ts" />

module kisaragi {
    var USER_SPRITE = 'user';
    var CURRENT_USER_SPRITE = 'current_user';
    var ENEMY_SPRITE = 'enemy';
    var ITEM_SPRITE = 'item';


    export class ServerEntityFactory {
        constructor() {
        }
    }

    export class ClientEntityFactory {
        state: Phaser.State;

        constructor(state: Phaser.State) {
            this.state = state;
        }

        preload() {
            this.state.load.image(USER_SPRITE, ASSET_PATH + 'sprites/kisaragi.png');
            this.state.load.image(CURRENT_USER_SPRITE, ASSET_PATH + 'sprites/mutsuki.png');
            this.state.load.image(ENEMY_SPRITE, ASSET_PATH + 'sprites/space-baddie-purple.png');
            this.state.load.image(ITEM_SPRITE, ASSET_PATH + 'sprites/blue_ball.png');    
        }

        createSkeleton(packet: NewObjectPacket) {
            var ent: Entity = null;

            var movableId = packet.movableId;
            var pos = new Coord(packet.x, packet.y);

            if (packet.category === Category.Player) {
                ent = Player.createClientEntity(movableId, null);
            } else if (packet.category === Category.Enemy) {
                ent = new Enemy(movableId, Role.Client, pos);
            } else {
                assert(!"unknown category");
            }

            ent.pos = pos;
            ent.zoneId = packet.zoneId;

            return ent;
        }

        createLoginPlayer(id: number, x: number, y:number, zoneId: number, group: Phaser.Group, conn: ClientConnection) {
            // 현재 유저의 경우만 네트워크같은 추가 처리가 필요하다
            // 그래서 함수 하나로 하는것보다는 둘로 쪼개는게 관리하기 편할거같더라
            var player = Player.createClientEntity(id, conn);
            player.pos = new Coord(x, y);
            player.zoneId = zoneId;
            player.sprite = this._createSprite(CURRENT_USER_SPRITE, group);
            return player;
        }

        create(packet: NewObjectPacket, group: Phaser.Group) {
            var ent = this.createSkeleton(packet);
            
            var spriteNameTable = {};
            spriteNameTable[Category.Player] = USER_SPRITE;
            spriteNameTable[Category.Enemy] = ENEMY_SPRITE;
            spriteNameTable[Category.Item] = ITEM_SPRITE;

            var spriteName = spriteNameTable[ent.category];
            ent.sprite = this._createSprite(spriteName, group);
            return ent;
        }

        _createSprite(spriteName: string, group: Phaser.Group) {
            var sprite = this.state.add.sprite(-100, -100, spriteName);
            group.add(sprite);

            sprite.anchor.set(0, 0);
            sprite.width = TILE_SIZE;
            sprite.height = TILE_SIZE;

            return sprite;
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.ServerEntityFactory = kisaragi.ServerEntityFactory;
    exports.ClientEntityFactory = kisaragi.ClientEntityFactory;
}
