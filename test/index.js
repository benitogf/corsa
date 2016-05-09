var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    promise = require("bluebird"),
    redis = require("redis"),
    rc = redis.createClient();

var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

var mandarin = {
   set: function(data) {
    return rc.setAsync('mandarin:'+data.character+':wubi', data.wubi);
   }
};

console.log('loading..');
driver.get('http://localhost/#/chars');
var loading = driver.findElement(By.id('loading'));
promise.all([loading.isDisplayed(), driver.findElements(By.tagName('i'))])
  .then(function(load){
    console.log('Total characters '+load[1].length);
    return promise.each(load[1], function(tag, i){
         return promise.all([tag.getText(), tag.getAttribute('title')])
           .then(function(info){
             var data = {
               character: info[0],
               wubi: info[1].trim()
             };
             return mandarin.set(data);
           });
       });
  })
  .then(function(){
    console.log('done');
    driver.quit();
    rc.quit();
  });
