///<reference path="app.d.ts"/>

if (typeof module !== 'undefined') {
    //import assert = require('assert');
}

module kisaragi {
    export class Player extends Entity {
        svrSock: ServerSocket;
        cliSock: SocketIOClient.Socket;

        constructor(id: number, role: Role) {
            super(id);

            this.category = Category.Player;
            this.role = role;
        }

        static createClientEntity(id: number, sock: SocketIOClient.Socket) {
            var player = new Player(id, Role.Client);
            player.cliSock = sock;
            return player;
        }
        static createServerEntity(id: number, sock: ServerSocket) {
            var player = new Player(id, Role.Server);
            player.svrSock = sock;

            // sock - user는 서로 연결시켜놓기. sock != socket io object
            if (sock) {
                sock.user = player;
            }

            return player;
        }

        connect(world: GameWorld, data) {
            var self = this;
            world.addUser(self);

            var loginData = {
                id: this.movableId,
                category: this.category,
                x: this.x,
                y: this.y,
                width: world.level.width,
                height: world.level.height
            }
            self.svrSock.send('s2c_login', loginData);

            self.svrSock.broadcast('s2c_newObject', {
                id: this.movableId,
                category: this.category,
                x: this.x,
                y: this.y
            });
    
            // give dynamic object's info to new user
            _.each(world.allObjectList(), function (ent: Entity) {
                self.svrSock.send('s2c_newObject', {
                    id: ent.movableId,
                    category: ent.category,
                    x: ent.x,
                    y: ent.y
                });
            });
        };

        disconnect(world: GameWorld, data) {
            var self = this;
            world.removeUser(self);
            self.svrSock.broadcast('s2c_removeObject', {
                id: self.movableId
            });
        };

        c2s_requestMap(world: GameWorld, data) {
            var self = this;
            data = {
                data: world.level.data,
                width: world.level.width,
                height: world.level.height
            }
            self.svrSock.send('s2c_responseMap', data);
        };

        // move function
        moveOneTile(dx: number, dy: number) {
            var self = this;
            //assert(self.role === Role.Client);

            var isLeft = (dx === -1 && dy === 0);
            var isRight = (dx === 1 && dy === 0);
            var isUp = (dx === 0 && dy === 1);
            var isDown = (dx === 0 && dy === -1);

            // allow only one tile move
            if (!(isLeft || isRight || isUp || isDown)) {
                return false;
            }

            var x = self.x + dx;
            var y = self.y + dy;
            self.requestMoveTo(x, y);

            return true;
        };

        moveLeft() {
            this.moveOneTile(-1, 0);
        };
        moveRight() {
            this.moveOneTile(1, 0);
        };
        moveUp() {
            this.moveOneTile(0, 1);
        };
        moveDown() {
            this.moveOneTile(0, -1);
        };

        requestMoveTo(x: number, y: number) {
            var self = this;
            if (self.world && !self.world.isMovablePos(x, y)) {
                return;
            }
            self.cliSock.emit('c2s_requestMove', {
                x: x,
                y: y
            });
        };

        c2s_requestMove(world: GameWorld, data) {
            if (world.isMovablePos(data.x, data.y)) {
                this.targetPos = new Coord(data.x, data.y);
            }
        };
    }
}

if (typeof exports != 'undefined') {
    exports.Player = kisaragi.Player;
}

