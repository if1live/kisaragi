// Ŭnicode please
///<reference path="../app.d.ts"/>

module kisaragi {
    export class ServerPing {
        handle(svrPacket: ServerReceivedPacket) {
            var packet = svrPacket.packet;
            if (packet.packetType == PacketType.Ping) {
                svrPacket.conn.send(packet);
            }
        }
    }
    
    interface IPingRenderer {
        render(count: number, curr: number, average: number, min: number, max: number);
    }

    export class HtmlPingRenderer implements IPingRenderer {
        displayId: string;

        constructor(displayId: string) {
            this.displayId = displayId;
        }

        render(count: number, curr: number, average: number, min: number, max: number) {
            var self = this;
            var root = document.getElementById(self.displayId);
            if (!root) {
                return;
            }
            var table = [
                { name: '.ping-count', val: count },
                { name: '.ping-curr', val: curr },
                { name: '.ping-average', val: average },
                { name: '.ping-min', val: min },
                { name: '.ping-max', val: max }
            ];
            _.each(table, (elem) => {
                var node = root.querySelector(elem.name);
                if (node) {
                    node.textContent = elem.val.toString();
                }
            });
        }
    }

    export class ClientPing {
        logs: number[] = [];
        duration: number = 2000;
        windowSize: number = 30;
        count: number = 0;
        conn: ClientConnection;

        renderer: IPingRenderer = null;

        constructor(conn: ClientConnection) {
            var self = this;
            self.conn = conn;

            conn.registerHandler(PacketType.Ping, function (packet: PingPacket) {
                self.count += 1;
                var now = Date.now();
                var prev = packet.timestamp;
                var diff = now - prev;
                if (self.logs.length < self.windowSize) {
                    self.logs.push(diff);
                } else {
                    self.logs.splice(0, 1);
                    self.logs.push(diff);
                }

                if (self.renderer !== null) {
                    self.renderer.render(self.count, self.last(), self.average(), self.min(), self.max());
                }

                setTimeout(function () {
                    self.ping();
                }, self.duration);
                //console.log("ping : " + diff + "ms");
            })
        }

        ping() {
            var self = this;
            var factory = new PacketFactory();
            var packet = factory.ping();
            self.conn.send(packet);
        }

        max() {
            if (this.logs.length === 0) {
                return 0;
            }
            return _.max(this.logs);
        }

        min() {
            if (this.logs.length === 0) {
                return 0;
            }
            return _.min(this.logs);
        }

        last() {
            if (this.logs.length === 0) {
                return 0;
            }
            return this.logs[this.logs.length - 1];
        }

        average() {
            if (this.logs.length === 0) {
                return 0;
            }
            var sum = _.reduce(this.logs, (memo: number, num: number) => { return memo + num; }, 0);
            var average = sum / this.logs.length;
            return Math.ceil(average);
        }
    }
}

declare var exports: any;
if(typeof exports !== 'undefined') {
    exports.HtmlPingRenderer = kisaragi.HtmlPingRenderer;
    exports.ClientPing = kisaragi.ClientPing;
    exports.ServerPing = kisaragi.ServerPing;
}
