(function(){
  var _global = this;
  
  if(typeof module !== 'undefined') {
    var uuid = require('node-uuid');
    var _ = require('underscore');
  }
  
  /*
  CliSocket : client socket for client
  */
  function CliSocket() {
    
  }


  /*
  SvrSocket : client socket for server
  * SvrScoket_SocketIO
  */
  function SvrSocket_SocketIO(uuid_val, socket, io) {
    var self = this;
    self.type = 'socket-io';
    self.uuid = uuid_val;
    self.socket = socket;
    self.user = null;
    self.io = io;
  }
  
  SvrSocket_SocketIO.prototype.getAddress = function() {
    var self = this;
    var remoteAddr = self.socket.request.connection.remoteAddress;
    return remoteAddr.replace('::ffff:', '');
  };
  
  SvrSocket_SocketIO.prototype.onEvent = function(cmd, world, user, obj) {
    var self = this;
    // for development
    if(cmd === 'ping') {
      return self.send('ping', obj);
    } else if (cmd === 'echo') {
      return self.send('echo', obj);
    } else if(cmd === 'echo_all') {
      return self.broadcast('echo_all', obj);
    }
  
    // handle event
    if(typeof user[cmd] === 'function') {
      return user[cmd](world, obj);
    }
  
    console.log(`cmd:${cmd} is unknown command`);
  };
  
  SvrSocket_SocketIO.prototype.send = function(cmd, ctx) {
    var self = this;
    return self.socket.emit(cmd, ctx);
  };
  
  SvrSocket_SocketIO.prototype.broadcast = function(cmd, ctx) {
    var self = this;
    return self.io.emit(cmd, ctx);
  };



  /*
  game server
  */
  function Server(io) {
    var self = this;
    self.io = io;
  
    self.clientList = [];
  }
  
  Server.prototype.connectClient = function(socket) {
    var self = this;
    var client = new SvrSocket_SocketIO(uuid.v1(), socket, self.io);
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


  exports.Server = Server;
  exports.CliSocket = CliSocket;
})(typeof exports === 'undefined'? this.network={}: exports);
