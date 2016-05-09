'use strict';
var RedisSessions = require("redis-sessions"),
    redis = require("redis"),
    promise = require("bluebird"),
    rs = new RedisSessions(),
    rc = redis.createClient();

//request = require('request'),
//querystring = require("querystring"),
//googleTranslate = require('google-translate')('AIzaSyAnmO5wfZglyHV8vex-XcKa5LqUtcaBPEM');

// var apiBase = 'https://www.googleapis.com/language/translate/v2?q=';
// var qenc = querystring.stringify({ query: '画' });
// var lang = '&target=en&key=';
// var apiKey = 'AIzaSyAnmO5wfZglyHV8vex-XcKa5LqUtcaBPEM';
// var urlApi = apiBase+qenc+lang+apiKey;
// console.log(urlApi);
// request.get(urlApi, function(err, res){
//   console.log(res);
// });
// googleTranslate.translate('画', 'en', function(err, translation) {
//   console.log(err);
//   console.log(translation);
// });
promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

var model = {
  app: {
    check: function(data, cb) {
      rc.get(data.app.name+':pwd', function(err, reply) {
        if (err) throw err;
        cb(data.app.pwd === reply);
      });
    }
  },
  mandarin: {
   set: function(data, cb) {
    var self = this;
    rc.set('mandarin:'+data.character+':'+data.field, data.value, function(err, reply) {
      if (err) throw err;
      cb(reply);
    });
   },
   filterLimit: function(set, limit) {
     return set.slice(limit.start, limit.end);
   },
   filterWubi: function(set, text) {
     var setSearch = [];
     set.forEach(function(symbol, ind){
       var check = false;
       var wubi = symbol.wubi.split(',');
       wubi.forEach(function(keys){
         var wk = keys.replace(/\s+/g, '');
         //console.log(wk);
         if (wk.indexOf(text) === 0)
            check = true;
       });
       if (check)
          setSearch.push(symbol);
     });
     return setSearch;
   },
   getKeys: function(data, cb) {
    var self = this;
    rc.keys('mandarin:*', function(err, reply){
      if (err) throw err;
      var chars = [];
      var set = self.filterLimit(reply, data.limit);
      promise.map(set, function(key, ind) {
        var character = (key.replace('mandarin:', '')).replace(':wubi', '');
        chars.push({
          character: character
        });
        return rc.getAsync('mandarin:'+character+':wubi');
      }).then(function(result) {
        result.forEach(function(wubi, ind){
          chars[ind].wubi = wubi;
        });
        chars = self.filterWubi(chars, data.search);
        cb(chars);
      });
    });
   }
  },
  user: {
   set: function(data, cb) {
    var self = this,
        multi = [],
        keys = Object.keys(data);
    self.exist(data, function(res){
      if (!res) {
        keys.forEach(function(key){
          if (key !== 'username') {
            multi.push(['set', data.app.name+':user:'+data.username+':'+key, data[key]]);
          }
        });
        rc.multi(multi).exec(function (err) {
            if (err) throw err;
            self.check(data, cb);
        });
      } else {
        cb(false);
      }
    });
   },
   get: function(data, cb) {
    var ds = {
      app: data.app.name,
      token: data.token
    };
    rs.get(ds, function(err, res) {
        if (err) throw err;
        cb(res.id);
    });
   },
   exist: function(data, cb) {
    rc.get(data.app.name+':user:'+data.username+':email', function(err, reply) {
      if (err) throw err;
      cb(reply);
    });
   },
   check: function(data, cb) {
    rc.get(data.app.name+':user:'+data.username+':pwd', function(err, reply) {
      if (err) throw err;
      if (data.pwd === reply) {
       rs.create({
        app: data.app.name,
        id: data.username,
        ip: data.ip,
        ttl: 3600
        },
        function(err, res) {
          cb(res);
        });
      } else {
        cb(false);
      }
    });
   },
   kill: function(data, cb) {
    var ds = {
      app: data.app.name,
      token: data.token
    };
    rs.kill(ds, function(err, res) {
        if (err) throw err;
        cb(res);
    });
   }
  },
  client: {

  }
};
module.exports = model;
