var DynamicsCompressorNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "dcn";
		this.thingy = context.createDynamicsCompressor();
		this.name = "Dynamic Compr";
		this.icon = "icon-bullhorn";
		this.tooltip = "Dynamics compression is very commonly used in musical production and game audio. It lowers the volume of the loudest parts of the signal and raises the volume of the softest parts";
		var el = this.createMainEl(true, true, true, 305);
		var dynCmpN = this.thingy;
		var thisNode = this;

		if(!config) {
			this.c = {
				t: dynCmpN.threshold.defaultValue,
				k: dynCmpN.knee.defaultValue,
				rat: dynCmpN.ratio.defaultValue,
				a: 0.1,
				rel: 0.25
			};
		}
		
		var setThresholdFnc = function(el, v) {
			thisNode.c.t = v.value;
			dynCmpN.threshold.value = v.value;
			thresLabel.html('Threshold ' + v.value + ' dB');
		};
		var setKneeFnc = function(el, v) {
			thisNode.c.k = v.value;
			dynCmpN.knee.value = v.value;
			kneeLabel.html('Knee ' + v.value + ' dB');
		};
		var setRatioFnc = function(el, v) { 
			thisNode.c.rat = v.value;
			dynCmpN.ratio.value = v.value;
			ratioLabel.html('Ratio ' + v.value);
		};
		var setAttackFnc = function(el, v) { 
			thisNode.c.a = v.value;
			dynCmpN.attack.value = v.value;
			attackLabel.html('Attack ' + v.value + ' s');
		};
		var setReleaseFnc = function(el, v) { 
			thisNode.c.rel = v.value;
			dynCmpN.release.value = v.value;
			releaseLabel.html('Release ' + v.value + ' s');
		};

		if(dynCmpN.threshold == undefined || dynCmpN.attack == undefined || dynCmpN.release == undefined) {
			el.append($('<p>').html('Not supported by your browser'));
			return;
		}
		
		var thresRange = $('<div>');
		var thresLabel = $('<a href="#" rel="tooltip" title="The decibel value above which the compression will start taking effect">').tooltip();
		thresRange.slider({
			min: dynCmpN.threshold.minValue,
			max: dynCmpN.threshold.maxValue,
			value: this.c.t,
			slide: setThresholdFnc
			
		});
		el.append(thresLabel);
		el.append(thresRange);
		el.append($('<br/>'));
		setThresholdFnc(null, { value: this.c.t});

		var kneeRange = $('<div>');
		var kneeLabel = $('<a href="#" rel="tooltip" title="A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion">').tooltip();
		kneeRange.slider({
			min: dynCmpN.knee.minValue,
			max: dynCmpN.knee.maxValue,
			value: this.c.k,
			slide: setKneeFnc
			
		});
		el.append(kneeLabel);
		el.append(kneeRange);
		el.append($('<br/>'));
		setKneeFnc(null, { value: this.c.k});

		var ratioRange = $('<div>');
		var ratioLabel = $('<a href="#" rel="tooltip" title="The ratio of compression">').tooltip();
		ratioRange.slider({
			min: dynCmpN.ratio.minValue,
			max: dynCmpN.ratio.maxValue,
			value: this.c.rat,
			slide: setRatioFnc
			
		});
		el.append(ratioLabel);
		el.append(ratioRange);
		el.append($('<br/>'));
		setRatioFnc(null, { value: this.c.rat});

		
		var attackRange = $('<div>');
		var attackLabel = $('<a href="#" rel="tooltip" title="The amount of time to increase the gain by 10dB.">').tooltip();
		attackRange.slider({
			min: dynCmpN.attack.minValue,
			max: dynCmpN.attack.maxValue,
			step: 0.01,
			value: this.c.a,
			slide: setAttackFnc
		});
		el.append(attackLabel);
		el.append(attackRange);
		el.append($('<br/>'));
		setAttackFnc(null, { value: this.c.a});
		
		var releaseRange = $('<div>');
		var releaseLabel = $('<a href="#" rel="tooltip" title="The amount of time to reduce the gain by 10dB">').tooltip();
		releaseRange.slider({
			min: dynCmpN.release.minValue,
			max: dynCmpN.release.maxValue,
			step: 0.01,
			value: this.c.rel,
			slide: setReleaseFnc
		});
		el.append(releaseLabel);
		el.append(releaseRange);
		el.append($('<br/>'));
		setReleaseFnc(null, { value: this.c.rel});

		var reductionLabel = $('<p>')
		setInterval(function() {
			reductionLabel.html('Reduction ' + Math.min(dynCmpN.reduction.value.toPrecision(2), -0.1) + ' dB');
		},100);
		el.append($('<a href="#" rel="tooltip" title="Current amount of gain reduction">').tooltip().append(reductionLabel));
	}
});