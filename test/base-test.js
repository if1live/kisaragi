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
  },
  'Serializer': {
    topic: new base.Serializer(['id', 'pos'], {id: 1, pos: [2, 3], category: 'user'}),
    'serialize': function(topic) {
      var serialized = topic.serialize();
      assert.deepEqual(serialized, {id: 1, pos: [2, 3]});
    },
    'deserialize': function(topic) {
      topic.deserialize({id: 2, pos: [3, 4]});
      assert.equal(topic.obj.id, 2);
      assert.deepEqual(topic.obj.pos, [3, 4]);
    }
  }
}).export(module);
