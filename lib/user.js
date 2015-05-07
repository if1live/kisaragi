(function() {
  var _global = this;

  if(typeof module !== 'undefined') {
    var _ = require('underscore');
    var base = require('./base');
  }

  function User(client) {
    var self = this;
    self.category = 'user';

    self.id = null;

    // client - user는 서로 연결시켜놓기
    self.client = client;
    if(client !== null && client !== undefined) {
      client.user = self;
    }
  
    // user info [x, y]
    self.pos = [-1, -1];
  }
  
  User.prototype.connect = function(world, obj) {
    var self = this;
    world.addUser(self);
  
    self.client.send('login', self.serializer().serialize());
  };
  
  User.prototype.disconnect = function(world, obj) {
    var self = this;
    world.removeUser(self);
  };
  
  User.prototype.requestMap = function(world, obj) {
    var self = this;
    self.client.send('requestMap', world.level.serializer().serialize());
  };
  
  User.prototype.requestUserList = function(world, obj) {
    var self = this;
  
    // TODO rails 처럼 serializer를 분리하면 편할거같은데...
    var userList = [];
    var allUserList = world.objectList('user');
    for(var i = 0 ; i < allUserList.length ; i += 1) {
      userList.push(allUserList[i].serializer().serialize());
    }
  
    self.client.send('moveOccur', {
      'user_list': userList,
    });
  };

  User.prototype.requestMove = function(world, obj) {
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
    self.client.broadcast('moveOccur', {
        'user_list': world.getUserList()
    });
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
