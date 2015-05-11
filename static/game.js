// initialize game context
var socket = io();
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

// network & handler
socket.on('s2c_login', function(obj) {
  // dumpCommunication('s2c_login', obj);
  currUserId = obj.id;
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
  _.each(obj.obstacles, function(pos) {
    map.putTile(currentTile, pos.x, level.height - pos.y - 1, layer);
  });
});

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


// phaser
var width = 800;
var height = 600;
var game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser-example', {
  preload: preload, create: create, update: update, render: render
});

function preload() {
  // dummy sprite
  game.load.image('user', 'assets/sprites/sora-128x128.png');
  game.load.image('current_user', 'assets/sprites/sora2-128x128.png');
  game.load.image('enemy', 'assets/sprites/space-baddie-purple.png');
  game.load.image('item', 'assets/sprites/blue_ball.png');

  // dummy tilemap
  game.load.image('ground_1x1', 'assets/tilemaps/tiles/ground_1x1.png');
}


var sprite;


function create() {
  game.stage.backgroundColor = '#2d2d2d';
  
  map = game.add.tilemap();
  map.addTilesetImage('ground_1x1');
  
  cursors = game.input.keyboard.createCursorKeys();
  
  /*
  var tileX = 5;
  var tileY = 10;
  sprite = game.add.sprite(tileX * tileSize, tileY * tileSize, 'phaser');
  sprite.anchor.set(0, 0);
  sprite.width = tileSize;
  sprite.height = tileSize;
  */
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
}

// network helper
socket.on('s2c_ping', function(obj) {
  var now = Date.now();
  var prev = obj.timestamp;
  var diff = now - prev;
  console.log("ping : " + diff + "ms");
});

function ping() {
  var timestamp = Date.now();
  socket.emit('c2s_ping', {timestamp:timestamp});
}

function dumpCommunication(cmd, obj) {
  console.log(cmd + " : " + JSON.stringify(obj));
}

socket.on('s2c_echo', function(ctx) {
  dumpCommunication('echo', ctx);
});

function echo(ctx) {
  socket.emit('c2s_echo', ctx);
}

socket.on('s2c_echoAll', function(ctx) {
  dumpCommunication('echoAll', ctx);
});

function echoAll(ctx) {
  socket.emit('c2s_echoAll', ctx);
}

// TODO periodic ping
ping();

