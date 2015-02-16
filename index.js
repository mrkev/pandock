// For server things
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var serveStatic = require('serve-static')

// For pandoc things
var pandoc = require('pandoc');


//app.get('/', function (req, res) {
//  res.sendfile('public/index.html')
//});

app.use(express.static(__dirname + '/public'));



var _id = 0;
io.on('connection', function (socket) {
  var user = { id : _id++ }

  socket.emit('user info', user);

  console.log('a user connected');

  socket.on('+++ render_document', function (doc) {
    console.log('rendering');
    render_pandoc(doc)
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
})


var render_pandoc = function (doc) {
  pandoc.convert(
    'markdown',
    doc.content, [ doc.format ], 
    function(result, err) {
      if(err) console.error('pandoc exited with status code ' + err);
      io.emit('--- render_document', result[doc.format])
    }
  );
}


