var PianoNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "pn";
		this.name = "Piano";
		this.icon = " icon-play";
		this.tooltip = "Play piano on your keyboard. ";
		this.deleted = false;
		var el = this.createMainEl(true, false, true, 290);
		this.thingy = context.createOscillator();
  		var thisNode = this;

  		if(!config) {
  			this.c = {
  				t: "sine",
  				d: 0,
  				o: 2,
  				at: 0.3,
  				de: 0.3,
  				su: 0.8,
  				re: 0.3
  			};
  		}

  		var pianoNotes = this.pianoNotes = {};

  		var shutupFnc = this.shutupFnc = function(note) {
  			if(!note) return;
  			note.gain.gain.linearRampToValueAtTime(0.0, context.currentTime + thisNode.c.re);
  			setTimeout(function() {
	  			note.osc.stop(0);
	  			note.osc.disconnect(note.gain);
				for(var i in thisNode.myConnections) {
					var n = thisNode.myConnections[i];
					var conns = n.getConnections();
					for(var i in conns) {
						note.gain.disconnect(conns[i]);
					}
				}
  			}, thisNode.c.re * 1000 + 50);
  		}

  		var soundFnc = function() {
  			var note = {};
  			note.osc = context.createOscillator();
  			note.gain = context.createGain();
  			note.osc.connect(note.gain);
  			for(var i in thisNode.myConnections) {
				var n = thisNode.myConnections[i];
				var conns = n.getConnections();
				for(var i in conns) {
					note.gain.connect(conns[i]);
				}
			}
			note.osc.start(0);
			note.gain.gain.linearRampToValueAtTime(0.0, context.currentTime);
			note.gain.gain.linearRampToValueAtTime(1.0, context.currentTime + thisNode.c.at);
			setTimeout(function() {
				if(note.gain.gain.value == 1.0) {
					note.gain.gain.linearRampToValueAtTime(thisNode.c.su, context.currentTime + thisNode.c.de);
				}
			},thisNode.c.at * 1000);
			return note;
  		}
  		
  		var setTypeFnc = function(v) {
  			thisNode.c.t = v;
  			var t = null;
  			switch(v) {
  				case "sine":
  					t = thisNode.thingy.SINE;
  				break;
  				case "square":
  					t = thisNode.thingy.SQUARE;
  				break;
  				case "sawtooth":
  					t = thisNode.thingy.SAWTOOTH;
  				break;
  				case "triangle":
  					t = thisNode.thingy.TRIANGLE;
  				break;
  			}
  			if(t) {
	  			for(var i in pianoNotes) {
	  				if(pianoNotes[i]) pianoNotes[i].osc.type = t;
	  			}
	  		}
  		};

  		var setOctaveFnc = function(el, v) {
  			thisNode.c.o = v.value;
  			octaveLabel.html('Octave ' + v.value);
  		}
  		
  		var setDetuneFnc = function(el, v) {
  			thisNode.c.d = v.value;
  			for(var i in pianoNotes) {
  				if(pianoNotes[i]) pianoNotes[i].osc.detune.value = v.value;
  			}
			detuneLabel.html('Detune ' + v.value + ' Cents');
  		}
  		
  		var setAttackFnc = function(el, v) {
  			thisNode.c.at = v.value;
  			attackLabel.html('Attack ' + v.value + ' s');
  		}
  		
  		var setDecayFnc = function(el, v) {
  			thisNode.c.de = v.value;
  			decayLabel.html('Decay ' + v.value + ' s');
  		}
  		
  		var setSustainFnc = function(el, v) {
  			thisNode.c.su = v.value;
  			sustainLabel.html('Sustain level ' + v.value);
  		}
  		
  		var setReleaseFnc = function(el, v) {
  			thisNode.c.re = v.value;
  			releaseLabel.html('Release ' + v.value + ' s');
  		}
  		
		var pf =  {
			Z: 65.406,
			S: 69.296,
			X: 73.416,
			D: 77.782,
			C: 82.407,
			V: 87.307,
			G: 92.499,
			B: 97.999,
			H: 103.826,
			N: 110.000,
			J: 116.541,
			M: 123.471,
			Q: 65.406*2,
			'2': 69.296*2,
			W: 73.416*2,
			'3': 77.782*2,
			E: 82.407*2,
			R: 87.307*2,
			'5': 92.499*2,
			T: 97.999*2,
			'6': 103.826*2,
			Y: 110.000*2,
			'7': 116.541*2,
			U: 123.471*2 
		};

		this.onkeydown = function(e) {
			if(thisNode.deleted) return;

			var note = String.fromCharCode(e.keyCode);
			if(!pianoNotes[note]) {
				if(pf[note]) {
					pianoNotes[note] = soundFnc();
					pianoNotes[note].osc.frequency.value = pf[note] * thisNode.c.o;
					setTypeFnc(thisNode.c.t);
					setDetuneFnc(null, {value:thisNode.c.d});
				}
			}
		};

		this.onkeyup = function(e) {
			if(thisNode.deleted) return;

			var note = String.fromCharCode(e.keyCode);
			shutupFnc(pianoNotes[note]);
			pianoNotes[note] = null;
		};
  		
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

		var octaveRange = $('<div>');
		var octaveLabel = $('<a href="#" rel="tooltip" title="Select the octave of the piano">').tooltip();
		octaveRange.slider({
			min: 1,
			max: 6,
			step: 1,
			value: this.c.o,
			slide: setOctaveFnc
		});
		el.append(octaveLabel);
		el.append(octaveRange);
		setOctaveFnc(null, {value:this.c.o});
		
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
		
		var attackRange = $('<div>');
		var attackLabel = $('<a href="#" rel="tooltip" title="Attack time is the time taken for initial run-up of level from nil to peak">').tooltip();
		attackRange.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: this.c.at,
			slide: setAttackFnc
		});
		el.append(attackLabel);
		el.append(attackRange);
		setAttackFnc(null, {value:this.c.at});
		
		var decayRange = $('<div>');
		var decayLabel = $('<a href="#" rel="tooltip" title="Decay time is the time taken for the subsequent run down from the attack level to the designated sustain level.">').tooltip();
		decayRange.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: this.c.de,
			slide: setDecayFnc
		});
		el.append(decayLabel);
		el.append(decayRange);
		setDecayFnc(null, {value:this.c.de});
		
		var sustainRange = $('<div>');
		var sustainLabel = $('<a href="#" rel="tooltip" title="Sustain level is the level during the main sequence of the sound\'s duration, until the key is released.">').tooltip();
		sustainRange.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: this.c.su,
			slide: setSustainFnc
		});
		el.append(sustainLabel);
		el.append(sustainRange);
		setSustainFnc(null, {value:this.c.su});
		
		var releaseRange = $('<div>');
		var releaseLabel = $('<a href="#" rel="tooltip" title="Release time is the time taken for the level to decay from the sustain level to zero after the key is released.">').tooltip();
		releaseRange.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: this.c.re,
			slide: setReleaseFnc
		});
		el.append(releaseLabel);
		el.append(releaseRange);
		setReleaseFnc(null, {value:this.c.re});
		
		if(!localStorage["shownPianoInfo"]) {
			localStorage["shownPianoInfo"] = 'yes';
			$('#pianoInfoBox').modal();
		}

	},
	shutdown: function() {
		for(var i in this.pianoNotes) {
			this.shutupFnc(this.pianoNotes[i]);
		}
		this.deleted = true;
	}
});