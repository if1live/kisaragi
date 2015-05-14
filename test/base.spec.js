/* global describe: false, it: false, beforeEach: false, before: false */
"use strict";

var assert = require('assert');
var base = require('../lib/base');

describe('base', function() {
  describe('#unitTestSample()', function() {
    before(function() {
      this.topic = base.unitTestSample();
    });

    it('success', function() {
      assert.equal(this.topic, true);
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

