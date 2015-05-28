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
