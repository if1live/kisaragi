// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if(typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('Enemy', () => {
    describe('#findTargetPlayer - player not exist', () => {
        var zone: kisaragi.Zone;
        beforeEach(() => {
            zone = new kisaragi.Zone(0);
        })

        it('player not exist', () => {
            var pos = new kisaragi.Coord(0, 0);
            var enemy = new kisaragi.Enemy(1, kisaragi.Role.Server, pos);
            zone.attach(enemy);

            assert.equal(enemy.findTargetPlayer(), null);
        })
    })
    describe('#findTargetPlayer - player exist', () => {
        var zone: kisaragi.Zone;
        var player_zero: kisaragi.Entity;
        var player_far: kisaragi.Entity;

        beforeEach(() => {
            zone = new kisaragi.Zone(0);
            player_zero = new kisaragi.Player(1, kisaragi.Role.Server);
            player_zero.pos = new kisaragi.Coord(0, 0);
            zone.attach(player_zero);

            player_far= new kisaragi.Player(2, kisaragi.Role.Server);
            player_far.pos = new kisaragi.Coord(10, 0);
            zone.attach(player_far);
        })

        it('close player not exist', () => {
            var pos = new kisaragi.Coord(-10, 0);
            var enemy = new kisaragi.Enemy(3, kisaragi.Role.Server, pos);
            zone.attach(enemy);

            assert.equal(enemy.findTargetPlayer(), null);
        })

        it('found - 1', () => {
            var pos = new kisaragi.Coord(-1, 0);
            var enemy = new kisaragi.Enemy(3, kisaragi.Role.Server, pos);
            zone.attach(enemy);

            assert.equal(enemy.findTargetPlayer(), player_zero);
        })

        it('found - 2', () => {
            var pos = new kisaragi.Coord(11, 0);
            var enemy = new kisaragi.Enemy(3, kisaragi.Role.Server, pos);
            zone.attach(enemy);

            assert.equal(enemy.findTargetPlayer(), player_far);
        })
    })
})
