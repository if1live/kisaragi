var vows = require('vows');
var assert = require('assert');
var Level = require('../lib/level');


vows.describe('Level').addBatch({
  'create': {
    topic: new Level(2, 3),
    'succes': function(topic) {
      assert.equal(topic.width, 2);
      assert.equal(topic.height, 3);
    }
  },
  'tile': {
    topic: new Level(2, 3),
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
  }
}).export(module);

