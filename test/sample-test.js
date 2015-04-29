var vows = require('vows');
var assert = require('assert');

vows.describe('sample').addBatch({
  'foo': {
    topic: function() { return 1/0; },

    'infinity': function(topic) {
      assert.equal(topic, Infinity);
    }
  }
}).export(module);
