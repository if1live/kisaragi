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
    // TODO 이동 검증같은거 넣어야되는데
    var x = (obj.x < 0 ? 0 : (obj.x >= world.level.width ? (world.level.width - 1) : obj.x));
    var y = (obj.y < 0 ? 0 : (obj.y >= world.level.height ? (world.level.height - 1) : obj.y));
    var pos = [x, y];
    self.pos = pos;
  
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