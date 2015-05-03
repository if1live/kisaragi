(function() {
  var _global = this;

  var base = null;
  if(typeof module !== 'undefined') {
    base = require('./base');
  } else {
    base = window.base;
  }

  var TILE_EMPTY = 0;

  var Level = function(width, height) {
    var self = this;

    self.width = width;
    self.height = height;

    // constant
    self.TILE_EMPTY = TILE_EMPTY;

    // empty data
    self.data = [];
    for(var y = 0 ; y < self.height ; y += 1) {
      var line = [];
      for(var x = 0 ; x < self.width ; x += 1) {
        line.push(TILE_EMPTY);
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

  Level.prototype.filterVeticalRange = function(y) {
    return (y < 0 ? 0 : (y >= this.height ? (this.height - 1) : y));
  };
  Level.prototype.filterHorizontalRange = function(x) {
    return (x < 0 ? 0 : (x >= this.width ? (this.width - 1) : x));
  };
  Level.prototype.filterPosition = function(x, y) {
    return [this.filterHorizontalRange(x), this.filterVeticalRange(y)];
  };

  Level.prototype.isEmptyTile = function(x, y) {
    return (this.tile(x, y) === TILE_EMPTY);
  };

  Level.prototype.serializer = function() {
    return new base.Serializer(['width', 'height', 'data'], this);
  };


  if(typeof(module) !== 'undefined' && module.exports) {
    // node.js module
    module.exports = Level;
  } else {
    // global (browser)
    _global.Level = Level;
  }
}).call(this);