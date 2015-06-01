// Ŭnicode please
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
            ent_b.zoneId = kisaragi.ZoneID.buildId(0, 0, 1);

            mgr.add(ent_a);
            mgr.add(ent_b); 
        });
        it('pos based == combine based', () => {
            var elemList:kisaragi.Entity[] = mgr.findAll({
                x: ent_a.x,
                y: ent_a.y
            });
            assert.equal(elemList.length, 1);
            assert.equal(elemList[0], ent_a);
        });
        it('id based', () => {
            var elemList:kisaragi.Entity[] = mgr.findAll({
                id: ent_b.movableId
            });
            assert.equal(elemList.length, 1);
            assert.equal(elemList[0], ent_b);
        });
        it('floor based', () => {
            var elemList = mgr.findAll({
                floor: 1
            });
            assert.equal(elemList.length, 1);
            assert.equal(elemList[0], ent_b);
        })
    });
});
