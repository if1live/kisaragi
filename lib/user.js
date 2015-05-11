(function() {
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

  function User(client) {
    var self = this;
    self.category = 'user';

    // client - user는 서로 연결시켜놓기
    self.client = client;
    if(client !== null && client !== undefined) {
      client.user = self;
    }
  }
  User.prototype = new base.GameObject();
  User.prototype.constructor = User;

  User.prototype.connect = function(world, obj) {
    var self = this;
    world.addUser(self);
  
    self.client.send('s2c_login', self.serializer().serialize());
    self.notifyAllMoveOccur(world);
  };
  
  User.prototype.disconnect = function(world, obj) {
    var self = this;
    world.removeUser(self);

    self.notifyAllMoveOccur(world);
  };
  
  User.prototype.c2s_requestMap = function(world, obj) {
    var self = this;
    self.client.send('s2c_responseMap', world.level.serializer().serialize());
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
    if(world.level.isEmptyTile(pos[0], pos[1]) === false) {
      return;
    }

    world.level.setWalkableAt(self.pos[0], self.pos[1], true);
    world.level.setWalkableAt(pos[0], pos[1], false);

    // position verify success
    self.pos = pos;

    // 전체 클라한테 위치 변경 알려주기
    self.notifyAllMoveOccur(world);
  };
  
  User.prototype.createMoveOccurData = function(world) {
    return {
      'user_list': world.getUserList()
    };
  };
  User.prototype.notifyMoveOccur = function (world) {
    this.client.send('s2c_moveOccur', this.createMoveOccurData(world));
  };
  User.prototype.notifyAllMoveOccur = function(world) {
    this.client.broadcast('s2c_moveOccur', this.createMoveOccurData(world));
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
