// Ŭnicode please
///<reference path="test.d.ts"/>

import assert = require('assert');
if (typeof module !== 'undefined') {
    var kisaragi = require('../app/kisaragi');
}

describe('Zone', function () {
    var topic: kisaragi.Zone = null;
    beforeEach(function () {
        topic = new kisaragi.Zone(0);
    });
})