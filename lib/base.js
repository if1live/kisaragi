(function(exports) {
  "use strict";
  var _;
  if(typeof module !== 'undefined') {
    _ = require('underscore');
  } else {
    _ = window._;
  }

  function unitTestSample() {
    return true;
  }

  // Serializer
  function Serializer(keylist, obj) {
    var self = this;
    self.obj = obj;
    self.keylist = keylist;
  }

  Serializer.prototype.serialize = function() {
    var self = this;
    return _.object(self.keylist, _.map(self.keylist, function(key) { return self.obj[key]; }));
  };

  Serializer.prototype.deserialize = function(data) {
    var self = this;
    _.each(_.pairs(data), function(pair) {
      var key = pair[0];
      var value = pair[1];
      self.obj[key] = value;
    });
  };

  // Game Object
  function GameObject() {
    var self = this;
    self.category = null;
    self.id = null;
    self.world = null;
    
    // user info [x, y]
    self.pos = [-1, -1];
    self.targetPos = null;
    self.moveCooltime = 0;
    self.COOLTIME_MOVE = 0.3;

    // client / server?
    self.role = null;

    // for client
    self.sprite = null;
  }
  GameObject.prototype.moveNotify = function(world) {
    var self = this;
    this.sock.broadcast('s2c_moveNotify', {
      id: self.id,
      pos: self.pos
    });
  };

  GameObject.prototype.update = function(delta) {
    var self = this;
    
    // handle move
    self.moveCooltime -= delta;
    if(self.moveCooltime < 0) {
      self.moveCooltime = 0;
    }
    if(self.targetPos && self.moveCooltime === 0) {
      var nextPos = self.world.level.findNextPos(self.pos[0], self.pos[1], self.targetPos[0], self.targetPos[1]);
      if(!nextPos) {
        self.targetPos = null;
        return;
      }
      
      self.pos = nextPos;
      self.moveNotify(self.world);

      if(self.pos[0] === self.targetPos[0] && self.pos[1] === self.targetPos[1]) {
        self.targetPos = null;
      }

      self.moveCooltime = self.COOLTIME_MOVE;
    }
  };

  // Game Object List
  function GameObjectListHelper(list) {
    var self = this;
    self.list = list;
  }

  GameObjectListHelper.prototype.getLength = function() {
    return this.list.length;
  };

  GameObjectListHelper.prototype.addObject = function(obj) {
    var self = this;
    if(obj === null) {
      return false;
    }
    var prev = self.findObject(obj.id);
    if(prev) {
      return false;
    }
    self.list.push(obj);
    return true;
  };

  GameObjectListHelper.prototype.findObject = function(pk) {
    var filtered = _.filter(this.list, function(obj) {
      return obj.id === pk;
    });
    if(filtered.length === 0) {
      return null;
    } else {
      return filtered[0];
    }
  };

  GameObjectListHelper.prototype.removeId = function(pk) {
    var self = this;
    for(var i = 0 ; i < self.list.length ; i += 1) {
      if(self.list[i].id === pk) {
        self.list.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  GameObjectListHelper.prototype.removeObject = function(obj) {
    var self = this;
    if(!obj) {
      return false;
    }
    return self.removeId(obj.id);
  };

  exports.Serializer = Serializer;
  exports.GameObject = GameObject;
  exports.GameObjectListHelper = GameObjectListHelper;
  exports.unitTestSample = unitTestSample;
})(typeof exports === 'undefined'? this.base={}: exports);
