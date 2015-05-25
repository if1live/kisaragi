// Ŭnicode please
var kisaragi;
(function (kisaragi) {
    var BasePacket = (function () {
        function BasePacket(packetType) {
            this.packetType = packetType;
        }
        BasePacket.prototype._generateJson = function () {
            return {};
        };
        BasePacket.prototype.toJson = function () {
            var data = this._generateJson();
            data.packetType = this.packetType;
            return data;
        };
        BasePacket.prototype.loadJson = function (data) { };
        Object.defineProperty(BasePacket.prototype, "command", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        return BasePacket;
    })();
    kisaragi.BasePacket = BasePacket;
    var Queue = (function () {
        function Queue() {
        }
        Object.defineProperty(Queue.prototype, "length", {
            get: function () {
                return this.queue.length;
            },
            enumerable: true,
            configurable: true
        });
        Queue.prototype.isEmpty = function () {
            return (0 === this.length);
        };
        Queue.prototype.push = function (elem) {
            if (elem === null) {
                return false;
            }
            this.queue.push(elem);
            return true;
        };
        Queue.prototype.pop = function () {
            if (this.length === 0) {
                return null;
            }
            return this.queue.shift();
        };
        return Queue;
    })();
    kisaragi.Queue = Queue;
})(kisaragi || (kisaragi = {}));
if (typeof exports !== 'undefined') {
    exports.BasePacket = kisaragi.BasePacket;
    exports.Queue = kisaragi.Queue;
}
