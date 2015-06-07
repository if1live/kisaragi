// Ŭnicode please
///<reference path="../test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../../app/kisaragi');
}

describe('logger', () => {
    var subject = new kisaragi.Logger();

    describe('#createText()', () => {
        it('no param', () => {
            var actual = subject.createText("123");
            assert.equal(actual, "123");
        })

        it('contain params', () => {
            var actual = subject.createText("%d:%d", 1, 2);
            assert.equal(actual, "1:2");
        })
    })

    describe('#printHtmlLogger', () => {
        it('no error occur', () => {
            subject.printHtmlLogger("hello world");
        })
    })
})

