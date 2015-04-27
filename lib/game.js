var _ = require('underscore');

function SocketIOClient(uid, socket) {
  var self = this;
  self.type = 'socket-io';
  self.uid = uid;
  self.socket = socket;
  self.user = null;
}

SocketIOClient.prototype.getAddress = function() {
  var self = this;
  var remoteAddr = self.socket.request.connection.remoteAddress;
  return remoteAddr.replace('::ffff:', '');
};

SocketIOClient.prototype.onEvent = function(cmd, world, user, obj) {
  var self = this;
  // for development
  if(cmd === 'ping') {
    return self.socket.emit('ping', obj);
  } else if (cmd === 'echo') {
    return self.socket.emit('echo', obj);
  }

  // handle event
  if(typeof user[cmd] === 'function') {
    return user[cmd](world, obj);
  }

  console.log(`cmd:${cmd} is unknown command`);
};


function Server(io) {
  var self = this;
  self.io = io;
  self.nextClientId = 1;

  self.clientList = [];
}

Server.prototype.getNextId = function() {
  var self = this;
  var retval = self.nextClientId;
  self.nextClientId += 1;
  return retval;
};

Server.prototype.connectClient = function(socket) {
  var self = this;
  var uid = self.getNextId();
  var client = new SocketIOClient(uid, socket);
  self.clientList.push(client);
  return client;
};

Server.prototype.findClient = function(opts) {
  var self = this;

  var filterTable = {
    'uid': function(client) {
      return client.uid === opts.uid;
    },
    'socket': function(client) {
      return client.socket === opts.socket;
    }
  };

  for(var key in filterTable) {
    if(opts[key] !== undefined) {
      var filtered = self.clientList.filter(filterTable[key]);
      return (filtered.length > 0) ? filtered[0] : null;
    }
  }
  return null;
};

Server.prototype.disconnectClient = function(socket) {
  var self = this;
  var client = self.findClient({socket: socket});
  if(client === null) {
    return false;
  }
  self.clientList = _.reject(self.clientList, function(x) { return x === client; });
  return true;
};


function User(client) {
  var self = this;
  self.type = 'user';
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
  // 유저를 적당한 곳에 배치하기
  var self = this;
  var y = Math.floor(Math.random() * self.height);
  var x = Math.floor(Math.random() * self.width);
  user.pos = [y, x];
  this.userList.push(user);
};

World.prototype.findUser = function(user, pred) {
  return _.filter(this.userList, pred);
};

World.prototype.removeUser = function(user) {
  this.userList = _.filter(this.userList, function(x) { return user === x; });
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
exports.Server = Server;
exports.World = World;
exports.User = User;
exports.AdminHelper = AdminHelper;
