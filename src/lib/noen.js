'use strict';

var noen = {
    scale: 3,
    uniform: {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() }
    },
    init: function(){
      this.drawModel(render.loader.parse(require('./mesh/plane.json')));
      this.mesh.rotation.x = 0;
    },
    generateMorphTargetsW: function( mesh, freq, magnitude ) {
    	var vertices = [], scale;
      //console.log(freqByteData.length);
      // if (freq[0] > 0)
      //   console.log(freq);
    	for ( var i = 0; i < mesh.geometry.vertices.length; i++ ) {
    		vertices.push( mesh.geometry.vertices[ i ].clone() );
        //console.log(freqByteData[i]);
        var fq = (!!freq[i]) ? freq[i] * freq[i] : Math.random() * Math.cos(magnitude);
    		scale =  Math.random() * (fq - magnitude) + magnitude * fq;
    		//vertices[ vertices.length - 1 ].x = Math.sin(scale);
    		vertices[ vertices.length - 1 ].y *= fq + scale*scale;
    		//vertices[ vertices.length - 1 ].z = Math.sin(fq);
    	}
      //mesh.geometry.morphTargets = [];
    	mesh.geometry.morphTargets.push( { vertices: vertices } );
      //mesh.geometry.update
    },
    drawModel: function(model){
      // var material = new THREE.ShaderMaterial({
      //     uniforms: noen.uniform,
      // 		vertexShader: THREE.Shaders['vertex-shader'].vertexShader,
      // 		fragmentShader: THREE.Shaders['fragment-shader'].fragmentShader,
      //     morphTargets: true,
      //     morphNormals: true,
      //     wireframe: true
      // 	});
      var material = new THREE.MeshBasicMaterial({
        color:'#1e1e1e',
        morphTargets: true,
        wireframe: true
      });
      this.mesh = new THREE.Mesh(model.geometry, material);
      this.mesh.scale.set(this.scale,this.scale,this.scale);
      //console.log(this.mesh.geometry.morphTargets);
      render.drawBox(this.mesh, {x:0,y:0,z:0});
    },
    update: function(time){
      var times = time * 0.001; //to seconds
      var relativeCameraOffset = new THREE.Vector3(0,0,-1);
      var cameraOffset = relativeCameraOffset.applyMatrix4( noen.mesh.matrixWorld );
      var magnitude = 0;
      var delta = render.clock.getDelta();
		  noen.uniform.time.value += delta * 2;
      var freqByteData = [];
      if (!!sound.tones.analyser) {
        freqByteData = new Uint8Array(sound.tones.analyser.frequencyBinCount);
        sound.tones.analyser.getByteFrequencyData(freqByteData);
        //sound.tones.analyser.fftSize = 256;
        //var bufferLength = sound.tones.analyser.frequencyBinCount;
        //console.log(bufferLength);
        //dataArray = new Float32Array(bufferLength);
        //sound.tones.analyser.getFloatFrequencyData(dataArray);
        //console.log(dataArray);
        freqByteData = freqByteData.slice(0,99);
        freqByteData.forEach(function(fq){
          magnitude += fq;
        });
      }
      //console.log(freq);
      var aux = Math.PI+magnitude/2+delta;
      var rotateAngle = Math.random() * (Math.cos(aux) * Math.sin(aux));
      noen.generateMorphTargetsW(render.target.mesh, freqByteData, rotateAngle);
      noen.mesh.updateMorphTargets();
      noen.mesh.morphTargetInfluences[ 0 ] = magnitude/1000;
      render.camera.position.x = cameraOffset.x;
      render.camera.position.y = cameraOffset.y+40;
      render.camera.position.z =  cameraOffset.z+50;
      render.camera.lookAt( render.target.mesh.position );
    }
};
if ( typeof module === 'object' ) {

	module.exports = noen;

}
