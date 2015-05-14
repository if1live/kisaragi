/* global describe: false, it: false, beforeEach: false, before: false */
"use strict";

var assert = require('assert');
var World = require('../lib/world');

describe('World', function() {
  beforeEach(function() {
    this.topic = new World('svr');
  });
  describe('#getNextId()', function() {
    it('success', function() {
      assert.equal(this.topic.getNextId(), 1);
      assert.equal(this.topic.getNextId(), 2);
      assert.equal(this.topic.getNextId(), 3);
    });
  });
  
  // General
  describe('#objectList()', function() {
    describe('not exist', function() {
      it('create list', function() {
        assert.equal(this.topic.objectList('sample').length, 0);
      });
    });
    describe('exist', function() {
      beforeEach(function() {
        this.topic.objectList('sample').push({id: 1});
      });
      it('use prev list', function() {
        assert.equal(this.topic.objectList('sample').length, 1);
      });
    });
  });
  describe('#allObjectList()', function() {
    describe('simple', function() {
      beforeEach(function() {
        this.topic.objectList('foo').push({id: 1});
        this.topic.objectList('bar').push({id: 2});
      });
      it('success', function() {
        assert.equal(this.topic.allObjectList().length, 2);
      });
    });
  });
  describe('#findObject()', function() {
    beforeEach(function() {
      this.user = this.topic.createUser({"foo": "bar"});
      this.topic.addUser(this.user);
      
      this.enemy = this.topic.generateEnemy();
    });
    it('enemy', function() {
      assert.equal(this.topic.findObject(this.enemy.id), this.enemy);
    });
    it('user', function() {
      assert.equal(this.topic.findObject(this.user.id), this.user);
    });
  });
  // User
  describe('#createUser()', function() {
    it('success', function() {
      var sock = {};
      var user = this.topic.createUser(sock);
      assert.equal(user.sock, sock);
      assert.equal(sock.user, user);
    });
  });
  describe('#addUser()', function() {
    describe('1 time', function() {
      beforeEach(function() {
        this.user = this.topic.createUser({"foo": "bar"});
        this.topic.addUser(this.user);
      });
      it('success', function() {
        assert.equal(this.topic.objectList('user').length, 1);
        assert.equal(this.user.id, 1);
      });
    });
    describe('multiple time', function() {
      beforeEach(function() {
        this.user_a = this.topic.createUser({"foo": "bar"});
        this.user_b = this.topic.createUser({"foo": "spam"});
        this.topic.addUser(this.user_a);
        this.topic.addUser(this.user_b);
      });
      it('success', function() {
        assert.equal(this.user_a.id, 1);
        assert.equal(this.user_b.id, 2);
      });
    });
  });
  
  describe('#removeUser()', function() {
    describe('simple', function() {
      beforeEach(function() {
        this.user_a = this.topic.createUser({"foo": "bar"});
        this.user_b = this.topic.createUser({"foo": "spam"});
        this.topic.addUser(this.user_a);
        this.topic.addUser(this.user_b);
      });
      it('success', function() {
        this.topic.removeUser(this.user_a);
        assert.equal(this.topic.objectList('user')[0].id, this.user_b.id);
      });
    });
  });
  
  describe('#findUser()', function() {
    describe('exist', function() {
      beforeEach(function() {
        this.user = this.topic.createUser({"foo": "bar"});
        this.topic.addUser(this.user);
      });
      it('success', function() {
        assert.equal(this.topic.findUser(this.user.id), this.user);
      });
    });
    describe('not exist', function() {
      it('null', function() {
        assert.equal(this.topic.findUser(999), null);
      });
    });
  });
  // Enemy
  describe('#generateEnemy()', function() {
    describe('simple', function() {
      it('success', function() {
        this.topic.generateEnemy();
        assert.equal(this.topic.objectList('enemy').length, 1);
      });
    });
  });
});
