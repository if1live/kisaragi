(function() {
  var _global = this;

  var base = null;
  var PF = null;
  var fs = null;
  if(typeof module !== 'undefined') {
    base = require('./base');
    PF = require('pathfinding');
    fs = require('fs');
  } else {
    base = window.base;
    PF = window.PF;
  }

  var TILE_EMPTY = 0;
  var TILE_OBSTACLE = 1;
  var TILE_PLAYER = 2;
  var TILE_ENEMY = 3;

  var Level = function(width, height) {
    var self = this;

    self.finder = new PF.AStarFinder();

    self.width = width;
    self.height = height;

    // constant
    self.TILE_EMPTY = TILE_EMPTY;
    self.TILE_OBSTACLE = TILE_OBSTACLE;
    self.TILE_PLAYER = TILE_PLAYER;
    self.TILE_ENEMY = TILE_ENEMY;
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
    if(typeof module !== 'undefined') {
      // TODO
      // make random level data
      var data = fs.readFileSync('res/map.txt', 'utf-8');
      var rows = data.split('\n');

      var size = rows[0].split(' ');
      this.width = size[0];
      this.height = size[1];
      rows.shift();

      this.data = [];
      this.grid = new PF.Grid(this.width, this.height);
      this.obstacles = [];

      for(var i = 0; i < this.height; i += 1) {
        var cols = rows[i].split('');
        var line = [];
        for(var j = 0; j < this.width; j += 1) {
          if(cols[j] === 'x') {
            line.push(this.TILE_OBSTACLE);
            this.obstacles.push({pos:[j, i]});
          }
          else {
            line.push(this.TILE_EMPTY);
          }
        }
        this.data.push(line);
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
    return this.tile(x, y) === this.TILE_EMPTY;
  };

  Level.prototype.findPath = function(x_0, y_0, x_1, y_1) {
    var path = this.finder.findPath(x_0, y_0, x_1, y_1, this.grid);
  };

  Level.prototype.serializer = function() {
    return new base.Serializer(['width', 'height', 'data', 'obstacles'], this);
  };


  if(typeof(module) !== 'undefined' && module.exports) {
    // node.js module
    module.exports = Level;
  } else {
    // global (browser)
    _global.Level = Level;
  }
}).call(this);

