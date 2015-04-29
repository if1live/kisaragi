var vows = require('vows');
var assert = require('assert');
var network = require('../lib/network');

vows.describe('Server').addBatch({
  'connectClient': {
    topic: new network.Server(null),
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
    'uuid - found': {
      topic: new network.Server(null),
      'success': function(topic) {
        var client = topic.connectClient('foo');
        assert.equal(topic.findClient({uuid: client.uuid}), client);
      }
    },
    'uuid - not found': {
      topic: new network.Server(null),
      'null': function(topic) {
        var client = topic.connectClient('foo');
        assert.equal(topic.findClient({uuid: 999}), null);
      }
    },
    'socket - found': {
      topic: new network.Server(null),
      'success': function(topic) {
        var client = topic.connectClient('foo');
        assert.equal(topic.findClient({socket: 'foo'}), client);
      }
    },
    'socket - not found': {
      topic: new network.Server(null),
      'null': function(topic) {
        var client = topic.connectClient('foo');
        assert.equal(topic.findClient({socket: '????'}), null);
      }
    }
  },
  'disconnectClient': {
    topic: new network.Server(null),
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
