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
  dumpCommunication('requestMap', obj);
});

socket.on('moveOccur', function(obj) {
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
