// Ŭnicode please
///<reference path="app.d.ts"/>
module kisaragi {
    var LEVEL_DATA_0 = [
        '..........',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '.xx.....x.',
        '.xxx....x.',
        '..........'
    ];

    var LEVEL_DATA_1 = [
        '..........',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '.x..x...x.',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '..........'
    ];

    var LEVEL_DATA_2 = [
        '..........',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '.x..xx..x.',
        '.x......x.',
        '.x......x.',
        '.x......x.',
        '..........',
    ];

    export var LEVEL_DATA_LIST = [
        LEVEL_DATA_0,
        LEVEL_DATA_1,
        LEVEL_DATA_2,
    ];

}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.HTTP_PORT = kisaragi.HTTP_PORT;
    exports.LEVEL_DATA_LIST = kisaragi.LEVEL_DATA_LIST;
}