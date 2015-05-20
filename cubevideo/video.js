var renderer, scene, camera, texture, video, mesh, skyboxMesh;

var postprocessing = { enabled: true };
var params = { reflection: false, postprocessing_blur: 0.002953125, postprocessing_opacity: 1.13, skybox: true };

$(document).ready(function() {

	if ( !Detector.webgl ) {
		Detector.addGetWebGLMessage({ parent: document.body});
		return;
	}

	var container = $('#scene');
	
	renderer = new THREE.WebGLRenderer();
	container.append( renderer.domElement );
	renderer.setSize(window.innerWidth, window.innerHeight)
	
	camera = new THREE.Camera( 40, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.x = 150;
	camera.position.y = 0;
	camera.position.z = 150;
	
	scene = new THREE.Scene();
	
	var pointLight = new THREE.PointLight( 0xFFFFFF );

	pointLight.position.x = 500;
	pointLight.position.y = 0;
	pointLight.position.z = 1500;

	scene.addLight(pointLight);
	
	var pointLight2 = new THREE.PointLight( 0xFFFFFF );

	pointLight2.position.x = -500;
	pointLight2.position.y = 0;
	pointLight2.position.z = -1500;

	scene.addLight(pointLight2); 
	
	var pointLight3 = new THREE.PointLight( 0xFFFFFF );

	pointLight3.position.x = 0;
	pointLight3.position.y = 1000;
	pointLight3.position.z = -500;

	scene.addLight(pointLight3); 

	video = document.getElementById('video');
	texture = new THREE.Texture( video );
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	
	var path = "../resources/skybox/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];
	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	
	var materialRefl = new THREE.MeshLambertMaterial( { map: texture, envMap: reflectionCube} );
	var material = new THREE.MeshLambertMaterial( { map: texture} );

    mesh = new THREE.Mesh( new THREE.CubeGeometry(50,50,50,1,1,1), material );
    scene.addObject( mesh );
    
    var shader = THREE.ShaderUtils.lib["cube"];
    shader.uniforms["tCube"].texture = reflectionCube; // textureCube has been init before
    var cubeMaterial = new THREE.MeshShaderMaterial({
	    fragmentShader : shader.fragmentShader,
	    vertexShader : shader.vertexShader,
	    uniforms : shader.uniforms
    }); 
    
    skyboxMesh = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000, 1, 1, 1, null, true ), cubeMaterial );
    scene.addObject( skyboxMesh ); 
    
    initPostprocessing();
	renderer.autoClear = false;
	
	var gui = new DAT.GUI({
		height : 5 * 32 - 1
	}); 
	gui.add(postprocessing, 'enabled').name('Postprocessing');
	gui.add(params, 'postprocessing_blur').name('Blur').min(0).max(0.01).step(0.0005).onChange(function(newValue) {
		postprocessing.blurx = new THREE.Vector2( params.postprocessing_blur, 0.0 );
		postprocessing.blury = new THREE.Vector2( 0.0, params.postprocessing_blur );
	});
	gui.add(params, 'postprocessing_opacity').name('Opacity').min(0).max(2).step(0.05);
	gui.add(params, 'reflection').name('Reflection').onChange(function(newValue) {
		mesh.materials[0] = newValue ? materialRefl : material;
	});
	gui.add(params, 'skybox').name('Skybox').onChange(function(newValue) {
		if(newValue) {
			skyboxMesh = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000, 1, 1, 1, null, true ), cubeMaterial );
			scene.addObject( skyboxMesh );
		} else {
			scene.removeObject( skyboxMesh );
		}
	});
    
	animate();
});

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

	postprocessing.blurx = new THREE.Vector2( params.postprocessing_blur, 0.0 );
	postprocessing.blury = new THREE.Vector2( 0.0, params.postprocessing_blur );

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

function animate() {
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) {

		if ( texture ) texture.needsUpdate = true;

	}
	mesh.rotation.y -= 0.01;
	mesh.rotation.x -= 0.005;
	
	var timer = - new Date().getTime() * 0.0002; 
	camera.position.x = 150 * Math.cos( timer );
	camera.position.y = 50 * Math.sin( timer );
	camera.position.z = 150 * Math.sin( timer );
	
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
		postprocessing.materialScreen.uniforms.opacity.value = params.postprocessing_opacity;

		renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTexture1, false );

		// Render to screen

		postprocessing.materialScreen.uniforms.tDiffuse.texture = postprocessing.rtTexture1;
		renderer.render( postprocessing.scene, postprocessing.camera );

	} else {

		renderer.render( scene, camera );

	}
	
	requestAnimationFrame( animate );
}