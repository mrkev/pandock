// For server things
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)
var serveStatic = require('serve-static')
var config  = require('./config');

// For pandoc things
var pandoc = require('pandoc');
var pdc = require('pdc');


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


var render_pandoc = function (doc) {
  pdc(doc.content, 'markdown', doc.format, function(err, result) {
    if (err) console.trace(err);
    io.emit('--- render_document', result[doc.format])
  });


  // pandoc.convert(
  //   'markdown',
  //   doc.content, [ doc.format ], 
  //   function(result, err) {
  //     if(err) console.error('pandoc exited with status code ' + err);
  //     io.emit('--- render_document', result[doc.format])
  //   }
  // );
}

http.listen(config.port, config.ipaddr);


