﻿var renderer, scene, camera;
var nodes = new Array();

var cubeMaterial = new THREE.MeshFaceMaterial();
var textMaterial;
var textRedMaterial;

var lineMaterials = new Array();
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0x222222 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0x333333 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0x444444 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0x555555 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0x666666 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0x777777, linewidth:2 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0x888888, linewidth:2 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0x999999, linewidth:2 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0xAAAAAA, linewidth:2 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0xBBBBBB, linewidth:2 } ));
lineMaterials.push(new THREE.LineBasicMaterial( { color: 0xCCCCCC, linewidth:3 } ));

var v = new THREE.Vector3();

var repulsiveForce = 0.2;
var attractiveForce = 0.00002;

var postprocessing = { enabled: true };

function initArtistGraph() {

	if ( !Detector.webgl ) {
		Detector.addGetWebGLMessage({ parent: document.getElementById('scene')});
		return;
	}

	var $scene = $('#scene');
	var $container = $('#sceneContainer');
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize($container.width(),$container.height());
	$scene.append(renderer.domElement);
	
	camera = new THREE.TrackballCamera({

		fov: 45, 
		aspect: window.innerWidth / window.innerHeight,
		near: 0.1,
		far: 10000,

		rotateSpeed: 1.0,
		zoomSpeed: 1.2,
		panSpeed: 0.2,

		noZoom: false,
		noPan: false,

		staticMoving: false,
		dynamicDampingFactor: 0.3,

		minDistance: 50,
		maxDistance: 10000,

		domElement: renderer.domElement

	});

	camera.position.z = 350;
	camera.position.x = 100;
	
	var path = "../resources/skybox/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];
	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	
	textMaterial = new THREE.MeshLambertMaterial( { color: 0xffffaa, envMap: reflectionCube } );
	textRedMaterial = new THREE.MeshLambertMaterial( { color: 0xff5555, envMap: reflectionCube } );
	
	initScene();
	
	initPostprocessing();
	renderer.autoClear = false;
	
	animate();
}

function initScene() {
	scene = new THREE.Scene();
	
	var pointLight = new THREE.PointLight( 0xFFFFFF );
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 1030;
	scene.addLight(pointLight);
	
	var pointLight = new THREE.PointLight( 0xFFFFFF );
	pointLight.position.x = 500;
	pointLight.position.y = 500;
	pointLight.position.z = -500;
	scene.addLight(pointLight);
	
	nodes = new Array();
}

function initPostprocessing() {
	 
	postprocessing.scene = new THREE.Scene();

	postprocessing.camera = new THREE.Camera();
	postprocessing.camera.projectionMatrix = THREE.Matrix4.makeOrtho( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	postprocessing.camera.position.z = 100;

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	postprocessing.rtTexture1 = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
	postprocessing.rtTexture2 = new THREE.WebGLRenderTarget( 512, 512, pars );
	postprocessing.rtTexture3 = new THREE.WebGLRenderTarget( 512, 512, pars );

	var screen_shader = THREE.ShaderExtras.screen;
	var screen_uniforms = THREE.UniformsUtils.clone( screen_shader.uniforms );

	screen_uniforms["tDiffuse"].texture = postprocessing.rtTexture1;
	screen_uniforms["opacity"].value = 1.0;

	postprocessing.materialScreen = new THREE.MeshShaderMaterial( {

		uniforms: screen_uniforms,
		vertexShader: screen_shader.vertexShader,
		fragmentShader: screen_shader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true

	} );

	var convolution_shader = THREE.ShaderExtras.convolution;
	var convolution_uniforms = THREE.UniformsUtils.clone( convolution_shader.uniforms );

	postprocessing.blurx = new THREE.Vector2( 0.001953125, 0.0 ),
	postprocessing.blury = new THREE.Vector2( 0.0, 0.001953125 );

	convolution_uniforms["tDiffuse"].texture = postprocessing.rtTexture1;
	convolution_uniforms["uImageIncrement"].value = postprocessing.blurx;
	convolution_uniforms["cKernel"].value = THREE.ShaderExtras.buildKernel( 4.0 );

	postprocessing.materialConvolution = new THREE.MeshShaderMaterial( {

		uniforms: convolution_uniforms,
		vertexShader:   "#define KERNEL_SIZE 25.0\n" + convolution_shader.vertexShader,
		fragmentShader: "#define KERNEL_SIZE 25\n"   + convolution_shader.fragmentShader

	} );

	postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ), postprocessing.materialConvolution );
	postprocessing.quad.position.z = -500;
	postprocessing.scene.addObject( postprocessing.quad );

}

function getRootNode(_screenName) {
	createNode(_screenName);
	
	theViewport.setLoading(true);
	
	$.ajax({
		url: 'http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=' + _screenName + '&api_key=17033506c053ed85b1e3cc72711ce0a2&format=json',
		dataType: 'jsonp',
		timeout: 15000,
		success: function(data) {
			theViewport.setLoading(false);
			if(data.similarartists) {
				$.each(data.similarartists.artist, function(i) {
					createNode(this.name, this.match, 0);
				});
				
				var store = Ext.data.StoreManager.lookup('artistStore');
				store.loadData(nodes.slice());
				store.sort('screenName', 'ASC');
				
			} else {
				Ext.Msg.alert('Error', 'Could not get artist ' + _screenName + ' from Last.fm.');
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			theViewport.setLoading(false);
			Ext.Msg.alert('Error', 'Could not get artist ' + _screenName + ' from Last.fm.');
		}
	});
}

function getArtistData(_screenName) {
	var nodeIndex = getNodeIndexByScreenName(_screenName);
	if(nodeIndex != -1) {
		theViewport.setLoading(true);
		$.ajax({
			url: 'http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=' + _screenName + '&api_key=17033506c053ed85b1e3cc72711ce0a2&format=json',
			dataType: 'jsonp',
			timeout: 15000,
			success: function(data) {
				theViewport.setLoading(false);
				if(data.similarartists) {
					$.each(data.similarartists.artist, function(i) {
						var newNodeIndex = getNodeIndexByScreenName(this.name);
						if(newNodeIndex == -1) {
							createNode(this.name, this.match, nodeIndex);
						} else {
							createFollow(nodes[newNodeIndex], nodeIndex, this.match);
						}
					});
					
					var store = Ext.data.StoreManager.lookup('artistStore');
					store.loadData(nodes.slice());
					store.sort('screenName', 'ASC');
					
				} else {
					Ext.Msg.alert('Error', 'Could not get artist ' + _screenName + ' from Last.fm.');
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				theViewport.setLoading(false);
				Ext.Msg.alert('Error', 'Could not get artist ' + _screenName + ' from Last.fm.');
			}
		});
	} else {
		Ext.Msg.alert('Warning', 'An artist with name ' + _screenName + ' does not exist in your graph.');
	}
}

function animate() {

	//calculate speed for every node
	for(var i = 0; i < nodes.length; i++) {
		//repulsion beetwen all nodes
		for(var j = 0; j < nodes.length; j++) {
			if(i != j) {
				doRepulsion(nodes[i], nodes[j]);
			}
		}
		
		//attraction between followed nodes
		var follows = nodes[i].follows;
		if(follows.length > 0) {
			for(var j = 0; j < follows.length; j++) {
				doAttraction(nodes[i], nodes[follows[j].index], follows[j].strength);
			}
		}
		
		//attraction between following nodes
		var followers = nodes[i].followers;
		if(followers.length > 0) {
			for(var j = 0; j < followers.length; j++) {
				doAttraction(nodes[i], nodes[followers[j].index], followers[j].strength);
			}
		}
		
	}
	
	//update position for every node
	for(var i = 0; i < nodes.length; i++) {
		nodes[i].speed.multiplyScalar(0.95);
		nodes[i].object.position.addSelf(nodes[i].speed);
		var follows = nodes[i].follows;
		if(follows.length > 0) {
			for(var j = 0; j < follows.length; j++) {
				follows[j].line.geometry.__dirtyVertices = true;
			}
		}
		
	}
	
	renderer.clear();
	 
	if ( postprocessing.enabled ) {

		// Render scene into texture

		renderer.render( scene, camera, postprocessing.rtTexture1, true );

		// Render quad with blured scene into texture (convolution pass 1)

		postprocessing.quad.materials = [ postprocessing.materialConvolution ];

		postprocessing.materialConvolution.uniforms.tDiffuse.texture = postprocessing.rtTexture1;
		postprocessing.materialConvolution.uniforms.uImageIncrement.value = postprocessing.blurx;

		renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTexture2, true );

		// Render quad with blured scene into texture (convolution pass 2)

		postprocessing.materialConvolution.uniforms.tDiffuse.texture = postprocessing.rtTexture2;
		postprocessing.materialConvolution.uniforms.uImageIncrement.value = postprocessing.blury;

		renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTexture3, true );

		// Render original scene with superimposed blur to texture

		postprocessing.quad.materials = [ postprocessing.materialScreen ];

		postprocessing.materialScreen.uniforms.tDiffuse.texture = postprocessing.rtTexture3;
		postprocessing.materialScreen.uniforms.opacity.value = 1.13;

		renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTexture1, false );

		// Render to screen

		postprocessing.materialScreen.uniforms.tDiffuse.texture = postprocessing.rtTexture1;
		renderer.render( postprocessing.scene, postprocessing.camera );

	} else {

		renderer.render( scene, camera );

	}


	requestAnimationFrame( animate );
}

function createNode(screenName, strength, followsIndex) {
	
	var showText = screenName.replace(/[^a-z|0-9|\s]/gi, "_");
	var text = new THREE.Mesh(new THREE.TextGeometry(showText, {size: 5, height: 2, curveSegments: 1}), textMaterial);
	text.position.x = (Math.random()-0.5)*60;
	text.position.y = (Math.random()-0.5)*60;
	text.position.z = (Math.random()-0.5)*60;
	
	var node = {
		id: nodes.length,
		screenName: screenName,
		object: text,
		speed: new THREE.Vector3(),
		follows: [],
		followers: []
	};

	if(followsIndex != null) {
		createFollow(node, followsIndex, strength);
		text.position.addSelf(nodes[followsIndex].object.position);
	}
	scene.addChild(text);
	nodes.push(node);
}

function createFollow(node, followsIndex, strength) {
	var followsNode = nodes[followsIndex]; 
	
	var geometry = new THREE.Geometry();
	geometry.vertices.push( new THREE.Vertex( followsNode.object.position ) );
	geometry.vertices.push( new THREE.Vertex( node.object.position ) );
	
	var lineMaterialIndex = Math.floor(strength*10);
	var line = new THREE.Line(geometry, lineMaterials[lineMaterialIndex]);
	scene.addChild(line);
	
	var strengthFloat = parseFloat(strength);
	
	node.object.scale.addScalar(0.03*strengthFloat);
	node.follows.push({
		index: followsIndex,
		line: line,
		strength: strengthFloat
	});
	
	followsNode.object.scale.addScalar(0.03*strengthFloat);
	followsNode.followers.push({
		index: node.id,
		strength: strengthFloat
	});
}

function setNodeSelected(screenName, selected) {
	var idx = getNodeIndexByScreenName(screenName);
	nodes[idx].object.materials[0] = selected ? textRedMaterial : textMaterial;
}

function getNodeIndexByScreenName(screenName) {
	for(var i = 0; i < nodes.length; i++) {
		if(screenName == nodes[i].screenName) {
			return i;
		}
	}
	return -1;
}

function doRepulsion(nodeMe, nodeOther) {
	v.sub(nodeOther.object.position, nodeMe.object.position);
	
	if(!v.isZero()) {
		//divide by its own length to make strength fade with distance
		var len = v.length();
		v = v.divideScalar(len*len);
		
		v = v.multiplyScalar(nodeOther.object.scale.x)
		
		//apply repulsiveForce
		v = v.multiplyScalar(repulsiveForce);
		
		nodeMe.speed.subSelf(v);
	}
}

function doAttraction(nodeMe, nodeOther, strength) {
	v.sub(nodeOther.object.position, nodeMe.object.position);
	
	if(!v.isZero()) {
		//multiply by its own length to make strength grow with distance
		v = v.multiplyScalar(v.length());
		
		//apply attractiveForce
		v = v.multiplyScalar(attractiveForce);
		
		//apply strength
		v = v.multiplyScalar(strength);
		
		nodeMe.speed.addSelf(v);
	}
}