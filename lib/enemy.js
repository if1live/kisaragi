(function(){
  var _global = this;

  var base = null;
  if(typeof module !== 'undefined') {
    base = require('./base');
  } else {
    base = window.base;
  }

  function Enemy(role, pos) {
    var self = this;
    self.category = 'enemy';
    self.role = role;
    self.pos = pos;
  }
  Enemy.prototype = new base.GameObject();
  Enemy.prototype.constructor = Enemy;

  Enemy.prototype.serializer = function() {
    return new base.Serializer(['category', 'id', 'pos'], this);
  };

  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = Enemy;
  } else {
    _global.Enemy = Enemy;
  }
}).call(this);

