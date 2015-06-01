// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('Player[Client]', function () {
    describe('move function', function () {
        var subject: kisaragi.Player = null;

        beforeEach(function () {
            var conn = kisaragi.ClientConnection.mock();
            subject = kisaragi.Player.createClientEntity(1, conn);
            subject.x = 0;
            subject.y = 0;
        });

        it('#moveLeft()', function () {
            subject.moveLeft();
        });

        it('#moveRight()', function () {
            subject.moveRight();
        });

        it('#moveUp()', function () {
            subject.moveUp();
        });

        it('#moveDown()', function () {
            subject.moveDown();
        });
    });
});

describe('Player[Server]', function() {
    beforeEach(function() {
  
    });
});
