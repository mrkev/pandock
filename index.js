// For server things
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)
var serveStatic = require('serve-static')
var config  = require('./config');

// For pandoc things
var pandoc = require('pandoc');
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var exec = childProcess.exec;
var fs = require('fs');



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
  // pdc(doc.content, 'markdown', doc.format, function(err, result) {
  //   if (err) console.trace(err);
  //   io.emit('--- render_document', result[doc.format])
  // });
  // 
  
  if (doc.format === 'pdf') {
    
    var panspawn = spawn('pandoc', ['-t', 'latex', '-o', 'temp.pdf'], { cwd: process.cwd(), env: process.env });

    panspawn.on('error', function(err) {
      console.trace(err);
    });

    panspawn.on('exit', function(code, signal) {

      fs.readFile('temp.pdf', function (err, data) {
        if (err) throw err;
        console.log(data);
        io.emit('--- render_document', {
          format : 'pdf',
          content : data
        })
      });

      if(code !== 0) console.error('Code is not 0, it\'s ', code)
    });

    //pipe them the input
    panspawn.stdin.write('\n' + doc.content, 'utf8');
    panspawn.stdin.end();

    return;
  }

  pandoc.convert(
    'markdown',
    doc.content, [ doc.format ], 
    function(result, err) {
      if(err) console.error('pandoc exited with status code ' + err);
      io.emit('--- render_document', {
        format : doc.format,
        content : result[doc.format]
      })
    }
  );
}

http.listen(config.port, config.ipaddr);


var do_pdf = function (content) {
  
}

