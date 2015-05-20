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
            title: 'TwitterGraph <a href="http://uglyhack.appspot.com/artistgraph/">ArtistGraph</a>',
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
					'<a href="http://www.twitter.com" target="_blank">Twitter</a>. ' + 
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
			html: '<div id="scene" />'
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
				    		getTwitterData(record.data.screenName);
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
			region: 'south',
			html: '<div id="statusText" />',
			height: 20
		}]
    });
    
	Ext.MessageBox.prompt('Twitter', 
	 	'Please enter any Twitter username', 
		function(button, text) {
			if (button == 'ok'){
				initTwitterGraph();
           		getRootNode(text);
			}
    });
	
	
});