// command
function getCurrentUser() {
  var filtered = _.filter(users, function(obj) {
    return obj.id === currUserId;
  });
  if(filtered.length > 0) {
    return filtered[0];
  } else {
    return null;
  }
}

function movePlayer(dx, dy) {
  if(!player) {
    return;
  }
  player.moveOneTile(dx, dy);
}

$('.cmd-move').click(function() {
  var dx = parseInt($(this).data('dx'), 10);
  var dy = parseInt($(this).data('dy'), 10);
  movePlayer(dx, dy);
});


// share game world
var world = new World();
var level = world.level;
var player = null;

// network & handler
var socket = io();

function dumpCommunication(cmd, obj) {
  console.log(cmd + " : " + JSON.stringify(obj));
}

var currUserId = null;

socket.on('s2c_login', function(obj) {
  dumpCommunication('s2c_login', obj);
  
  currUserId = obj.id;

  socket.emit('c2s_requestMap', {});
  socket.emit('c2s_requestUserList', {});
});

socket.on('s2c_responseMap', function(obj) {
  // object synchronize by serializer/deserializer
  level.serializer().deserialize(obj);
  
  var html = '<table><tbody>' + _.reduceRight(obj.nodes, function(memo, row, y) {
    return memo + '<tr>' + _.reduce(row, function(memo, cell, x) {
      return memo + '<td data-coords="[' + x + ', ' + y + ']">' + (cell.walkable ? '–' : 'x') + '</td>';
    }, '') + '</tr>';
  }, '') + '</tbody></table>';
  
  $("#game").html(html);
});

var users = new Object();

socket.on('s2c_moveOccur', function(obj) {
  console.log(users);
  _.each(users, function(user, i) {
    user.valid = false;
  });
  
  _.each(obj.user_list, function(user, i) {
    console.log(user.pos);
    var x = user.pos[0];
    var y = user.pos[1];
    
    if(users[user.id]) {
	$('#game td[data-coords=\'[' + users[user.id].x + ', ' + users[user.id].y + ']\']').html('–');
    }
    users[user.id] = { 'id': user.id, 'x': x, 'y': y, 'valid': true };
  });
  
  _.each(users, function(user, i) {
    if(user.valid) {
      $('#game td[data-coords=\'[' + user.x + ', ' + user.y + ']\']').html(user.id);
    }
    else {
      $('#game td[data-coords=\'[' + user.x + ', ' + user.y + ']\']').html('–');
      delete users[i];
    }
  });
  
  player = new Player(getCurrentUser(), socket);
  //dumpCommunication('moveOccur', obj);
});

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

function requestMove(x, y) {
  socket.emit('requestMove', {
    x: x,
    y: y
  });
}

// main
ping();

