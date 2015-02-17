var childProcess = require('child_process');
var spawn = childProcess.spawn;
var exec = childProcess.exec;
var fs = require('fs');

pandoc = spawn('pandoc', ['-t', 'latex', '-o', './temp.pdf']);

pandoc.on('error', function(err) {
  console.trace(err);
});

pandoc.on('exit', function(code, signal) {

  fs.readFile('./temp.pdf', function (err, data) {
    if (err) throw err;
    console.log(data);
  });

  if(code !== 0) console.error('Code is not 0')


});

//pipe them the input
pandoc.stdin.write('# SUP', 'utf8');
pandoc.stdin.end();