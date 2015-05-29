// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('ConnectionManager', function () {
    var factory = new kisaragi.PacketFactory();
    var subject: kisaragi.ConnectionManager;
    var io: SocketIO.Server;

    beforeEach(function () {
        io = kisaragi.createMockSocketIOServer();
        subject = new kisaragi.ConnectionManager();
    })

    describe('#create_xxx', function () {
        it('empty', function () {
            assert.equal(subject.connList.length, 0);
        });
        it('success', function () {
            subject.create_socketIO(kisaragi.createMockSocketIOClient(io));
            assert.equal(subject.connList.length, 1);

            subject.create_socketIO(kisaragi.createMockSocketIOClient(io));
            assert.equal(subject.connList.length, 2);
        });
    })

    describe('#find()', function () {
        it('uuid - found', function () {
            var sock = kisaragi.createMockSocketIOClient(io)
            var client = subject.create_socketIO(sock);
            
            assert.equal(subject.find({ uuid: client.uuid }), client);
        });
        it('uuid - not found', function () {
            var sock = kisaragi.createMockSocketIOClient(io)
            var client = subject.create_socketIO(sock);
            
            assert.equal(subject.find({ uuid: 999 }), null);
        });
        it('socket_io - found', function () {
            var sock = kisaragi.createMockSocketIOClient(io)
            var client = subject.create_socketIO(sock);
            assert.equal(subject.find({ socket_io: sock }), client);
        });
        it('socket_io - not found', function () {
            var sock_1 = kisaragi.createMockSocketIOClient(io)
            var client_1 = subject.create_socketIO(sock_1);

            var sock_2 = kisaragi.createMockSocketIOClient(io)
            assert.equal(subject.find({ socket_io: sock_2 }), null);
        });
    })

    describe('#destroy()', function () {
        it('remove from list', function () {
            var sock_a = kisaragi.createMockSocketIOClient(io);
            var sock_b = kisaragi.createMockSocketIOClient(io);

            var client_a = subject.create_socketIO(sock_a);
            var client_b = subject.create_socketIO(sock_b);

            assert.equal(subject.connList.length, 2);

            subject.destroy(client_b);
            assert.equal(subject.connList.length, 1);
            assert.equal(subject.connList[0], client_a);
        });
    });
})