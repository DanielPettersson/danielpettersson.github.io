(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

$(function() {
	$('#origcanvas')[0].addEventListener('drop', function (evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    
	    var reader = new FileReader();
	    reader.onload = function(e) {
	    	var img = new Image();
	    	img.src = e.target.result;
	    	img.onload = function() {
	    		var canvas = $("#origcanvas")[0];
	    		var canvasWidth  = canvas.width;
				var canvasHeight = canvas.height;

	    		var ctx = canvas.getContext("2d");
	    		ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);


				var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
				var data = imageData.data;

				for (var y = 0; y < canvasHeight; ++y) {
				    for (var x = 0; x < canvasWidth; ++x) {
				        var offset = y * canvasWidth * 4 + x * 4;
				        data[offset] = data[offset+1];
				    }
				}
				ctx.putImageData(imageData, 0, 0);
	    	};
	    }
	    reader.readAsDataURL(evt.dataTransfer.files[0]);		    
	}, false);
		
	$('#origcanvas')[0].addEventListener('dragover', function (evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    return false;
	}, false);
}); 