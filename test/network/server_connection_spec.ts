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
            assert.equal(subject.globalBroadcastedPacket, null);
        })
    })

    describe('#broadcastImmediate()', function () {
        var subject: kisaragi.MockServerConnection;
        before(function () {
            subject = kisaragi.ServerConnection.mock('dummy');
        })

        it('success', function () {
            var packet = new kisaragi.PingPacket();
            subject.broadcastImmediate(packet, 0);
            assert.equal(subject.sendedPacket, null);
            assert.equal(subject.broadcastedPacket, packet);
            assert.equal(subject.globalBroadcastedPacket, null);
        })
    })

    describe('#globalBroadcastImmediate()', function () {
        var subject: kisaragi.MockServerConnection;
        before(function () {
            subject = kisaragi.ServerConnection.mock('dummy');
        })

        it('success', function () {
            var packet = new kisaragi.PingPacket();
            subject.globalBroadcastImmediate(packet);
            assert.equal(subject.sendedPacket, null);
            assert.equal(subject.broadcastedPacket, null);
            assert.equal(subject.globalBroadcastedPacket, packet);
        })
    })
})
