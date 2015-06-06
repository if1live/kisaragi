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

        get encoded(): number {
            var val = this.x;
            val += (this.y << 16)
            return val
        }

        distance(o: Coord): number {
            var dx = (this.x - o.x);
            var dy = (this.y - o.y);
            var dirVec = new Coord(dx, dy);
            return dirVec.length;
        }
        gridDistance(o: Coord): number {
            var dx = (this.x - o.x);
            var dy = (this.y - o.y);
            var dist = Math.abs(dx) + Math.abs(dy);
            return dist;
        }

        get length(): number {
            var val = (this.x * this.x) + (this.y * this.y);
            return Math.sqrt(val);
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Coord = kisaragi.Coord;
}
