'use strict';

var $ = window.jQuery = window.$ = require('jquery');
var riot = window.riot = require('riot');
var detector = require('./lib/detector');
var render =  window.render = (detector.webgl) ? require('./lib/render') : false;
var sound = window.sound = (detector.webaudio) ? require('./lib/sound') : false;
var wsauth = window.wsauth = require('./lib/wsauth');
var menu = require('./lib/menu');
require('./tags/tags');

var app = window.app = {
    init: function () {
      app.host = $('#appData').data('host');
      app.name = $('#appData').data('name');
      menu.init();
      wsauth.init();
      riot.route(app.onPath);
      riot.route.start(true);
    },
    bindEvents: function() {
      document.addEventListener('deviceready', this.init, false);
    },
    onPath: function (path) {
      if (render)
         render.clear();
      if (sound)
         sound.stop();
      app.showLoader();
      menu.path(path);
      if (path === '' )
         path = 'root';
      if (app.currentTag)
         app.currentTag.unmount(true);
      riot.mount(path);
    },
    hideLoader: function() {
      $('#content').css('opacity', '1');
      $('header').css('opacity', '1');
      $('#loading').css('display', 'none');
    },
    showLoader: function() {
      $('#content').css('opacity', '0');
      $('header').css('opacity', '0');
      $('#loading').css('display', 'block');
    },

    errorConfirm: function () {
        document.location.reload();
    },
    errorHandler: function (message) {
        console.log('error ' + message);
        navigator.notification.alert(
             message, // message
             app.errorConfirm, // callback to invoke with index of button pressed
             'Error', // title
             'Restart' // buttonLabels
        );
    }
};
$(document).ready(function() {
  app.bindEvents();
});
