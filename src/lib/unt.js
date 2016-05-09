'use strict';

var unt = {
    scale: 5,
    init: function(){
      this.drawSome();
      this.drawMore();
    },
    generateMorphMesh: function( mesh ) {
    	var vertices = [], scale;
    	for ( var i = 0; i < mesh.geometry.vertices.length; i++ ) {
    		vertices.push( mesh.geometry.vertices[ i ].clone() );
    	}
    	mesh.geometry.morphTargets.push( { vertices: vertices } );
    },
    generateMorphFloor: function( mesh ) {
    	var vertices = [], scale;
    	for ( var i = 0; i < mesh.geometry.vertices.length; i++ ) {
    		vertices.push( mesh.geometry.vertices[ i ].clone() );
        scale = Math.random() * (0.3 - 0.6) + 0.2;
    		//vertices[ vertices.length - 1 ].x *= scale;
    		vertices[ vertices.length - 1 ].y = scale/2;
    		//vertices[ vertices.length - 1 ].z *= scale;
    	}
    	mesh.geometry.morphTargets.push( { vertices: vertices } );
    },
    drawMore: function(){
      var model = render.loader.parse(require('./mesh/untitled2.json'));
      var material = new THREE.MeshPhongMaterial({
        color:'#363636',
        side: THREE.DoubleSide,
        overdraw: 2,
        morphTargets: true,
        opacity: 0.5,
        transparent: false,
        shading: THREE.SmoothShading
      });
      this.circle = new THREE.Mesh(model.geometry, material);
      this.circle.scale.set(this.scale,this.scale,this.scale);
      this.circle.rotation.x = 0;
      this.circle.position.set(0,2,0);
      this.generateMorphMesh(this.circle);
      render.scene.add(this.circle);
      render.static.push(this.circle);
      this.circle.updateMorphTargets();
    },
    drawSome: function(){
      var model = render.loader.parse(require('./mesh/untitled.json'));
      var material = new THREE.MeshPhongMaterial({
        color:'#24bfff',
        side: THREE.DoubleSide,
        overdraw: 2,
        morphTargets: true,
        opacity: 0.5,
        transparent: true,
        shading: THREE.SmoothShading
      });
      this.floor = new THREE.Mesh(model.geometry, material);
      this.floor.scale.set(this.scale,this.scale,this.scale);
      this.floor.rotation.x = 0;
      this.floor.position.set(0,2,0);
      this.generateMorphFloor(this.floor);
      render.scene.add(this.floor);
      render.static.push(this.floor);
      this.floor.updateMorphTargets();
      render.camera.position.x = 0;
      render.camera.position.y = 45;
      render.camera.position.z = 55;
      render.camera.lookAt( {x:0, y:0, z:0} );
      render.renderer.setClearColor( 0x000, 1 );
      // var relativeCameraOffset = new THREE.Vector3(0,0,-1);
      // var cameraOffset = relativeCameraOffset.applyMatrix4( unt.floor.matrixWorld );
      // render.camera.position.x = cameraOffset.x;
      // render.camera.position.y = cameraOffset.y+200;
      // render.camera.position.z =  cameraOffset.z+205;
      // render.camera.lookAt( unt.floor );
    },
    update: function(time){
      var freq = 80;
      var times = time * 0.001; //to seconds
      var rotateAngle = Math.sin(Math.PI/2+times);
      unt.floor.morphTargetInfluences[ 0 ] = rotateAngle;
    }
};
if ( typeof module === 'object' ) {

	 module.exports = unt;

}
