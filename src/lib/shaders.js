'use strict';

var shaders = [];

shaders[ 'vertex-shader' ] = {
	vertexShader: [
		'varying vec2 vUv;',
		'void main()',
			'{',
				'vUv = uv;',
				'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
				'gl_Position = projectionMatrix * mvPosition;',
			'}'
	].join( '\n' )
}

shaders[ 'fragment-shader' ] = {
	fragmentShader: [
		'uniform float time;',
		'uniform vec2 resolution;',
		'varying vec2 vUv;',
		'void main( void ) {',
			'vec2 position = vUv;',
			'float color = 0.0;',
			'color += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );',
			'color += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );',
			'color += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );',
			'color *= sin( time / 10.0 ) * 0.5;',
			'gl_FragColor = vec4( vec3( color, color * 0.5, sin( color + time / 3.0 ) * 0.75 ), 1.0 );',
		'}'
	].join( '\n' )
}

shaders[ 'triangle-vertex-shader' ] = {
	vertexShader: [
		'attribute vec2 a_position;',
    'uniform mat3 u_matrix;',
    'varying vec2 v_position;',
		'void main (void) {',
			'gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);',
			'v_position = a_position;',
		'}'
	].join( '\n' )
};
shaders[ 'triangle-fragment-shader' ] = {
	fragmentShader: [
  'precision mediump float;',
  'varying vec2 v_position;',
  'uniform float u_time;',
  'float random (float p) {',
    'return fract(cos(p)*1000.);',
  '}',
  'float noise(vec2 p) {',
    'return random(p.x + p.y*1000.);',
  '}',
  'vec2 sw(vec2 p) {return vec2( floor(p.x) , floor(p.y) );}',
  'vec2 se(vec2 p) {return vec2( ceil(p.x)  , floor(p.y) );}',
  'vec2 nw(vec2 p) {return vec2( floor(p.x) , ceil(p.y)  );}',
  'vec2 ne(vec2 p) {return vec2( ceil(p.x)  , ceil(p.y)  );}',
  'float smoothNoise(vec2 p) {',
    'vec2 inter = smoothstep(0., 1., fract(p));',
    'float s = mix(noise(sw(p)), noise(se(p)), inter.x);',
    'float n = mix(noise(nw(p)), noise(ne(p)), inter.x);',
    'return mix(s, n, inter.y);',
    'return noise(nw(p));',
  '}',
  'float movingNoise(vec2 p) {',
    'float total = 0.0;',
    'total += smoothNoise(p     - u_time);',
    'total += smoothNoise(p*2.  + u_time) / 2.;',
    'total += smoothNoise(p*4.  - u_time) / 4.;',
    'total += smoothNoise(p*8.  + u_time) / 8.;',
    'total += smoothNoise(p*16. - u_time) / 16.;',
    'total /= 1. + 1./2. + 1./4. + 1./8. + 1./16.;',
    'return total;',
  '}',
  'float nestedNoise(vec2 p) {',
    'float x = movingNoise(p);',
    'float y = movingNoise(p + 10.);',
    'return movingNoise(p + vec2(x, y));',
  '}',
  'void main() {',
    'vec2 p = v_position / 60.;',
    'float brightness = nestedNoise(p);',
    'gl_FragColor.r = brightness;',
    'gl_FragColor.g = brightness*100.;',
    'gl_FragColor.b = brightness*10.;',
    'gl_FragColor.a = 1.;',
  '}'
	].join( '\n' )
};

if ( typeof module === 'object' ) {

	module.exports = shaders;

}
