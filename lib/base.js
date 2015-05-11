(function(exports) {
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
  exports.GameObjectListHelper = GameObjectListHelper;
  exports.unitTestSample = unitTestSample;
})(typeof exports === 'undefined'? this.base={}: exports);
