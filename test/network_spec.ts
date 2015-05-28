// Ŭnicode please
///<reference path="test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../app/kisaragi');
}

describe('Server', function () {
    var io: SocketIO.Server;
    var topic: kisaragi.Server;
    beforeEach(function () {
        io = kisaragi.createMockSocketIOServer();
        topic = new kisaragi.Server(io);
    });

    describe('#connectSocketIO()', function () {
        it('empty', function () {
            assert.equal(topic.sockList.length, 0);
        });
        it('success', function () {
            topic.connectSocketIO(kisaragi.createMockSocketIOClient(io));
            assert.equal(topic.sockList.length, 1);

            topic.connectSocketIO(kisaragi.createMockSocketIOClient(io));
            assert.equal(topic.sockList.length, 2);
        });
    });

    describe('#findClient()', function () {
        it('uuid - found', function () {
            var client = topic.connectSocketIO(kisaragi.createMockSocketIOClient(io));
            assert.equal(topic.find({ uuid: client.uuid }), client);
        });
        it('uuid - not found', function () {
            var client = topic.connectSocketIO(kisaragi.createMockSocketIOClient(io));
            assert.equal(topic.find({ uuid: 999 }), null);
        });
        it('socket_io - found', function () {
            var sock = kisaragi.createMockSocketIOClient(io)
            var client = topic.connectSocketIO(sock);
            assert.equal(topic.find({ socket_io: sock }), client);
        });
        it('socket_io - not found', function () {
            var client = topic.connectSocketIO(kisaragi.createMockSocketIOClient(io));
            assert.equal(topic.find({ socket_io: '????' }), null);
        });
    });

    describe('#disconnectSocketIO()', function () {
        it('remove from list', function () {
            var sock_a = kisaragi.createMockSocketIOClient(io);
            var sock_b = kisaragi.createMockSocketIOClient(io);

            var client_a = topic.connectSocketIO(sock_a);
            var client_b = topic.connectSocketIO(sock_b);

            assert.equal(topic.sockList.length, 2);

            topic.disconnectSocketIO(sock_b);
            assert.equal(topic.sockList.length, 1);
            assert.equal(topic.sockList[0], client_a);
        });
    });
});
