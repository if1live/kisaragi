var uuid = require('node-uuid');
var _ = require('underscore');

function SocketIOClient(uuid_val, socket) {
  var self = this;
  self.type = 'socket-io';
  self.uuid = uuid_val;
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

  self.clientList = [];
}

Server.prototype.connectClient = function(socket) {
  var self = this;
  var client = new SocketIOClient(uuid.v1(), socket);
  self.clientList.push(client);
  return client;
};

Server.prototype.findClient = function(opts) {
  var self = this;

  var filterTable = {
    'uuid': function(client) {
      return client.uuid === opts.uuid;
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

var exports = module.exports;
exports.Server = Server;
exports.SocketIOClient = SocketIOClient;
