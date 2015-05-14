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
  
    self.sock.send('s2c_login', self.serializer().serialize());
    self.notifyAllMoveOccur(world);
  };
  
  User.prototype.disconnect = function(world, obj) {
    var self = this;
    world.removeUser(self);

    self.notifyAllMoveOccur(world);
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
    self.sock.emit('c2s_requestMove', {
      x: x,
      y: y
    });
  };
  
  User.prototype.c2s_requestUserList = function(world, obj) {
    var self = this;
  
    // TODO rails 처럼 serializer를 분리하면 편할거같은데...
//    var userList = [];
//    var allUserList = world.objectList('user');
//    for(var i = 0 ; i < allUserList.length ; i += 1) {
//      userList.push(allUserList[i].serializer().serialize());
//    }
    self.notifyMoveOccur(world);
  };

  User.prototype.c2s_requestMove = function(world, obj) {
    var self = this;
    // level range check
    var pos = world.level.filterPosition(obj.x, obj.y);
    if(pos[0] !== obj.x || pos[1] !== obj.y) {
      return;
    }

    // prev object exist?
//    var prevObj = world.getObject(pos[0], pos[1]);
//    if(prevObj) {
//      return;
//    }

    // empty tile?
//    if(world.level.isEmptyTile(pos[0], pos[1]) === false) {
//      return;
//    }

    // position verify success
    self.targetPos = pos;

    // 전체 클라한테 위치 변경 알려주기
    //self.notifyAllMoveOccur(world);
  };
  
  User.prototype.createMoveOccurData = function(world) {
    return {
      'user_list': world.getUserList()
    };
  };
  User.prototype.notifyMoveOccur = function (world) {
    this.sock.send('s2c_moveOccur', this.createMoveOccurData(world));
  };
  User.prototype.notifyAllMoveOccur = function(world) {
    this.sock.broadcast('s2c_moveOccur', this.createMoveOccurData(world));
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

