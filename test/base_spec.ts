///<reference path="test.d.ts"/>  

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../app/kisaragi');
}

describe('Entity', () => {
    describe('#x, #y', () => {
        var subject: kisaragi.Entity = null;

        beforeEach(() => {
            subject = new kisaragi.Entity(1);
        });
        it('x', () => {
            subject.x = 10;
            assert.equal(subject.x, 10);
        });
        it('y', () => {
            subject.y = 20;
            assert.equal(subject.y, 20);
        });
    });
});

describe('EntityManager', () => {
    describe('#removeId()', () => {
        var mgr: kisaragi.EntityManager = null;
        var ent_a: kisaragi.Entity = null;

        beforeEach(function () {
            mgr = new kisaragi.EntityManager();
            ent_a = new kisaragi.Entity(100);
            mgr.add(ent_a);
        });
        it('id', () => {
            mgr.removeId(ent_a.movableId);
            assert.equal(mgr.table[ent_a.movableId], undefined);
        });
        it('cannot find exist id', function () {
            mgr.removeId(999);
            assert.equal(mgr.table[999], undefined);
        });
    });
    
    describe('#remove()', () => {
        var mgr: kisaragi.EntityManager = null;
        var ent_a: kisaragi.Entity = null;

        beforeEach(function () {
            mgr = new kisaragi.EntityManager();
            ent_a = new kisaragi.Entity(100);
            mgr.add(ent_a);
        });
        
        it('cond', () => {
            mgr.remove({
                id: ent_a.movableId
            });
            assert.equal(mgr.table[ent_a.movableId], undefined);
        }); 
    });

    describe('#findAll()', () => {
        var mgr: kisaragi.EntityManager = null;
        var ent_a: kisaragi.Entity = null;
        var ent_b: kisaragi.Entity = null;

        before(function () {
            mgr = new kisaragi.EntityManager();

            ent_a = new kisaragi.Entity(100);
            ent_a.pos = new kisaragi.Coord(1, 2);

            ent_b = new kisaragi.Entity(200);
            ent_b.pos = new kisaragi.Coord(1, 3);

            mgr.add(ent_a);
            mgr.add(ent_b);
        });
        it('pos based == combine based', () => {
            var elemList:kisaragi.Entity[] = mgr.findAll({
                x: ent_a.x,
                y: ent_a.y
            });
            assert.equal(elemList[0], ent_a);
        });
        it('id based', () => {
            var elemList:kisaragi.Entity[] = mgr.findAll({
                id: ent_b.movableId
            });
            assert.equal(elemList[0], ent_b);
        });
    });
});

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
