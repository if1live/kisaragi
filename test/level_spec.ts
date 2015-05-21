// Ŭnicode please
///<reference path="test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../app/kisaragi');
}

describe('Level', () => {
    var topic: kisaragi.Level = null;

    beforeEach(() => {
        var level = new kisaragi.Level();
        level.reset(2, 3);
        topic = level;
    });
    
    describe('#create()', () => {
        it('success', () => {
            assert.equal(topic.width, 2);
            assert.equal(topic.height, 3);
        });
    });

    describe('#tile()', () => {
        it('get', () => {
            assert.equal(topic.tile(1, 1), 0);
        });
    });

    describe('#setTile()', () => {
        it('set', () => {
            it('success', () => {
                assert.equal(topic.setTile(1, 1, 100), true);
            });

            it('invalid range', () => {
                assert.equal(topic.setTile(-10, 10, 1), false);
                assert.equal(topic.setTile(10, -10, 1), false);
            });
        });
    });

    describe('#filterPosition', () => {
        it('success', () => {
            assert.deepEqual(topic.filterPosition(-1, -1), [0, 0]);
            assert.deepEqual(topic.filterPosition(100, 100), [1, 2]);
            assert.deepEqual(topic.filterPosition(1, 2), [1, 2]);
        });
    });
});
