// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('Coord', () => {
    describe('#gridDistance()', () => {
        it('success', () => {
            var a = new kisaragi.Coord(0, 0);
            var b = new kisaragi.Coord(1, 2);
            var dist = a.gridDistance(b);
            assert.equal(dist, 3);
        })
    })

    describe('#distance()', () => {
        it('success', () => {
            var a = new kisaragi.Coord(0, 0);
            var b = new kisaragi.Coord(3, 4);
            var dist = a.distance(b);
            assert.equal(dist, 5);
        })
    })
})

