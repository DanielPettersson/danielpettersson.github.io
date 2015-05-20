var SourceNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "son";
		this.thingy = context.createBufferSource();
		this.thingy.loop = true;
		this.name = "File";
		this.icon = "icon-file";
		this.tooltip = "Plays an audio file dragged from the filesystem"
	    
		var bufferSource = this.thingy;
		var thisNode = this;

		if(!config) {
			this.c = {
				pr: 1
			};
		}
		
		var el = this.createMainEl(true, false, true, 175);
		
		var setPlaybackRateFnc = function(el, v) {
			thisNode.c.pr = v.value;
			bufferSource.playbackRate.value = v.value;
			rateLabel.html('Rate ' + v.value);
		} 
		
		var rateRange = $('<div>');
		var rateLabel = $('<a href="#" rel="tooltip" title="Set playback rate multiplier">').tooltip();
		rateRange.slider({
			min: 0.1,
			max: 3,
			value: this.c.pr,
			step: 0.05,
			slide: setPlaybackRateFnc
		});
		el.append('<br/>');
		el.append(rateLabel);
		el.append(rateRange);
		el.append('<br/>');
		setPlaybackRateFnc(null, {value: this.c.pr});
		
		var infoEl = $('<div>');
		infoEl.html("Drag and drop a sound file to me..");
		el.append(infoEl);
		
		var info2El = this.info2El = $('<div>');
		info2El.html("Now connect me to something..");
		info2El.hide();
		el.append(info2El);
		
		el.parent()[0].addEventListener('drop', function (evt) {
		    evt.stopPropagation();
		    evt.preventDefault();
		    infoEl.hide('slow');
		    thisNode.loader.fadeIn('fast');
		    
		    var reader = new FileReader();
		    reader.onload = function(e) {
		    	if(context.decodeAudioData) {
			        context.decodeAudioData(e.target.result, function(buffer) {
			        	thisNode.loader.fadeOut('fast');
			        	bufferSource.buffer = buffer;
			        	bufferSource.start(0);
			        	if(thisNode.myConnections.length == 0) {
			        		info2El.show('fast');
			        	}
			        }, function(e) {
			        	alert('Could not play that audio file. Try another file format.');
			        });
			    } else {
			    	bufferSource.buffer = context.createBuffer(e.target.result, false /*mixToMono*/);
			    	thisNode.loader.fadeOut('fast');
			    }
		    }
		    reader.readAsArrayBuffer(evt.dataTransfer.files[0]);		    
		}, false);
		
		el.parent()[0].addEventListener('dragover', function (evt) {
		    evt.stopPropagation();
		    evt.preventDefault();
		    return false;
		}, false);
  	},
  	connectTo: function(node) {
	  	var ret = this._super(node);
		this.info2El.hide('fast');
		return ret;
  	},
  	getConnections: function() {
		return new Array();
	},
	shutdown: function() {
		this.thingy.stop(0);
	}
});