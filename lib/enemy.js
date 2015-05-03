(function(){
  var _global = this;
  
  function Enemy(pos) {
    var self = this;
    self.category = 'enemy';
  
    self.pos = pos;
  }


  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = Enemy;
  } else {
    _global.Enemy = Enemy;
  }
}).call(this);

