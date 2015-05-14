(function() {
  "use strict";

  var _global = this;

  var base = null, assert = null;
  if(typeof module !== 'undefined') {
    var _ = require('underscore');
    assert = require('assert');
    base = require('./base');
  } else {
    assert = window.assert;
    base = window.base;
  }

  function User(role, sock) {
    assert(role !== undefined);

    var self = this;
    self.category = 'user';
    self.role = role;

    // sock - user는 서로 연결시켜놓기. sock != socket io object
    self.sock = sock;
    if(sock && role === 'svr') {
      sock.user = self;
    }
  }
  User.prototype = new base.GameObject();
  User.prototype.constructor = User;

  User.prototype.connect = function(world, obj) {
    var self = this;
    world.addUser(self);
  
    var loginData = self.serializer().serialize();
    loginData.width = world.level.width;
    loginData.height = world.level.height;
    self.sock.send('s2c_login', loginData);
    
    self.sock.broadcast('s2c_newObject', self.serializer().serialize());
    
    // give dynamic object's info to new user
    _.each(world.allObjectList(), function(obj) {
      self.sock.send('s2c_newObject', obj.serializer().serialize());
    });
  };
  
  User.prototype.disconnect = function(world, obj) {
    var self = this;
    world.removeUser(self);
    self.sock.broadcast('s2c_removeObject', {id: self.id});
  };
  
  User.prototype.c2s_requestMap = function(world, obj) {
    var self = this;
    var data = world.level.serializer().serialize();
    self.sock.send('s2c_responseMap', data);
  };

  // move function
  User.prototype.moveOneTile = function(dx, dy) {
    var self = this;
    assert(self.role === 'cli');

    var isLeft = (dx === -1 && dy === 0);
    var isRight = (dx === 1 && dy === 0);
    var isUp = (dx === 0 && dy === 1);
    var isDown = (dx === 0 && dy === -1);

    // allow only one tile move
    if(!(isLeft || isRight || isUp || isDown)) {
      return false;
    }

    var x = self.pos[0] + dx;
    var y = self.pos[1] + dy;
    self.requestMoveTo(x, y);

    return true;
  };

  User.prototype.moveLeft = function() {
    this.moveOneTile(-1, 0);
  };
  User.prototype.moveRight = function() {
    this.moveOneTile(1, 0);
  };
  User.prototype.moveUp = function() {
    this.moveOneTile(0, 1);
  };
  User.prototype.moveDown = function() {
    this.moveOneTile(0, -1);
  };

  User.prototype.requestMoveTo = function(x, y) {
    var self = this;
    if(self.world && !self.world.isMovablePos(x, y)) {
      return;
    }
    self.sock.emit('c2s_requestMove', {
      x: x,
      y: y
    });
  };

  User.prototype.c2s_requestMove = function(world, data) {
    if(world.isMovablePos(data.x, data.y)) {
      this.targetPos = [data.x, data.y];
    }
  };
  
  User.prototype.serializer = function() {
    return new base.Serializer(['category', 'id', 'pos'], this);
  };

  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = User;
  } else {
    _global.User = User;
  }
}).call(this);

