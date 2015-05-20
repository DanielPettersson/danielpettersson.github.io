/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();var SoundVisualizer = Class.extend({
	init: function(el, width, height){
		this.canvas = $('<canvas width="' + width + '" height="' + height + '">');
		this.w = width;
		this.h = height;
		el.append(this.canvas);
		this.ctx = this.canvas[0].getContext("2d");
	},
	visualizeFrequencyData: function(data) {
		this.ctx.fillStyle = "rgba(255,255,255,0.2)";
		this.ctx.fillRect(0,0,this.w,this.h);
		this.ctx.fillStyle = "rgba(200,0,0,0.5)";
		
		var h = Math.floor((data.length*0.33) / this.w);
		var v = 0;
		var s = 0;
		for(var i = 0; i < this.w; i++) {
			v = data[i*h];
			s = (v/255)*this.h;
			this.ctx.fillRect(i, (this.h-s), 1, s);
		}
	},
	visualizeTimeDomainData: function(data) {
		this.ctx.fillStyle = "rgba(255,255,255,0.2)";
		this.ctx.fillRect(0,0,this.w,this.h);
		this.ctx.strokeStyle = "rgba(200,0,0,0.5)";
		
		var h = Math.floor(data.length / this.w);
		var v = 0;
		var s = 0;
		this.ctx.beginPath();
		this.ctx.moveTo(0,(data[0]/255)*this.h);
		for(var i = 1; i < this.w; i++) {
			v = data[i*h];
			s = (v/255)*this.h;
			this.ctx.lineTo(i, s);
		}
		this.ctx.stroke();
	},
	clear: function() {
		this.ctx.fillStyle = "rgba(255,255,255,1)";
		this.ctx.fillRect(0,0,this.w,this.h);
	}
});var BaseNode = Class.extend({
	init: function(index, config){
		this.idx = index;
    	this.myConnections = new Array();
		this.c = config;
  	},
  	createMainEl: function(createDrag, createDrop, createclose, elHeight, elWidth) {
  		var thisNode = this;
  		var el = this.el = $('<div>');
  		
		el.addClass('node');
		if(elHeight != undefined) {
			el.css('height', elHeight)
		} 
		if(elWidth != undefined) {
			el.css('width', elWidth)
		} 

		$('body').append(el);
		
		el.draggable({
			stack: 'div.node',
			containment: 'parent',
			drag: function() {
				thisNode.updateConnectionLines();
			},
		});

		el.css('position', 'absolute');

		
		//create loader
		var loaderImg = $('<img>').attr('src', 'img/ajax-loader.gif').addClass('loaderImg');;
		this.loader = $('<div>').addClass('loaderOverlay');
		this.loader.append(loaderImg);
		el.append(this.loader);
		this.loader.hide();
		
		//create header
		var header = $('<div>');
		header.addClass('nodeheader');
		header.append($('<i class="' + this.icon + '">'));
		header.append($('<a href="#" rel="tooltip" title="' + this.tooltip + '">').html('&nbsp;' + this.name).tooltip());
		el.append(header);
		if(createclose) {
			var closeBtn = $('<div>');
			closeBtn.addClass('close');
			closeBtn.html('x');
			closeBtn.on('click', function() {
				$('.line').each(function() {
					var line = $(this);
					var lineFromIdx = line.attr('data-fromIdx');
					var lineToIdx = line.attr('data-toIdx');
					if(lineFromIdx == thisNode.idx || lineToIdx == thisNode.idx) {
						line.fadeOut(700, function() {
							line.remove();
						});
					}
				});
				el.fadeOut(700, function() {
					for(var i in thisNode.myConnections) {
						thisNode.disconnectFrom(thisNode.myConnections[i]);
					}
					thisNode.shutdown();
					var nH = thisNode.el.height()+2;
					thisNode.el.remove();
					thisNode.deleted = true;
				});
			});
		}
		header.append(closeBtn);
		
		var tempConnectionLine = null;
		if(createDrag) {
			var dragEl = $('<div>');
			dragEl.draggable({
				revert: true,
				snap: '.nodedrop',
				start: function() {
					tempConnectionLine = thisNode.createConnectionLine(thisNode.el, dragEl, null, null, true)
				},
				drag: function() {
					var linePosData = thisNode.getLinePosData(thisNode.el, dragEl, true);
					thisNode.updateConnectionLine(tempConnectionLine, linePosData);
				},
				stop: function() {
					tempConnectionLine.parent().remove();
				}
			});
			dragEl.droppable({
				accept: ".nodedrop",
				drop: function( event, ui ) {
					var dEl = $(ui.draggable[0]);
					var dragFromIndex = dEl.attr('data-nodeIndex');
					var fromN = nodes[thisNode.idx];
					var toN = nodes[dragFromIndex];

					$('.templine').remove();
					if(fromN.connectTo(toN)) {
						toN.createConnectionLine(fromN.el,toN.el,fromN.idx,toN.idx, false);
						toN.updateConnectionLines();
					}
				}
			});
			dragEl.addClass('nodedrag');
			dragEl.addClass('nodehandle');
			dragEl.attr('data-nodeIndex', this.idx);
			dragEl.css({
				position: 'absolute',
				top: el.height()/2-12 + 'px',	
				left: el.width()+8 + 'px'
			});

			el.append(dragEl);
			

		}

		if(createDrop) {
			
			var dropEl = $('<div>');
			dropEl.addClass('nodedrop');
			dropEl.addClass('nodehandle');
			dropEl.attr('data-nodeIndex', this.idx);
			dropEl.draggable({
				revert: true,
				snap: '.nodedrag',
				start: function() {
					tempConnectionLine = thisNode.createConnectionLine(thisNode.el, dropEl, null, null, true)
				},
				drag: function() {
					var linePosData = thisNode.getLinePosData(thisNode.el, dropEl, true, true);
					thisNode.updateConnectionLine(tempConnectionLine, linePosData, true);
				},
				stop: function() {
					tempConnectionLine.parent().remove();
				}
			});
			dropEl.droppable({
				accept: ".nodedrag",
				drop: function( event, ui ) {
					var dEl = $(ui.draggable[0]);
					var dragFromIndex = dEl.attr('data-nodeIndex');
					var fromN = nodes[dragFromIndex];
					var toN = nodes[thisNode.idx];

					$('.templine').remove();
					if(fromN.connectTo(toN)) {
						toN.createConnectionLine(fromN.el,toN.el,fromN.idx,toN.idx, false);
						toN.updateConnectionLines();
					}
				}
			});
			dropEl.css({
				position: 'absolute',
				top: el.height()/2-12 + 'px',	
				left: -28 + 'px'
			});

			el.append(dropEl);

		}

		var body = $('<div>');
		body.addClass('nodebody');
		el.append(body);
		
		el.offset({top: 200, left: 200});
		el.hide();
		el.fadeIn(700);
		return body;
  	},
  	connectTo: function(node) {
  		if(this.myConnections.indexOf(node) != -1) {
  			return false;
  		}

		var conns = node.getConnections();
		for(var i in conns) {
			this.thingy.connect(conns[i]);
		}
		this.myConnections.push(node);
		return true;
	},
  	disconnectFrom: function(node) {
		var conns = node.getConnections();
		for(var i in conns) {
			this.thingy.disconnect(conns[i]);
		}
		var idx = this.myConnections.indexOf(node);
		if(idx!=-1) this.myConnections.splice(idx, 1);
  	},
  	getConnections: function() {
		var arr = new Array();
		arr[0] = this.thingy;
		return arr;
	},
	createConnectionLine: function(fromEl, toEl, fromIdx, toIdx, temp) {
		var linePosData = this.getLinePosData(fromEl, toEl, temp);

		var lineCont = $('<div>')
			.appendTo('body')
			.addClass('linecont')
	        .css({
	          'position': 'absolute',
	          'transform': linePosData.transform
	        })
	        .width(linePosData.length);
		lineCont.offset({left: linePosData.left, top: linePosData.top-connLineWidth/2});
		
	    var line = $('<div>')
	        .addClass('line')
	        .attr({
	        	'data-fromIdx': fromIdx,
	        	'data-toIdx': toIdx
	        })
	        .width(linePosData.length);
	    if(temp) {
	    	lineCont.addClass('templine');
	    } else {
	    	lineCont.on('click', function() {
	    		var fromN = nodes[line.attr('data-fromIdx')];
				var toN = nodes[line.attr('data-toIdx')];
				lineCont.fadeOut(700, function() {
					fromN.disconnectFrom(toN);
					$(this).remove();
				});
				
	    	})
	    }
	    
	    lineCont.append(line);

	    return line;
	},
	updateConnectionLines: function() {
		var thisNode = this;
		$('.line').each(function() {
			var line = $(this);
			var fromEl = nodes[line.attr('data-fromIdx')].el;
			var toEl = nodes[line.attr('data-toIdx')].el;
			var linePosData = thisNode.getLinePosData(fromEl, toEl, false);

			thisNode.updateConnectionLine(line, linePosData);
		});
	},
	updateConnectionLine: function(line, linePosData) {
		line.parent().css({
          'webkit-transform': linePosData.transform,
          '-moz-transform': linePosData.transform,
          'transform': linePosData.transform
        })
        .width(linePosData.length)
        .offset({left: linePosData.left, top: linePosData.top-connLineWidth/2});
		
		line.width(linePosData.length);
	},
	getLinePosData: function(fromEl, toEl, temp, reverse) {
		var fromElPos = fromEl.offset();
		var toElPos = toEl.offset();

		var fromElWidth = fromEl.width();
		var fromElHeight = fromEl.height();
		var toElHeight = toEl.height();

		var x1 = fromElPos.left+(reverse?2:fromElWidth);
		var y1 = fromElPos.top+fromElHeight/2;
		var x2 = toElPos.left;
		var y2 = toElPos.top+toElHeight/2;

		if(temp) {
			x2 += 10;
		} else {
			x1 += 25;
			x2 -= 15;
		}

		var a = Math.atan2(y2 - y1, x2 - x1);
		var angle  = a * 180 / Math.PI;	
		var ld = Math.abs(Math.sin(a)*connLineWidth/2);
		return {
			length: Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)),
	  		transform: 'rotate('+angle+'deg)',
	  		top: y1 < y2 ? y1 + ld : y1 - (y1-y2) + ld,
	  		left: x1 < x2 ? x1 - ld : x1 - (x1-x2) - ld
		}
	},
	shutdown: function() {}
});var BiquadFilterNode = BaseNode.extend({
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
});var ConvolverNode = BaseNode.extend({
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
  	
});var DelayNode = BaseNode.extend({
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
	
});var DestinationNode = BaseNode.extend({
  	init: function(index, config){
  		this._super(index, config);
  		this.shortName = "dstn";
  		this.thingy = context.createAnalyser();
  		this.icon = "icon-volume-up";
  		this.name = "Output";
  		this.tooltip = "Represents the final audio destination and is what the user will ultimately hear";
  		var el = this.createMainEl(false, true, false);
  		el.css('margin', 0);
		
		var analyzer = this.thingy;
		this.thingy.connect(context.destination);
		var thisNode = this;
	    if(!config) {
	    	this.c = {
	    		vm: 0
	    	};
	    }

	    var ctooltip = $('<a href="#" rel="tooltip" title="Click to change visualization">').tooltip({placement: 'bottom'});
	    el.append(ctooltip);
	    var soundVisualizer = new SoundVisualizer(ctooltip, 150, 120);
	    soundVisualizer.canvas.on('click', function() {
	    	thisNode.c.vm++;
	    	if(thisNode.c.vm == 2) {
	    		soundVisualizer.clear();
	    	} else if(thisNode.c.vm == 3) {
	    		thisNode.c.vm = 0;
	    		window.requestAnimationFrame(onaudioprocess);
	    	}
	    })

	    var data = null; 
	    var onaudioprocess = function() {
		    if(data == null) {
		    	data = new Uint8Array(analyzer.frequencyBinCount);
		    }
		    if(thisNode.c.vm == 0) {
		    	analyzer.getByteTimeDomainData(data);
			    soundVisualizer.visualizeTimeDomainData(data);
			    window.requestAnimationFrame(onaudioprocess);
		    } else if(thisNode.c.vm == 1) {
		    	analyzer.getByteFrequencyData(data);
			    soundVisualizer.visualizeFrequencyData(data);
		    	window.requestAnimationFrame(onaudioprocess);
		    }
		};
		
		window.requestAnimationFrame(onaudioprocess);
  	},
  	getConnections: function() {
		var arr = new Array();
		arr[0] = context.destination;
		arr[1] = this.thingy;
		return arr;
	}
});var DynamicsCompressorNode = BaseNode.extend({
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
});var GainNode = BaseNode.extend({
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
});var ScriptNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "scn";
		this.thingy = context.createScriptProcessor(4096, 1, 1);
		this.thingy.onaudioprocess = function(event) {	};
		this.name = "Javascript";
		this.icon = "icon-filter";
		this.tooltip = "Can generate or process audio directly using JavaScript. Has inputBuffer inp, outputBuffer out and AudioProcessingEvent ev defined. Size of buffer is 4096";
	    var javaScriptNode = this.thingy;
	    var thisNode = this;

	    if(!config) {
	    	this.c = {
	    		c: "for (var i = 0; i < inp.length; i++) {\n out[i] = inp[i];\n}"
	    	};
	    }
		
	    var el = this.createMainEl(true, true, true, 318, 241);
	    el.css('width', '221px');
	    
	    var scriptBox = $('<textarea>');
	    var compileButton = $('<input>');
	    var errorMsg = this.thingy.errorMsg = $('<div>');
	    errorMsg.css({ 'float': 'right', 
	    	'width': '159px',
	    	'height': '36px',
	    	'overflow-y': 'auto',
	    	'overflow-x': 'hidden'
	    });
	    
	    var compileFnc = function(code) {
	    	thisNode.c.c = code;
			var fnc = null;
			errorMsg.html("");
			try {
				fnc = new Function("ev", "this.errorMsg.innerHTML = ''; try { var inp = ev.inputBuffer.getChannelData(0); var out = ev.outputBuffer.getChannelData(0);" + code + "} catch(e) { this.errorMsg.html(e.message); }");
			} catch(e) {
				errorMsg.html(e.message);
				fnc = function(event) {};
			}
			javaScriptNode.onaudioprocess = fnc;
			return this;
		};
	    
		
		scriptBox.attr('cols', '30');
		scriptBox.attr('rows', '12');
		scriptBox.val(this.c.c);
		
		compileButton.attr({
			type: 'button',
			value: 'compile'
		});
		compileButton.on("click", function() {
			compileFnc(scriptBox.val());
		});
		
		el.append(scriptBox);
		el.append($('<br/>'));
		el.append(compileButton);
		el.append(errorMsg);
		
		compileFnc(this.c.c);
	}  
});var SourceNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "son";
		this.thingy = context.createBufferSource();
		this.thingy.loop = true;
		this.name = "File";
		this.icon = "icon-file";
		this.tooltip = "Plays an audio file dragged from the filesystem"
	    
		var bufferSource = this.thingy;
		var thisNode = this;

		if(!config) {
			this.c = {
				pr: 1
			};
		}
		
		var el = this.createMainEl(true, false, true, 175);
		
		var setPlaybackRateFnc = function(el, v) {
			thisNode.c.pr = v.value;
			bufferSource.playbackRate.value = v.value;
			rateLabel.html('Rate ' + v.value);
		} 
		
		var rateRange = $('<div>');
		var rateLabel = $('<a href="#" rel="tooltip" title="Set playback rate multiplier">').tooltip();
		rateRange.slider({
			min: 0.1,
			max: 3,
			value: this.c.pr,
			step: 0.05,
			slide: setPlaybackRateFnc
		});
		el.append('<br/>');
		el.append(rateLabel);
		el.append(rateRange);
		el.append('<br/>');
		setPlaybackRateFnc(null, {value: this.c.pr});
		
		var infoEl = $('<div>');
		infoEl.html("Drag and drop a sound file to me..");
		el.append(infoEl);
		
		var info2El = this.info2El = $('<div>');
		info2El.html("Now connect me to something..");
		info2El.hide();
		el.append(info2El);
		
		el.parent()[0].addEventListener('drop', function (evt) {
		    evt.stopPropagation();
		    evt.preventDefault();
		    infoEl.hide('slow');
		    thisNode.loader.fadeIn('fast');
		    
		    var reader = new FileReader();
		    reader.onload = function(e) {
		    	if(context.decodeAudioData) {
			        context.decodeAudioData(e.target.result, function(buffer) {
			        	thisNode.loader.fadeOut('fast');
			        	bufferSource.buffer = buffer;
			        	bufferSource.start(0);
			        	if(thisNode.myConnections.length == 0) {
			        		info2El.show('fast');
			        	}
			        }, function(e) {
			        	alert('Could not play that audio file. Try another file format.');
			        });
			    } else {
			    	bufferSource.buffer = context.createBuffer(e.target.result, false /*mixToMono*/);
			    	thisNode.loader.fadeOut('fast');
			    }
		    }
		    reader.readAsArrayBuffer(evt.dataTransfer.files[0]);		    
		}, false);
		
		el.parent()[0].addEventListener('dragover', function (evt) {
		    evt.stopPropagation();
		    evt.preventDefault();
		    return false;
		}, false);
  	},
  	connectTo: function(node) {
	  	var ret = this._super(node);
		this.info2El.hide('fast');
		return ret;
  	},
  	getConnections: function() {
		return new Array();
	},
	shutdown: function() {
		this.thingy.stop(0);
	}
});var WaveShaperNode = BaseNode.extend({
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
	
});var OscillatorNode = BaseNode.extend({
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
});var MicrophoneNode = BaseNode.extend({
  	init: function(index){
  		this._super(index);
  		this.shortName = "mn";
		this.name = "Microphone";
		this.icon = " icon-user";
		this.tooltip = "Gets audio input from a microphone";
		var thisNode = this;
		this.myLazyConnections = new Array();
		var el = this.createMainEl(true, false, true, 128);

		var status = $('<p>');
		el.append(status);

		try {
			var successFnc = function (stream) {
				thisNode.thingy = context.createMediaStreamSource(stream);

				for(var i in thisNode.myLazyConnections) {
					thisNode.connectTo(thisNode.myLazyConnections[i]);
				}
				for(var j in thisNode.myConnections) {
					var toN = thisNode.myConnections[j];
					thisNode.createConnectionLine(thisNode.el,toN.el,thisNode.idx,toN.idx, false);
				}
				thisNode.updateConnectionLines();
				thisNode.myLazyConnections = new Array();

				status.html('Recording...');
			};

			var errorFnc = function(e) {
				status.html('Failed to start recording');
				console.log(e);
			};

			if(navigator.getUserMedia) {
				navigator.getUserMedia({audio: true, video: false}, successFnc, errorFnc);
			} else if (navigator.webkitGetUserMedia) {
				navigator.webkitGetUserMedia({audio: true, video: false}, successFnc, errorFnc);
			} else if (navigator.mozGetUserMedia) {
				navigator.mozGetUserMedia({audio: true, video: false}, successFnc, errorFnc);
			} else {
				status.html('Not yet supported in your browser.');	
			}
		 } catch(e) {
		 	status.html('Not yet supported in your browser.');
		 }
	},

	lazyConnectTo: function(node) {
		this.myLazyConnections.push(node);
	}
});var AnalyzerNode = BaseNode.extend({
  	init: function(index, config){
  		this._super(index, config);
  		this.shortName = "an";
  		this.thingy = context.createAnalyser();
  		this.icon = "icon-eye-open";
  		this.name = "Analyzer";
  		this.tooltip = "Provides real-time frequency and time-domain analysis information. The audio stream will be passed un-processed from input to output.";
  		var el = this.createMainEl(true, true, true);
  		el.css('margin', 0);
		
		var analyzer = this.thingy;
	    var thisNode = this;
	    if(!config) {
	    	this.c = {
	    		vm: 0
	    	};
	    }

	    var ctooltip = $('<a href="#" rel="tooltip" title="Click to change visualization">').tooltip({placement: 'bottom'});
	    el.append(ctooltip);
	    var soundVisualizer = new SoundVisualizer(ctooltip, 150, 120);
	    soundVisualizer.canvas.on('click', function() {
	    	thisNode.c.vm++;
	    	if(thisNode.c.vm == 2) {
	    		soundVisualizer.clear();
	    	} else if(thisNode.c.vm == 3) {
	    		thisNode.c.vm = 0;
	    		window.requestAnimationFrame(onaudioprocess);
	    	}
	    })

	    var data = null; 
	    var onaudioprocess = function() {
		    if(data == null) {
		    	data = new Uint8Array(analyzer.frequencyBinCount);
		    }
		    if(thisNode.c.vm == 0) {
		    	analyzer.getByteTimeDomainData(data);
			    soundVisualizer.visualizeTimeDomainData(data);
			    window.requestAnimationFrame(onaudioprocess);
		    } else if(thisNode.c.vm == 1) {
		    	analyzer.getByteFrequencyData(data);
			    soundVisualizer.visualizeFrequencyData(data);
		    	window.requestAnimationFrame(onaudioprocess);
		    }
		};
		
		window.requestAnimationFrame(onaudioprocess);
  	}
});var TextToSpeechNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "tts";
		this.thingy = context.createBufferSource();
		this.name = "Text To Speech";
		this.icon = "icon-font";
		this.tooltip = "Uses the brilliant speak.js to speak the text";
	    var thisNode = this;

	    if(!config) {
	    	this.c = {
	    		t: "All your bases are belong to us!",
	    		p: 50,
	    		s: 150,
	    		g: 0
	    	};
	    }
	    
	    var setPitchFnc = function(el, v) { thisNode.c.p = v.value; pitchLabel.html('Pitch ' + v.value); } 
	    var setSpeedFnc = function(el, v) { thisNode.c.s = v.value; speedLabel.html('Speed ' + v.value + ' word / minute'); }
	    var setWordGapFnc = function(el, v) { thisNode.c.g = v.value; wordGapLabel.html('Word Gap ' + v.value + ' ms'); }
		
	    var el = this.createMainEl(true, false, true, 313, 241);
	    el.css('width', '221px');
	    
	    var pitchRange = $('<div>');
		var pitchLabel = $('<a href="#" rel="tooltip" title="The voice pitch">').tooltip();
		pitchRange.slider({
			min: 10,
			max: 100,
			value: this.c.p,
			step: 1,
			slide: setPitchFnc
		});
		el.append(pitchLabel);
		el.append(pitchRange);
		setPitchFnc(null, {value: this.c.p});
		
		var speedRange = $('<div>');
		var speedLabel = $('<a href="#" rel="tooltip" title="The speed at which to talk">').tooltip();
		speedRange.slider({
			min: 10,
			max: 300,
			value: this.c.s,
			step: 1,
			slide: setSpeedFnc
		});
		el.append(speedLabel);
		el.append(speedRange);
		setSpeedFnc(null, {value: this.c.s});
		
		var wordGapRange = $('<div>');
		var wordGapLabel = $('<a href="#" rel="tooltip" title="Additional gap between words">').tooltip();
		wordGapRange.slider({
			min: 0,
			max: 200,
			value: this.c.g,
			step: 10,
			slide: setWordGapFnc
		});
		el.append(wordGapLabel);
		el.append(wordGapRange);
		setWordGapFnc(null, {value: this.c.g});
	    
	    var textBox = $('<textarea>');
	    var speakButton = $('<input>');
	    
	    var speakFnc = function(text) {
	    	thisNode.c.t = text;
	    	thisNode.loader.fadeIn('fast');
	    	speakButton.attr('disabled', 'true');
	    	
	    	var speakWorker = new Worker('js/speakWorker.js');

	    	speakWorker.onmessage = function(event) {
    			thisNode.thingy = context.createBufferSource();
	    		context.decodeAudioData(event.data.buffer, function(buffer) {
	    			thisNode.thingy.buffer = buffer;
	    			for(var i in thisNode.myConnections) {
	    				var node = thisNode.myConnections[i];
	    				var conns = node.getConnections();
	    				for(var i in conns) {
	    					thisNode.thingy.connect(conns[i]);
	    				}
					}
	    			thisNode.thingy.start(0);
	    			
	    			setTimeout(function() {
	    				thisNode.thingy.stop(0);
	    				for(var i in thisNode.myConnections) {
		    				var node = thisNode.myConnections[i];
		    				var conns = node.getConnections();
		    				for(var i in conns) {
		    					thisNode.thingy.disconnect(conns[i]);
		    				}
						}
	    				speakButton.removeAttr('disabled');
	    			}, buffer.duration * 1000)
	    			
	    			thisNode.loader.fadeOut('fast');
	    		});
	    	};

	    	speakWorker.postMessage({
	    		text : text,
	    		args : {
	    			pitch: thisNode.c.p,
	    			speed: thisNode.c.s,
	    			wordgap: thisNode.c.g/10
	    		}
	    	});
		};
		
		textBox.attr('cols', '30');
		textBox.attr('rows', '6');
		textBox.css('height', '105px');
		textBox.val(this.c.t);
		
		speakButton.attr({
			type: 'button',
			value: 'Speak'
		});
		speakButton.on("click", function() {
			speakFnc(textBox.val());
		});
		
		el.append($('<br/>'));
		el.append(textBox);
		el.append($('<br/>'));
		el.append(speakButton);
	}  
});var PianoNode = BaseNode.extend({
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
});var NoiseNode = BaseNode.extend({
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
});var VibratoNode = BaseNode.extend({
  	init: function(index, config){
		this._super(index, config);
		this.shortName = "vn";
		this.thingy = context.createScriptProcessor(4096, 1, 1);
		this.name = "Vibrato";
		this.icon = "icon-leaf";
		this.tooltip = "Adds a vibrato effect to the signal";
	    var el = this.createMainEl(true, true, true, 110);
	    var thisNode = this;

	    if(!config) {
	    	this.c = {
	    		v: 0.5,
	    		s: 1.0
	    	};
	    }
	    
	    var setAmountFnc = function(el, v) {
	    	thisNode.c.v = v.value;
			amountLabel.html('Amount ' + v.value);
		} 
	    var setSpeedFnc = function(el, v) {
	    	thisNode.c.s = v.value;
			speedLabel.html('Speed ' + v.value);
		}
		
		var amountRange = $('<div>');
		var amountLabel = $('<a href="#" rel="tooltip" title="Set vibrato amount">').tooltip();
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
		
		var speedRange = $('<div>');
		var speedLabel = $('<a href="#" rel="tooltip" title="Set vibrato speed">').tooltip();
		speedRange.slider({
			min: 0,
			max: 3,
			value: this.c.v,
			step: 0.01,
			slide: setSpeedFnc
		});
		el.append(speedLabel);
		el.append(speedRange);
		setSpeedFnc(null, {value: this.c.s});
		
		var cc = 0;
		this.thingy.onaudioprocess = function(ev) {
			var inp = ev.inputBuffer.getChannelData(0); 
			var out = ev.outputBuffer.getChannelData(0);
			for (var i = 0; i < inp.length; i++) {
				out[i] = inp[i] * (1+Math.sin(cc*thisNode.c.s*0.001)*thisNode.c.v);
				cc++;
			}
		}
	}
});var PitchNode = BaseNode.extend({
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
});var SaveHandler = Class.extend({
	init: function(){
		this.localStorageSavePrefix = "save_";
	},
	createSaveData: function() {
		var save = {
			nodes: []
		};

		for(var i in nodes) {
			var n = nodes[i];
			if(!n.deleted) {
				var conns = new Array();
				for(var j in n.myConnections) {
					if(!n.myConnections[j].deleted) {
						conns.push(n.myConnections[j].idx);
					}
				}

				save.nodes.push({
					i: n.idx,
					sn: n.shortName,
					d: n.c,
					p: n.el.offset(),
					c: conns
				});
			}
		}

		return window.btoa(JSON.stringify(save));
	},
	loadSaveData: function(data) {
		//parse data
		var save = JSON.parse(window.atob(data));

		//clean up old nodes
		for(var i in nodes) {
			for(var j in nodes[i].myConnections) {
				nodes[i].disconnectFrom(nodes[i].myConnections[j]);
			}
			nodes[i].shutdown();
			nodes[i].el.remove();
		}
		$('.line').remove();
		nodes = new Array();

		//create saved nodes
		for(var i in save.nodes) {
			var n = save.nodes[i];
			var node = this.createNodeFromString(n);
			node.el.offset(n.p);
			nodes[n.i] = node;
		}

		//connect saved nodes
		for(var i in save.nodes) {
			var n = save.nodes[i];
			if(n.c.length > 0) {
				for(var j in n.c) {
					var connectTo = n.c[j];
					var connectFrom = nodes[n.i];
					if(connectFrom instanceof MicrophoneNode) {
						connectFrom.lazyConnectTo(nodes[connectTo]);
					} else {
						connectFrom.connectTo(nodes[connectTo]);
					}
				}
			}
		}

		//create connection lines
		for(var i in nodes) {
			var fromN = nodes[i];
			if(fromN) {
				for(var j in fromN.myConnections) {
					var toN = fromN.myConnections[j];
					fromN.createConnectionLine(fromN.el,toN.el,fromN.idx,toN.idx, false);
				}
				fromN.updateConnectionLines();
			}
		}
	},
	createNodeFromString: function(n) {
		var node = null;
		switch(n.sn) {
			case 'mn': node = new MicrophoneNode(n.i, n.d); break;
			case 'gn': node = new GainNode(n.i, n.d); break;
			case 'scn': node = new ScriptNode(n.i, n.d); break;
			case 'son': node = new SourceNode(n.i, n.d); break;
			case 'bfn': node = new BiquadFilterNode(n.i, n.d); break;
			case 'cn': node = new ConvolverNode(n.i, n.d); break;
			case 'deln': node = new DelayNode(n.i, n.d); break;
			case 'dstn': node = new DestinationNode(n.i, n.d); break;
			case 'dcn': node = new DynamicsCompressorNode(n.i, n.d); break;
			case 'wsn': node = new WaveShaperNode(n.i, n.d); break;
			case 'on': node = new OscillatorNode(n.i, n.d);	 break;
			case 'an': node = new AnalyzerNode(n.i, n.d); break;
			case 'tts': node = new TextToSpeechNode(n.i, n.d); break;
			case 'pn': node = new PianoNode(n.i, n.d); break;
			case 'nn': node = new NoiseNode(n.i, n.d); break;
			case 'vn': node = new VibratoNode(n.i, n.d); break;
			case 'ptn': node = new PitchNode(n.i, n.d); break;
		}
		return node;
	},
	saveToLocalStorage: function(saveName) {
		var data = this.createSaveData();
		localStorage[this.localStorageSavePrefix + saveName] = data;
	}, 
	loadFromLocalStorage: function(saveName) {
		var data = localStorage[this.localStorageSavePrefix + saveName];
		this.loadSaveData(data);
	},
	getAllSavesInLocalStorage: function() {
		var saves = new Array();
		for (var i = 0; i < localStorage.length; i++) {  
	        var key = localStorage.key(i);
	        if(key.substr(0,5) === this.localStorageSavePrefix) {
	        	saves.push(key.substr(5));
	        }
	    }
		return saves;
	}
	 
});(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var nodes = new Array();
var context = null;
var connLineWidth = 30;

$(function() {
	
	var populateLoadSelect = function() {
		var loadSelect = $('#loadSelect');
		var loadNothing = $('#loadNothing');
		var loadOkBtn = $('#loadOkBtn');
		loadSelect.empty();
		
		var saves = new SaveHandler().getAllSavesInLocalStorage();
		for(var i in saves) {
			loadSelect.append($('<option>').html(saves[i]));
		}
		if(saves.length === 0) {
			loadSelect.hide();
			loadNothing.show();
			loadOkBtn.addClass('disabled');
		} else {
			loadSelect.show();
			loadNothing.hide();
			loadOkBtn.removeClass('disabled');
		}
	}

	$('body').css('height', window.innerHeight - 40);
	$('a.brand').tooltip({placement: 'bottom'});
	$('#firstTimeChk').on('change', function() {
		if(this.checked) {
			localStorage["beenherebefore"] = 'yes';
		} else {
			localStorage.removeItem("beenherebefore");
		}
	});
	$('#pianoInfoChk').on('change', function() {
		if(this.checked) {
			localStorage["shownPianoInfo"] = 'yes';
		} else {
			localStorage.removeItem("shownPianoInfo");
		}
	});

	var addNodeFnc = function(str) {
		var sh = new SaveHandler();
		var n = sh.createNodeFromString({sn: str, i: nodes.length});
		nodes.push(n);
		return n;
	};
	
	$('ul.nodeslist > li > a').draggable({
		revert: true
	});

	$('body').droppable({
		accept: "ul.nodeslist > li > a",
		drop: function( event, ui ) {
			var t = $(ui.draggable[0]).attr('data-nodetype');
			var n = addNodeFnc(t);		
			n.el.offset({ left: event.clientX, top: event.clientY });
		}
	});

	$('ul.nodeslist > li > a').on('click', function() {
		var t = $(this).attr('data-nodetype');
		addNodeFnc(t);
	});

	try {
		context = new (window.AudioContext || window.webkitAudioContext)();
	} catch(e) {
		context = null;
	}

	document.onkeydown = function(e) {
		for(var i in nodes) {
			if(nodes[i] && nodes[i] instanceof PianoNode) {
				nodes[i].onkeydown(e);
			}
		}
	};

	document.onkeyup = function(e) {
		for(var i in nodes) {
			if(nodes[i] && nodes[i] instanceof PianoNode) {
				nodes[i].onkeyup(e);
			}
		}
	};
	
	if(context == null) {
		$('#noWebAudioBox').modal();
	} else {
		//some kind fo bug makes audio analyze not kick in if creating destination node directly
		setTimeout(function() {
			var p = getUrlParams();
			if(p.data) {
				new SaveHandler().loadSaveData(p.data);
			} else {
				nodes[0] = new SourceNode(0);
				nodes[1] = new DestinationNode(1);
				
				nodes[0].el.offset({left: 250, top: window.innerHeight/2-100});
				nodes[1].el.offset({left: window.innerWidth - 200, top: window.innerHeight/2-150});
			}
			
			if(!localStorage["beenherebefore"] && !p.data) {
				localStorage["beenherebefore"] = 'yes';
				$('#firstTimeBox').modal();
			}
			
		}, 700);

		$('#saveOkBtn').on('click', function() {
			var saveName = $('#saveTxt').val();
			if(saveName.length > 0) {
				new SaveHandler().saveToLocalStorage(saveName);
				populateLoadSelect();
				$('#saveBox').modal('hide');
			}
		});
		
		$('#saveTxt').on('keyup', function() {
			if($(this).val().length == 0) {
				$('#saveOkBtn').addClass('disabled');
			} else {
				$('#saveOkBtn').removeClass('disabled');
			}
		});

		$('#loadOkBtn').on('click', function() {
			var saveName = $('#loadSelect').val();
			new SaveHandler().loadFromLocalStorage(saveName);
			$('#saveTxt').val(saveName);
			$('#saveOkBtn').removeClass('disabled');
			$('#loadBox').modal('hide');
		});
		
		$('#shareBtn').on('click', function() {
			var shareUrl = window.location.origin + window.location.pathname + "?data=" + new SaveHandler().createSaveData();
			$('#shareLink').attr("href", shareUrl).html(shareUrl);
			$('#shareBox').modal();
		})
		populateLoadSelect();

		$(document.body).on("keypress", "select", function(event) {
			event.preventDefault();
		});
	}
}); 

function getUrlParams() {
  var params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
    params[key] = value;
  });
 
  return params;
}