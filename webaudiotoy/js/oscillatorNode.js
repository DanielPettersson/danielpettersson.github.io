var OscillatorNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "on";
		this.name = "Oscillator";
		this.icon = " icon-chevron-up";
		this.tooltip = "Oscillator represents an audio source generating a periodic waveform";
		var el = this.createMainEl(true, false, true, 183);
		try {
			this.thingy = context.createOscillator();
		} catch(e) {
			el.append($('<p>').html('Not supported by your browser. You probably need to go Chrome Canary.'));
			return;
		}
  		var oscN = this.thingy;
  		var thisNode = this;

  		if(!config) {
  			this.c = {
  				t: "sine",
  				f: 0.1,
  				d: 0
  			};
  		}
  		
  		var setTypeFnc = function(v) {
  			thisNode.c.t = v;
  			oscN.type = v;
  		};
  		
  		var setFrequencyFnc = function(el, v) {
  			thisNode.c.f = v.value;
  			var minValue = 30;
  			var maxValue = context.sampleRate / 2;
  			// Logarithm (base 2) to compute how many octaves fall in the range.
  			var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  			// Compute a multiplier from 0 to 1 based on an exponential scale.
  			var multiplier = Math.pow(2, numberOfOctaves * (v.value - 1.0));
  			// Get back to the frequency value between min and max.
  			oscN.frequency.value = maxValue * multiplier;
  			freqLabel.html('Frequency ' + Math.floor(oscN.frequency.value) + ' Hz');
  		};
  		
  		var setDetuneFnc = function(el, v) {
  			thisNode.c.d = v.value;
  			oscN.detune.value = v.value;
			detuneLabel.html('Detune ' + v.value + ' Cents');
  		}
  		
		var selectEl = $('<select>');
		selectEl.append($('<option>').html("sine"));
		selectEl.append($('<option>').html("square"));
		selectEl.append($('<option>').html("sawtooth"));
		selectEl.append($('<option>').html("triangle"));
		selectEl.val(this.c.t)
		selectEl.on('change', function() {
			setTypeFnc(this.value);
		});
		el.append($('<a href="#" rel="tooltip" title="The shape of the periodic waveform">').tooltip().html('Type'));
		el.append(selectEl);
		el.append($('<br/>'));
		setTypeFnc(this.c.t);
		
		var freqRange = $('<div>');
		var freqLabel = $('<a href="#" rel="tooltip" title="The frequency of the periodic waveform.">').tooltip();
		freqRange.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: this.c.f,
			slide: setFrequencyFnc
		});
		el.append(freqLabel);
		el.append(freqRange);
		el.append($('<br/>'));
		setFrequencyFnc(null, {value:this.c.f});
		
		var detuneRange = $('<div>');
		var detuneLabel = $('<a href="#" rel="tooltip" title="A detuning value which will offset the frequency by the given amount">').tooltip();
		detuneRange.slider({
			min: -100,
			max: 100,
			step: 1,
			value: this.c.d,
			slide: setDetuneFnc
		});
		el.append(detuneLabel);
		el.append(detuneRange);
		setDetuneFnc(null, {value:this.c.d});

		oscN.start(0);
	},
	shutdown: function() {
		this.thingy.stop(0);
	}
});