var PitchNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "ptn";
		this.thingy = context.createScriptProcessor(8192, 1, 1);
		this.name = "Pitch";
		this.icon = "icon-resize-full";
		this.tooltip = "A simple artifact introducing pitch changer";
	    var el = this.createMainEl(true, true, true, 78);
	    var thisNode = this;

	    if(!config) {
	    	this.c = {
	    		v: 1.0
	    	};
	    }
	    
	    var setAmountFnc = function(el, v) {
	    	thisNode.c.v = v.value;
			amountLabel.html('Amount ' + v.value);
		} 
		
		var amountRange = $('<div>');
		var amountLabel = $('<a href="#" rel="tooltip" title="Set pitch amount">').tooltip();
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
			var a;
			var s;
			var l = inp.length;
			for (var i = 0; i < l; i++) {
				a = Math.floor(i*thisNode.c.v);
				if(a >= l) {
					a = l-(a-l)-1;
				}
				s = inp[a];
				out[i] = s;
			}
		}
	}
});