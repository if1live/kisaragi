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
  },
  'GameObjectListHelper': {
    'addObject': {
      'normal add': {
        topic: new base.GameObjectListHelper([]),
        'run': function(topic) {
          var retval = topic.addObject({id: 1});
          assert.equal(retval, true);
          assert.equal(topic.getLength(), 1);
        }
      },
      'duplicated id': {
        topic: new base.GameObjectListHelper([]),
        'run': function(topic) {
          topic.addObject({id: 1});
          var retval = topic.addObject({id: 1});
          assert.equal(retval, false);
          assert.equal(topic.getLength(), 1);
        }
      },
      'null': {
        topic: new base.GameObjectListHelper([]),
        'run': function(topic) {
          var retval = topic.addObject(null);
          assert.equal(retval, false);
          assert.equal(topic.getLength(), 0);
        }
      }
    },
    'findObject': {
      topic: function() {
        var list = new base.GameObjectListHelper([]);
        list.addObject({id: 1});
        return list;
      },
      'success': function(topic) {
        var obj = topic.findObject(1);
        assert.equal(obj.id, 1);
      },
      'not exist': function(topic) {
        var obj = topic.findObject(999);
        assert.equal(obj, null);
      }
    },
    'removeId': {
      topic: function() {
        return function() {
          var list = new base.GameObjectListHelper([]);
          list.addObject({id: 1});
          return list;
        };
      },
      'success': function(topicFunc) {
        var topic = topicFunc();
        var retval = topic.removeId(1);
        assert.equal(retval, true);
        assert.equal(topic.getLength(), 0);
      },
      'not exist': function(topicFunc) {
        var topic = topicFunc();
        var retval = topic.removeId(9999);
        assert.equal(retval, false);
        assert.equal(topic.getLength(), 1);
      }
    }
  }
}).export(module);
