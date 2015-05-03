var vows = require('vows');
var assert = require('assert');
var game = require('../lib/game');

vows.describe('World').addBatch({
  'createUser': {
    topic: new game.World(),
    'success': function(topic) {
      var client = {};
      var user = topic.createUser(client);
      assert.equal(user.client, client);
      assert.equal(client.user, user);
    }
  },
  'addUser': {
    '1 time': {
      topic: new game.World(),
      'success': function(topic) {
        var user = topic.createUser('foo');
        topic.addUser(user);
        assert.equal(topic.userList.length, 1);
        assert.equal(user.id, 1);
      }
    },
    'multiple time': {
      topic: new game.World(),
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
    topic: new game.World(),
    'success': function(topic) {
      var user_a = topic.createUser('foo');
      var user_b = topic.createUser('bar');
      topic.addUser(user_a);
      topic.addUser(user_b);

      topic.removeUser(user_a);
      assert.equal(topic.userList[0].id, user_b.id);
    }
  },
  'getNextId': {
    topic: new game.World(null),
    'success': function(topic) {
      assert.equal(topic.getNextId(), 1);
      assert.equal(topic.getNextId(), 2);
      assert.equal(topic.getNextId(), 3);
    }
  },
  'findUser': {
    'exist': {
      topic: new game.World(),
      'success': function(topic) {
        var user = topic.createUser('foo');
        topic.addUser(user);
        assert.equal(topic.findUser(user.id), user);
      }
    },
    'not exist': {
      topic: new game.World(),
      'null': function(topic) {
        assert.equal(topic.findUser(999), null);
      }
    }
  },
  'findGameObject': {
    'enemy': {
      topic: new game.World(),
      'success': function(topic) {
        var user = topic.createUser('foo');
        topic.addUser(user);

        var enemy = topic.generateEnemy();
        assert.equal(topic.findGameObject(enemy.id), enemy);
      }
    },
    'user': {
      topic: new game.World(),
      'success': function(topic) {
        var user = topic.createUser('foo');
        topic.addUser(user);

        var enemy = topic.generateEnemy();
        assert.equal(topic.findGameObject(user.id), user);
      }
    }
  },
  'generateEnemy': {
    topic: new game.World(),
    'success': function(topic) {
      var enemy = topic.generateEnemy();
      assert.equal(topic.enemyList.length, 1);
    }
  }
}).export(module);
