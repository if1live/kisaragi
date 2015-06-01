// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    export class Coord {
        x: number;
        y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Coord = kisaragi.Coord;
}
