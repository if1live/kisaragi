(function(exports) {
  "use strict";

  var _;
  if(typeof module !== 'undefined') {
    var uuid = require('node-uuid');
    _ = require('underscore');
  } else {
    _ = window._;
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
    
    if(typeof socket === 'object') {
      socket.on('error', function (err) {
        console.log("Socket Error Occur");
        console.error(err.stack); 
      });
    }
  }
  
  SvrSocket_SocketIO.prototype.getAddress = function() {
    var self = this;
    var remoteAddr = self.socket.request.connection.remoteAddress;
    return remoteAddr.replace('::ffff:', '');
  };
  
  SvrSocket_SocketIO.prototype.onEvent = function(cmd, world, user, obj) {
    var self = this;
    // for development
    if(cmd === 'c2s_ping') {
      return self.send('s2c_ping', obj);
    } else if (cmd === 'c2s_echo') {
      return self.send('s2c_echo', obj);
    } else if(cmd === 'c2s_echoAll') {
      return self.broadcast('s2c_echoAll', obj);
    }
  
    // handle event
    if(typeof user[cmd] === 'function') {
      return user[cmd](world, obj);
    }

    console.log('cmd:' + cmd + 'is unknown command');
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

  // for client
  function HtmlPingRenderer(displayId) {
    var self = this;
    self.displayId = displayId;
  }
  HtmlPingRenderer.prototype.render = function(count, curr, average, min, max) {
    var self = this;
    var root = document.getElementById(self.displayId);
    if(!root) {
      return;
    }
    var table = [
      ['.ping-count', count],
      ['.ping-curr', curr],
      ['.ping-average', average],
      ['.ping-min', min],
      ['.ping-max', max]
    ];
    _.each(table, function(elem) {
      var node = root.querySelector(elem[0]);
      if(node) {
        node.innerHTML = elem[1];
      }
    });
  };
  
  function ClientPing(socket) {
    var self = this;
    self.logs = [];
    self.socket = socket;
    self.duration = 2000;
    self.windowSize = 30;
    self.count = 0;

    self.renderer = null;

    socket.on('s2c_ping', function(obj) {
      self.count += 1;
      var now = Date.now();
      var prev = obj.timestamp;
      var diff = now - prev;
      if(self.logs.length < self.windowSize) {
        self.logs.push(diff);
      } else {
        self.logs.splice(0, 1);
        self.logs.push(diff);
      }
      
      if(self.renderer !== null) {
        self.renderer.render(self.count, self.last(), self.average(), self.min(), self.max());
      }

      setTimeout(function() {
        self.ping();
      }, self.duration);
      //console.log("ping : " + diff + "ms");
    });
  }

  ClientPing.prototype.ping = function() {
    var self = this;
    var timestamp = Date.now();
    self.socket.emit('c2s_ping', {timestamp:timestamp});
  };
  ClientPing.prototype.max = function() {
    if(this.logs.length === 0) {
      return 0;
    }
    return _.max(this.logs);
  };
  ClientPing.prototype.min = function() {
    if(this.logs.length === 0) {
      return 0;
    }
    return _.min(this.logs);
  };
  ClientPing.prototype.last = function() {
    if(this.logs.length === 0) {
      return 0;
    }
    return this.logs[this.logs.length - 1];
  };
  ClientPing.prototype.average = function() {
    if(this.logs.length === 0) {
      return 0;
    }
    var sum = _.reduce(this.logs, function(memo, num){ return memo + num; }, 0);
    var average = sum / this.logs.length;
    return Math.ceil(average);
  };

  function ClientEcho(socket, callbacks) {
    var self = this;
    self.socket = socket;

    var echoCallback = function(ctx) {
      self.dumpCommunication('echo', ctx);
    };
    var echoAllCallback = function(ctx) {
      self.dumpCommunication('echoAll', ctx);
    };

    if(callbacks !== undefined) {
      if(callbacks.echo) {
        echoCallback = callbacks.echo;
      }
      if(callbacks.echoAll) {
        echoAllCallback = callbacks.echoAll;
      }
    }

    socket.on('s2c_echo', echoCallback);
    socket.on('s2c_echoAll', echoAllCallback);
  }

  ClientEcho.prototype.dumpCommunication = function(cmd, obj) {
    console.log(cmd + " : " + JSON.stringify(obj));
  };

  ClientEcho.prototype.echo = function(ctx) {
    this.socket.emit('c2s_echo', ctx);
  };

  ClientEcho.prototype.echoAll = function(ctx) {
    this.socket.emit('c2s_echoAll', ctx);
  };

  exports.Server = Server;
  exports.CliSocket = CliSocket;
  exports.ClientPing = ClientPing;
  exports.HtmlPingRenderer = HtmlPingRenderer;
  exports.ClientEcho = ClientEcho;
})(typeof exports === 'undefined'? this.network={}: exports);
