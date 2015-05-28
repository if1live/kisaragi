// Ŭnicode please
///<reference path="../test.d.ts"/>
var assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}
describe('ClientEcho', function () {
    var conn;
    var subject;
    var factory = new kisaragi.PacketFactory();
    beforeEach(function () {
        conn = kisaragi.ClientConnection.mock();
        subject = new kisaragi.ClientEcho(conn);
    });
    describe('#echo()', function () {
        it('success', function () {
            subject.echo('data');
            assert.notEqual(conn.sendedPacket, null);
            assert.equal(conn.sendedPacket.packetType, kisaragi.PacketType.Echo);
        });
    });
    describe('#echoAll()', function () {
        it('success', function () {
            subject.echoAll('data');
            assert.notEqual(conn.sendedPacket, null);
            assert.equal(conn.sendedPacket.packetType, kisaragi.PacketType.EchoAll);
        });
    });
    describe('echo receive', function () {
        it('success', function () {
            var packet = factory.echo('echo');
            conn.handle(packet);
            assert.equal(subject.echoReceivedPacket, packet);
        });
    });
    describe('echoAll received', function () {
        it('success', function () {
            var packet = factory.echoAll('echoAll');
            conn.handle(packet);
            assert.equal(subject.echoAllReceivedPacket, packet);
        });
    });
});
