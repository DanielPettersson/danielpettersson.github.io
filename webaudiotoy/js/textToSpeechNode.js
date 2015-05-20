var TextToSpeechNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "tts";
		this.thingy = context.createBufferSource();
		this.name = "Text To Speech";
		this.icon = "icon-font";
		this.tooltip = "Uses the brilliant speak.js to speak the text";
	    var thisNode = this;

	    if(!config) {
	    	this.c = {
	    		t: "All your bases are belong to us!",
	    		p: 50,
	    		s: 150,
	    		g: 0
	    	};
	    }
	    
	    var setPitchFnc = function(el, v) { thisNode.c.p = v.value; pitchLabel.html('Pitch ' + v.value); } 
	    var setSpeedFnc = function(el, v) { thisNode.c.s = v.value; speedLabel.html('Speed ' + v.value + ' word / minute'); }
	    var setWordGapFnc = function(el, v) { thisNode.c.g = v.value; wordGapLabel.html('Word Gap ' + v.value + ' ms'); }
		
	    var el = this.createMainEl(true, false, true, 313, 241);
	    el.css('width', '221px');
	    
	    var pitchRange = $('<div>');
		var pitchLabel = $('<a href="#" rel="tooltip" title="The voice pitch">').tooltip();
		pitchRange.slider({
			min: 10,
			max: 100,
			value: this.c.p,
			step: 1,
			slide: setPitchFnc
		});
		el.append(pitchLabel);
		el.append(pitchRange);
		setPitchFnc(null, {value: this.c.p});
		
		var speedRange = $('<div>');
		var speedLabel = $('<a href="#" rel="tooltip" title="The speed at which to talk">').tooltip();
		speedRange.slider({
			min: 10,
			max: 300,
			value: this.c.s,
			step: 1,
			slide: setSpeedFnc
		});
		el.append(speedLabel);
		el.append(speedRange);
		setSpeedFnc(null, {value: this.c.s});
		
		var wordGapRange = $('<div>');
		var wordGapLabel = $('<a href="#" rel="tooltip" title="Additional gap between words">').tooltip();
		wordGapRange.slider({
			min: 0,
			max: 200,
			value: this.c.g,
			step: 10,
			slide: setWordGapFnc
		});
		el.append(wordGapLabel);
		el.append(wordGapRange);
		setWordGapFnc(null, {value: this.c.g});
	    
	    var textBox = $('<textarea>');
	    var speakButton = $('<input>');
	    
	    var speakFnc = function(text) {
	    	thisNode.c.t = text;
	    	thisNode.loader.fadeIn('fast');
	    	speakButton.attr('disabled', 'true');
	    	
	    	var speakWorker = new Worker('js/speakWorker.js');

	    	speakWorker.onmessage = function(event) {
    			thisNode.thingy = context.createBufferSource();
	    		context.decodeAudioData(event.data.buffer, function(buffer) {
	    			thisNode.thingy.buffer = buffer;
	    			for(var i in thisNode.myConnections) {
	    				var node = thisNode.myConnections[i];
	    				var conns = node.getConnections();
	    				for(var i in conns) {
	    					thisNode.thingy.connect(conns[i]);
	    				}
					}
	    			thisNode.thingy.start(0);
	    			
	    			setTimeout(function() {
	    				thisNode.thingy.stop(0);
	    				for(var i in thisNode.myConnections) {
		    				var node = thisNode.myConnections[i];
		    				var conns = node.getConnections();
		    				for(var i in conns) {
		    					thisNode.thingy.disconnect(conns[i]);
		    				}
						}
	    				speakButton.removeAttr('disabled');
	    			}, buffer.duration * 1000)
	    			
	    			thisNode.loader.fadeOut('fast');
	    		});
	    	};

	    	speakWorker.postMessage({
	    		text : text,
	    		args : {
	    			pitch: thisNode.c.p,
	    			speed: thisNode.c.s,
	    			wordgap: thisNode.c.g/10
	    		}
	    	});
		};
		
		textBox.attr('cols', '30');
		textBox.attr('rows', '6');
		textBox.css('height', '105px');
		textBox.val(this.c.t);
		
		speakButton.attr({
			type: 'button',
			value: 'Speak'
		});
		speakButton.on("click", function() {
			speakFnc(textBox.val());
		});
		
		el.append($('<br/>'));
		el.append(textBox);
		el.append($('<br/>'));
		el.append(speakButton);
	}  
});