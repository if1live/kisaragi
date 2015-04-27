var vows = require('vows');
var assert = require('assert');
var game = require('../lib/game');

vows.describe('Server').addBatch({
  'getNextId': {
    topic: new game.Server(null),
    'success': function(topic) {
      assert.equal(topic.getNextId(), 1);
      assert.equal(topic.getNextId(), 2);
      assert.equal(topic.getNextId(), 3);
    }
  },

  'connectClient': {
    topic: new game.Server(null),
    'empty': function(topic) {
      assert.equal(topic.clientList.length, 0);
    },
    'success': function(topic) {
      var client_1 = topic.connectClient('foo');
      assert.equal(topic.clientList.length, 1);

      var client_2 = topic.connectClient('bar');
      assert.equal(topic.clientList.length, 2);
    }
  },
  'findClient': {
    'uid - found': {
      topic: new game.Server(null),
      'success': function(topic) {
        var client = topic.connectClient('foo');
        assert.equal(topic.findClient({uid: client.uid}), client);
      }
    },
    'uid - not found': {
      topic: new game.Server(null),
      'null': function(topic) {
        var client = topic.connectClient('foo');
        assert.equal(topic.findClient({uid: 999}), null);
      }
    },
    'socket - found': {
      topic: new game.Server(null),
      'success': function(topic) {
        var client = topic.connectClient('foo');
        assert.equal(topic.findClient({socket: 'foo'}), client);
      }
    },
    'socket - not found': {
      topic: new game.Server(null),
      'null': function(topic) {
        var client = topic.connectClient('foo');
        assert.equal(topic.findClient({socket: '????'}), null);
      }
    }
  },
  'disconnectClient': {
    topic: new game.Server(null),
    'remove from list': function(topic) {
      var client_a = topic.connectClient('foo');
      var client_b = topic.connectClient('bar');

      assert.equal(topic.clientList.length, 2);

      topic.disconnectClient(client_b.socket);
      assert.equal(topic.clientList.length, 1);
      assert.equal(topic.clientList[0], client_a);
    }
  }
}).export(module);

vows.describe('User').addBatch({

}).export(module);

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
    topic: new game.World(),
    'success': function(topic) {
      var user = topic.createUser('foo');
      topic.addUser(user);
      assert.equal(topic.userList.length, 1);
    }
  }
}).export(module);
