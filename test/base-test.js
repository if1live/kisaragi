var vows = require('vows');
var assert = require('assert');
var base = require('../lib/base');

vows.describe('base').addBatch({
  'unitTestSample': {
    topic: function() {
      return base.unitTestSample();
    },
    'success': function(topic) {
      assert.equal(topic, true);
    }
  }
}).run();
