var ConvolverNode = BaseNode.extend({
  	init: function(index, config){
  		this._super(index, config);
  		this.shortName = "cn";
  		this.thingy = context.createConvolver();
  		this.name = "Convolver";
  		this.icon = "icon-random";
  		this.tooltip = "Applies a linear convolution effect given an impulse response";
  		var el = this.createMainEl(true, true, true, 115);
  		var convN = this.thingy;
  		var thisNode = this;
  		
  		if(!config) {
  			this.c = {
  				conv: "cardiod-rear-levelled",
  				norm: true
  			};
  		}
  		
  		var setConvFnc = function(v) {
  			thisNode.c.conv = v;
  			thisNode.loader.fadeIn('fast');
  			var request = new XMLHttpRequest();
  		    request.open("GET", "conv/" + v + ".wav", true);
  		    request.responseType = "arraybuffer";
  		    
  		    request.onload = function() {
  		    	context.decodeAudioData(request.response, function(buffer) {
			      convN.buffer = buffer;
			    }, function() {
			    	console.log('failed to decode convolver buffer');
			    });
  		    	thisNode.loader.fadeOut('fast');
  		    }
  		    request.send();
  		};

  		var setNormalizeFnc = function() {
  			thisNode.c.norm = this.checked;
  			convN.normalize.value = this.checked;
  		};
  		
		var sEl = $('<select>');
		sEl.on('change', function() {
			setConvFnc(this.value);
		});
		sEl.append($('<option>').html("cardiod-rear-levelled"));
		sEl.append($('<option>').html("comb-saw1"));
		sEl.append($('<option>').html("comb-saw2"));
		sEl.append($('<option>').html("cosmic-ping-long"));
		sEl.append($('<option>').html("diffusor3"));
		sEl.append($('<option>').html("dining-far-kitchen"));
		sEl.append($('<option>').html("dining-living-true-stereo"));
		sEl.append($('<option>').html("feedback-spring"));
		sEl.append($('<option>').html("filter-lopass160"));
		sEl.append($('<option>').html("filter-rhythm1"));
		sEl.append($('<option>').html("filter-rhythm3"));
		sEl.append($('<option>').html("filter-telephone"));
		sEl.append($('<option>').html("impulse-rhythm2"));
		sEl.append($('<option>').html("kitchen"));
		sEl.append($('<option>').html("kitchen-true-stereo"));
		sEl.append($('<option>').html("living-bedroom-leveled"));
		sEl.append($('<option>').html("matrix6-backwards"));
		sEl.append($('<option>').html("matrix-reverb2"));
		sEl.append($('<option>').html("matrix-reverb3"));
		sEl.append($('<option>').html("s2_r4_bd"));
		sEl.append($('<option>').html("spatialized4"));
		sEl.append($('<option>').html("spatialized5"));
		sEl.append($('<option>').html("spreader50-65ms"));
		sEl.append($('<option>').html("wildecho"));
		sEl.val(this.c.conv);

		el.append($('<a href="#" rel="tooltip" title="Impulse response used by the convolver">').tooltip().html('Impulse response'));
		el.append(sEl);
		setConvFnc(this.c.conv);

		var normalizeChk = $('<input>').attr({
			type: 'checkbox',
			checked: this.c.norm
		});
		var normalizeLabel = $('<a href="#" rel="tooltip" title="Controls whether the impulse response will be scaled by an equal-power normalization">').tooltip().html('Normalize');
		el.append($('<label>').addClass('checkbox').append(normalizeChk).append(normalizeLabel));
		normalizeChk.on('change', setNormalizeFnc);
  	}
  	
});