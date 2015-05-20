var MicrophoneNode = BaseNode.extend({
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
});