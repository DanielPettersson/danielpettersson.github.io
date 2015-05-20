var VibratoNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "vn";
		this.thingy = context.createScriptProcessor(4096, 1, 1);
		this.name = "Vibrato";
		this.icon = "icon-leaf";
		this.tooltip = "Adds a vibrato effect to the signal";
	    var el = this.createMainEl(true, true, true, 110);
	    var thisNode = this;

	    if(!config) {
	    	this.c = {
	    		v: 0.5,
	    		s: 1.0
	    	};
	    }
	    
	    var setAmountFnc = function(el, v) {
	    	thisNode.c.v = v.value;
			amountLabel.html('Amount ' + v.value);
		} 
	    var setSpeedFnc = function(el, v) {
	    	thisNode.c.s = v.value;
			speedLabel.html('Speed ' + v.value);
		}
		
		var amountRange = $('<div>');
		var amountLabel = $('<a href="#" rel="tooltip" title="Set vibrato amount">').tooltip();
		amountRange.slider({
			min: 0,
			max: 3,
			value: this.c.v,
			step: 0.01,
			slide: setAmountFnc
		});
		el.append(amountLabel);
		el.append(amountRange);
		setAmountFnc(null, {value: this.c.v});
		
		var speedRange = $('<div>');
		var speedLabel = $('<a href="#" rel="tooltip" title="Set vibrato speed">').tooltip();
		speedRange.slider({
			min: 0,
			max: 3,
			value: this.c.v,
			step: 0.01,
			slide: setSpeedFnc
		});
		el.append(speedLabel);
		el.append(speedRange);
		setSpeedFnc(null, {value: this.c.s});
		
		var cc = 0;
		this.thingy.onaudioprocess = function(ev) {
			var inp = ev.inputBuffer.getChannelData(0); 
			var out = ev.outputBuffer.getChannelData(0);
			for (var i = 0; i < inp.length; i++) {
				out[i] = inp[i] * (1+Math.sin(cc*thisNode.c.s*0.001)*thisNode.c.v);
				cc++;
			}
		}
	}
});