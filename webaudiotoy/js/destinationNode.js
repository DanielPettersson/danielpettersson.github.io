var DestinationNode = BaseNode.extend({
  	init: function(index, config){
  		this._super(index, config);
  		this.shortName = "dstn";
  		this.thingy = context.createAnalyser();
  		this.icon = "icon-volume-up";
  		this.name = "Output";
  		this.tooltip = "Represents the final audio destination and is what the user will ultimately hear";
  		var el = this.createMainEl(false, true, false);
  		el.css('margin', 0);
		
		var analyzer = this.thingy;
		this.thingy.connect(context.destination);
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
  	},
  	getConnections: function() {
		var arr = new Array();
		arr[0] = context.destination;
		arr[1] = this.thingy;
		return arr;
	}
});