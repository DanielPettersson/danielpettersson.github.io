var GainNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "gn";
		this.thingy = context.createGain();
		this.name = "Gain";
		this.icon = "icon-plus";
		this.tooltip = "Changes the gain of (scales) the incoming audio signal by a certain amount";
	    var el = this.createMainEl(true, true, true, 78);
	    var gainN = this.thingy;
	    var thisNode = this;

	    if(!config) {
	    	this.c = {
	    		v: 1
	    	};
	    }
	    
	    var setVolumeFnc = function(el, v) {
	    	thisNode.c.v = v.value;
			gainN.gain.value = v.value * v.value;
			gainLabel.html('Volume ' + v.value);
		} 
		
		var gainRange = $('<div>');
		var gainLabel = $('<a href="#" rel="tooltip" title="Set gain multiplier">').tooltip();
		gainRange.slider({
			min: 0,
			max: 3,
			value: this.c.v,
			step: 0.01,
			slide: setVolumeFnc
		});
		el.append(gainLabel);
		el.append(gainRange);
		setVolumeFnc(null, {value: this.c.v});
	}
});