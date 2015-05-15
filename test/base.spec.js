/* global describe: false, it: false, beforeEach: false, before: false */
"use strict";

var assert = require('assert');
var base = require('../lib/base');

describe('base.Entity', function() {
  describe('#x, #y', function() {
    beforeEach(function() {
      this.subject = new base.Entity();
    });
    it('set x', function() {
      this.subject.x(10);
      assert.equal(this.subject.pos[0], 10);
    });
    it('get x', function() {
      this.subject.pos[0] = 20;
      assert.equal(this.subject.x(), 20);
    });
    it('set y', function() {
      this.subject.y(30);
      assert.equal(this.subject.pos[1], 30);
    });
    it('get y', function() {
      this.subject.pos[1] = 40;
      assert.equal(this.subject.y(), 40);
    });
  });
});

describe('base.EntityManager', function() {
  describe('#findALl()', function() {
    before(function() {
      this.mgr = new base.EntityManager();
      
      this.ent_a = new base.Entity();
      this.ent_a.movableId = 100;
      this.ent_a.pos = [1, 2];
      
      this.ent_b = new base.Entity();
      this.ent_b.movableId = 200;
      this.ent_b.pos = [1, 3];
      
      this.mgr.add(this.ent_a);
      this.mgr.add(this.ent_b);
    });
    it('pos based == combine based', function() {
      var elemList = this.mgr.findAll({
        x: this.ent_a.x(), 
        y: this.ent_a.y()
      });
      assert.equal(elemList[0], this.ent_a);
    });
    it('id based', function() {
      var elemList = this.mgr.findAll({
        id: this.ent_b.movableId
      });
      assert.equal(elemList[0], this.ent_b);
    });
  });
  
  describe('#remove', function() {
    beforeEach(function() {
      this.mgr = new base.EntityManager();
      
      this.ent_a = new base.Entity();
      this.ent_a.movableId = 100;
      
      this.mgr.add(this.ent_a);
    });
    it('id', function() {
      this.mgr.remove(this.ent_a.movableId);
      assert.equal(this.mgr.table[this.ent_a.id()], undefined);
    });
    it('cond', function() {
      this.mgr.remove({
        id: this.ent_a.movableId
      });
      assert.equal(this.mgr.table[this.ent_a.id()], undefined);
    });
    it('cannot find exist id', function() {
      this.mgr.remove(999);
    });
  });
});

describe('base.Serializer', function() {
  before(function() {
    this.topic = new base.Serializer(['id', 'pos'], {id: 1, pos: [2, 3], category: 'user'});
  });

  describe('#serialize()', function() {
    it('success', function() {
      var serialized = this.topic.serialize();
      assert.deepEqual(serialized, {id: 1, pos: [2, 3]});
    });
  });
  describe('#deserialize()', function() {
    it('success', function() {
      this.topic.deserialize({id: 2, pos: [3, 4]});
      assert.equal(this.topic.obj.id, 2);
      assert.deepEqual(this.topic.obj.pos, [3, 4]);
    });
  });
});

describe('base.GameObjectListHelper', function() {
  beforeEach(function() {
    this.topic = new base.GameObjectListHelper([]);
  });
  
  describe("#addObject()", function() {
    describe('normal add', function() {
      it('success', function() {
        var retval = this.topic.addObject({id: 1});
        assert.equal(retval, true);
        assert.equal(this.topic.getLength(), 1);
      });
    });
    describe('duplicated id', function() {
      beforeEach(function() {
        this.topic.addObject({id: 1});
      });
      it('cannot add', function() {
        var retval = this.topic.addObject({id: 1});
        assert.equal(retval, false);
        assert.equal(this.topic.getLength(), 1);
      });
    });
    describe('null', function() {
      it('cannot add', function() {
        var retval = this.topic.addObject(null);
        assert.equal(retval, false);
        assert.equal(this.topic.getLength(), 0);
      });
    });
  });
  
  describe('#findObject()', function() {
    beforeEach(function() {
      this.topic.addObject({id: 1});
    });
    
    it('exist -> success', function() {
      var obj = this.topic.findObject(1);
      assert.equal(obj.id, 1);
    });
    it('not exist', function() {
      var obj = this.topic.findObject(999);
      assert.equal(obj, null);
    });
  });
  
  describe('#removeId()', function() {
    beforeEach(function() {
      this.topic.addObject({id: 1});
    });
    it('success', function() {
      var retval = this.topic.removeId(1);
      assert.equal(retval, true);
      assert.equal(this.topic.getLength(), 0);
    });
    it('not exist', function() {
      var retval = this.topic.removeId(9999);
      assert.equal(retval, false);
      assert.equal(this.topic.getLength(), 1);
    });
  });
});

