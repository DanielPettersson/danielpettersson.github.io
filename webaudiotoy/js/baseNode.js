var BaseNode = Class.extend({
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
});