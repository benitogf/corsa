var clients = [],
    cp = require('child_process'),
    fs = require('fs'),
    parser = new require('xml2js').Parser(),
    util = require('util'),
    model = require('./model'),
    client;

function getConf(cb) {
  if (!!process.send) {
     process.send('Platform:');
     process.send(process.arch);
     process.send(process.platform);
     process.send(process.version);
   }
  fs.readFile(__dirname + '/config.xml', function(err, data) {
    if (err) throw err;
    parser.parseString(data, function (err, data) {
      if (err) throw err;
        var conf = {
          title: data.widget.name[0],
          author: data.widget.author[0]._,
          enviroment: data.widget.server[0].env[0],
          host: data.widget.server[0].host[0],
          client: {
            port: data.widget.client[0].port[0],
          },
          server: {
            port: data.widget.server[0].port[0],
          },
          gapi: data.widget.server[0].gapi[0],
          ganalytics: data.widget.server[0].ganalytics[0]
        };
        process.title = conf.title+' server';
        if (!!process.send)
           process.send(util.inspect(conf, false, null));
        console.log(util.inspect(conf, false, null));
        cb(conf);
    });
  });
}

function startClient(conf){
  client = cp.fork('client.js');
  client.send(conf);
  client.on('message', function(data) {
    console.log(data);
    if (!!process.send)
       process.send(data);
  });
}

getConf(function(conf){
  var io = require('socket.io')(conf.server.port);
  io.on('connection', function(socket){
    //console.log(socket.handshake);
    clients.push({
      id: socket.conn.id,
      socket: socket
    });
    socket.on('app:check', function(data, cb){
      model.app.check(data, cb);
    });
    socket.on('mandarin:keys', function(limit, cb) {
      model.mandarin.getKeys(limit, cb);
    });
    socket.on('session:signup', function(data, cb){
      data.ip = socket.handshake.headers['x-real-ip'];
      model.user.set(data, cb);
    });
    socket.on('session:login', function(data, cb){
      //console.log(socket.handshake.headers);
      data.ip = socket.handshake.headers['x-real-ip'];
      model.user.check(data, cb);
    });
    socket.on('session:get', function(data, cb){
      model.user.get(data, cb);
    });
    socket.on('session:kill', function(data, cb){
      model.user.kill(data, cb);
    });
    socket.on('error', function(e){
      if (process.send)
         process.send(e);
      console.log(e);
    });
    socket.on('disconnect', function(){
      var idk = -1;
      clients.forEach(function(client, i){
        if (client.id === socket.conn.id) {
           idk = i;
        }
      });
      if (idk !== -1) {
         clients.splice(idk, 1);
      }
    });
  });
  console.log('ws server ready on port '+conf.server.port);
  if (process.send)
     process.send('ws server ready on port '+conf.server.port);
  startClient(conf);
});
