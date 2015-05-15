(function(exports) {
  "use strict";
  var _;
  if(typeof module !== 'undefined') {
    _ = require('underscore');
  } else {
    _ = window._;
  }
  
  function Entity() {
    var self = this;
    // core attribute
    self.category = null;
    self.movableId = null;
    self.entityMgr = null;
    // client[cli] / server[svr]
    self.role = null;
    
    // position
    self.pos = [-1, -1];
    
    // movable
    self.targetPos = null;
    self.moveCooltime = 0;
    // default value
    self.COOLTIME_MOVE = 0.1;
    
    // renderable
    self.sprite = null;
  }
  
  Entity.prototype.id = function(val) {
    if(typeof val === 'undefined') {
      return this.movableId;
    } else {
      this.movableId = val;
      return this.movableId;
    }
  };
  
  Entity.prototype.x = function(val) {
    return this.posElem(val, 0);
  };
  Entity.prototype.y = function(val) {
    return this.posElem(val, 1);
  };
  
  Entity.prototype.posElem = function(val, idx) {
    if(typeof val === 'undefined') {
      return this.pos[idx];
    } else {
      this.pos[idx] = val;
      return this.pos[idx];
    }
  };
  
  function EntityManager() {
    var self = this;
    self.table = {};
  }
  
  EntityManager.prototype.add = function(ent) {
    this.table[ent.movableId] = ent;
  };
  EntityManager.prototype.remove = function(opts) {
    var self = this;
    if(typeof opts === 'number') {
      delete this.table[opts];
      
    } else {
      var elemList = this.findAll(opts);
      _.each(elemList, function(ent) {
        delete self.table[ent.movableId];
      });
    }
  };
  
  EntityManager.prototype.findAll = function(opts) {
    var predList = [];
    var elemList = _.values(this.table);
    
    if('id' in opts) {
      predList.push(function(ent) {
        return ent.movableId === opts.id;
      });
    }
    if('x' in opts) {
      predList.push(function(ent) {
        return ent.x() === opts.x; 
      });
    }
    if('y' in opts) {
      predList.push(function(ent) {
        return ent.y() === opts.y; 
      });
    }
    
    _.each(predList, function(pred) {
      elemList = _.filter(elemList, pred);
    });

    return elemList;
  };
  
  EntityManager.prototype.find = function(opts) {
    var elemList = this.findAll(opts);
    if(elemList.length) {
      return elemList[0];
    } else {
      return null;
    }
  };

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
    
    // pos : [x, y]
    // move
    self.pos = [-1, -1];
    self.targetPos = null;
    self.moveCooltime = 0;
    self.COOLTIME_MOVE = 0.1;

    // client[cli] / server[svr]
    self.role = null;

    // for client
    self.sprite = null;
  }
  GameObject.prototype.moveNotify = function(world) {
    var self = this;
    // send move notify to closed user
    var userList = world.objectList('user');
    _.each(userList, function(user) {
      //TODO how to calculate distance?
      var maxDist = 1000000;
      var dist = Math.abs(self.pos[0] - user.pos[0]) + Math.abs(self.pos[1] - user.pos[1]);
      if(dist < maxDist) {
        user.sock.send('s2c_moveNotify', {
          id: self.id,
          pos: self.pos
        });
      }
    });
  };

  GameObject.prototype.update = function(delta) {
    var self = this;
    self.updatePre(delta);
    self.updateMove(delta);
    self.updatePost(delta);
  };
  
  GameObject.prototype.updatePre = function(delta) {};
  GameObject.prototype.updatePost = function(delta) {};
  
  GameObject.prototype.updateMove = function(delta) {
    var self = this;
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

  exports.Entity = Entity;
  exports.EntityManager = EntityManager;

  exports.Serializer = Serializer;
  exports.GameObject = GameObject;
  exports.GameObjectListHelper = GameObjectListHelper;
})(typeof exports === 'undefined'? this.base={}: exports);
