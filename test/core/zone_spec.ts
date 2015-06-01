// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if(typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('ZoneID', function() {
    describe('#buildId()', function() {
        it('0 = base', function() {
            assert.equal(kisaragi.ZoneID.buildId(0, 0, 0), 0);
        })
        it('z = simple value', function() {
            var floor = 123;
            assert.equal(kisaragi.ZoneID.buildId(0, 0, floor), floor);
        })
    })
    describe("#xyz()", function() {
        var x = 1;
        var y = 2;
        var z = 3;
        var zone: kisaragi.ZoneID;
        beforeEach(function() {
            zone = new kisaragi.ZoneID(kisaragi.ZoneID.buildId(x, y, z));
        })
        
        it('x', function() {
            assert.equal(zone.x, x);
        })
        it('y', function() {
            assert.equal(zone.y, y);
        })
        it('z == floor', function() {
            assert.equal(zone.z, z);
            assert.equal(zone.floor, z);
        })
    })
})