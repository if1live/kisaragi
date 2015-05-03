var vows = require('vows');
var assert = require('assert');
var World = require('../lib/world');

vows.describe('World').addBatch({
  'getNextId': {
    topic: new World(null),
    'success': function(topic) {
      assert.equal(topic.getNextId(), 1);
      assert.equal(topic.getNextId(), 2);
      assert.equal(topic.getNextId(), 3);
    }
  },
  // General
  'objectList': {
    'not exist': {
      topic: new World(),
      'success': function(topic) {
        assert.equal(topic.objectList('sample').length, 0);
      }
    },
    'exist': {
      topic: new World(),
      'success': function(topic) {
        topic.objectList('sample').push({});
        assert.equal(topic.objectList('sample').length, 1);
      }
    }
  },
  'allObjectList': {
    topic: new World(),
    'success': function(topic) {
      topic.objectList('foo').push({});
      topic.objectList('bar').push({});
      assert.equal(topic.allObjectList().length, 2);
    }
  },
  'findObject': {
    'enemy': {
      topic: new World(),
      'success': function(topic) {
        var user = topic.createUser('foo');
        topic.addUser(user);

        var enemy = topic.generateEnemy();
        assert.equal(topic.findObject(enemy.id), enemy);
      }
    },
    'user': {
      topic: new World(),
      'success': function(topic) {
        var user = topic.createUser('foo');
        topic.addUser(user);

        topic.generateEnemy();
        assert.equal(topic.findObject(user.id), user);
      }
    }
  },
  // User
  'createUser': {
    topic: new World(),
    'success': function(topic) {
      var client = {};
      var user = topic.createUser(client);
      assert.equal(user.client, client);
      assert.equal(client.user, user);
    }
  },
  'addUser': {
    '1 time': {
      topic: new World(),
      'success': function(topic) {
        var user = topic.createUser('foo');
        topic.addUser(user);
        assert.equal(topic.objectList('user').length, 1);
        assert.equal(user.id, 1);
      }
    },
    'multiple time': {
      topic: new World(),
      'success': function(topic) {
        var user_a = topic.createUser('foo');
        var user_b = topic.createUser('bar');
        topic.addUser(user_a);
        topic.addUser(user_b);

        assert.equal(user_a.id, 1);
        assert.equal(user_b.id, 2);
      }
    }
  },
  'removeUser': {
    topic: new World(),
    'success': function(topic) {
      var user_a = topic.createUser('foo');
      var user_b = topic.createUser('bar');
      topic.addUser(user_a);
      topic.addUser(user_b);

      topic.removeUser(user_a);
      assert.equal(topic.objectList('user')[0].id, user_b.id);
    }
  },
  'findUser': {
    'exist': {
      topic: new World(),
      'success': function(topic) {
        var user = topic.createUser('foo');
        topic.addUser(user);
        assert.equal(topic.findUser(user.id), user);
      }
    },
    'not exist': {
      topic: new World(),
      'null': function(topic) {
        assert.equal(topic.findUser(999), null);
      }
    }
  },
  // Enemy
  'generateEnemy': {
    topic: new World(),
    'success': function(topic) {
      topic.generateEnemy();
      assert.equal(topic.objectList('enemy').length, 1);
    }
  }
}).export(module);
