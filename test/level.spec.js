/* global describe: false, it: false, beforeEach: false, before: false */
"use strict";

var assert = require('assert');
var Level = require('../lib/level');

describe('Level', function() {
  beforeEach(function() {
    var level = new Level();
    level.reset(2, 3);
    this.topic = level;
  });
  
  describe('#create()', function() {
    it('success', function() {
      assert.equal(this.topic.width, 2);
      assert.equal(this.topic.height, 3);
    });
  });

  describe('#tile#', function() {
    it('get', function() {
      assert.equal(this.topic.tile(1, 1), 0);
    });
    
    it('set', function() {
      it('success', function() {
        assert.equal(this.topic.tile(1, 1, 100), 100);
      });
      it('invalid range', function() {
        assert.equal(this.topic.tile(-10, 10, 1), false);
        assert.equal(this.topic.tile(10, -10, 1), false);
      });
    });
  });
  
  describe('#filterPosition', function() {
    it('success', function() {
      assert.deepEqual(this.topic.filterPosition(-1, -1), [0, 0]);
      assert.deepEqual(this.topic.filterPosition(100, 100), [1, 2]);
      assert.deepEqual(this.topic.filterPosition(1, 2), [1, 2]);
    });
  });
});

