$(document).ready(function() {
	if ( !Detector.webgl ) {
		Detector.addGetWebGLMessage({ parent: document.body });
		return;
	}

	var renderer = new THREE.WebGLRenderer();
	$('#scene').append( renderer.domElement );
	renderer.setSize(window.innerWidth, window.innerHeight)
	
	var camera = new THREE.OrthoCamera( window.innerWidth / - 2, 
										window.innerWidth / 2, 
										window.innerHeight / 2,
										window.innerHeight / - 2, 
										0, 
										10 );
	camera.position.z = 1;
	
	var scene = new THREE.Scene();
	
	var uniforms = {
		resolution: { 
			type: "v2", 
			value: new THREE.Vector2( window.innerWidth, window.innerHeight )
		},
		time: {
			type: "f",
			value: 0.0
		}
	};
	
    scene.addObject( 
    	new THREE.Mesh( 
    		new THREE.PlaneGeometry(window.innerWidth,window.innerHeight,1,1),
    		new THREE.MeshShaderMaterial({
    		    vertexShader:   $('#vertexshader').text(),
    		    fragmentShader: fragmentshader,
    		    uniforms: uniforms
    		}) 
    	) 
    );

    var startTime = new Date().getTime();
    
	var animate = function() {
		uniforms.time.value = (new Date().getTime() - startTime) / 1000.0;
		renderer.render( scene, camera );
		requestAnimationFrame( animate );
	}
	
	animate();
});


var fragmentshader = [
	"#ifdef GL_ES",
	"precision highp float;",
	"#endif",
	
	"uniform sampler2D video0;",
	"uniform vec2 resolution;",
	"uniform float time;",
	
	"varying vec2 vUv;",
	
	"float wave(float size, float speed, float strength, vec2 pos)",
	"{",
		"return cos(length(pos*size)-time*speed)*(strength*max(0.,(1.-length(pos))));",
	"}",
	
	"float wavein(float size, float speed, float strength, vec2 pos)",
	"{",
		"return cos(length(pos*size*(sin(time*2.)*0.3+1.))+time*speed)*(strength*max(0.,(1.-length(pos))));",
	"}",
	
	"float sinpp(float a)",
	"{",
		"return (sin(a)+1.)*0.5;",
	"}",
	
	"float cospp(float a)",
	"{",
		"return (cos(a)+1.)*0.5;",
	"}",
	
	"void main(void)",
	"{",
		"vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;",
		"vec2 pp = (p + 1.0)*0.5;",
		"vec3 col = vec3(pp.x, pp.y, (pp.x*pp.y)*sinpp(time*3.) + (pp.x+pp.y)*cospp(time*4.));",
		
		"col += wave(17.0, 7.0, 0.4, p);",
		"col += wave(27.0, 8.0, 0.4, p+0.03);",
		"col += wavein(100.0, 8.0, 0.4, p-0.02);",
		
		"gl_FragColor = vec4(col,1.0);",
	"}",
].join('\n');