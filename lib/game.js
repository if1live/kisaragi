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
};

User.prototype.disconnect = function(world, obj) {
  var self = this;
  world.removeUser(self);
};


function World() {
  var self = this;
  self.tickCount = 0;
  self.initialTime = Date.now();

  self.nextClientId = 1;

  self.userList = [];

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

World.prototype.getObject = function(y, x) {
  var self = this;
  // if object exist, return object(user, enemy,...)
  // user loop
  var filteredUser = _.filter(self.userList, function(el) {
    return (el.pos[0] === y && el.pos[1] === x);
  });
  if(filteredUser.length > 0) {
    return filteredUser[0];
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
  var y = Math.floor(Math.random() * self.height);
  var x = Math.floor(Math.random() * self.width);
  user.pos = [y, x];
  this.userList.push(user);
};

World.prototype.findUser = function(user, pred) {
  return _.filter(this.userList, pred);
};

World.prototype.removeUser = function(user) {
  this.userList = _.reject(this.userList, function(x) {
    return user.id === x.id;
  });
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
exports.World = World;
exports.User = User;
exports.AdminHelper = AdminHelper;
