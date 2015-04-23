var net = require('net');
var GAME_PORT = 8124;

var g_count = 0;

var server = net.createServer(function(c) { //'connection' listener
  console.log('client connected');
  g_count += 1;
  console.log('counter : ' + g_count);
  c.on('end', function() {
    console.log('client disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});

server.listen(GAME_PORT, function() { //'listening' listener
  console.log('server bound');
});
