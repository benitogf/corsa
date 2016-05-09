'use strict';

var synth = {
    color: {
      box: 0x4D4D4D,
      activeLine: 0x363636,
      intersect: 0x00ffcc,
      remove: 0xff0000
    },
    init: function(step, size) {
      this.step = step;
      this.size = size;
      this.area = {
        x: synth.step * synth.size.x,
        z: synth.step * synth.size.z
      };
      this.end = {
        x: synth.area.x/2,
        z: synth.area.z/2
      };
      this.start = {
         x: synth.area.x/2*-1,
         z: synth.area.z/2*-1,
      };
      this.initBoxes();
      this.drawGrid();
    },
    initBoxes: function(){
      var i = 0,
          j = 0;
      this.boxes = [];
      this.control = {
        x: [],
        z: []
      };
      this.jumpLine = 0;
      this.lastJump = 0;
      for ( var x = this.start.x; x <= this.end.x; x += this.step ) {
        this.boxes[i] = [];
        j = 0;
        for ( var z = this.start.z; z <= this.end.z; z += this.step ) {
           this.boxes[i][j] = {
             position: {
               x: x,
               y: 0,
               z: z
             },
             coords: {
               i: i,
               j: j
             }
           };
          j++;
        }
        i++;
      }
    },
    generateMorphTargets: function( mesh ) {
      var vertices = [], scale;
      for ( var i = 0; i < mesh.geometry.vertices.length; i++ ) {
        vertices.push( mesh.geometry.vertices[ i ].clone() );
        scale = 1 + Math.random() * 0.5;
        //vertices[ vertices.length - 1 ].x *= scale;
        vertices[ vertices.length - 1 ].y = scale/2;
        //vertices[ vertices.length - 1 ].z *= scale;
      }
      mesh.geometry.morphTargets = [];
      mesh.geometry.morphTargets.push( { vertices: vertices } );
      //mesh.geometry.update
    },
    drawPulse: function(box){
      var size = synth.step - 25;
      var geometry = new THREE.BoxGeometry(size,size,size);
      var material = new THREE.MeshPhongMaterial({
        color: synth.color.intersect,
        side: THREE.DoubleSide,
        overdraw: 1,
        morphTargets: true,
        opacity: 0.9,
        transparent: true,
        shading: THREE.SmoothShading
      });
      var mesh = new THREE.Mesh(geometry, material);
      mesh.grid = box.grid;
      mesh.pulse = true;
      synth.generateMorphTargets(mesh);
      render.drawBox(mesh, { x: box.position.x, y: box.position.y+size, z: box.position.z });
      mesh.updateMorphTargets();
      return mesh;
    },
    drawControls: function(box, geometry){
      var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: synth.color.box} ));
      var pos = {
        x: box.position.x - (synth.step * 2),
        y: box.position.y,
        z: box.position.z
      };
      render.drawBox(mesh, pos);
      synth.control.x.push(mesh);
    },
    drawGrid: function(){
      var geometry = new THREE.BoxGeometry( synth.step, synth.step, synth.step );
      synth.boxes.forEach(function(line, i){
         line.forEach(function(box, j){
           if (i === 0) {
              synth.drawControls(box, geometry);
           }
           if (j === line.length-1) {
           var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: synth.color.box} ));
           var pos = {
             x: box.position.x,
             y: box.position.y,
             z: box.position.z + (synth.step * 2)
           };
           render.drawBox(mesh, pos);
           synth.control.z.push(mesh);
           }
           var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: synth.color.box} ));
           render.drawBox(mesh, box.position);
           mesh.grid = box;
           box.mesh = mesh;
        });
      });
    },
    clickBox: function(pulse){
      if (pulse.grid) {
         var box = synth.boxes[pulse.grid.coords.i][pulse.grid.coords.j];
         if (!box.pulse)
            box.pulse = synth.drawPulse(pulse);
         else {
            render.clearBox(box.pulse);
            delete box.pulse;
          }
      } else {
        console.log('c');
      }
    },
    intersect: function(intersects){
      if ((intersects.length > 0) && intersects[ 0 ].object.grid) {
        var box = this.boxes[intersects[ 0 ].object.grid.coords.i][intersects[ 0 ].object.grid.coords.j];
        if (box.pulse)
           box.pulse.material.color.set(0xf0f0f0);
        box.mesh.material.color.set(0xf0f0f0);
      } else {
        if (intersects.length > 0)
           intersects[ 0 ].object.material.color.set(0xf0f0f0);
      }
    },
    update: function(time) {
      render.camera.position.x = 0;
      render.camera.position.z = 600;
      render.camera.position.y = 700;
      render.camera.rotation.x = -1;
      render.camera.lookAt( {x:0, y:0, z:0} );
      var freq = 80;
      var times = time * 0.001; //to seconds
      var rotateAngle = Math.sin(Math.PI/2+this.jumpLine);   // pi/2 radians (90 degrees) per second
      this.boxes.forEach(function(line, i){
        line.forEach(function(box, j){
          if (box.pulse){
            box.pulse.material.color.set( synth.color.intersect );
            if ( ( synth.lastJump+freq <= time ) && (i === synth.jumpLine) ){
                  box.pulsing = true;
                  sound.pulse(i, j);
                setTimeout(function(){
                  box.pulsing = false;
                  if (box.pulse)
                     box.pulse.morphTargetInfluences[ 0 ] = 0;
                }, freq*3);
            }
            if (box.pulsing)
               box.pulse.morphTargetInfluences[ 0 ] = rotateAngle;
          }
          if ( i === synth.jumpLine )
             box.mesh.material.color.set(synth.color.activeLine);
          else
             box.mesh.material.color.set(synth.color.box);
        });
      });
      this.control.x.forEach(function(box){
        box.material.color.set(synth.color.box);
      });
      this.control.z.forEach(function(box){
        box.material.color.set(synth.color.box);
      });
      this.intersect(render.intersects);
      if ( this.lastJump+freq <= time) {
         this.lastJump = time;
         if (this.jumpLine > this.size.x)
            this.jumpLine = 0;
          else
            this.jumpLine++;
      }
    }
};
if ( typeof module === 'object' ) {

	module.exports = synth;

}
