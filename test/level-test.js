var vows = require('vows');
var assert = require('assert');
var Level = require('../lib/level');

function createEmptyLevel() {
  var level = new Level();
  level.reset(2, 3);
  return level;
}

vows.describe('Level').addBatch({
  'create': {
    topic: createEmptyLevel(),
    'succes': function(topic) {
      assert.equal(topic.width, 2);
      assert.equal(topic.height, 3);
    }
  },
  'tile': {
    topic: createEmptyLevel(),
    'get': function(topic) {
      assert.equal(topic.tile(1, 1), 0);
    },
    'set': {
      'success': function(topic) {
        assert.equal(topic.tile(1, 1, 100), 100);
      },
      'invalid range': function(topic) {
        assert.equal(topic.tile(-10, 10, 1), false);
        assert.equal(topic.tile(10, -10, 1), false);
      }
    }
  },
  'filterPosition': {
    topic: createEmptyLevel(),
    'success': function(topic) {
      assert.deepEqual(topic.filterPosition(-1, -1), [0, 0]);
      assert.deepEqual(topic.filterPosition(100, 100), [1, 2]);
      assert.deepEqual(topic.filterPosition(1, 2), [1, 2]);
    }
  }
}).export(module);

