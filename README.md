# Corsa

Sample cordova app with sass, browserify and jade hooks including threejs and webaudio on riotjs stuff.

Also a wubi input method and auth using redis db.

## PreInstallation

Install [cordova](http://cordova.apache.org/)

```bash
npm install -g cordova
```

Install and run [redis](http://redis.io/download)

Install [nginx](http://nginx.org/en/download.html) to include headers for the auth session, example of the configuration for the default ports:

```
upstream client {
        server localhost:9000;
}

server {
        listen 80;

        root /usr/share/nginx/html;
        index index.html;

        server_name localhost;

        location / {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_pass http://client;
        }
}
```
More info on [nginx docs](http://nginx.org/en/docs/beginners_guide.html)

## Installation

```bash
git clone https://github.com/benitogf/corsa.git
cd corsa
npm install
cordova platform add browser
cordova build browser
```

## Test

There's only one test to fill the db with the chars for the wubi input method, use one time only (after installation)

```bash
npm run test
```

## Starting

After the test to start both server and client:

```bash
npm start
```
Or click on the start.bat for windows

## nwjs

Some scripts to build for [nwjs](http://nwjs.io/) are included, be sure to change the path in those to your nw installation, also install and add to your path [7zip](http://www.7-zip.org/) for windows builds
