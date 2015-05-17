/// <reference path="app/app.d.ts" />

// client 에서는 require 사용 불가능

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

function getUserSprite(gameObject) {
    return getCommonSprite(gameObject, 'user');
}

function getCurrUserSprite(gameObject) {
    return getCommonSprite(gameObject, 'current_user');
}

function getEnemySprite(gameObject) {
    return getCommonSprite(gameObject, 'enemy');
}

function getItemSprite(gameObject) {
    return getCommonSprite(gameObject, 'item');
}

function getCommonSprite(gameObject, spriteName) {
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

function createGameObject(data) {
    // TODO 서버와 클라의 보내는 패킷 규격 일치시키기
    var gameObject: kisaragi.Entity = null;

    var movableId = data.id;
    var pos = new kisaragi.Coord(data.x, data.y);

    if (data.category === kisaragi.Category.Player) {
        gameObject = kisaragi.Player.createClientEntity(movableId, socket);
        gameObject.pos = pos;
    } else if (data.category === kisaragi.Category.Enemy) {
        gameObject = new kisaragi.Enemy(movableId, kisaragi.Role.Client, pos);
        //gameObject = new Enemy();
    } else {
        //assert(!"unknown category");
    }
        
    world.attachObject(gameObject);

    var sprite = null;
    if (gameObject.category === kisaragi.Category.Player) {
        if (data.id === currUserId) {
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

function updateGameObjectPos(gameObject) {
    var tileX = gameObject.pos.x;
    var tileY = level.height - gameObject.pos.y - 1;
    var x = tileX * tileSize;
    var y = tileY * tileSize;
    var sprite = gameObject.sprite;
    sprite.position.x = x;
    sprite.position.y = y;
}

function registerSocketHandler(socket) {
    socket.on('s2c_login', function (data) {
        //console.log(data);
        console.log('Login : userId=' + data.id);
        currUserId = data.id;
        level.width = data.width;
        level.height = data.height;

        currUser = createGameObject(data);
    
        // sometime, socket io connection end before game context created
        socket.emit('c2s_requestMap', {});
    });

    socket.on('s2c_responseMap', function (data) {
        //console.log(data);
        console.log('Load Level data from server');
            
        // object synchronize by serializer/deserializer
        level.width = data.width;
        level.height = data.height;
        level.data = data.data;

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

    socket.on('s2c_newObject', function (data) {
        //console.log(data);
        console.log('New Object : id=' + data.id);
        if (!world.findObject(data.id)) {
            // create user to world
            createGameObject(data);
        } else {
            console.log('Object id=' + data.id + 'is already created');
        }
    });

    socket.on('s2c_removeObject', function (data) {
        //console.log(data);
        console.log('Remove Object : id=' + data.id);
        world.removeId(data.id);
    });

    socket.on('s2c_moveNotify', function (data) {
        //console.log(data);
        var gameObject = world.findObject(data.id);
        gameObject.pos = data.pos;
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
    socket = io('http://127.0.0.1:8001');
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
        if (tileObj.category === 'user') {
            color = USER_MARKER_COLOR;
        } else if (tileObj.category === 'enemy') {
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