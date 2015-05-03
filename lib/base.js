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


  exports.Serializer = Serializer;
  exports.unitTestSample = unitTestSample;
})(typeof exports === 'undefined'? this.base={}: exports);
