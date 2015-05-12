// initialize game context
var world = new World('cli');
var level = world.level;
var users = new Object();
var currUser = null;
var currUserId = null;

// tilemap
var map;
var layer;
var tileSize = 32;
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
    if(layer) {
      layer.destroy();
    }
    layer = map.create('level', level.width, level.height, tileSize, tileSize);

    var currentTile = 1;
    _.each(obj.obstacles, function(obstacle) {
      map.putTile(currentTile, obstacle.pos[0], level.height - obstacle.pos[1] - 1, layer);
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
  game.load.image('ground_1x1', 'assets/tilemaps/tiles/ground_1x1.png');
}


var marker = null;


function create() {
  game.stage.backgroundColor = '#2d2d2d';
  
  map = game.add.tilemap();
  map.addTilesetImage('ground_1x1');
  
  cursors = game.input.keyboard.createCursorKeys();

  // cursor + tile select
  marker = game.add.graphics();
  marker.lineStyle(2, 0x0000ff, 1);
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
  if(!layer) {
    return;
  }

  // move tile marker to mouse position
  var tileX = layer.getTileX(game.input.activePointer.worldX);
  var tileY = layer.getTileY(game.input.activePointer.worldY);

  if(tileX >= level.width) {
    tileX = level.width - 1;
  }
  if(tileY >= level.height) {
    tileY = level.height - 1;
  }

  marker.x = tileX * tileSize;
  marker.y = tileY * tileSize;
  if (game.input.mousePointer.isDown) {
    // TODO implement move to
    var data = markerToTileCoord(marker);
    console.log("selected tile coord : " + data.tileX + "," + data.tileY);
  }
}

function markerToTileCoord(marker) {
  var tileX = marker.x / tileSize;
  var tileY = level.height - marker.y / tileSize;
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
