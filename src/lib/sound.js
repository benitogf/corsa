'use strict';

//var tones = require('./tones');

var sound = {
  tones: require('./tones'),
  octaves: [
      [],
      [90, 88, 67, 86, 66, 78, 83, 68, 71, 72, 74, 77],
      [76, 186, 188, 190, 192, 0, 191, 189, 173, 0]
  ],
  currentKeys: [],
  grid: ['c','d','e','f','g','a','b','c#','d#','f#','g#','a#','c#'],
  keys: {
      90: 'c',
      83: 'c#',
      68: 'd#',
      88: 'd',
      67: 'e',
      86: 'f',
      71: 'f#',
      66: 'g',
      78: 'a',
      72: 'g#',
      74: 'a#',
      77: 'b',
      76: 'c#',
      186: 'd#',
      188: 'c',
      190: 'd',
      191: 'e',
      173: 'f',
      189: 'f',
      192: 'f#',
      0: 'f#'
  },
  play: function(){
    document.addEventListener('keydown', sound.keyDown);
    document.addEventListener('keyup', sound.keyUp);
  },
  stop: function(){
    document.removeEventListener('keydown', sound.keyDown);
    document.removeEventListener('keyup', sound.keyUp);
  },
  keyDown: function(e){
    var key = e.keyCode || e.which;
    if ((sound.keys[key])&&(sound.currentKeys.indexOf(key) === -1)) {
        sound.currentKeys.push(key);
        // sound.tones.volume = 1;
        // sound.tones.attack = 10;
        // sound.tones.release = 600;
        // sound.tones.type = 'custom';
        // sound.tones.waveRange = [0.5, 1, 0.5, 0, 0.5, 1, 0.5, 0, 0.5];
        // sound.tones.wave = sound.tonesWave;
        sound.wv();
        sound.tones.play(sound.keys[key], sound.getKeyOctave(key)+1);
    }
  },
  keyUp: function(e){
    var key = e.keyCode || e.which;
    //console.log(key);
    var ck = sound.currentKeys.indexOf(key);
    sound.currentKeys.splice(ck, 1);
  },
  wv: function(){
    sound.tones.volume = 1;
    sound.tones.attack = 1;
    sound.tones.release = 600;
    sound.tones.type = 'custom';
    sound.tones.waveRange = [-50, -80, -50, 0, 50, 150, 80, 0.5, 1, 0.5, 0, 0.5, 1, 0.5, 0, 0.5, Math.PI, Math.PI*2, Math.PI*3, Math.PI*6];
    sound.tones.wave = sound.tonesWave;
  },
  pulse: function(i, j){
    // sound.tones.volume = 1;
    // sound.tones.attack = 100;
    // sound.tones.release = 600;
    // sound.tones.type = 'square';
    //tones.waveRange = [-50, -80, -50, 0, 50, 150, 80, 0.5, 1, 0.5, 0, 0.5, 1, 0.5, 0, 0.5, Math.PI, Math.PI*2, Math.PI*3, Math.PI*6];
    //tones.wave = this.tonesWave;
    sound.wv();
    sound.tones.play(this.grid[j], j);
  },
  getKeyOctave: function(key){
    var res;
    sound.octaves.forEach(function(octave, i){
      if (octave.indexOf(key) !== -1) res = i;
    });
    return res;
  },
  tonesWave: function(t){
    //f = (sin(2*pi*x/0.8)+cos(2*pi*x/0.5))/(2*pi);
    return (Math.sin(2*t*Math.PI/0.8)+Math.cos(2*t/0.5))/2*Math.PI;
  },
};
if ( typeof module === 'object' ) {

	module.exports = sound;

}
