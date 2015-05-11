(function() {
  var _global = this;

  var _ = null, Enemy = null, User = null, Level = null, base = null, assert = null;
  if(typeof module !== 'undefined') {
    _ = require('underscore');
    assert = require('assert');
    User = require('./user');
    Enemy = require('./enemy');
    Level = require('./level');
    base = require('./base');
  } else {
    _ = window._;
    assert = window.assert;
    Level = window.Level;
    User = window.User;
    base = window.base;
  }

  function World(role) {
    var self = this;
    self.role = role;
    self.tickCount = 0;
    self.initialTime = Date.now();

    self.nextClientId = 1;

    // TODO 나중에 quad tree 같은거 붙여서 검색 가속
    // 일단은 구현 간단하게 리스트
    self.objectListTable = {};

    // 프로토타입의 구현은 간단하게 무식한 격자 배열로 구성
    // 1st prototype : show all tiles without scroll
    var width = 20;
    var height = 10;
    self.level = new Level(width, height);
    self.level.generate();
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

  // General Game Object Access Function Start
  World.prototype.objectList = function(category) {
    var self = this;
    if(self.objectListTable[category] === undefined) {
      self.objectListTable[category] = [];
    }
    return self.objectListTable[category];
  };
  
  World.prototype.objectListHelper = function(category) {
    return new base.GameObjectListHelper(this.objectList(category));
  };

  World.prototype.allObjectList = function() {
    var self = this;
    var objList = [];
    _.each(_.values(self.objectListTable), function(list, idx) {
      objList = objList.concat(list);
    });
    return objList;
  };

  World.prototype.addObject = function(obj) {
    var self = this;
    if(obj.id === null || obj.id === undefined) {
      obj.id = self.getNextId();
      return self.objectListHelper(obj.category).addObject(obj);
    } else {
      return false;
    }
  };

  World.prototype.attachObject = function(obj) {
    var self = this;
    if(obj.id === null || obj.id === undefined) {
      return false;
    }
    self.objectListHelper(obj.category).addObject(obj);
  };

  World.prototype.removeObject = function(obj) {
    this.objectListHelper(obj.category).removeObject(obj);
  };

  World.prototype.removeId = function(pk) {
    var self = this;
    var obj = self.findObject(pk);
    if(obj) {
      self.removeObject(obj);
    }
  };

  World.prototype.findObject = function(pk) {
    var filtered = _.map(_.values(this.objectListTable), function(list) {
      var helper = new base.GameObjectListHelper(list);
      return helper.findObject(pk);
    });
    filtered = _.filter(filtered, function(obj) {
      return obj !== null;
    });
    return filtered[0];
  };

  World.prototype.getObject = function(x, y) {
    var self = this;
    // if object exist, return object(user, enemy,...)
    var pred = function(el) {
      return (el.pos[0] === x && el.pos[1] === y);
    };
    var filtered = _.filter(self.allObjectList(), pred);
    if(filtered.length > 0) {
      return filtered[0];
    }
    return null;
  };

  // Game Object
  World.prototype.findAnyEmptyPos = function() {
    // 빈자리 적당히 찾기
    // 야매로 될때까지 생성. 설마 100번 동안 삽질하겠어?
    // TODO 나중에 제대로 고치기
    var self = this;
    for(var i = 0 ; i < 100 ; i += 1) {
      // 유저를 적당한 곳에 배치하기
      var y = Math.floor(Math.random() * self.level.height);
      var x = Math.floor(Math.random() * self.level.width);
      var obj = self.getObject(x, y);
      if(obj === null) {
        return [x, y];
      }
    }
    return [-1, -1];
  };

  // User 
  World.prototype.getUserCount = function() {
    return this.objectList('user').length;
  };

  World.prototype.createUser = function(sock) {
    var user = new User('svr', sock);
    return user;
  };

  World.prototype.addUser = function(user) {
    var self = this;
    // 유저를 적당한 곳에 배치하기
    var pos = self.findAnyEmptyPos();
    self.level.setWalkableAt(pos[0], pos[1], false);
    user.pos = pos;
    self.addObject(user);
  };

  World.prototype.findUser = function(pk) {
    return this.objectListHelper('user').findObject(pk);
  };

  World.prototype.removeUser = function(user) {
    var self = this;
    self.level.setWalkableAt(user.pos[0], user.pos[1], true);
    self.removeObject(user);
  };

  World.prototype.getUserList = function() {
    var self = this;
    var userList = [];
    self.objectList('user').map(function(user) {
      userList.push({ type: user.category, id: user.id, pos: user.pos });
    });
    return userList;
  };

  // Enemy
  World.prototype.generateEnemy = function() {
    var self = this;
    var pos = self.findAnyEmptyPos();
    var enemy = new Enemy('svr', pos);
    self.addObject(enemy);
    return enemy;
  };

  // serialize/deserialize
  World.prototype.syncAllObjectList = function(dataList) {
    var self = this;
    assert(self.role === 'cli');

    _.each(dataList, function(data, i) {
      var registeredObj = self.findObject(data.id);
      if(registeredObj) {
        // if prev objec exist, modify attribute
        registeredObj.pos = data.pos;

      } else {
        // register new object
        if(data.type === 'user') {
          var obj = new User('cli', null);
          obj.id = data.id;
          obj.pos = data.pos;
          self.attachObject(obj);
        }
      }
    });

    // if prev exist and next not exist, then remove it
    var prevIdList = _.map(self.allObjectList(), function(obj, i) { return obj.id; });
    var nextIdList = _.map(dataList, function(obj, id) { return obj.id; });
    _.each(_.difference(prevIdList, nextIdList), function(id, idx) {
      var obj = self.findObject(id);
      if(obj.sprite) {
        obj.sprite.destroy();
      }
      self.removeId(id);
    });
  };

  // Game Logic
  World.prototype.update = function(delta) {
    var self = this;
    self.tickCount += 1;
    //console.log('Hi there! (frame=%s, delta=%s)', self.frameCount++, delta);
  };


  if(typeof(module) !== 'undefined' && module.exports) {
    module.exports = World;
  } else {
    _global.World = World;
  }
}).call(this);
