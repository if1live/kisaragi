 // Ŭnicode please
module kisaragi {
    export class BasePacket {
        packetType: PacketType;

        constructor(packetType: PacketType) {
            this.packetType = packetType;
        }
        _generateJson(): any {
            return {};
        }
        toJson(): any {
            var data = this._generateJson();
            data.packetType = this.packetType;
            return data;
        }
        loadJson(data: any) { }

        get command(): string {
            return null;
        }
    }

    export class Queue<T> {
        queue: T[];

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
    exports.BasePacket = kisaragi.BasePacket;
    exports.Queue = kisaragi.Queue;
}

