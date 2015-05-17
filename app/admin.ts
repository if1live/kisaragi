///<reference path="app.d.ts"/>

//if (typeof module !== 'undefined') {
//    var sprintf = require('sprintf').sprintf;
//}

module kisaragi {
    export class AdminHelper {
        constructor() {
        }

        gameObjectToChar(entity: Entity, tile: TileCode) {
            if (entity) {
                if (entity.category == Category.Player) {
                    //return sprintf("%02d", entity.movableId);
                    return entity.movableId.toString();
                } else if (entity.category == Category.Enemy) {
                    return 'EE';
                }
                // unknown
                return 'XX';
            } else {
                if (tile == TileCode.Empty) {
                    return '..';
                } else {
                    return '%%';
                }
            }
        }
    }
}
