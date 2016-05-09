'use strict';

var THREE = window.THREE = require('three');
THREE.Shaders = window.THREE.Shaders = require('./shaders');
var render = {
    init: function(){
      this.intersectable = [];
      this.static = [];
      this.keys = [];
      this.intersects = [];
      if (!document.getElementById('render')) {
         if (!navigator.cancelAnimationFrame)
           navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
         if (!navigator.requestAnimationFrame)
           navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
         this.raycaster = new THREE.Raycaster();
         this.mouse = new THREE.Vector2();
         this.scene = new THREE.Scene();
         this.renderer = new THREE.WebGLRenderer();
         this.loader = new THREE.JSONLoader();
         this.clock =  new THREE.Clock();
         this.renderer.domElement.id = 'render';
         document.getElementById('content').appendChild( this.renderer.domElement );
         var aspect = this.renderer.context.canvas.clientWidth / this.renderer.context.canvas.clientHeight;
         console.log(aspect);
         var ratio = (aspect > 1) ? aspect*40 : aspect*125;
         console.log(ratio);
         this.camera = new THREE.PerspectiveCamera( ratio, this.renderer.context.canvas.clientWidth / this.renderer.context.canvas.clientHeight, 1, 10000 );
         this.initLights();
         this.renderer.domElement.addEventListener( 'mousemove', this.onMouseMove, false );
         this.renderer.domElement.addEventListener( 'click', this.onClick, false );
         }
      this.renderer.setClearColor( 0x363636, 1 );
      this.renderer.domElement.style.display = 'block';
      this.animateId = requestAnimationFrame(render.animate);
    },
    resizeGlToDisplaySize: function (gl, camera){
      var realToCSSPixels = window.devicePixelRatio || 1;
      // Lookup the size the browser is displaying the canvas in CSS pixels
      // and compute a size needed to make our drawingbuffer match it in
      // device pixels.
      var displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
      var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);
      // Check if the canvas is not the same size.
      if (gl.canvas.width  != displayWidth ||
          gl.canvas.height != displayHeight) {
        // Make the canvas the same size
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;
        camera.aspect = displayWidth / displayHeight;
        // Set the viewport to match
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      }
    },
    drawBox: function(mesh, pos){
      this.intersectable.push(mesh);
      mesh.position.set(pos.x,pos.y,pos.z);
      this.scene.add(mesh);
    },
    clearBox: function(box){
      var ind = false;
      render.intersectable.forEach(function(obj, i){
        if (obj.uuid === box.uuid)
           ind = i;
      });
      if (ind) {
         render.intersectable.splice(ind, 1);
         render.scene.remove(box);
      }
    },
    clear: function(){
      if (render.intersectable) {
         render.intersectable.forEach(function(obj){
           render.scene.remove(obj);
         });
         render.static.forEach(function(obj){
           render.scene.remove(obj);
         });
         render.intersectable = [];
         cancelAnimationFrame(render.animateId);
         delete render.target;
         this.renderer.domElement.style.display = 'none';
         //console.log('clear');
         }
    },
    initLights: function() {
      var ambientLight = new THREE.AmbientLight( 0xffffff );
      render.scene.add( ambientLight );
      // var lights = [];
      // lights[0] = new THREE.PointLight( '#ffffff', 1, 0 );
      // lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
      // lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
      // lights[0].position.set( 0, 200, 0 );
      // lights[1].position.set( 100, 200, 100 );
      // lights[2].position.set( -100, -200, -100 );
      // render.scene.add( lights[0] );
      // render.scene.add( lights[1] );
      // render.scene.add( lights[2] );
    },
    onMouseMove: function ( event ) {
      event.preventDefault();
      render.mouse.x = ( event.clientX / render.renderer.context.canvas.clientWidth ) * 2 - 1;
      render.mouse.y = - ( event.clientY / render.renderer.context.canvas.clientHeight ) * 2 + 1;
    },
    onClick: function(event) {
      event.preventDefault();
      if (render.intersects.length > 0 && !!render.target.clickBox)
         render.target.clickBox(render.intersects[ 0 ].object);
    },
    rayInstersect: function(){
      this.raycaster.setFromCamera( this.mouse, this.camera );
      // calculate objects intersecting the picking ray
      this.intersects = this.raycaster.intersectObjects( this.intersectable );
    },
    animate: function(now){
      render.rayInstersect();
      if (!!render.target)
         render.target.update(now);
      render.resizeGlToDisplaySize(render.renderer.context, render.camera);
      render.camera.updateProjectionMatrix();
      render.renderer.render( render.scene, render.camera );
      render.animateId = requestAnimationFrame( render.animate );
    }
};
if ( typeof module === 'object' ) {

	module.exports = render;

}
