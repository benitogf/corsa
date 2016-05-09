'use strict';

var fs = require('fs'),
    express =  require('express'),
    app = express(),
    cp = require('child_process'),
    compileSass = require('express-compile-sass'),
    shell = require('shelljs'),
    chokidar = require('chokidar'),
    srccss = __dirname + '/src/scss',
    cordovajs = __dirname + '/platforms/browser/www/cordova.js',
    cordovapluginsroot = __dirname + '/platforms/browser/www/plugins',
    cordovaplugins = __dirname + '/platforms/browser/www/cordova_plugins.js',
    rootjs = __dirname + '/www/js',
    rootcss = __dirname + '/www/css',
    rootimg = __dirname + '/www/img',
    server = require('http').createServer(app),
    nextReload = 0,
    watch,
    conf;

//
function listTags(cb){
  var tags = shell.ls( __dirname + '/src/tags');
  var tagsFile = '\'use strict\' \n' ;
  tags.splice(tags.indexOf('tags.js'), 1);
  tags = tags.map(function(tag){
    tagsFile += 'require(\'./'+tag+'\') \n' ;
    return tag.replace('.html', '');
  });
  fs.writeFile(__dirname+'/src/tags/tags.js', tagsFile, function(err) {
    if (err) throw err;
    cb(tags);
  });
}

function startWatch(){
  watch = cp.fork('watch.js');
  watch.send(conf);
  watch.on('message', function(data) {
    //console.log(data);
    if (!!process.send)
       process.send(data);
  });
     chokidar.watch(__dirname+'/src/tags/*.html', {
       ignoreInitial: true
     }).on('all', function(e) {
       if ((e === 'add' || e === 'unlink') && (nextReload < Date.now()))
          listTags(function(newTags){
            conf.tags = newTags;
            nextReload = Date.now()+200;
            console.log('tags update');
          });
     });
}

process.on('message', function(newConf){
    conf = newConf;
    process.title = conf.title+' client';
    app.engine('jade', require('jade').__express);
    app.use('/cordova.js', express.static(cordovajs));
    app.use('/cordova_plugins.js', express.static(cordovaplugins));
    app.use('/plugins', express.static(cordovapluginsroot));
    if (conf.enviroment === 'dev') {
      listTags(function(tags){
        startWatch();
        conf.tags = tags;
        app.use('/scss', compileSass({
           root: srccss,
           sourceMap: true,
           sourceComments: true,
           watchFiles: true,
           logToConsole: false
        }));
        app.use('/js', express.static(rootjs));
        app.use('/css', express.static(rootcss));
        app.use('/img', express.static(rootimg));
        app.get('/', function(req, res, next){
            res.render(__dirname +'/src/index.jade', conf, function(err, html){
              if (err) {
                console.log(err);
                res.status(err.status).end();
              } else {
                res.send(html);
                console.log(Date.now());
              }
            });
        });
      });
    } else {
       var root = __dirname + '/www';
       app.use(express.static(root));
    }
    server.listen(conf.client.port);
    console.log('client ready on port '+conf.client.port);
});
