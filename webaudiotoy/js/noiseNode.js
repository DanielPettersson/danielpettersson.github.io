var NoiseNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "nn";
		this.thingy = context.createScriptProcessor(4096, 1, 1);
		this.name = "Noise";
		this.icon = "icon-question-sign";
		this.tooltip = "Amplifies each sample in the signal with random amount";
	    var el = this.createMainEl(true, true, true, 78);
	    var thisNode = this;

	    if(!config) {
	    	this.c = {
	    		v: 0.5
	    	};
	    }
	    
	    var setAmountFnc = function(el, v) {
	    	thisNode.c.v = v.value;
			amountLabel.html('Amount ' + v.value);
		} 
		
		var amountRange = $('<div>');
		var amountLabel = $('<a href="#" rel="tooltip" title="Set noise amount">').tooltip();
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
		
		this.thingy.onaudioprocess = function(ev) {
			var inp = ev.inputBuffer.getChannelData(0); 
			var out = ev.outputBuffer.getChannelData(0);
			for (var i = 0; i < inp.length; i++) {
				out[i] = inp[i] * (1+(Math.random()*thisNode.c.v)-thisNode.c.v*0.5);
			}
		}
	}
});