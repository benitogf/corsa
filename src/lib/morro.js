'use strict';

var morro = {
    velZ: 0,
    velY: 0,
    velX: 0,
    speed: 4,
    friction: 0.38,
    lastJump: 0,
    meshs: [],
    keys: [],
    block: false,
    scale: 5,
    boxes: [],
    planeSize: {
      x: 28,
      z: 28
    },
    init: function(){
      this.meshs = [];
      this.keys = [];
      document.body.addEventListener("keydown", function (e) {
          morro.keys[e.keyCode] = true;
      });
      document.body.addEventListener("keyup", function (e) {
          morro.keys[e.keyCode] = false;
      });
      this.drawFloor();
      this.drawMorro();
      this.drawRocks();
    },
    generateMorphFloor: function( mesh ) {
    	var vertices = [], scale;
    	for ( var i = 0; i < mesh.geometry.vertices.length; i++ ) {
    		vertices.push( mesh.geometry.vertices[ i ].clone() );
        scale = Math.random() * (1.8 - 3.5) + 0.5;
    		//vertices[ vertices.length - 1 ].x *= scale;
    		vertices[ vertices.length - 1 ].y = scale/2;
    		//vertices[ vertices.length - 1 ].z *= scale;
    	}
    	mesh.geometry.morphTargets.push( { vertices: vertices } );
    },
    generateMorphMesh: function( mesh ) {
    	var vertices = [], scale;
    	for ( var i = 0; i < mesh.geometry.vertices.length; i++ ) {
    		vertices.push( mesh.geometry.vertices[ i ].clone() );
    	}
    	mesh.geometry.morphTargets.push( { vertices: vertices } );
    },
    over: function(mesh){
      var boxArea = 5;
      var maxTop = 0;
      render.intersectable.forEach(function(box){
        var collisionHorizontal = morro.collisionHorizontal(mesh, box, boxArea);
        var top = box.position.y+boxArea;
        if  ((collisionHorizontal) && (top > maxTop))
            maxTop = top;
      });
      return maxTop;
    },
    collision: function(mesh){
      var boxArea = 5;
      var collision = false;
      render.intersectable.forEach(function(box){
        var collisionHorizontal = morro.collisionHorizontal(mesh, box, boxArea);
        var collisionVertical = morro.collisionVertical(mesh, box, boxArea);
        collision = (collision) ? true : (collisionHorizontal && collisionVertical);
      });
      return collision;
    },
    collisionHorizontal: function(mesh, box, boxArea){
      return ((mesh.position.x > box.position.x-boxArea) && (mesh.position.x < box.position.x+boxArea) && (mesh.position.z > box.position.z-boxArea) && (mesh.position.z < box.position.z+boxArea));
    },
    collisionVertical: function(mesh, box, boxArea){
      return (mesh.position.y > box.position.y-boxArea) && (mesh.position.y < box.position.y+boxArea);
    },
    drawRocks: function(){
      var boxSize = 7;
      var geometry = new THREE.BoxGeometry( boxSize, boxSize, boxSize );
      var positionBoxes = [
          {x:0, y:boxSize/2, z:0},
          {x:0, y:boxSize, z:0},
          {x:0, y:boxSize/2, z:boxSize},
          {x:boxSize, y:boxSize/2, z:0},
          {x:0, y:boxSize/2, z:boxSize*2},
          {x:0, y:boxSize/2, z:boxSize},
          {x:boxSize, y:boxSize/2, z:boxSize*2}
      ];
      positionBoxes.forEach(function(pb){
           var box = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: '#424242'} ) );
           render.drawBox(box, {x:pb.x,y:pb.y,z:pb.z});
           //morro.boxes.push(box);
      });
    },
    drawFloor: function(){
      var model = render.loader.parse(require('./mesh/plane.json'));
      var material = new THREE.MeshBasicMaterial({
        color:'#960000',
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
    },
    drawMorro: function(model){
      var model = render.loader.parse(require('./mesh/morro.json'));
      var material = new THREE.MeshBasicMaterial({
        color:'#5f5f5f',
        morphTargets: true,
        shading: THREE.SmoothShading
      });
      this.mesh = new THREE.Mesh(model.geometry, material);;
      this.mesh.scale.set(this.scale,this.scale,this.scale);
      this.mesh.position.set(0,2,0);
      this.generateMorphMesh(this.mesh);
      render.static.push(this.mesh);
      render.scene.add(this.mesh);
      this.mesh.updateMorphTargets();
    },
    movement: function(time, mesh){
      var delta = render.clock.getDelta();
      var rotateAngle = Math.PI/ 2* delta;
      if (morro.keys[38] || morro.keys[87]) {
         if (morro.velZ > -morro.speed) {
             morro.velZ--;
         }
         //THREE.AnimationHandler.update( delta );
      }
      if (morro.keys[40] || morro.keys[83]) {
         if (morro.velZ < morro.speed) {
             morro.velZ++;
         }
         //THREE.AnimationHandler.update( delta );
      }
      if (morro.keys[39] || morro.keys[65]) {
         mesh.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
         //THREE.AnimationHandler.update( delta );
      }
      if (morro.keys[37] || morro.keys[68]) {
         mesh.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
         //THREE.AnimationHandler.update( delta );
      }
      if (morro.keys[32] && !morro.block && (time-1000 > morro.lastJump)) {
        morro.block = true;
        morro.lastJump = time;
        morro.velY+=0.7;
        setTimeout(function(){
          morro.block = false;
        }, 500);
      }
      var over = morro.over(mesh);
      if (!morro.block && (mesh.position.y > over)) {
         morro.velY -= 0.5;
      }

      morro.velZ *= morro.friction;
      morro.velX *= morro.friction;
      //morro.velY *= morro.friction;
      mesh.translateZ( -morro.velZ );
      mesh.translateX( -morro.velX );
      mesh.translateY( morro.velY );

      if (morro.collision(mesh)){
         mesh.translateZ( morro.velZ );
         mesh.translateX( morro.velX );
      }

      if(mesh.position.y < over) {
        mesh.position.y = over;
        morro.velY = 0;
        }

      if (mesh.position.z > morro.planeSize.z) {
        mesh.position.z = morro.planeSize.z;
      } else if(mesh.position.z < -morro.planeSize.z) {
        mesh.position.z = -morro.planeSize.z;
      }
      if (mesh.position.x > morro.planeSize.x) {
        mesh.position.x = morro.planeSize.x;
      } else if(mesh.position.x < -morro.planeSize.x) {
        mesh.position.x = -morro.planeSize.x;
      }
    },
    intersect: function(intersects){
      if (intersects.length > 0)
         intersects[ 0 ].object.material.color.set('#292929');
    },
    update: function(time){
      var freq = 80;
      var times = time * 0.001; //to seconds
      var rotateAngle = Math.sin(Math.PI/2+times);
      var relativeCameraOffset = new THREE.Vector3(0,0,-1);
      var cameraOffset = relativeCameraOffset.applyMatrix4( morro.mesh.matrixWorld );
      render.camera.position.x = cameraOffset.x;
      render.camera.position.y = cameraOffset.y+20;
      render.camera.position.z =  cameraOffset.z+25;
      render.camera.lookAt( morro.mesh.position );
      morro.floor.morphTargetInfluences[ 0 ] = rotateAngle;
      morro.mesh.morphTargetInfluences[ 0 ] = rotateAngle;
      render.intersectable.forEach(function(box){
        box.material.color.set('#424242');
      });
      this.intersect(render.intersects);
      morro.movement(time, morro.mesh);
    }
};
if ( typeof module === 'object' ) {

	module.exports = morro;

}
