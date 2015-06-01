// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if(typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('Zone', function() {
    describe('#buildIndex()', function() {
        it('0 = base', function() {
            var idx = kisaragi.Zone.buildIndex(0, 0, 0);
            assert.equal(idx, 0);
        })
        it('z = simple value', function() {
            var floor = 123;
            var idx = kisaragi.Zone.buildIndex(0, 0, floor);
            assert.equal(idx, floor);
        })
    })
    describe("#zoneXYZ()", function() {
        var x = 1;
        var y = 2;
        var z = 3;
        var zone: kisaragi.Zone;
        beforeEach(function() {
            var idx = kisaragi.Zone.buildIndex(x, y, z);
            zone = new kisaragi.Zone(idx);
        })
        
        it('x', function() {
            assert.equal(zone.zoneX, x);
        })
        it('y', function() {
            assert.equal(zone.zoneY, y);
        })
        it('z == floor', function() {
            assert.equal(zone.zoneZ, z);
            assert.equal(zone.floor, z);
        })
    })
})