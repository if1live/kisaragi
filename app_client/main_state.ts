// Ŭnicode please
/// <reference path="app_client.d.ts" />

module kisaragi {
    var EMPTY_MARKER_COLOR = 0x0000ff;
    var USER_MARKER_COLOR = 0x00ffff;
    var ENEMY_MARKER_COLOR = 0xff0000;
    var WALL_MARKER_COLOR = 0x000000;
    var UNKNOWN_MARKER_COLOR = 0xffff00;

    // layer order
    var GROUND_DEPTH = 1;
    var CHARACTER_DEPTH = 2;

    export class MainState extends Phaser.State {
        gameWorld: GameWorld;
        currUser: Player;
        currUserId: number;

        map: Phaser.Tilemap;
        tileLayer: Phaser.TilemapLayer;
        tileSize: number;

        marker: Phaser.Graphics;

        // dynamic elem
        characterGroup: Phaser.Group;

        // input
        cursors: Phaser.CursorKeys;

        // network
        conn: ClientConnection;
        ping: ClientPing;
        echoRunner: ClientEcho;

        // previous key down state
        prevUpPressed: boolean = false;
        prevDownPressed: boolean = false;
        prevLeftPressed: boolean = false;
        prevRightPressed: boolean = false;

        get level(): Level {
            return this.gameWorld.level;
        }

        getUserSprite(gameObject: Entity) {
            return this.getCommonSprite(gameObject, 'user');
        }

        getCurrUserSprite(gameObject: Entity) {
            return this.getCommonSprite(gameObject, 'current_user');
        }

        getEnemySprite(gameObject: Entity) {
            return this.getCommonSprite(gameObject, 'enemy');
        }

        getItemSprite(gameObject: Entity) {
            return this.getCommonSprite(gameObject, 'item');
        }
        getCommonSprite(gameObject: Entity, spriteName: string) {
            if (gameObject.sprite === undefined || gameObject.sprite === null) {
                var sprite = this.add.sprite(-100, -100, spriteName);
                this.characterGroup.add(sprite);

                sprite.anchor.set(0, 0);
                gameObject.sprite = sprite;
                gameObject.sprite.width = this.tileSize;
                gameObject.sprite.height = this.tileSize;
            }
            return gameObject.sprite;
        }

        createGameObject(packet: NewObjectPacket) {
            var gameObject: Entity = null;

            var movableId = packet.movableId;
            var pos = new Coord(packet.x, packet.y);

            if (packet.category === Category.Player) {
                gameObject = Player.createClientEntity(movableId, this.conn);
                gameObject.pos = pos;
            } else if (packet.category === Category.Enemy) {
                gameObject = new Enemy(movableId, Role.Client, pos);
                //gameObject = new Enemy();
            } else {
                //assert(!"unknown category");
            }

            this.gameWorld.attachObject(gameObject);

            var sprite = null;
            if (gameObject.category === Category.Player) {
                if (packet.movableId === this.currUserId) {
                    sprite = this.getCurrUserSprite(gameObject);
                } else {
                    sprite = this.getUserSprite(gameObject);
                }
            } else if (gameObject.category === Category.Enemy) {
                sprite = this.getEnemySprite(gameObject);
            } else if (gameObject.category === Category.Item) {
                sprite = this.getItemSprite(gameObject);
            }

            this.updateGameObjectPos(gameObject);

            return gameObject;
        }

        updateGameObjectPos(gameObject: Entity) {
            var tileX = gameObject.pos.x;
            var tileY = this.level.height - gameObject.pos.y - 1;
            var x = tileX * this.tileSize;
            var y = tileY * this.tileSize;
            var sprite = gameObject.sprite;
            sprite.position.x = x;
            sprite.position.y = y;
        }

        registerSocketHandler(conn: ClientConnection) {
            var self = this;
            conn.registerHandler(PacketType.Login, function (packet: LoginPacket) {
                console.log('Login : userId=' + packet.movableId);
                self.currUserId = packet.movableId;
                self.level.width = packet.width;
                self.level.height = packet.height;

                var factory = new PacketFactory();
                var newObjPacket = factory.newObject(packet.movableId, Category.Player, packet.x, packet.y);
                self.currUser = <Player> self.createGameObject(newObjPacket);
    
                // sometime, socket io connection end before game context created
                var requestMapPacket = factory.createRequestMap();
                conn.send(requestMapPacket);
            });

            conn.registerHandler(PacketType.ResponseMap, function(packet: ResponseMapPacket) {
                //console.log(data);
                console.log('Load Level data from server');
            
                // object synchronize by serializer/deserializer
                self.level.width = packet.width;
                self.level.height = packet.height;
                self.level.data = packet.data;

                // generate tile map from server data
                // TODO lazy level loading
                if (self.tileLayer) {
                    self.tileLayer.destroy();
                }
                self.tileLayer = self.map.create('level', self.level.width, self.level.height, self.tileSize, self.tileSize);
                self.tileLayer.z = GROUND_DEPTH;
                self.world.sort();

                var groundTile = 29;
                var wallTile = 9;
                for (var y = 0; y < self.level.width; y += 1) {
                    for (var x = 0; x < self.level.width; x += 1) {
                        if (self.level.tile(x, y) === TileCode.Obstacle) {
                            self.map.putTile(wallTile, x, y, self.tileLayer);
                        } else {
                            self.map.putTile(groundTile, x, y, self.tileLayer);
                        }
                    }
                }
            });

            conn.registerHandler(PacketType.NewObject, function (packet: NewObjectPacket) {
                console.log('New Object : id=' + packet.movableId);
                if (!self.gameWorld.findObject(packet.movableId)) {
                    // create user to world
                    self.createGameObject(packet);
                } else {
                    console.log('Object id=' + packet.movableId + ' is already created');
                }
            });

            conn.registerHandler(PacketType.RemoveObject, function (packet: RemoveObjectPacket) {
                console.log('Remove Object : id=' + packet.movableId);
                self.gameWorld.removeId(packet.movableId);
            });

            conn.registerHandler(PacketType.MoveNotify, function (packet: MoveNotifyPacket) {
                var gameObject = self.gameWorld.findObject(packet.movableId);
                gameObject.x = packet.x;
                gameObject.y = packet.y;
                self.updateGameObjectPos(gameObject);
            });
        }

        preload() {
            // dummy sprite
            this.load.image('user', '/static/assets/sprites/kisaragi.png');
            this.load.image('current_user', '/static/assets/sprites/mutsuki.png');
            this.load.image('enemy', '/static/assets/sprites/space-baddie-purple.png');
            this.load.image('item', '/static/assets/sprites/blue_ball.png');

            // dummy tilemap
            this.load.image('desert', '/static/assets/tilemaps/tiles/tmw_desert_spacing.png');
        }


        create() {
            // initialize game context
            this.gameWorld = new GameWorld(Role.Client);
            this.currUser = null;
            this.currUserId = null;

            // tilemap - static elem
            this.map = null;
            this.tileLayer = null;
            this.tileSize = 32;

            ///////////////////////////
            this.stage.backgroundColor = '#2d2d2d';

            this.map = this.add.tilemap();
            this.map.addTilesetImage('desert', undefined, this.tileSize, this.tileSize, 1, 1);

            this.characterGroup = this.add.group();
            this.characterGroup.z = CHARACTER_DEPTH;

            this.cursors = this.input.keyboard.createCursorKeys();

            // cursor + tile select
            //TODO
            this.marker = this.add.graphics(1, 1);
            this.marker.lineStyle(2, EMPTY_MARKER_COLOR, 1);
            this.marker.drawRect(0, 0, this.tileSize, this.tileSize);

            this.input.addMoveCallback(this.updateMarker, this);

            // create network after game context created
            var host = window.location.hostname;
            var url = 'http://' + host + ':' + HTTP_PORT;
            var socket = io(url);
            this.conn = ClientConnection.socketIO(socket);
            this.registerSocketHandler(this.conn);

            //TODO
            this.echoRunner = new ClientEcho(this.conn);
            this.ping = new ClientPing(this.conn);
            this.ping.renderer = new HtmlPingRenderer('ping-result');
            this.ping.ping();
        }

        updateMarker() {
            if (!this.tileLayer) {
                return;
            }
            if (!this.marker) {
                return;
            }

            // move tile marker to mouse position
            var rawTileX = this.tileLayer.getTileX(this.input.activePointer.worldX);
            var rawTileY = this.tileLayer.getTileY(this.input.activePointer.worldY);

            if (rawTileX >= this.level.width) {
                rawTileX = this.level.width - 1;
            }
            if (rawTileY >= this.level.height) {
                rawTileY = this.level.height - 1;
            }

            this.marker.x = rawTileX * this.tileSize;
            this.marker.y = rawTileY * this.tileSize;

            var tileCoord = this.markerToTileCoord(this.marker);
            var tileObj = this.gameWorld.getObject(tileCoord.x, tileCoord.y);
            var color = EMPTY_MARKER_COLOR;
            if (tileObj) {
                if (tileObj.category === Category.Player) {
                    color = USER_MARKER_COLOR;
                } else if (tileObj.category === Category.Enemy) {
                    color = ENEMY_MARKER_COLOR;
                } else {
                    color = UNKNOWN_MARKER_COLOR;
                }
            } else {
                if (this.level.tile(tileCoord.x, tileCoord.y) === TileCode.Obstacle) {
                    color = WALL_MARKER_COLOR;
                }
            }
            this.marker.clear();
            this.marker.lineStyle(2, color, 1);
            this.marker.drawRect(0, 0, this.tileSize, this.tileSize);

            // TODO why double clicked?
            if (this.input.mousePointer.isDown) {
                // TODO implement move to
                console.log("selected tile coord : " + tileCoord.x + "," + tileCoord.y);
                this.currUser.requestMoveTo(tileCoord.x, tileCoord.y);
            }
        }

        markerToTileCoord(marker) {
            if (marker == null) {
                return;
            }
            var tileX = marker.x / this.tileSize;
            var tileY = this.level.height - marker.y / this.tileSize - 1;
            return { x: tileX, y: tileY };
        }

        update() {
            if (this.cursors.up.isDown) {
                if (this.prevUpPressed === false) {
                    this.currUser.moveUp();
                }
                this.prevUpPressed = true;
            } else {
                this.prevUpPressed = false;
            }

            if (this.cursors.down.isDown) {
                if (this.prevDownPressed === false) {
                    this.currUser.moveDown();
                }
                this.prevDownPressed = true;
            } else {
                this.prevDownPressed = false;

            }

            if (this.cursors.right.isDown) {
                if (this.prevRightPressed === false) {
                    this.currUser.moveRight();
                }
                this.prevRightPressed = true;
            } else {
                this.prevRightPressed = false;
            }

            if (this.cursors.left.isDown) {
                if (this.prevLeftPressed === false) {
                    this.currUser.moveLeft();
                }
                this.prevLeftPressed = true;
            } else {
                this.prevLeftPressed = false;
            }
        }

        render() {
            this.game.debug.inputInfo(32, 32);

            var tileCoord = this.markerToTileCoord(this.marker);
            if (tileCoord) {
                this.game.debug.text('Tile Coord : ' + tileCoord.x + ',' + tileCoord.y, 16, 550);
            }
        }
    }
}
