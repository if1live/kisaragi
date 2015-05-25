///<reference path="../app.d.ts"/>
/*
Auto generated code
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var kisaragi;
(function (kisaragi) {
    var PingPacket = (function (_super) {
        __extends(PingPacket, _super);
        function PingPacket() {
            _super.call(this, kisaragi.PacketType.Ping);
            this.timestamp = 0;
        }
        Object.defineProperty(PingPacket.prototype, "command", {
            get: function () {
                return 'ping';
            },
            enumerable: true,
            configurable: true
        });
        PingPacket.prototype._generateJson = function () {
            return {
                timestamp: this.timestamp,
            };
        };
        PingPacket.prototype.loadJson = function (data) {
            this.timestamp = data.timestamp;
        };
        return PingPacket;
    })(kisaragi.BasePacket);
    kisaragi.PingPacket = PingPacket;
    var EchoPacket = (function (_super) {
        __extends(EchoPacket, _super);
        function EchoPacket() {
            _super.call(this, kisaragi.PacketType.Echo);
            this.data = null;
        }
        Object.defineProperty(EchoPacket.prototype, "command", {
            get: function () {
                return 'echo';
            },
            enumerable: true,
            configurable: true
        });
        EchoPacket.prototype._generateJson = function () {
            return {
                data: this.data,
            };
        };
        EchoPacket.prototype.loadJson = function (data) {
            this.data = data.data;
        };
        return EchoPacket;
    })(kisaragi.BasePacket);
    kisaragi.EchoPacket = EchoPacket;
    var EchoAllPacket = (function (_super) {
        __extends(EchoAllPacket, _super);
        function EchoAllPacket() {
            _super.call(this, kisaragi.PacketType.EchoAll);
            this.data = null;
        }
        Object.defineProperty(EchoAllPacket.prototype, "command", {
            get: function () {
                return 'echoAll';
            },
            enumerable: true,
            configurable: true
        });
        EchoAllPacket.prototype._generateJson = function () {
            return {
                data: this.data,
            };
        };
        EchoAllPacket.prototype.loadJson = function (data) {
            this.data = data.data;
        };
        return EchoAllPacket;
    })(kisaragi.BasePacket);
    kisaragi.EchoAllPacket = EchoAllPacket;
    var ConnectPacket = (function (_super) {
        __extends(ConnectPacket, _super);
        function ConnectPacket() {
            _super.call(this, kisaragi.PacketType.Connect);
        }
        Object.defineProperty(ConnectPacket.prototype, "command", {
            get: function () {
                return 'connect';
            },
            enumerable: true,
            configurable: true
        });
        ConnectPacket.prototype._generateJson = function () {
            return {};
        };
        ConnectPacket.prototype.loadJson = function (data) {
        };
        return ConnectPacket;
    })(kisaragi.BasePacket);
    kisaragi.ConnectPacket = ConnectPacket;
    var DisconnectPacket = (function (_super) {
        __extends(DisconnectPacket, _super);
        function DisconnectPacket() {
            _super.call(this, kisaragi.PacketType.Disconnect);
        }
        Object.defineProperty(DisconnectPacket.prototype, "command", {
            get: function () {
                return 'disconnect';
            },
            enumerable: true,
            configurable: true
        });
        DisconnectPacket.prototype._generateJson = function () {
            return {};
        };
        DisconnectPacket.prototype.loadJson = function (data) {
        };
        return DisconnectPacket;
    })(kisaragi.BasePacket);
    kisaragi.DisconnectPacket = DisconnectPacket;
    var RequestMovePacket = (function (_super) {
        __extends(RequestMovePacket, _super);
        function RequestMovePacket() {
            _super.call(this, kisaragi.PacketType.RequestMove);
            this.movableId = 0;
            this.x = 0;
            this.y = 0;
        }
        Object.defineProperty(RequestMovePacket.prototype, "command", {
            get: function () {
                return 'c2s_requestMove';
            },
            enumerable: true,
            configurable: true
        });
        RequestMovePacket.prototype._generateJson = function () {
            return {
                movableId: this.movableId,
                x: this.x,
                y: this.y,
            };
        };
        RequestMovePacket.prototype.loadJson = function (data) {
            this.movableId = data.movableId;
            this.x = data.x;
            this.y = data.y;
        };
        return RequestMovePacket;
    })(kisaragi.BasePacket);
    kisaragi.RequestMovePacket = RequestMovePacket;
    var MoveNotifyPacket = (function (_super) {
        __extends(MoveNotifyPacket, _super);
        function MoveNotifyPacket() {
            _super.call(this, kisaragi.PacketType.MoveNotify);
            this.movableId = 0;
            this.x = 0;
            this.y = 0;
        }
        Object.defineProperty(MoveNotifyPacket.prototype, "command", {
            get: function () {
                return 's2c_moveNotify';
            },
            enumerable: true,
            configurable: true
        });
        MoveNotifyPacket.prototype._generateJson = function () {
            return {
                movableId: this.movableId,
                x: this.x,
                y: this.y,
            };
        };
        MoveNotifyPacket.prototype.loadJson = function (data) {
            this.movableId = data.movableId;
            this.x = data.x;
            this.y = data.y;
        };
        return MoveNotifyPacket;
    })(kisaragi.BasePacket);
    kisaragi.MoveNotifyPacket = MoveNotifyPacket;
    var NewObjectPacket = (function (_super) {
        __extends(NewObjectPacket, _super);
        function NewObjectPacket() {
            _super.call(this, kisaragi.PacketType.NewObject);
            this.movableId = 0;
            this.category = null;
            this.x = 0;
            this.y = 0;
        }
        Object.defineProperty(NewObjectPacket.prototype, "command", {
            get: function () {
                return 's2c_newObject';
            },
            enumerable: true,
            configurable: true
        });
        NewObjectPacket.prototype._generateJson = function () {
            return {
                movableId: this.movableId,
                category: this.category,
                x: this.x,
                y: this.y,
            };
        };
        NewObjectPacket.prototype.loadJson = function (data) {
            this.movableId = data.movableId;
            this.category = data.category;
            this.x = data.x;
            this.y = data.y;
        };
        return NewObjectPacket;
    })(kisaragi.BasePacket);
    kisaragi.NewObjectPacket = NewObjectPacket;
    var RemoveObjectPacket = (function (_super) {
        __extends(RemoveObjectPacket, _super);
        function RemoveObjectPacket() {
            _super.call(this, kisaragi.PacketType.RemoveObject);
            this.movableId = 0;
        }
        Object.defineProperty(RemoveObjectPacket.prototype, "command", {
            get: function () {
                return 's2c_removeObject';
            },
            enumerable: true,
            configurable: true
        });
        RemoveObjectPacket.prototype._generateJson = function () {
            return {
                movableId: this.movableId,
            };
        };
        RemoveObjectPacket.prototype.loadJson = function (data) {
            this.movableId = data.movableId;
        };
        return RemoveObjectPacket;
    })(kisaragi.BasePacket);
    kisaragi.RemoveObjectPacket = RemoveObjectPacket;
    var LoginPacket = (function (_super) {
        __extends(LoginPacket, _super);
        function LoginPacket() {
            _super.call(this, kisaragi.PacketType.Login);
            this.movableId = 0;
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        }
        Object.defineProperty(LoginPacket.prototype, "command", {
            get: function () {
                return 's2c_login';
            },
            enumerable: true,
            configurable: true
        });
        LoginPacket.prototype._generateJson = function () {
            return {
                movableId: this.movableId,
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
            };
        };
        LoginPacket.prototype.loadJson = function (data) {
            this.movableId = data.movableId;
            this.x = data.x;
            this.y = data.y;
            this.width = data.width;
            this.height = data.height;
        };
        return LoginPacket;
    })(kisaragi.BasePacket);
    kisaragi.LoginPacket = LoginPacket;
    var RequestMapPacket = (function (_super) {
        __extends(RequestMapPacket, _super);
        function RequestMapPacket() {
            _super.call(this, kisaragi.PacketType.RequestMap);
        }
        Object.defineProperty(RequestMapPacket.prototype, "command", {
            get: function () {
                return 'c2s_requestMap';
            },
            enumerable: true,
            configurable: true
        });
        RequestMapPacket.prototype._generateJson = function () {
            return {};
        };
        RequestMapPacket.prototype.loadJson = function (data) {
        };
        return RequestMapPacket;
    })(kisaragi.BasePacket);
    kisaragi.RequestMapPacket = RequestMapPacket;
    var ResponseMapPacket = (function (_super) {
        __extends(ResponseMapPacket, _super);
        function ResponseMapPacket() {
            _super.call(this, kisaragi.PacketType.ResponseMap);
            this.data = null;
            this.width = 0;
            this.height = 0;
        }
        Object.defineProperty(ResponseMapPacket.prototype, "command", {
            get: function () {
                return 's2c_requestMap';
            },
            enumerable: true,
            configurable: true
        });
        ResponseMapPacket.prototype._generateJson = function () {
            return {
                data: this.data,
                width: this.width,
                height: this.height,
            };
        };
        ResponseMapPacket.prototype.loadJson = function (data) {
            this.data = data.data;
            this.width = data.width;
            this.height = data.height;
        };
        return ResponseMapPacket;
    })(kisaragi.BasePacket);
    kisaragi.ResponseMapPacket = ResponseMapPacket;
})(kisaragi || (kisaragi = {}));
if (typeof exports !== 'undefined') {
    exports.PingPacket = kisaragi.PingPacket;
    exports.EchoPacket = kisaragi.EchoPacket;
    exports.EchoAllPacket = kisaragi.EchoAllPacket;
    exports.ConnectPacket = kisaragi.ConnectPacket;
    exports.DisconnectPacket = kisaragi.DisconnectPacket;
    exports.RequestMovePacket = kisaragi.RequestMovePacket;
    exports.MoveNotifyPacket = kisaragi.MoveNotifyPacket;
    exports.NewObjectPacket = kisaragi.NewObjectPacket;
    exports.RemoveObjectPacket = kisaragi.RemoveObjectPacket;
    exports.LoginPacket = kisaragi.LoginPacket;
    exports.RequestMapPacket = kisaragi.RequestMapPacket;
    exports.ResponseMapPacket = kisaragi.ResponseMapPacket;
}
