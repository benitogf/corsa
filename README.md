# Corsa

Sample cordova app with sass, browserify and jade hooks including threejs and webaudio on riotjs stuff.

Also a wubi input method and auth using redis db.

## PreInstallation

Install and run redis server, the test should fill the db with the chars for the wubi input method

## Installation

```bash
npm install -g cordova
git clone https://github.com/benitogf/corsa.git
cd corsa
npm install
cordova build browser
npm run test
npm start
```
