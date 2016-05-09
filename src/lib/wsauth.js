'use strict';


(function(global, code){ if(typeof exports === 'object'){ module.exports = code(); }
else{ global.wsauth = code(); }}(this, function(){
var wsauth = {
  conf: {
    app: {
      name: 'corsa'
    },
    elementId: 'auth'
  },
  formData: {},
  toJson: function(form) {
    for (var i = 0; i < form.children.length; i++) {
      if (form.children[i].children.length > 0) {
         this.toJson(form.children[i]);
      } else {
        if ((form.children[i].name)&&(form.children[i].type)) {
           this.formData[form.children[i].name] = form.children[i].value;
        }
      }
    }
  },
  createInput: function(id, type, caption, required){
    var group = document.createElement('div');
    var label = document.createElement('label');
    var input = document.createElement('input');
    input.id = id;
    input.type = type;
    if (caption) {
       label.innerHTML = caption;
       group.appendChild(label);
       input.name = id;
    } else {
      input.value = id;
    }
    if (required) {
       input.required = required;
    }
    group.appendChild(input);
    return group;
  },
  message: function(section, text) {
    document.getElementById(section+'Msg').innerHTML = text;
  },
  signup: function(event) {
    if (event) {
      event.preventDefault();
    }
    wsauth.formData = {app: wsauth.conf.app};
    wsauth.toJson(document.getElementById('signupForm'));
    wsauth.socket.emit('session:signup', wsauth.formData, function (data) {
      console.log(data);
      if (data && data.token) {
         wsauth.setToken(data.token);
         wsauth.start();
      } else {
         wsauth.message('signup','username taken');
      }
    });
  },
  login: function(event) {
    if (event) {
      event.preventDefault();
    }
    wsauth.formData = {app: wsauth.conf.app};
    wsauth.toJson(document.getElementById('loginForm'));
    wsauth.socket.emit('session:login', wsauth.formData, function (data) {
      if (data && data.token) {
         wsauth.setToken(data.token);
         wsauth.start();
      } else {
         wsauth.message('login','user not found');
      }
    });
  },
  logout: function(event) {
    if (event) {
      event.preventDefault();
    }
    wsauth.formData = {app: wsauth.conf.app, token: wsauth.getToken()};
    wsauth.socket.emit('session:kill', wsauth.formData, function (data) {
       wsauth.start();
    });
  },
  formLogin: function(root) {
    var title = document.createElement('h1');
    var msg = document.createElement('span');
    var form = document.createElement('form');
    title.innerHTML = 'Login';
    msg.id = 'loginMsg';
    var user = this.createInput('username', 'text', 'Username', true);
    var pwd = this.createInput('pwd', 'password', 'Password', true);
    var button = this.createInput('login', 'submit');
    form.id = 'loginForm';
    form.appendChild(user);
    form.appendChild(pwd);
    form.appendChild(button);
    root.appendChild(title);
    root.appendChild(msg);
    root.appendChild(form);
    form.addEventListener('submit', this.login);
  },
  formSignup: function(root){
    var title = document.createElement('h1');
    var msg = document.createElement('span');
    var form = document.createElement('form');
    title.innerHTML = 'Signup';
    msg.id = 'signupMsg';
    var mail = this.createInput('email', 'email', 'Email', true);
    var user = this.createInput('username', 'text', 'Username', true);
    var pwd = this.createInput('pwd', 'password', 'Password', true);
    var button = this.createInput('signup', 'submit');
    form.id = 'signupForm';
    form.appendChild(mail);
    form.appendChild(user);
    form.appendChild(pwd);
    form.appendChild(button);
    root.appendChild(title);
    root.appendChild(msg);
    root.appendChild(form);
    form.addEventListener('submit', this.signup);
  },
  userPanel: function(root, username){
    var title = document.createElement('h1');
    title.innerHTML = username;
    var button = this.createInput('logout', 'button');
    root.appendChild(title);
    root.appendChild(button);
    button.addEventListener('click', this.logout);
  },
  getToken: function() {
    return localStorage.getItem('token');
  },
  setToken: function(token) {
    return localStorage.setItem('token', token);
  },
  getUsername: function(token, cb) {
    var data = {
      app: this.conf.app,
      token: token
    };
    wsauth.socket.emit('session:get', data, function (data) {
      cb(data);
    });
  },
  clear: function(root){
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  },
  init: function () {
      /*app.conf = {
          elementId: 'auth'
      };*/
      var root = document.getElementById(wsauth.conf.elementId);
      root.innerHTML = 'Connecting';
      wsauth.socket = require('socket.io-client')('ws://' + app.host, { reconnectionAttempts: 3, reconnectionDelay: 1000 });
      wsauth.socket.on('connect', function () {
          wsauth.start(root);
      });
      wsauth.socket.on('disconnect', function () {
          wsauth.clear(root);
          root.innerHTML = 'Disconnected';
      });
      wsauth.socket.on('reconnecting', function (number) {
          wsauth.clear(root);
          root.innerHTML = 'Reconnecting '+number;
      });
      wsauth.socket.on('reconnect_failed', function () {
          wsauth.clear(root);
          app.errorHandler('Reconnect failed, restart to try again');
      });
      wsauth.socket.on('error', function () {
          //app.showLoader();
          app.errorHandler('Socket error');
      });
  },
  start: function(root) {
    if (app.conf) {
        this.conf.app.name = app.name.toLowerCase();
        this.conf.elementId = app.conf.elementId;
    }
    // if (!this.socket) {
    //   this.socket = app.socket;
    // }
    app.socket = wsauth.socket;
    wsauth.clear(root);
    var token = this.getToken();
    if (!token) {
      this.formLogin(root);
      this.formSignup(root);
    } else {
      this.getUsername(token, function(username){
        if (username) {
           wsauth.userPanel(root, username);
        } else {
           //wsauth.setToken('');
           wsauth.formLogin(root);
           wsauth.formSignup(root);
        }
      });
    }
  }
};
return wsauth;
}));
