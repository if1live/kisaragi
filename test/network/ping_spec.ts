// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('ClientPing', function () {
    var factory = new kisaragi.PacketFactory();
    var conn: kisaragi.MockClientConnection;
    var subject: kisaragi.ClientPing;
    beforeEach(function () {
        conn = kisaragi.ClientConnection.mock();
        subject = new kisaragi.ClientPing(conn);
    })

    describe('#ping', function () {
        it('success', function () {
            subject.ping();
            assert.notEqual(conn.sendedPacket, null);
            assert.equal(conn.sendedPacket.packetType, kisaragi.PacketType.Ping);
        })
    })
})

describe('ServerPing', function () {
    var subject = new kisaragi.ServerPing();
    var factory = new kisaragi.PacketFactory();
    var connMgr: kisaragi.ConnectionManager;
    var conn: kisaragi.MockServerConnection;

    beforeEach(function () {
        connMgr = new kisaragi.ConnectionManager(null);
        conn = connMgr.create_mock();
    })

    describe('#handle', function () {
        it('ping', function () {
            var packet = factory.ping();
            var svrPacket = new kisaragi.ServerReceivedPacket(packet, conn);
            subject.handle(svrPacket);
            connMgr.flushSendQueue();

            assert.equal(conn.sendedPacket, packet);
            assert.equal(conn.broadcastedPacket, null);
        })

        it('not ping', function () {
            var packet = factory.echo('echo');
            var svrPacket = new kisaragi.ServerReceivedPacket(packet, conn);
            subject.handle(svrPacket);
            connMgr.flushSendQueue();

            assert.equal(conn.sendedPacket, null);
            assert.equal(conn.broadcastedPacket, null);
        })
    })
})