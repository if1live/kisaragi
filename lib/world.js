(function() {
  var _global = this;

  var _ = null, Enemy = null, User = null, Level = null;
  if(typeof module !== 'undefined') {
    _ = require('underscore');
    User = require('./user');
    Enemy = require('./enemy');
    Level = require('./level');
  } else {
    _ = window._;
    Level = window.Level;
  }
  
  function World() {
    var self = this;
    self.tickCount = 0;
    self.initialTime = Date.now();
  
    self.nextClientId = 1;
  
    // TODO 나중에 quad tree 같은거 붙여서 검색 가속
    // 일단은 구현 간단하게 리스트
    self.objectListTable = {};
  
    // 프로토타입의 구현은 간단하게 무식한 격자 배열로 구성
    var width = 40;
    var height = 20;
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
  
  World.prototype.allObjectList = function() {
    var self = this;
    var objList = [];
    for(var category in self.objectListTable) {
      if(category !== '') {
        objList = objList.concat(self.objectListTable[category]);
      }
    }
    return objList;
  };
  
  World.prototype.addObject = function(obj) {
    var self = this;
    if(obj.id === null || obj.id === undefined) {
      obj.id = self.getNextId();
      self.objectList(obj.category).push(obj);
      return true;
    } else {
      return false;
    }
  };
  
  World.prototype.removeObject = function(obj) {
    var self = this;
    var category = obj.category;
    var currList = self.objectList(category);
    var nextList = _.reject(currList, function(x) {
      return obj.id === x.id;
    });
    self.objectListTable[category] = nextList;
  };
  
  World.prototype.removeId = function(pk) {
    var self = this;
    var obj = self.findObject(pk);
    if(obj) {
      self.removeObject(obj);
    }
  };
  
  World.prototype.findObject = function(pk) {
    var filtered = _.filter(this.allObjectList(), function(obj) {
      return obj.id === pk;
    });
    if(filtered.length === 0) {
      return null;
    } else {
      return filtered[0];
    }
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
  
  World.prototype.createUser = function(client) {
    var user = new User(client);
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
    var self = this;
    var obj = self.findObject(pk);
    if(obj !== null && obj.category === 'user') {
      return obj;
    } else {
      return null;
    }
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
    var enemy = new Enemy(pos);
    self.addObject(enemy);
    return enemy;
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
