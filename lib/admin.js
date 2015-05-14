(function(exports) {
  "use strict";
  var sprintf = require('sprintf').sprintf;

  function AdminHelper() {
  }
  AdminHelper.prototype.gameObjectToChar = function(obj, tile) {
    if(obj) {
      if(obj.category === 'user') {
        return sprintf("%02d", obj.id);
      } else if(obj.category === 'enemy') {
        return 'EE';
      }
      // unknown
      return 'XX';
    } else {
      if(tile.walkable) {
        return '..';
      } else {
        return '%%';
      }
    }
  };

  exports.AdminHelper = AdminHelper;

})(typeof exports === 'undefined'? this.world={}: exports);