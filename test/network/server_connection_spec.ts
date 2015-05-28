// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('ServerConnection', function () {
    describe('#sendImmediate()', function () {
        var subject: kisaragi.MockServerConnection;
        before(function () {
            subject = kisaragi.ServerConnection.mock('dummy');
        })

        it('success', function () {
            var packet = new kisaragi.PingPacket();
            subject.sendImmediate(packet);
            assert.equal(subject.sendedPacket, packet);
            assert.equal(subject.broadcastedPacket, null);
        })
    })

    describe('#broadcastImmediate()', function () {
        var subject: kisaragi.MockServerConnection;
        before(function () {
            subject = kisaragi.ServerConnection.mock('dummy');
        })

        it('success', function () {
            var packet = new kisaragi.PingPacket();
            subject.broadcastImmediate(packet);
            assert.equal(subject.sendedPacket, null);
            assert.equal(subject.broadcastedPacket, packet);
        })
    })
})
