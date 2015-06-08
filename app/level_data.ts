// Ŭnicode please
///<reference path="app.d.ts"/>

/*
auto-generated code
*/
module kisaragi {

    var LEVEL_DATA_0 = {
        data: [

            's.........',

            '.x......x.',

            '.x......x.',

            '.x......x.',

            '.x......x.',

            '.x......x.',

            '.x....t.x.',

            '.xx.....x.',

            '.xxx....x.',

            '..........',

        ],
        "enemy": 0
    };

    var LEVEL_DATA_1 = {
        data: [

            '..........',

            '.x......x.',

            '.x.t....x.',

            '.x......x.',

            '.x......x.',

            '.x..x...x.',

            '.x....b.x.',

            '.x......x.',

            '.x......x.',

            '..........',

        ],
        "enemy": 3
    };

    var LEVEL_DATA_2 = {
        data: [

            '..........',

            '.x......x.',

            '.x.b....x.',

            '.x......x.',

            '.x......x.',

            '.x..xx..x.',

            '.x......x.',

            '.x......x.',

            '.x......x.',

            '.........g',

        ],
        "enemy": 5
    };


    export var LEVEL_DATA_LIST = {};

    LEVEL_DATA_LIST[0] = LEVEL_DATA_0;

    LEVEL_DATA_LIST[1] = LEVEL_DATA_1;

    LEVEL_DATA_LIST[2] = LEVEL_DATA_2;


}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.LEVEL_DATA_LIST = kisaragi.LEVEL_DATA_LIST;
}