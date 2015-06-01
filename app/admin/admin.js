// Ŭnicode please
///<reference path="../app.d.ts"/>
//if (typeof module !== 'undefined') {
//    var sprintf = require('sprintf').sprintf;
//}
var kisaragi;
(function (kisaragi) {
    var AdminHelper = (function () {
        function AdminHelper() {
        }
        AdminHelper.prototype.gameObjectToChar = function (entity, tile) {
            if (entity) {
                if (entity.category === kisaragi.Category.Player) {
                    //return sprintf("%02d", entity.movableId);
                    return entity.movableId.toString();
                }
                else if (entity.category === kisaragi.Category.Enemy) {
                    return 'EE';
                }
                // unknown
                return 'XX';
            }
            else {
                if (tile === kisaragi.TileCode.Empty) {
                    return '..';
                }
                else {
                    return '%%';
                }
            }
        };
        return AdminHelper;
    })();
    kisaragi.AdminHelper = AdminHelper;
})(kisaragi || (kisaragi = {}));
