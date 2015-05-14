/* global describe: false, it: false, beforeEach: false, before: false */
"use strict";

var assert = require('assert');
var network = require('../lib/network');

describe('Server', function() {
  describe('#connectClient()', function() {
    beforeEach(function() {
      this.topic = new network.Server(null);
    });
    it('empty', function() {
      assert.equal(this.topic.clientList.length, 0);
    });
    it('success', function() {
      this.topic.connectClient('foo');
      assert.equal(this.topic.clientList.length, 1);

      this.topic.connectClient('bar');
      assert.equal(this.topic.clientList.length, 2);
    });
  });
  
  describe('#findClient()', function() {
    beforeEach(function() {
      this.topic = new network.Server(null);
    });
    
    it('uuid - found', function() {
      var client = this.topic.connectClient('foo');
      assert.equal(this.topic.findClient({uuid: client.uuid}), client);
    });
    it('uuid - not found', function() {
      var client = this.topic.connectClient('foo');
      assert.equal(this.topic.findClient({uuid: 999}), null);
    });
    it('socket - found', function() {
      var client = this.topic.connectClient('foo');
      assert.equal(this.topic.findClient({socket: 'foo'}), client);
    });
    it('socket - not found', function() {
      var client = this.topic.connectClient('foo');
      assert.equal(this.topic.findClient({socket: '????'}), null);
    });
  });
  
  describe('#disconnectClient()', function() {
    beforeEach(function() {
      this.topic = new network.Server(null);
    });
    it('remove from list', function() {
      var client_a = this.topic.connectClient('foo');
      var client_b = this.topic.connectClient('bar');

      assert.equal(this.topic.clientList.length, 2);

      this.topic.disconnectClient(client_b.socket);
      assert.equal(this.topic.clientList.length, 1);
      assert.equal(this.topic.clientList[0], client_a);
    });
  });
});

describe('ClientEcho', function() {
  beforeEach(function() {
    function DummySocket() {
      var self = this;
      self.cmdTable = {};
      self.called = {};
      self.on = function(cmd, func) {
        self.cmdTable[cmd] = func;
        self.called[cmd] = false;
      };
      self.emit = function(cmd, ctx) {
        var nextCmd = cmd.replace('c2s', 's2c');
        self.cmdTable[nextCmd](ctx);
        self.called[nextCmd] = true;
      };
    }
    this.socket = new DummySocket();
    this.echo = new network.ClientEcho(this.socket, {
      echo: function(ctx) {},
      echoAll: function(ctx) {}
    });
  });
  
  describe('#echo()', function() {
    it('success', function() {
      this.echo.echo('data');
      assert.equal(this.socket.called.s2c_echo, true);
    });
  });
  describe('#echoAll()', function() {
    it('success', function() {
      this.echo.echoAll('data');
      assert.equal(this.socket.called.s2c_echoAll, true);
    });
  });
});