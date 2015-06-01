// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('ClientConnection', function () {
    var subject = kisaragi.ClientConnection.mock();

    describe('#send()', function () {
        it('success', function () {
            var packet = new kisaragi.PingPacket();
            subject.send(packet);
            assert.equal(subject.sendedPacket, packet);
        })
    })

    describe('#handle', function () {
        var packetType = kisaragi.PacketType.Ping;
        var called = false;

        beforeEach(function () {
            called = false;
            subject.registerHandler(packetType, (packet: kisaragi.BasePacket) => {
                called = true;
            })
        })

        it('handler exist', function () {
            var packet = kisaragi.PacketFactory.create(packetType);
            subject.handle(packet);
            assert.equal(called, true);
        })

        it('handler not exist', function () {
            var invalidType = kisaragi.PacketType.Disconnect;
            var packet = kisaragi.PacketFactory.create(invalidType);
            subject.handle(packet);
            assert.notEqual(invalidType, packetType);
            assert.equal(called, false);
        })
    })
})
