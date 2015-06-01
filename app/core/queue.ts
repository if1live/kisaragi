// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    export class Queue<T> {
        queue: T[];

        constructor() {
            this.queue = [];
        }

        get length(): number {
            return this.queue.length;
        }

        isEmpty(): boolean {
            return (0 === this.length);
        }

        push(elem: T): boolean {
            if (elem === null) {
                return false;
            }
            this.queue.push(elem);
            return true;
        }
        pop(): T {
            if (this.length === 0) {
                return null;
            }
            return this.queue.shift();
        }
    }
}

declare var exports: any;
if (typeof exports !== 'undefined') {
    exports.Queue = kisaragi.Queue;
}