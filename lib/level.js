(function() {
  var _global = this;

  var base = null;
  var PF = null;
  if(typeof module !== 'undefined') {
    base = require('./base');
    PF = require('pathfinding');
  } else {
    base = window.base;
    PF = window.PF;
  }

//  var TILE_EMPTY = 0;

  var Level = function(width, height) {
    var self = this;

    self.finder = new PF.AStarFinder();

    self.width = width;
    self.height = height;

    // constant
//    self.TILE_EMPTY = TILE_EMPTY;

    // empty data
//    self.data = [];
//    for(var y = 0 ; y < self.height ; y += 1) {
//      var line = [];
//      for(var x = 0 ; x < self.width ; x += 1) {
//        line.push(TILE_EMPTY);
//      }
//      self.data.push(line);
//    }
    self.grid = new PF.Grid(self.width, self.height);
  };

  Level.prototype.tile = function(x, y, val) {
    var self = this;
    if(val === undefined) {
//      return self.grid.nodes[y][x];
      return self.grid.getNodeAt(x, y);
    } else {
      if(x < 0 || x >= self.width) {
        return false;
      }
      if(y < 0 || y >= self.height) {
        return false;
      }
//      self.grid.getNodeAt(x, y) = val;
      return val;
    }
  };
  
  Level.prototype.setWalkableAt = function(x, y, value) {
    this.grid.setWalkableAt(x, y, value);
  };

  Level.prototype.generate = function() {
    // TODO
    // make random level data
    for(var i = 0; i < this.width; i += 1) {
      for(var j = 0; j < this.height; j += 1) {
        if(Math.random() < 0.05) {
          this.grid.setWalkableAt(i, j, false);
        }
      }
    }
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
    return this.tile(x, y).walkable;
  };

  Level.prototype.findPath = function(x_0, y_0, x_1, y_1) {
    var path = this.finder.findPath(x_0, y_0, x_1, y_1, this.grid);
  };

  Level.prototype.serializer = function() {
    return new base.Serializer(['width', 'height', 'nodes'], this.grid);
  };


  if(typeof(module) !== 'undefined' && module.exports) {
    // node.js module
    module.exports = Level;
  } else {
    // global (browser)
    _global.Level = Level;
  }
}).call(this);
