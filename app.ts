// Ŭnicode please
/// <reference path="app/app.d.ts" />

// initialize game context
var world = new kisaragi.GameWorld(kisaragi.Role.Client);
var level = world.level;
var currUser = null;
var currUserId = null;

// tilemap - static elem
var map;
var tileLayer;
var tileSize = 32;

// marker
var marker = null;
var EMPTY_MARKER_COLOR = 0x0000ff;
var USER_MARKER_COLOR = 0x00ffff;
var ENEMY_MARKER_COLOR = 0xff0000;
var WALL_MARKER_COLOR = 0x000000;
var UNKNOWN_MARKER_COLOR = 0xffff00;

// dynamic elem
var characterGroup = null;

// layer order
var GROUND_DEPTH = 1;
var CHARACTER_DEPTH = 2;

// input
var cursors;

// network
var socket = null;
var ping = null;
var echoRunner = null;

function getUserSprite(gameObject: kisaragi.Entity) {
    return getCommonSprite(gameObject, 'user');
}

function getCurrUserSprite(gameObject: kisaragi.Entity) {
    return getCommonSprite(gameObject, 'current_user');
}

function getEnemySprite(gameObject: kisaragi.Entity) {
    return getCommonSprite(gameObject, 'enemy');
}

function getItemSprite(gameObject: kisaragi.Entity) {
    return getCommonSprite(gameObject, 'item');
}

function getCommonSprite(gameObject: kisaragi.Entity, spriteName: string) {
    if (gameObject.sprite === undefined || gameObject.sprite === null) {
        var sprite = game.add.sprite(-100, -100, spriteName);
        characterGroup.add(sprite);

        sprite.anchor.set(0, 0);
        gameObject.sprite = sprite;
        gameObject.sprite.width = tileSize;
        gameObject.sprite.height = tileSize;
    }
    return gameObject.sprite;
}

function createGameObject(packet: kisaragi.NewObjectPacket) {
    var gameObject: kisaragi.Entity = null;

    var movableId = packet.movableId;
    var pos = new kisaragi.Coord(packet.x, packet.y);

    if (packet.category === kisaragi.Category.Player) {
        gameObject = kisaragi.Player.createClientEntity(movableId, socket);
        gameObject.pos = pos;
    } else if (packet.category === kisaragi.Category.Enemy) {
        gameObject = new kisaragi.Enemy(movableId, kisaragi.Role.Client, pos);
        //gameObject = new Enemy();
    } else {
        //assert(!"unknown category");
    }
        
    world.attachObject(gameObject);

    var sprite = null;
    if (gameObject.category === kisaragi.Category.Player) {
        if (packet.movableId === currUserId) {
            sprite = getCurrUserSprite(gameObject);
        } else {
            sprite = getUserSprite(gameObject);
        }
    } else if (gameObject.category === kisaragi.Category.Enemy) {
        sprite = getEnemySprite(gameObject);
    } else if (gameObject.category === kisaragi.Category.Item) {
        sprite = getItemSprite(gameObject);
    }

    updateGameObjectPos(gameObject);

    return gameObject;
}

function updateGameObjectPos(gameObject: kisaragi.Entity) {
    var tileX = gameObject.pos.x;
    var tileY = level.height - gameObject.pos.y - 1;
    var x = tileX * tileSize;
    var y = tileY * tileSize;
    var sprite = gameObject.sprite;
    sprite.position.x = x;
    sprite.position.y = y;
}

function registerSocketHandler(socket) {
    socket.on(kisaragi.PacketFactory.toCommand(kisaragi.PacketType.Login), function (data) {
        var packet = <kisaragi.LoginPacket> kisaragi.PacketFactory.createFromJson(data);
        
        console.log('Login : userId=' + packet.movableId);
        currUserId = packet.movableId;
        level.width = packet.width;
        level.height = packet.height;

        var newObjPacket = kisaragi.PacketFactory.newObject(packet.movableId, kisaragi.Category.Player, packet.x, packet.y);
        currUser = createGameObject(newObjPacket);
    
        // sometime, socket io connection end before game context created
        var requestMapPacket = kisaragi.PacketFactory.requestMap();
        socket.emit(requestMapPacket.command, requestMapPacket.toJson());
    });


    socket.on(kisaragi.PacketFactory.toCommand(kisaragi.PacketType.ResponseMap), function (data) {
        var packet = <kisaragi.ResponseMapPacket> kisaragi.PacketFactory.createFromJson(data);
        //console.log(data);
        console.log('Load Level data from server');
            
        // object synchronize by serializer/deserializer
        level.width = packet.width;
        level.height = packet.height;
        level.data = packet.data;

        // generate tile map from server data
        // TODO lazy level loading
        if (tileLayer) {
            tileLayer.destroy();
        }
        tileLayer = map.create('level', level.width, level.height, tileSize, tileSize);
        tileLayer.z = GROUND_DEPTH;
        game.world.sort();

        var groundTile = 29;
        var wallTile = 9;
        for (var y = 0; y < level.width; y += 1) {
            for (var x = 0; x < level.width; x += 1) {
                if (level.tile(x, y) === kisaragi.TileCode.Obstacle) {
                    map.putTile(wallTile, x, y, tileLayer);
                } else {
                    map.putTile(groundTile, x, y, tileLayer);
                }
            }
        }
    });

    socket.on(kisaragi.PacketFactory.toCommand(kisaragi.PacketType.NewObject), function (data) {
        var packet = <kisaragi.NewObjectPacket> kisaragi.PacketFactory.createFromJson(data);
        console.log('New Object : id=' + packet.movableId);
        if (!world.findObject(packet.movableId)) {
            // create user to world
            createGameObject(packet);
        } else {
            console.log('Object id=' + packet.movableId + 'is already created');
        }
    });

    socket.on(kisaragi.PacketFactory.toCommand(kisaragi.PacketType.RemoveObject), function (data) {
        var packet = <kisaragi.RemoveObjectPacket> kisaragi.PacketFactory.createFromJson(data);
        console.log('Remove Object : id=' + packet.movableId);
        world.removeId(packet.movableId);
    });

    socket.on(kisaragi.PacketFactory.toCommand(kisaragi.PacketType.MoveNotify), function (data) {
        var packet = <kisaragi.MoveNotifyPacket> kisaragi.PacketFactory.createFromJson(data);
        var gameObject = world.findObject(packet.movableId);
        gameObject.x = packet.x;
        gameObject.y = packet.y;
        updateGameObjectPos(gameObject);
    });
}

// phaser
var width = 800;
var height = 600;
var game: Phaser.Game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser-example', {
    preload: preload, create: create, update: update, render: render
});

function preload() {
    // dummy sprite
    game.load.image('user', 'static/assets/sprites/kisaragi.png');
    game.load.image('current_user', 'static/assets/sprites/mutsuki.png');
    game.load.image('enemy', 'static/assets/sprites/space-baddie-purple.png');
    game.load.image('item', 'static/assets/sprites/blue_ball.png');

    // dummy tilemap
    game.load.image('desert', 'static/assets/tilemaps/tiles/tmw_desert_spacing.png');
}


function create() {
    game.stage.backgroundColor = '#2d2d2d';

    map = game.add.tilemap();
    map.addTilesetImage('desert', undefined, tileSize, tileSize, 1, 1);

    characterGroup = game.add.group();
    characterGroup.z = CHARACTER_DEPTH;

    cursors = game.input.keyboard.createCursorKeys();

    // cursor + tile select
    //TODO
    marker = game.add.graphics(1, 1);
    marker.lineStyle(2, EMPTY_MARKER_COLOR, 1);
    marker.drawRect(0, 0, tileSize, tileSize);

    game.input.addMoveCallback(updateMarker, this);

    // create network after game context created
    var host = window.location.hostname;
    var url = 'http://' + host + ':' + kisaragi.HTTP_PORT;
    socket = io(url);
    registerSocketHandler(socket);

    echoRunner = new kisaragi.ClientEcho(socket, {});
    ping = new kisaragi.ClientPing(socket);
    //TODO
    //ping.renderer = new network.HtmlPingRenderer('ping-result');
    ping.ping();
}

function updateMarker() {
    if (!tileLayer) {
        return;
    }
    if (!marker) {
        return;
    }

    // move tile marker to mouse position
    var rawTileX = tileLayer.getTileX(game.input.activePointer.worldX);
    var rawTileY = tileLayer.getTileY(game.input.activePointer.worldY);

    if (rawTileX >= level.width) {
        rawTileX = level.width - 1;
    }
    if (rawTileY >= level.height) {
        rawTileY = level.height - 1;
    }

    marker.x = rawTileX * tileSize;
    marker.y = rawTileY * tileSize;

    var tileCoord = markerToTileCoord(marker);
    var tileObj = world.getObject(tileCoord.x, tileCoord.y);
    var color = EMPTY_MARKER_COLOR;
    if (tileObj) {
        if (tileObj.category === kisaragi.Category.Player) {
            color = USER_MARKER_COLOR;
        } else if (tileObj.category === kisaragi.Category.Enemy) {
            color = ENEMY_MARKER_COLOR;
        } else {
            color = UNKNOWN_MARKER_COLOR;
        }
    } else {
        if (level.tile(tileCoord.x, tileCoord.y) === kisaragi.TileCode.Obstacle) {
            color = WALL_MARKER_COLOR;
        }
    }
    marker.clear();
    marker.lineStyle(2, color, 1);
    marker.drawRect(0, 0, tileSize, tileSize);

    // TODO why double clicked?
    if (game.input.mousePointer.isDown) {
        // TODO implement move to
        console.log("selected tile coord : " + tileCoord.x + "," + tileCoord.y);
        currUser.requestMoveTo(tileCoord.x, tileCoord.y);
    }
}

function markerToTileCoord(marker) {
    if (marker == null) {
        return;
    }
    var tileX = marker.x / tileSize;
    var tileY = level.height - marker.y / tileSize - 1;
    return { x: tileX, y: tileY };
}


// previous key down state
var prevUpPressed = false;
var prevDownPressed = false;
var prevLeftPressed = false;
var prevRightPressed = false;

function update() {
    if (cursors.up.isDown) {
        if (prevUpPressed === false) {
            currUser.moveUp();
        }
        prevUpPressed = true;
    } else {
        prevUpPressed = false;
    }

    if (cursors.down.isDown) {
        if (prevDownPressed === false) {
            currUser.moveDown();
        }
        prevDownPressed = true;
    } else {
        prevDownPressed = false;

    }

    if (cursors.right.isDown) {
        if (prevRightPressed === false) {
            currUser.moveRight();
        }
        prevRightPressed = true;
    } else {
        prevRightPressed = false;
    }

    if (cursors.left.isDown) {
        if (prevLeftPressed === false) {
            currUser.moveLeft();
        }
        prevLeftPressed = true;
    } else {
        prevLeftPressed = false;
    }
}

function render() {
    game.debug.inputInfo(32, 32);

    var tileCoord = markerToTileCoord(marker);
    if (tileCoord) {
        game.debug.text('Tile Coord : ' + tileCoord.x + ',' + tileCoord.y, 16, 550);
    }
}