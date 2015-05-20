var AnalyzerNode = BaseNode.extend({
  	init: function(index, config){
  		this._super(index, config);
  		this.shortName = "an";
  		this.thingy = context.createAnalyser();
  		this.icon = "icon-eye-open";
  		this.name = "Analyzer";
  		this.tooltip = "Provides real-time frequency and time-domain analysis information. The audio stream will be passed un-processed from input to output.";
  		var el = this.createMainEl(true, true, true);
  		el.css('margin', 0);
		
		var analyzer = this.thingy;
	    var thisNode = this;
	    if(!config) {
	    	this.c = {
	    		vm: 0
	    	};
	    }

	    var ctooltip = $('<a href="#" rel="tooltip" title="Click to change visualization">').tooltip({placement: 'bottom'});
	    el.append(ctooltip);
	    var soundVisualizer = new SoundVisualizer(ctooltip, 150, 120);
	    soundVisualizer.canvas.on('click', function() {
	    	thisNode.c.vm++;
	    	if(thisNode.c.vm == 2) {
	    		soundVisualizer.clear();
	    	} else if(thisNode.c.vm == 3) {
	    		thisNode.c.vm = 0;
	    		window.requestAnimationFrame(onaudioprocess);
	    	}
	    })

	    var data = null; 
	    var onaudioprocess = function() {
		    if(data == null) {
		    	data = new Uint8Array(analyzer.frequencyBinCount);
		    }
		    if(thisNode.c.vm == 0) {
		    	analyzer.getByteTimeDomainData(data);
			    soundVisualizer.visualizeTimeDomainData(data);
			    window.requestAnimationFrame(onaudioprocess);
		    } else if(thisNode.c.vm == 1) {
		    	analyzer.getByteFrequencyData(data);
			    soundVisualizer.visualizeFrequencyData(data);
		    	window.requestAnimationFrame(onaudioprocess);
		    }
		};
		
		window.requestAnimationFrame(onaudioprocess);
  	}
});