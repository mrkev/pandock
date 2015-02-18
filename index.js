'use strict';
/* global console, require, __dirname, process */
// For server things
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var config  = require('./config');

// For pandoc things
var pandoc = require('pandoc');
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var fs = require('fs');

// Prepare to rumble.
var default_md = fs.readFileSync(__dirname + '/md.md', {encoding : 'utf8'});
var _id = 0;

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {

  console.log('user ' + _id + ' connected');

  // Send the welcome package. who they are. what they have.
  socket.emit('welcome', {
    default_md : default_md,
    id : _id++
  });

  socket.on('+++ render_document', function (doc) {
    if (doc.format === 'pdf') { render_send_pdf    (doc, socket); }
                         else { render_send_pandoc (doc, socket); }
  });

  socket.on('disconnect', function () {
    fs.unlink('public/tmp/' + socket.id + '.pdf', function (err) {
      if (err) console.log('user didn\'t make a pdf it seems');
    });

    console.log('user disconnected');
  });
});

var render_send_pdf = function (doc, socket) {

  var outfile  = '/tmp/' + socket.id + '.pdf';
  var panspawn = 
    spawn('pandoc', 
      ['-t', 'latex', '-o', 'public/' + outfile, '--latex-engine=xelatex'], 
      { cwd: process.cwd(), env: process.env });

  panspawn.on('error', function(err) {
    console.trace(err);
  });

  panspawn.on('exit', function(code) {
    if(code !== 0) console.error('Code is not 0, it\'s ', code);

    socket.emit('--- render_document', {
      format : 'pdf',
      path : outfile
    });

  });

  //pipe them the input
  panspawn.stdin.write('\n' + doc.content, 'utf8');
  panspawn.stdin.end();
  
};

var render_send_pandoc = function (doc, socket) {
  pandoc.convert(
    'markdown',
    doc.content, [ doc.format ], 
    function(result, err) {
      if(err) console.error('pandoc exited with status code ' + err);
      socket.emit('--- render_document', {
        format : doc.format,
        content : result[doc.format]
      });
    }
  );
};

http.listen(config.port, config.ipaddr);


