(function(){
  var _global = this;

  if(typeof module !== 'undefined') {
    var base = require('./base');
  }

  function Enemy(pos) {
    var self = this;
    self.category = 'enemy';

    self.pos = pos;
  }

  Enemy.prototype.serializer = function() {
    return new base.Serializer(['category', 'id', 'pos'], this);
  };

  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = Enemy;
  } else {
    _global.Enemy = Enemy;
  }
}).call(this);

