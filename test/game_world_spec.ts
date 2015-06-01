﻿// Ŭnicode please
///<reference path="test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../app/kisaragi');
}

describe('GameWorld', function () {
    var topic: kisaragi.GameWorld = null;
    beforeEach(function () {
        topic = new kisaragi.GameWorld(kisaragi.Role.Server);
    });

    describe('#getNextId()', function () {
        it('success', function () {
            assert.equal(topic.getNextId(), 1);
            assert.equal(topic.getNextId(), 2);
            assert.equal(topic.getNextId(), 3);
        });
    });

    // General
    
    /*
    describe('#findObject()', function () {
        var enemy = null;

        beforeEach(function () {
            enemy = topic.generateEnemy();
        });
        it('enemy', function () {
            assert.equal(topic.findObject(enemy.movableId), enemy);
        });
    });
    */
    // User
    /*
    describe('#createUser()', function () {
        it('success', function () {
            var sock = {};
            var user = topic.createUser(sock);
            assert.equal(user.sock, sock);
            assert.equal(sock.user, user);
        });
    });
    describe('#addUser()', function () {
        describe('1 time', function () {
            beforeEach(function () {
                user = topic.createUser({ "foo": "bar" });
                topic.addUser(user);
            });
            it('success', function () {
                assert.equal(topic.objectList(kisaragi.'user').length, 1);
                assert.equal(user.id, 1);
            });
        });
        describe('multiple time', function () {
            beforeEach(function () {
                user_a = topic.createUser({ "foo": "bar" });
                user_b = topic.createUser({ "foo": "spam" });
                topic.addUser(user_a);
                topic.addUser(user_b);
            });
            it('success', function () {
                assert.equal(user_a.id, 1);
                assert.equal(user_b.id, 2);
            });
        });
    });
    */
    /*
    describe('#removeUser()', function () {
        describe('simple', function () {
            beforeEach(function () {
                user_a = topic.createUser({ "foo": "bar" });
                user_b = topic.createUser({ "foo": "spam" });
                topic.addUser(user_a);
                topic.addUser(user_b);
            });
            it('success', function () {
                topic.removeUser(user_a);
                assert.equal(topic.objectList('user')[0].id, user_b.id);
            });
        });
    });

    describe('#findUser()', function () {
        describe('exist', function () {
            beforeEach(function () {
                user = topic.createUser({ "foo": "bar" });
                topic.addUser(user);
            });
            it('success', function () {
                assert.equal(topic.findUser(user.id), user);
            });
        });
        describe('not exist', function () {
            it('null', function () {
                assert.equal(topic.findUser(999), null);
            });
        });
    });
    */
    // Enemy
    /*
    describe('#generateEnemy()', function () {
        describe('simple', function () {
            it('success', function () {
                topic.generateEnemy();
                assert.equal(topic.objectList(kisaragi.Category.Enemy).length, 1);
            });
        });
    });
    */
});
