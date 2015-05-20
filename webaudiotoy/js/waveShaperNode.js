var WaveShaperNode = BaseNode.extend({
  	init: function(index, config){
	    this._super(index, config);
	    this.shortName = "wsn";
		this.thingy = context.createWaveShaper();
		this.name = "WaveShaper";
		this.icon = "icon-tasks";
		this.tooltip = "Implements non-linear distortion effects";
		var el = this.createMainEl(true, true, true, 166, 155);
		var shaperN = this.thingy;
		var thisNode = this;

		if(!config) {
			this.c = {
				cu: [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45]
			};
		}
		
		var setCurveFnc = function(l, v) { 
			var curve = new Float32Array(10);
			var idx = 0;
			$(el).find('.curveRange').each(function() {
				var cVal = $(this).slider("value");
				thisNode.c.cu[idx] = cVal;
				curve[idx++] = cVal;
			});
			shaperN.curve = curve;
		}; 
		
		el.append($('<a href="#" rel="tooltip" title="The shaping curve used for the waveshaping effect">').tooltip().html('Curve'));
		el.append($('<br/>'));

		for(var i = 0; i < 10; i++) {
			var curveRange = $('<div>');
			curveRange.slider({
				orientation: "vertical",
				min: -1,
				max: 1,
				step: 0.01,
				value: this.c.cu[i],
				slide: setCurveFnc
			});
			curveRange.addClass('curveRange');
			el.append(curveRange);
		}

		setCurveFnc(null, null);
	}
	
});