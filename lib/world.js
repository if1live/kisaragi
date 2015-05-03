(function() {
  var _global = this;
  if(typeof module !== 'undefined') {
    var _ = require('underscore');
    var User = require('./user');
    var Enemy = require('./enemy');
  }
  
  function World() {
    var self = this;
    self.tickCount = 0;
    self.initialTime = Date.now();
  
    self.nextClientId = 1;
  
    // TODO 나중에 quad tree 같은거 붙여서 검색 가속
    // 일단은 구현 간단하게 리스트
    self.userList = [];
    self.enemyList = [];
  
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
  
  World.prototype.getGameObjectList = function() {
    var self = this;
    var objList = [];
    objList = objList.concat(self.userList);
    objList = objList.concat(self.enemyList);
    return objList;
  };
  
  World.prototype.getUserList = function() {
    var self = this;
    var userList = [];
    self.userList.map(function(user) {
      userList.push({ type: user.type, id: user.id, pos: user.pos });
    });
    
    return userList;
  };
  
  World.prototype.getObject = function(x, y) {
    var self = this;
  
    // if object exist, return object(user, enemy,...)
    var objectGroupList = [
      self.userList,
      self.enemyList
    ];
    var pred = function(el) {
      return (el.pos[0] === x && el.pos[1] === y);
    };
    for(var i = 0 ; i < objectGroupList.length ; i += 1) {
      var filtered = _.filter(objectGroupList[i], pred);
      if(filtered.length > 0) {
        return filtered[0];
      }
    }
  
    return self.getTile(x, y);
  };
  
  World.prototype.getTile = function(x, y) {
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
    user.pos = self.findAnyEmptyPos();
    this.userList.push(user);
  };
  
  World.prototype.findUser = function(pk) {
    var filtered = _.filter(this.userList, function(user) {
      return user.id === pk;
    });
    if(filtered.length === 0) {
      return null;
    } else {
      return filtered[0];
    }
  };
  
  World.prototype.findGameObject = function(pk) {
    var filtered = _.filter(this.getGameObjectList(), function(obj) {
      return obj.id === pk;
    });
    if(filtered.length === 0) {
      return null;
    } else {
      return filtered[0];
    }
  };
  
  World.prototype.removeUser = function(user) {
    this.userList = _.reject(this.userList, function(x) {
      return user.id === x.id;
    });
  };
  
  World.prototype.generateEnemy = function() {
    var self = this;
    var pos = self.findAnyEmptyPos();
    var id = self.getNextId();
    var enemy = new Enemy(id, pos);
    self.enemyList.push(enemy);
    return enemy;
  };
  
  World.prototype.findAnyEmptyPos = function() {
    // 빈자리 적당히 찾기
    // 야매로 될때까지 생성. 설마 100번 동안 삽질하겠어?
    // TODO 나중에 제대로 고치기
    var self = this;
    for(var i = 0 ; i < 100 ; i += 1) {
      // 유저를 적당한 곳에 배치하기
      var y = Math.floor(Math.random() * self.height);
      var x = Math.floor(Math.random() * self.width);
      var obj = self.getObject(x, y);
      if(obj === 0) {
        return [x, y];
      }
    }
    return [-1, -1];
  };
  
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