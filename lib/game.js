var _ = require('underscore');

function User(client) {
  var self = this;
  self.type = 'user';

  self.id = null;

  // client - user는 서로 연결시켜놓기
  self.client = client;
  if(client !== null) {
    client.user = self;
  }

  // user info [y, x]
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
    width: world.width,
    height: world.height,
    data: world.map
  });
};

User.prototype.requestUserList = function(world, obj) {
  var self = this;

  // TODO rails 처럼 serializer를 분리하면 편할거같은데...
  var userList = [];
  for(var i = 0 ; i < world.userList.length ; i += 1) {
    var user = world.userList[i];
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
  var pos = [obj.y, obj.x];
  self.pos = pos;

  // 전체 클라한테 위치 변경 알려주기
  var userList = [];
  for(var i = 0 ; i < world.userList.length ; i += 1) {
    var user = world.userList[i];
    userList.push({
      id: user.id,
      pos: user.pos
    });
  }
  self.client.broadcast('moveOccur', {
    'user_list': userList
  });
};

function Enemy(id, pos) {
  var self = this;
  self.type = 'enemy';

  self.id = id;
  self.pos = pos;
}

function World() {
  var self = this;
  self.tickCount = 0;
  self.initialTime = Date.now();

  self.nextClientId = 1;

  // TODO 나중에 quad tree 같은거 붙여서 검색 가속
  // 일단은 구현 간단하게 리스트
  self.userList = [];
  self.enemyList = [];

  // 프로토타입의 구현은 간단하게 무식한 격자 배열로 구성
  self.width = 40;
  self.height = 20;
  self.map = [];
  for(var y = 0 ; y < self.height ; y += 1) {
    var line = [];
    for(var x = 0 ; x < self.width ; x += 1) {
      line.push(0);
    }
    self.map.push(line);
  }
}

World.prototype.getNextId = function() {
  var self = this;
  var retval = self.nextClientId;
  self.nextClientId += 1;
  return retval;
};


World.prototype.getRunningTime = function() {
  var self = this;
  var now = Date.now();
  return (now - self.initialTime) / 1000;
};

World.prototype.getGameObjectList = function() {
  var self = this;
  var objList = [];
  objList = objList.concat(self.userList);
  objList = objList.concat(self.enemyList);
  return objList;
};

World.prototype.getObject = function(y, x) {
  var self = this;

  // if object exist, return object(user, enemy,...)
  var objectGroupList = [
    self.userList,
    self.enemyList
  ];
  for(var i = 0 ; i < objectGroupList.length ; i += 1) {
    var filtered = _.filter(objectGroupList[i], function(el) {
      return (el.pos[0] === y && el.pos[1] === x);
    });
    if(filtered.length > 0) {
      return filtered[0];
    }
  }

  return self.getTile(y, x);
};

World.prototype.getTile = function(y, x) {
  var self = this;
  return self.map[y][x];
};

World.prototype.getUserCount = function() {
  return this.userList.length;
};

World.prototype.createUser = function(client) {
  var user = new User(client);
  return user;
};

World.prototype.addUser = function(user) {
  var self = this;

  user.id = self.getNextId();

  // 유저를 적당한 곳에 배치하기
  user.pos = self.findAnyEmptyPos();
  this.userList.push(user);
};

World.prototype.findUser = function(pk) {
  var filtered = _.filter(this.userList, function(user) {
    return user.id === pk;
  });
  if(filtered.length === 0) {
    return null;
  } else {
    return filtered[0];
  }
};

World.prototype.findGameObject = function(pk) {
  var filtered = _.filter(this.getGameObjectList(), function(obj) {
    return obj.id === pk;
  });
  if(filtered.length === 0) {
    return null;
  } else {
    return filtered[0];
  }
};

World.prototype.removeUser = function(user) {
  this.userList = _.reject(this.userList, function(x) {
    return user.id === x.id;
  });
};

World.prototype.generateEnemy = function() {
  var self = this;
  var pos = self.findAnyEmptyPos();
  var id = self.getNextId();
  var enemy = new Enemy(id, pos);
  self.enemyList.push(enemy);
  return enemy;
};

World.prototype.findAnyEmptyPos = function() {
  // 빈자리 적당히 찾기
  // 야매로 될때까지 생성. 설마 100번 동안 삽질하겠어?
  // TODO 나중에 제대로 고치기
  var self = this;
  for(var i = 0 ; i < 100 ; i += 1) {
    // 유저를 적당한 곳에 배치하기
    var y = Math.floor(Math.random() * self.height);
    var x = Math.floor(Math.random() * self.width);
    var obj = self.getObject(y, x);
    if(obj === 0) {
      return [y, x];
    }
  }
  return [-1, -1];
};

World.prototype.update = function(delta) {
  var self = this;
  self.tickCount += 1;
  //console.log('Hi there! (frame=%s, delta=%s)', self.frameCount++, delta);
};

function AdminHelper() {
}
AdminHelper.prototype.gameObjectToChar = function(obj) {
  if(typeof obj === 'number') {
    var table = {
      '0': '.',
      '1': '1'
    };
    return table[obj];

  }
  if(obj.type === 'user') {
    return 'U';

  } else if(obj.type === 'enemy') {
    return 'E';
  }
  // unknown
  return 'X';
};

var exports = module.exports;
// game object
exports.World = World;
exports.User = User;
exports.Enemy = Enemy;
// for admin
exports.AdminHelper = AdminHelper;
