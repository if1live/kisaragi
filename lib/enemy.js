(function(){
  var _global = this;
  
  function Enemy(id, pos) {
    var self = this;
    self.type = 'enemy';
  
    self.id = id;
    self.pos = pos;
  }


  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = Enemy;
  } else {
    _global.Enemy = Enemy;
  }
}).call(this);

