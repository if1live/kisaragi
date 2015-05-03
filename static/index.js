// command
$('.cmd-move').click(function() {
  var dx = parseInt($(this).data('dx'), 10);
  var dy = parseInt($(this).data('dy'), 10);
  
  var filtered = _.filter(users, function(obj) {
    return obj.id == currUserId;
  });
  if(filtered.length > 0) {
    var user = filtered[0];

    var x = user.x + dx;
    var y = user.y + dy;
    requestMove(x, y);
  }
});

// network & handler
var socket = io();

function dumpCommunication(cmd, obj) {
  console.log(cmd + " : " + JSON.stringify(obj));
}

var currUserId = null;

socket.on('login', function(obj) {
  dumpCommunication('login', obj);
  
  currUserId = obj.id;

  socket.emit('requestMap', {});
  socket.emit('requestUserList', {});
});

var mapWidth = null;
var mapHeight = null;

socket.on('requestMap', function(obj) {
  mapWidth = obj.width;
  mapHeight = obj.height;
  
  var html = '<table><tbody>' + _.reduce(obj.data, function(memo, row, y) {
    return memo + '<tr>' + _.reduce(row, function(memo, cell, x) {
      return memo + '<td data-coords="[' + x + ', ' + (mapHeight - y - 1) + ']">–</td>';
    }, '') + '</tr>';
  }, '') + '</tbody></table>';
  
  $("#game").html(html);
//  dumpCommunication('requestMap', obj);
});

var users = new Object();

socket.on('moveOccur', function(obj) {
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
      delete users[i];
    }
  });
  
  dumpCommunication('moveOccur', obj);
});

socket.on('ping', function(obj) {
  var now = Date.now();
  var prev = obj.timestamp;
  var diff = now - prev;
  console.log("ping : " + diff + "ms");
});

function ping() {
  var timestamp = Date.now();
  socket.emit('ping', {timestamp:timestamp});
}

socket.on('echo', function(ctx) {
  dumpCommunication('echo', ctx);
});

function echo(ctx) {
  socket.emit('echo', ctx);
}

socket.on('echo_all', function(ctx) {
  dumpCommunication('echo_all', ctx);
});

function echo_all(ctx) {
  socket.emit('echo_all', ctx);
}

function requestMove(x, y) {
  socket.emit('requestMove', {
    x: x,
    y: y
  });
}

// main
ping();
