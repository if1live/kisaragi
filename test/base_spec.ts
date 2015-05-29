// Ŭnicode please
///<reference path="test.d.ts"/>  

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../app/kisaragi');
}

describe('kisaragi.EntityListHelper', function () {
    var topic: kisaragi.EntityListHelper = null;

    beforeEach(function () {
        topic = new kisaragi.EntityListHelper([]);
    });

    describe("#add()", function () {
        describe('normal add', function () {
            it('success', function () {
                var retval = topic.add(new kisaragi.Entity(1));
                assert.equal(retval, true);
                assert.equal(topic.length, 1);
            });
        });
        describe('duplicated id', function () {
            beforeEach(function () {
                topic.add(new kisaragi.Entity(1));
            });
            it('cannot add', function () {
                var retval = topic.add(new kisaragi.Entity(1));
                assert.equal(retval, false);
                assert.equal(topic.length, 1);
            });
        });
        describe('null', function () {
            it('cannot add', function () {
                var retval = topic.add(null);
                assert.equal(retval, false);
                assert.equal(topic.length, 0);
            });
        });
    });

    describe('#find()', function () {
        beforeEach(function () {
            topic.add(new kisaragi.Entity(1));
        });

        it('exist -> success', function () {
            var obj = topic.find(1);
            assert.equal(obj.movableId, 1);
        });
        it('not exist', function () {
            var obj = topic.find(999);
            assert.equal(obj, null);
        });
    });

    describe('#removeId()', function () {
        beforeEach(function () {
            topic.add(new kisaragi.Entity(1));
        });
        it('success', function () {
            var retval = topic.removeId(1);
            assert.equal(retval, true);
            assert.equal(topic.length, 0);
        });
        it('not exist', function () {
            var retval = topic.removeId(9999);
            assert.equal(retval, false);
            assert.equal(topic.length, 1);
        });
    });
});
