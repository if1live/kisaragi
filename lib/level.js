(function() {
  var _global = this;
  
  var Level = function(width, height) {
    var self = this;

    self.width = width;
    self.height = height;
    
    // empty data
    self.data = [];
    for(var y = 0 ; y < self.height ; y += 1) {
      var line = [];
      for(var x = 0 ; x < self.width ; x += 1) {
        line.push(0);
      }
      self.data.push(line);
    }
  };

  Level.prototype.tile = function(x, y, val) {
    var self = this;
    if(val === undefined) {
      return self.data[y][x];
    } else {
      if(x < 0 || x >= self.width) {
        return false;
      }
      if(y < 0 || y >= self.height) {
        return false;
      }
      self.data[y][x] = val;
      return val;
    }
  };

  Level.prototype.generate = function() {
    // TODO
    // make random level data
  };

  if(typeof(module) !== 'undefined' && module.exports) {
    // node.js module
    module.exports = Level;
  } else {
    // global (browser)
    _global.Level = Level;
  }
}).call(this);