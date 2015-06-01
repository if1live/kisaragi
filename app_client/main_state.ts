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

        marker: Phaser.Graphics;

        entityFactory: ClientEntityFactory;

        // dynamic elem
        characterGroup: Phaser.Group;

        // input
        cursors: Phaser.CursorKeys;
        // for dev
        zone0Key: Phaser.Key;
        zone1Key: Phaser.Key;
        zone2Key: Phaser.Key;

        // network
        conn: ClientConnection;
        ping: ClientPing;
        echoRunner: ClientEcho;

        registerSocketHandler(conn: ClientConnection) {
            var self = this;
            var factory = new PacketFactory();

            conn.registerHandler(PacketType.Login, function (packet: LoginPacket) {
                console.log('Login : userId=' + packet.movableId);
                self.currUserId = packet.movableId;

                var zone = self.gameWorld.zone(packet.zoneId);
                zone.level.width = packet.width;
                zone.level.height = packet.height;

                var player = self.entityFactory.createLoginPlayer(packet, self.characterGroup, conn);
                self.gameWorld.add(player);
                player.updateSpritePosition();

                self.currUser = player;
    
                // sometime, socket io connection end before game context created
                var requestMapPacket = factory.requestMap(packet.zoneId);
                conn.send(requestMapPacket);
            });

            conn.registerHandler(PacketType.ResponseMap, function(packet: ResponseMapPacket) {
                //console.log(data);
                console.log('Load Level data from server : zoneId=' + packet.zoneId);
            
                // object synchronize by serializer/deserializer
                var zone = self.gameWorld.zone(packet.zoneId);
                zone.level.width = packet.width;
                zone.level.height = packet.height;
                zone.level.data = packet.data;

                // generate tile map from server data
                // TODO lazy level loading
                if (self.tileLayer) {
                    self.tileLayer.destroy();
                }
                self.tileLayer = self.map.create('level', zone.level.width, zone.level.height, TILE_SIZE, TILE_SIZE);
                self.tileLayer.z = GROUND_DEPTH;
                self.world.sort();

                var groundTile = 29;
                var wallTile = 9;
                for (var y = 0; y < zone.level.width; y += 1) {
                    for (var x = 0; x < zone.level.width; x += 1) {
                        if (zone.level.tile(x, y) === TileCode.Obstacle) {
                            self.map.putTile(wallTile, x, y, self.tileLayer);
                        } else {
                            self.map.putTile(groundTile, x, y, self.tileLayer);
                        }
                    }
                }
            });

            conn.registerHandler(PacketType.NewObject, function (packet: NewObjectPacket) {
                console.log('New Object : id=' + packet.movableId);
                if(packet.zoneId != self.currUser.zoneId) {
                    return;
                }
                
                if (!self.gameWorld.findObject(packet.movableId)) {
                    // create user to world
                    var ent = self.entityFactory.create(packet, self.characterGroup);
                    self.gameWorld.add(ent);
                    ent.updateSpritePosition();

                } else {
                    console.log('Object id=' + packet.movableId + ' is already created');
                }
            });

            conn.registerHandler(PacketType.RemoveObject, function (packet: RemoveObjectPacket) {
                console.log('Remove Object : id=' + packet.movableId);
                self.gameWorld.removeId(packet.movableId);
            });

            conn.registerHandler(PacketType.MoveNotify, function (packet: MoveNotifyPacket) {
                var ent = self.gameWorld.findObject(packet.movableId);
                if(ent == null) { return; }
                if(ent.zoneId != self.currUser.zoneId) { return; }
                
                ent.x = packet.x;
                ent.y = packet.y;
                ent.updateSpritePosition();
            });
        }

        preload() {
            // dummy sprite
            this.entityFactory = new ClientEntityFactory(this);
            this.entityFactory.preload();

            // dummy tilemap
            this.load.image('desert', ASSET_PATH + 'tilemaps/tiles/tmw_desert_spacing.png');
        }


        create() {

            // initialize game context
            this.gameWorld = new GameWorld(Role.Client);
            this.currUser = null;
            this.currUserId = null;

            // tilemap - static elem
            this.map = null;
            this.tileLayer = null;

            ///////////////////////////
            this.stage.backgroundColor = '#2d2d2d';

            this.map = this.add.tilemap();
            this.map.addTilesetImage('desert', undefined, TILE_SIZE, TILE_SIZE, 1, 1);

            this.characterGroup = this.add.group();
            this.characterGroup.z = CHARACTER_DEPTH;

            // input
            this.cursors = this.input.keyboard.createCursorKeys();
            
            this.zone0Key = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
            this.zone1Key = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO);
            this.zone2Key = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE);

            // cursor + tile select
            //TODO
            this.marker = this.add.graphics(1, 1);
            this.marker.lineStyle(2, EMPTY_MARKER_COLOR, 1);
            this.marker.drawRect(0, 0, TILE_SIZE, TILE_SIZE);

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

            var zone = this.currUser.zone;
            var level = zone.level;

            if (rawTileX >= level.width) {
                rawTileX = level.width - 1;
            }
            if (rawTileY >= level.height) {
                rawTileY = level.height - 1;
            }

            this.marker.x = rawTileX * TILE_SIZE;
            this.marker.y = rawTileY * TILE_SIZE;

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
                var level = this.currUser.zone.level;
                if (level.tile(tileCoord.x, tileCoord.y) === TileCode.Obstacle) {
                    color = WALL_MARKER_COLOR;
                }
            }
            this.marker.clear();
            this.marker.lineStyle(2, color, 1);
            this.marker.drawRect(0, 0, TILE_SIZE, TILE_SIZE);

            // TODO why double clicked?
            if (this.input.mousePointer.isDown) {
                // TODO implement move to
                console.log("selected tile coord : " + tileCoord.x + "," + tileCoord.y);
                this.currUser.requestMoveTo(tileCoord.x, tileCoord.y);
            }
        }

        markerToTileCoord(marker) {
            if (!marker || !this.currUser) {
                return;
            }
            var level = this.currUser.zone.level;
            var tileX = marker.x / TILE_SIZE;
            var tileY = level.height - marker.y / TILE_SIZE - 1;
            return { x: tileX, y: tileY };
        }

        update() {
            // 이동처리는 동시에 눌리는거를 고려하지 않는다
            // 어차피 4-way 니까 하나씩만 처리하면된다
            if (this.cursors.up.justDown) {
                this.currUser.moveUp();
            } else if (this.cursors.down.justDown) {
                this.currUser.moveDown();
            } else if (this.cursors.left.justDown) {
                this.currUser.moveLeft();
            } else if (this.cursors.right.justDown) {
                this.currUser.moveRight();
            }
            
            if(this.zone0Key.justDown) {
                this.currUser.requestJumpZone(0)
            }
            if(this.zone1Key.justDown) {
                this.currUser.requestJumpZone(1);
            }
            if(this.zone2Key.justDown) {
                this.currUser.requestJumpZone(2);
            }
        }

        render() {
            this.game.debug.inputInfo(32, 32);

            var tileCoord = this.markerToTileCoord(this.marker);
            if (tileCoord) {
                this.game.debug.text('Tile Coord : ' + tileCoord.x + ',' + tileCoord.y, 16, 550);
            }
            
            if(this.currUser) {
                this.game.debug.text('zoneId : ' + this.currUser.zone.id, 16, 530);
            }
        }
    }
}
