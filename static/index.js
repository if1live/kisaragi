var socket = io();

function dumpCommunication(cmd, obj) {
  console.log(cmd + " : " + JSON.stringify(obj));
}

socket.on('login', function(obj) {
  dumpCommunication('login', obj);

  socket.emit('requestMap', {});
  socket.emit('requestUserList', {});
});

socket.on('requestMap', function(obj) {
  var html = '<table><tbody>' + _.reduce(obj.data, function(memo, row) {
    return memo + '<tr>' + _.reduce(row, function(memo, cell) {
      return memo + '<td>–</td>';
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
    var x = user.pos[0];
    var y = user.pos[1];
    
    if(users[user.id]) {
      $('#game > table > tbody > tr:nth-child(' + (users[user.id].x + 1) + ') > td:nth-child(' + (users[user.id].y + 1) + ')').html('–');
    }
    users[user.id] = { 'id': user.id, 'x': x, 'y': y, 'valid': true };
  });
  
  _.each(users, function(user, i) {
    if(user.valid) {
      $('#game > table > tbody > tr:nth-child(' + (user.x + 1) + ') > td:nth-child(' + (user.y + 1) + ')').html(user.id);
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

function requestMove(y, x) {
  socket.emit('requestMove', {
    x: x,
    y: y
  });
}

// main
ping();
