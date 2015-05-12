// initialize game context
var world = new World('cli');
var level = world.level;
var users = new Object();
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
  if(gameObject.sprite === undefined || gameObject.sprite === null) {
    var sprite = game.add.sprite(-100, -100, spriteName);
    characterGroup.add(sprite);

    sprite.anchor.set(0, 0);
    gameObject.sprite = sprite;
    gameObject.sprite.width = tileSize;
    gameObject.sprite.height = tileSize;
  }
  return gameObject.sprite;
}

function registerSocketHandler(socket) {
  socket.on('s2c_login', function(obj) {
    currUserId = obj.id;
    // sometime, socket io connection end before game context created
    socket.emit('c2s_requestMap', {});
    socket.emit('c2s_requestUserList', {});
  });

  socket.on('s2c_responseMap', function(obj) {
    // object synchronize by serializer/deserializer
    level.serializer().deserialize(obj);

    // generate tile map from server data
    // TODO lazy level loading
    if(tileLayer) {
      tileLayer.destroy();
    }
    tileLayer = map.create('level', level.width, level.height, tileSize, tileSize);
    tileLayer.z = GROUND_DEPTH;
    game.world.sort();

    var groundTile = 29;
    for(var y = 0 ; y < level.width ; y += 1) {
      for(var x = 0 ; x < level.width ; x += 1) {
        map.putTile(groundTile, x, y, tileLayer);
      }
    }

    var wallTile = 9;
    _.each(obj.obstacles, function(obstacle) {
      map.putTile(wallTile, obstacle.pos[0], level.height - obstacle.pos[1] - 1, tileLayer);
    });
  });

  socket.on('s2c_moveOccur', function(obj) {
    world.syncAllObjectList(obj.user_list);
    currUser = world.findObject(currUserId);
    currUser.sock = socket;

    _.each(world.allObjectList(), function(gameObject, i) {
      var tileX = gameObject.pos[0];
      var tileY = level.height - gameObject.pos[1] - 1;
      var x = tileX * tileSize;
      var y = tileY * tileSize;

      var sprite = null;
      if(gameObject.category === 'user') {
        if(gameObject.id === currUserId) {
          sprite = getCurrUserSprite(gameObject);
        } else {
          sprite = getUserSprite(gameObject);
        }
      } else if(gameObject.category === 'enemy') {
        sprite = getEnemySprite(gameObject);
      } else if(gameObject.category === 'item') {
        sprite = getItemSprite(gameObject);
      }
      sprite.position.x = x;
      sprite.position.y = y;
    });
  });
}

// phaser
var width = 800;
var height = 600;
var game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser-example', {
  preload: preload, create: create, update: update, render: render
});

function preload() {
  // dummy sprite
  game.load.image('user', 'assets/sprites/kisaragi.png');
  game.load.image('current_user', 'assets/sprites/mutsuki.png');
  game.load.image('enemy', 'assets/sprites/space-baddie-purple.png');
  game.load.image('item', 'assets/sprites/blue_ball.png');

  // dummy tilemap
  game.load.image('desert', 'assets/tilemaps/tiles/tmw_desert_spacing.png');
}


function create() {
  game.stage.backgroundColor = '#2d2d2d';
  
  map = game.add.tilemap();
  map.addTilesetImage('desert', undefined, tileSize, tileSize, 1, 1);

  characterGroup = game.add.group();
  characterGroup.z = CHARACTER_DEPTH;
  
  cursors = game.input.keyboard.createCursorKeys();

  // cursor + tile select
  marker = game.add.graphics();
  marker.lineStyle(2, EMPTY_MARKER_COLOR, 1);
  marker.drawRect(0, 0, tileSize, tileSize);

  game.input.addMoveCallback(updateMarker, this);

  // create network after game context created
  socket = io();
  registerSocketHandler(socket);

  echoRunner = new network.ClientEcho(socket);
  ping = new network.ClientPing(socket);
  ping.ping();
}

function updateMarker() {
  if(!tileLayer) {
    return;
  }

  // move tile marker to mouse position
  var rawTileX = tileLayer.getTileX(game.input.activePointer.worldX);
  var rawTileY = tileLayer.getTileY(game.input.activePointer.worldY);

  if(rawTileX >= level.width) {
    rawTileX = level.width - 1;
  }
  if(rawTileY >= level.height) {
    rawTileY = level.height - 1;
  }

  marker.x = rawTileX * tileSize;
  marker.y = rawTileY * tileSize;

  var tileCoord = markerToTileCoord(marker);
  var tileObj = world.getObject(tileCoord.x, tileCoord.y);
  var color = EMPTY_MARKER_COLOR;
  if(tileObj) {
    if(tileObj.category === 'user') {
      color = USER_MARKER_COLOR;
    } else if(tileObj.category === 'enemy') {
      color = ENEMY_MARKER_COLOR;
    } else {
      color = UNKNOWN_MARKER_COLOR;
    }
  } else {
    if(level.tile(tileCoord.x, tileCoord.y) === level.TILE_OBSTACLE) {
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
  }
}

function markerToTileCoord(marker) {
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
  if(cursors.up.isDown) {
    if(prevUpPressed === false) {
      currUser.moveUp();
    }
    prevUpPressed = true;
  } else {
    prevUpPressed = false;
  }
  
  if(cursors.down.isDown) {
    if(prevDownPressed === false) {
      currUser.moveDown();
    }
    prevDownPressed = true;
  } else {
    prevDownPressed = false;
    
  }

  if(cursors.right.isDown) {
    if(prevRightPressed === false) {
      currUser.moveRight();
    }
    prevRightPressed = true;
  } else {
    prevRightPressed = false;
  }

  if(cursors.left.isDown) {
    if(prevLeftPressed === false) {
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
  game.debug.text('Tile Coord : ' + tileCoord.x + ',' + tileCoord.y, 16, 550);

  var pingMsg = sprintf('Ping : avg=%d, max=%d, min=%d, last=%d', ping.average(), ping.max(), ping.min(), ping.last());
  game.debug.text(pingMsg, 16, 530);
}
