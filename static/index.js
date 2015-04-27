var socket = io();
$('form').submit(function() {
  socket.emit('chat message', [$('#m').val()]);
  $('#m').val('');
  return false;
});

socket.on('chat message', function(obj) {
  var msg = obj.msg;
  $('#messages').append($('<li>').text(msg));
});
