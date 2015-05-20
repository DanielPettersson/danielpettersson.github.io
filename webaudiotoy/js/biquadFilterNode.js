var BiquadFilterNode = BaseNode.extend({
  	init: function(index, config){
  		this._super(index, config);
		this.shortName = "bfn";
		this.thingy = context.createBiquadFilter();
		this.name = "Pass";
		this.icon = "icon-signal";
		this.tooltip = "Lets different frequencies of the audio input through";
		var el = this.createMainEl(true, true, true, 200);
  		var biqN = this.thingy;
  		var thisNode = this;
  		
  		if(!config) {
  			this.c = {
  				type: "lowpass",
  				freq: 0.8,
  				q: 0.2
  			};
  		}
  		
  		var setTypeFnc = function(v) {
  			thisNode.c.type = v;
  			biqN.type = v;
  		};
  		
  		var setFrequencyFnc = function(el, v) {
  			thisNode.c.freq = v.value;
  			var minValue = 30;
  			var maxValue = context.sampleRate / 2;
  			// Logarithm (base 2) to compute how many octaves fall in the range.
  			var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  			// Compute a multiplier from 0 to 1 based on an exponential scale.
  			var multiplier = Math.pow(2, numberOfOctaves * (v.value - 1.0));
  			// Get back to the frequency value between min and max.
  			biqN.frequency.value = maxValue * multiplier;
  			freqLabel.html('Frequency ' + Math.floor(biqN.frequency.value) + ' Hz');
  		};
  		
  		var setQFnc = function(el, v) { 
  			thisNode.c.q = v.value;
  			biqN.Q.value = v.value * 30; 
  			qLabel.html('Quality ' + Math.floor(biqN.Q.value));
  		};
	    		
		var selectEl = $('<select>');
		selectEl.append($('<option>').html("lowpass"));
		selectEl.append($('<option>').html("highpass"));
		selectEl.append($('<option>').html("bandpass"));
		selectEl.val(this.c.type);
		selectEl.on('change', function() {
			setTypeFnc(this.value);
		});
		el.append($('<a href="#" rel="tooltip" title="Type of pass effect">').tooltip().html('Type'));
		el.append(selectEl);
		el.append($('<br/>'));
		el.append($('<br/>'));
		setTypeFnc(this.c.type);
		
		var freqRange = $('<div>');
		var freqLabel = $('<a href="#" rel="tooltip" title="The cutoff frequency">').tooltip();
		freqRange.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: this.c.freq,
			slide: setFrequencyFnc
		});
		el.append(freqLabel);
		el.append(freqRange);
		el.append($('<br/>'));
		setFrequencyFnc(null, {value:this.c.freq});
		
		var qRange = $('<div>');
		var qLabel = $('<a href="#" rel="tooltip" title="Controls how peaked the response will be at the cutoff frequency">').tooltip();
		qRange.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: this.c.q,
			slide: setQFnc
		});
		el.append(qLabel);
		el.append(qRange);
		setQFnc(null, {value:this.c.q});
	}
});