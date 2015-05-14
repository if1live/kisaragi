(function(){
  "use strict";

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
    
    self.thinkCooltime = 0;
    self.COOLTIME_THINK = 1.0;
  }
  Enemy.prototype = new base.GameObject();
  Enemy.prototype.constructor = Enemy;
  
  Enemy.prototype.updatePre = function(delta) {
    var self = this;
    self.thinkCooltime -= delta;
    if(self.thinkCooltime < 0) {
      self.thinkCooltime = 0;
    }
    if(self.thinkCooltime === 0) {
      self.think();
      self.thinkCooltime = self.COOLTIME_THINK;
    }
  };
  
  Enemy.prototype.think = function() {
    var self = this;
    var nextPos = self.world.findAnyEmptyPos();
    self.targetPos = nextPos;
  };

  Enemy.prototype.serializer = function() {
    return new base.Serializer(['category', 'id', 'pos'], this);
  };

  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = Enemy;
  } else {
    _global.Enemy = Enemy;
  }
}).call(this);

