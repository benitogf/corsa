'use strict';

var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var riotify = require('riotify');
var util = require('util');

var b = browserify({
  entries: [__dirname+'/src/index.js'],
  cache: {},
  packageCache: {},
  plugin: [watchify]
});
b.transform('riotify', { ext: 'html' })
b.on('update', bundle);
bundle();
b.on('log', function (msg) {
  if (!!process.send)
     process.send('watch:'+msg);
})
function bundle(ids) {
  // console.log(ids);
  // if (!!process.send)
  //    process.send(util.inspect(ids, false, null));
  b.bundle().pipe(fs.createWriteStream(__dirname+'/www/js/index.bundle.js'));;
}

process.on('message', function(conf){
  process.title = conf.title+' watch';
  if (!!process.send)
     process.send('watch js started');
 });
