var _ = require('underscore');

function Client(uid, socket) {
  var self = this;
  self.uid = uid;
  self.socket = socket;
  self.user = null;
}

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
  var client = new Client(uid, socket);
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
  // client - user는 서로 연결시켜놓기
  self.client = client;
  if(client !== null) {
    client.user = self;
  }
}

function World() {
  var self = this;
  self.userList = [];
}

World.prototype.getUserCount = function() {
  return this.userList.length;
};

World.prototype.createUser = function(client) {
  var user = new User(client);
  return user;
};

World.prototype.addUser = function(user) {
  this.userList.push(user);
};

World.prototype.findUser = function(user, pred) {
  return _.filter(this.userList, pred);
};

World.prototype.removeUser = function(user) {
  this.userList = _.filter(this.userList, function(x) { return user === x; });
};

var exports = module.exports;
exports.Server = Server;
exports.World = World;
exports.User = User;
