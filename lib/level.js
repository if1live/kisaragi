(function() {
  var _global = this;

  var base = null;
  var PF = null;
  var fs = null;
  var assert = null;
  if(typeof module !== 'undefined') {
    base = require('./base');
    PF = require('pathfinding');
    fs = require('fs');
    assert = require('assert');
  } else {
    base = window.base;
    PF = window.PF;
    assert = window.assert;
  }

  var TILE_EMPTY = 0;
  var TILE_OBSTACLE = 1;
  var TILE_PLAYER = 2;
  var TILE_ENEMY = 3;

  var Level = function() {
    var self = this;

    self.width = null;
    self.height = null;

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
    // TODO
    // make random level data
  };

  Level.prototype.reset = function(width, height) {
    var self = this;
    self.width = width;
    self.height = height;
    // fill empty data
    self.data = [];
    for(var y = 0 ; y < height ; y += 1) {
      var line = [];
      for(var x = 0 ; x < width ; x += 1) {
        line.push(self.TILE_EMPTY);
      }
      self.data.push(line);
    }
  };

  Level.prototype.loadFromFile = function(filename) {
    var data = fs.readFileSync(filename, 'utf-8');
    var rows = data.split('\n');

    var size = rows[0].split(' ');
    this.width = size[0];
    this.height = size[1];
    rows.shift();

    this.data = [];

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
  };

  Level.prototype.createGrid = function() {
    var grid = new PF.Grid(this.width, this.height);
    // TODO set grid
    return grid;
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
    var grid = this.createGrid();
    var finder = new PF.AStarFinder();
    var path = finder.findPath(x_0, y_0, x_1, y_1, grid);
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

