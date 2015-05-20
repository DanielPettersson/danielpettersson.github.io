var SaveHandler = Class.extend({
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
	 
});