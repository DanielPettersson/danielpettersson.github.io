Ext.require(['*']);

var theViewport;

Ext.onReady(function() {

	Ext.define('Artist', {
	    extend: 'Ext.data.Model',
	    fields: [
	        {name: 'screenName', type: 'string'}
	    ]
	});
	
	Ext.create('Ext.data.Store', {
	    storeId:'artistStore',
	    model: 'Artist',
	    data: []
	});

	Ext.QuickTips.init();
    theViewport = Ext.create('Ext.Viewport', {
        layout: {
            type: 'border',
            padding: 0
        },
        items: [{
            region: 'north',
			padding: 2,
            collapsible: true,
            title: 'ArtistGraph <a href="http://uglyhack.appspot.com/twittergraph/">TwitterGraph</a>',
            height: 65,
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			items: [{
					flex: 1,
					html: 'Powered by <a href="http://github.com/mrdoob/three.js" target="_blank">three.js</a>,' + 
					'<a href="http://www.sencha.com/products/extjs" target="_blank">Ext JS</a>, ' + 
					'<a href="http://www.jquery.com" target="_blank">jQuery</a> and ' + 
					'<a href="http://www.lastfm.com" target="_blank">last.fm</a>. ' + 
					'Made by <a href="mailto:daniel.g.pettersson@gmail.com">Daniel Pettersson</a></br>' +
					'MOVE mouse & press LEFT/A: rotate, MIDDLE/S: zoom, RIGHT/D: pan</br></br>'
					
				},
				{
					flex: 1,
					html: '<iframe src="social.html" width="600" height="90" frameborder="0"></iframe>'
			}]
        },{
			id: 'sceneContainer',
			region: 'center',
            border: false,
			html: '<div id="scene"><div class="overlaybottom"><a href="http://www.chromeexperiments.com/detail/artistgraph/"><img src="../resources/badge-white_black.png" alt="See my Experiment on ChromeExperiments.com" /></a></div></div>'
        },{
			region: 'west',
			width: 200,
			items: [
				Ext.create('Ext.grid.Panel', {
				    title: 'Click in list to add to graph',
				    store: Ext.data.StoreManager.lookup('artistStore'),
				    autoScroll: true,
				    height: '100%',
				    columns: [
				        { header: 'Name',  dataIndex: 'screenName', flex: 1 }
				    ],
				    listeners: {
				    	select: function(me, record, index) {
				    		getArtistData(record.data.screenName);
				    	},
				    	itemmouseenter: function(me, record) {
				    		setNodeSelected(record.data.screenName, true);				    		
				    	},
				    	itemmouseleave: function(me, record) {
				    		setNodeSelected(record.data.screenName, false);
				    	}
				    }
				})
			]
		},{
			region: 'east',
			width: 200,
			items: [{
				fieldLabel: 'repulsiveForce',
				value: 0.2,
			    increment: 0.01,
			    minValue: 0,
			    maxValue: 1.0,
			    decimalPrecision: 2,
				listeners: {
			        change: function(me, value) {
						repulsiveForce = value;
					}
				}
			},{
				fieldLabel: 'attractiveForce',
				value: 0.00002,
			    increment: 0.000001,
			    minValue: 0,
			    maxValue: 0.0001,
			    decimalPrecision: 6,
				listeners: {
			        change: function(me, value) {
						attractiveForce = value;
					}
				}
			}],
			defaults: {
				xtype: 'slider',
				labelAlign: 'top',
				width: 180,
			    value: 50,
			    increment: 10,
			    minValue: 0,
			    maxValue: 200
			}
		}]
    });
	
	Ext.MessageBox.prompt('Artist', 
	 	'Please enter your most favourite artist in the whole wide world', 
		function(button, text) {
			if (button == 'ok'){
				initArtistGraph();
           		getRootNode(text);
			}
    });
	
});