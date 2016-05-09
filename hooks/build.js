#!/usr/bin/env node

'use strict';

var jade = require('jade'),
    fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    parser = new xml2js.Parser(),
    sass = require('node-sass'),
    shell = require('shelljs'),
    exec = require('child_process').exec;

function listTags(cb){
  var tags = shell.ls( __dirname + '/../src/tags');
  var tagsFile = '\'use strict\' \n' ;
  tags.splice(tags.indexOf('tags.js'), 1);
  tags = tags.map(function(tag){
    tagsFile += 'require(\'./'+tag+'\') \n' ;
    return tag.replace('.html', '');
  });
  fs.writeFile(__dirname+'/../src/tags/tags.js', tagsFile, function(err) {
    if (err) throw err;
    cb(tags);
  });
}

function readConf(cb){
  fs.readFile('config.xml', function(err, data) {
    parser.parseString(data, function (err, data) {
        if (err) throw err;
        listTags(function(tags){
          var conf = {
            title: data.widget.name[0],
            author: data.widget.author[0]._,
            enviroment: data.widget.server[0].env[0],
            host: data.widget.server[0].host[0],
            port: data.widget.server[0].port[0],
            gapi: data.widget.server[0].gapi[0],
            ganalytics: data.widget.server[0].ganalytics[0],
            tags: tags
          };
          console.log(util.inspect(conf, false, null));
          cb(conf);
        });
    });
  });
}

function renderSass(conf, Q){
   var deferral = new Q.defer();
   sass.render({
        file: 'src/scss/index.scss',
      }, function(err, result) {
         if (err) throw err;
         fs.writeFile('www/css/index.css', result.css, function (err) {
           if (err) throw err;
           console.log('css');
           deferral.resolve();
         });
        });
   return deferral.promise;
}

function renderJade(conf, Q){
  var deferral = new Q.defer();
  var render = jade.compileFile('src/index.jade');
  var html = render(conf);
  fs.writeFile('www/index.html', html, function (err) {
        if (err) throw err;
        console.log('html');
        deferral.resolve();
  });
  return deferral.promise;
}

function buildJs(Q){
  var deferral = new Q.defer();
  var child = exec('npm run build');
  child.on('close', function(){
    console.log('js');
    deferral.resolve();
  });
  return deferral.promise;
}

module.exports = function(context) {
    console.log('starting pre build');
    var Q = context.requireCordovaModule('q');
    var deferral = new Q.defer();
    readConf(function(conf){
      Q.all([
          renderJade(conf, Q),
          renderSass(conf, Q),
          buildJs(Q)
        ]).then(function(){
          console.log('pre build end');
          deferral.resolve();
        });
    });
    return deferral.promise;
};
