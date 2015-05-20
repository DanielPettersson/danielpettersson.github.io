var DelayNode = BaseNode.extend({
  	init: function(index, config){
	    this._super(index, config);
	    this.shortName = "deln";
		this.thingy = context.createDelay();
		this.name = "Delay";
		this.icon = "icon-pause";
		this.tooltip = "Delays the incoming audio signal by a certain amount";
		var el = this.createMainEl(true, true, true, 78);
		var delayN = this.thingy;
		var thisNode = this;
		
		if(!config) {
			this.c = {
				d: 0.8
			};
		}
		
		var setDelayFnc = function(el, v) { 
			thisNode.c.d = v.value;
			delayN.delayTime.value = v.value;
			delayLabel.html('Delay ' + v.value + ' s');
		}; 
		
		var delayRange = $('<div>');
		var delayLabel = $('<a href="#" rel="tooltip" title="Delay time in seconds">').tooltip();
		delayRange.slider({
			min: 0,
			max: 0.99,
			step: 0.01,
			value: this.c.d,
			slide: setDelayFnc
		});
		el.append(delayLabel);
		el.append(delayRange);
		setDelayFnc(null, {value:this.c.d});
	}
	
});