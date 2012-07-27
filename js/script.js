	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	
	/******
	*
	* SCENE 
	*
	*******/
	
	
	// set the scene size
	var WIDTH = window.innerWidth,
	    HEIGHT = window.innerHeight;

	// set some camera attributes
	var VIEW_ANGLE = 45,
	    ASPECT = WIDTH / HEIGHT,
	    NEAR = 0.1,
	    FAR = 10000;

	var scene = new THREE.Scene();
	
	
	/******
	*
	* RENDERER 
	*
	*******/

	// create a WebGL renderer, camera
	// and a scene
	var renderer = new THREE.WebGLRenderer({ antialias: true } );
	// start the renderer
	renderer.sortObjects = false;
	renderer.setSize(WIDTH, HEIGHT);

	// get the DOM element to attach to
	// - assume we've got jQuery to hand
	var $container = $('#container');
	// attach the render-supplied DOM element
	$container.append(renderer.domElement);
	
	/******
	*
	* CAMERA
	*
	*******/


	var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
	                                ASPECT,
	                                NEAR,
	                                FAR  );
	// the camera starts at 0,0,0 so pull it back
	camera.position.z = 1000;
	// and the camera
	scene.add(camera);

	// create a camera contol
	controls = new THREE.TrackballControls(camera);
	controls.target.set( 0, 0, 0 );

				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;

				controls.noZoom = false;
				controls.noPan = false;

				controls.staticMoving = false;
				controls.dynamicDampingFactor = 0.15;

				controls.keys = [ 65, 83, 68 ];
	
	// Reflection Camera		
	mirrorCubeCamera = new THREE.CubeCamera( NEAR, FAR, 512);
	mirrorCubeCamera.position.z = 0;
	mirrorCubeCamera.position.x = 0;
	mirrorCubeCamera.position.y = 0;
				
    /******
	*
	* CENTRAL AXIS MARKER
	*
	*******/

	var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(
        v(-100, 0, 0), v(100, 0, 0),
        v(0, -100, 0), v(0, 100, 0),
        v(0, 0, -100), v(0, 0, 100)
    );
    var lineMat = new THREE.LineBasicMaterial({
        color: 0x000000, lineWidth: 1});
    var line = new THREE.Line(lineGeo, lineMat);
    line.type = THREE.Lines;
    
    
    /******
	*
	* PLANE (FLOOR) 
	*
	*******/

	// Add plane
	var planeGeo = new THREE.PlaneGeometry(1000, 1000, 40, 40);
  	var planeMat = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
  	var plane = new THREE.Mesh(planeGeo, planeMat);
 	plane.rotation.x = 0;
  	plane.position.y = -200;
  	plane.receiveShadow = true;
  	plane.doubleSided = true;
  	
  	
  	/******
	*
	* SHAPES
	*
	*******/
	
	// MATERIALS
    var sphereMaterial = new THREE.MeshLambertMaterial(
        {
            color: 0xFFFFFF
        });

    var cubeGeom = new THREE.CubeGeometry(1000, 1000, 40, 40, 1, 1);
    var mirrorCubeMaterial = new THREE.MeshBasicMaterial( { envMap: mirrorCubeCamera.renderTarget } );


    // SPHERE object for ease
  	var Sphere = function(radius, segments, rings, material){
  		var shape = new THREE.Mesh( new THREE.SphereGeometry(radius, segments, rings), material);
  	    var pos = function(x,y,z){
  			shape.position.x = x;
  			shape.position.y = y;
  			shape.position.z = z;
  		};
  		var create = function(){

  			scene.add(shape);
  		};
        return {
            shape: shape,
            pos: pos,
            create: create
        }


  	};
  	
    // set up the sphere vars
    var segments = 400, rings = 32;

  	var sphere = new Sphere(50, segments, rings, mirrorCubeMaterial);
  	sphere.pos(0,40,0);
  	
  	
  	// Cube
    var litCube = new THREE.Mesh(
        new THREE.CubeGeometry(50, 50, 50),
        new THREE.MeshLambertMaterial({color: 0x00E0FF}));
      litCube.position.x = 100;
      
      
    // Wire cube

	  var wireMat = new THREE.MeshLambertMaterial({color: 0xFFFFFF, wireframe: true});
	  var meshCube = new THREE.Mesh(
	  new THREE.CubeGeometry(500,500,500, 4,4,4), // 10 segments
	  wireMat
	);
    meshCube.position.y = 50;
    
    /******
    *
    * MODELS
    *
    *******/
    
	var dae, skin;
	var st = 0;
	
	var mesh;
	var loaderH = new THREE.JSONLoader( true );
	loaderH.load( "models/horse.js", function( geometry ) {
		
		mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xFFFFFF, morphTargets: true } ) );
		mesh.scale.set( 1, 1, 1);
		mesh.position.y = -200;

		// Initialise and then animate the 3D scene
		// since we have now successfully loaded the model:
		init();
		animate();
	} );
    
    
    /******
	*
	* Lights
	*
	*******/
	
	// add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x555555);
    
    
    // Add light marker
	var spotdot = new Sphere(10, segments, rings, sphereMaterial);
    spotdot.pos(400,400,0);
    

	var light = new THREE.SpotLight();
      light.position.set( 400, 400, 0 );
      

      // enable shadows on the renderer
      renderer.shadowMapEnabled = true;

      // enable shadows for a light
      light.castShadow = true;

      // enable shadows for an object
      litCube.castShadow = true;
      litCube.receiveShadow = true;
      sphere.shape.castShadow = true;
      sphere.shape.receiveShadow =true;
    
    /******
	*
	* FUNCTIONS
	*
	*******/
	
	function init(){
		scene.add( mirrorCubeCamera );
		scene.add(line);
		scene.add(plane);
		// Add the loaded model to the scene:
		scene.add(dae);
		scene.add(mesh);
		sphere.create();
		scene.add(litCube);
		scene.add(meshCube);
		scene.add(ambientLight);
		spotdot.create();
		scene.add(light);
	}
	
	var duration = 1000;
	var keyframes = 15, interpolation = duration / keyframes;
	var lastKeyframe = 0, currentKeyframe = 0;
    function animate(){
		requestAnimationFrame(animate);
		
		if ( st > 30 ) st = 0;
		if ( skin ) {
            for ( var i = 0; i < skin.morphTargetInfluences.length; i++ ) {
              skin.morphTargetInfluences[ i ] = 0;
            }
            skin.morphTargetInfluences[ Math.floor( st ) ] = 1;
            st += 0.5;
          }
        
        if ( mesh ) {

					// Alternate morph targets

					var time = Date.now() % duration;

					var keyframe = Math.floor( time / interpolation );

					if ( keyframe != currentKeyframe ) {

						mesh.morphTargetInfluences[ lastKeyframe ] = 0;
						mesh.morphTargetInfluences[ currentKeyframe ] = 1;
						mesh.morphTargetInfluences[ keyframe ] = 0;

						lastKeyframe = currentKeyframe;
						currentKeyframe = keyframe;

						//console.log( mesh.morphTargetInfluences );

					}

					mesh.morphTargetInfluences[ keyframe ] = ( time % interpolation ) / interpolation;
					mesh.morphTargetInfluences[ lastKeyframe ] = 1 - mesh.morphTargetInfluences[ keyframe ];

				}
		render(new Date().getTime());
	}

	function render(time){

		litCube.position.x = Math.cos(time/600)*85;
  		litCube.position.y = 50-Math.sin(time/900)*25;
  		litCube.position.z = Math.sin(time/600)*85;
  		litCube.rotation.x = time/200;
  		litCube.rotation.y = time/400;

        sphere.shape.visible = false;
        mirrorCubeCamera.updateCubeMap( renderer, scene );
        sphere.shape.visible = true;

  		controls.update();
       	renderer.render(scene, camera);
	}

	function v(x,y,z){
        return new THREE.Vector3(x,y,z);
      }