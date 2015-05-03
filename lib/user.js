(function() {
  var _global = this;

  function User(client) {
    var self = this;
    self.category = 'user';

    self.id = null;

    // client - user는 서로 연결시켜놓기
    self.client = client;
    if(client !== null) {
      client.user = self;
    }
  
    // user info [x, y]
    self.pos = [-1, -1];
  }
  
  User.prototype.connect = function(world, obj) {
    var self = this;
    world.addUser(self);
  
    self.client.send('login', {
      id: self.id,
      pos: self.pos
    });
  };
  
  User.prototype.disconnect = function(world, obj) {
    var self = this;
    world.removeUser(self);
  };
  
  User.prototype.requestMap = function(world, obj) {
    var self = this;
    self.client.send('requestMap', {
      width: world.level.width,
      height: world.level.height,
      data: world.level.data
    });
  };
  
  User.prototype.requestUserList = function(world, obj) {
    var self = this;
  
    // TODO rails 처럼 serializer를 분리하면 편할거같은데...
    var userList = [];
    var allUserList = world.objectList('user');
    for(var i = 0 ; i < allUserList.length ; i += 1) {
      var user = allUserList[i];
      userList.push({
        id: user.id,
        pos: user.pos
      });
    }
  
    self.client.send('moveOccur', {
      'user_list': userList,
    });
  };

  User.prototype.requestMove = function(world, obj) {
    var self = this;
    // level range check
    var pos = world.level.filterPosition(obj.x, obj.y);
    if(pos[0] === obj.x && pos[1] === obj.y) {
      return;
    }
    self.pos = pos;

    // prev object exist?
    var prevObj = world.getObject(self.pos.x, self.pos.y);
    if(prevObj) {
      return;
    }

    // empty tile?
    if(world.level.isEmptyTile(self.pos.x, self.pos.y) === false) {
      return;
    }

    // 전체 클라한테 위치 변경 알려주기
    var userList = [];
    var allUserList = world.objectList('user');
    for(var i = 0 ; i < allUserList.length ; i += 1) {
      var user = allUserList[i];
      userList.push({
        id: user.id,
        pos: user.pos
      });
    }
  //  self.client.broadcast('moveOccur', {
  //    'user_list': userList
  //  });
  };


  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = User;
  } else {
    _global.User = User;
  }
}).call(this);