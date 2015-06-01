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
})(kisaragi || (kisaragi = {}));
if (typeof exports !== 'undefined') {
    exports.BasePacket = kisaragi.BasePacket;
}
