// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('ClientEcho', () => {
    var conn: kisaragi.MockClientConnection;
    var subject: kisaragi.ClientEcho;
    var factory = new kisaragi.PacketFactory();
    
    beforeEach(() => {
        conn = kisaragi.ClientConnection.mock();
        subject = new kisaragi.ClientEcho(conn);
    });

    describe('#echo()', () => {
        it('success', () => {
            subject.echo('data');
            assert.notEqual(conn.sendedPacket, null);
            assert.equal(conn.sendedPacket.packetType, kisaragi.PacketType.Echo);
        });
    });
    describe('#echoAll()', () => {
        it('success', () => {
            subject.echoAll('data');
            assert.notEqual(conn.sendedPacket, null);
            assert.equal(conn.sendedPacket.packetType, kisaragi.PacketType.EchoAll);
        });
    });
    
    describe('echo receive', function() {
        it('success', function() {
            var packet = factory.echo('echo');
            conn.handle(packet);
            assert.equal(subject.echoReceivedPacket, packet);
        });
    });
    describe('echoAll received', function() {
        it('success', function() {
            var packet = factory.echoAll('echoAll');
            conn.handle(packet);
            assert.equal(subject.echoAllReceivedPacket, packet);
        });
    });
});


describe('ServerEcho', function () {
    var subject = new kisaragi.ServerEcho()
    var factory = new kisaragi.PacketFactory();
    var connMgr: kisaragi.ConnectionManager;
    var conn: kisaragi.MockServerConnection;

    beforeEach(function () {
        connMgr = new kisaragi.ConnectionManager(null);
        conn = connMgr.create_mock();
    })

    describe('#handle', function () {
        it('echo', function () {
            var packet = factory.echo('echo');
            var svrPacket = new kisaragi.ServerReceivedPacket(packet, conn);
            subject.handle(svrPacket);
            connMgr.flushSendQueue();

            assert.equal(conn.sendedPacket, packet);
            assert.equal(conn.broadcastedPacket, null);
        })
        it('echoAll', function () {
            var packet = factory.echoAll('echo');
            var svrPacket = new kisaragi.ServerReceivedPacket(packet, conn);
            subject.handle(svrPacket);
            connMgr.flushSendQueue();

            assert.equal(conn.sendedPacket, null);
            assert.equal(conn.broadcastedPacket, packet);
        })
        it('not echo packet', function () {
            var packet = factory.ping();
            var svrPacket = new kisaragi.ServerReceivedPacket(packet, conn);
            subject.handle(svrPacket);
            connMgr.flushSendQueue();

            assert.equal(conn.sendedPacket, null);
            assert.equal(conn.sendedPacket, null);
        })
    })
})