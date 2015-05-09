(function() {
  // Player : user for client
  
  var _global = this;
  
  var _ = null;
  if(typeof module !== 'undefined') {
    _ = require('underscore');
  } else {
    _ = _global._;
  }

  function Player(user, socket) {
    var self = this;
    self.user = user;
    self.socket = socket;
    
    // register socket handler
  }
  
  Player.prototype.moveOneTile = function(dx, dy) {
    var self = this;
    
    var isLeft = (dx === -1 && dy === 0);
    var isRight = (dx === 1 && dy === 0);
    var isUp = (dx === 0 && dy === 1);
    var isDown = (dx === 0 && dy === -1);
    
    // allow only one tile move
    if(!(isLeft || isRight || isUp || isDown)) {
      return false;
    }
    
    var x = self.user.x + dx;
    var y = self.user.y + dy;
    self.requestMoveTo(x, y);
    
    return true;
  };
  
  Player.prototype.moveLeft = function() {
    this.moveOneTile(-1, 0);
  };
  Player.prototype.moveRight = function() {
    this.moveOneTile(1, 0);
  };
  Player.prototype.moveUp = function() {
    this.moveOneTile(0, 1);
  };
  Player.prototype.moveDown = function() {
    this.moveOneTile(0, -1);
  };
  
  Player.prototype.requestMoveTo = function(x, y) {
    var self = this;
    self.socket.emit('c2s_requestMove', {
      x: x,
      y: y
    });
  };
  
  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = Player;
  } else {
    _global.Player = Player;
  }
}).call(this);
