var Box2D = require('./box2d.js');
var world;
var SCALE = 50;
var size = 70;
var w = 1000; 
var h = 3000;
var fps = 30;
var PI2 = Math.PI * 2;
var drawData;
var simulating = true;
var md;

var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2AABB = Box2D.Collision.b2AABB,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2Fixture = Box2D.Dynamics.b2Fixture,
	b2World = Box2D.Dynamics.b2World,
	b2MassData = Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
	b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
	b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;



function createObjects(x, y, width, height) {
	var domObj = {id:'foo'};
	var domPos = {left:x, top:y};
	
	var x = (domPos.left) + width;
	var y = (domPos.top) + height;
	var body = createBox(x,y,width,height, false);
	body.m_userData = {domObj:domObj, width:width, height:height};
}

function createBox(x,y,width,height, static) {
	var bodyDef = new b2BodyDef;
	bodyDef.type = static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
	bodyDef.position.x = x / SCALE;
	bodyDef.position.y = y / SCALE

	var fixDef = new b2FixtureDef;
 	fixDef.density = 1.0;
 	fixDef.friction = 0.3;
 	fixDef.restitution = 0.25;

	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(width / SCALE, height / SCALE);

	return world.CreateBody(bodyDef).CreateFixture(fixDef);
}

function getUpdateData() {
	var ret = [];
	var oldDrawData = drawData;
	drawData = [];

	var g = 0;
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var f = b.m_fixtureList; f; f = f.m_next) {
			if (f.m_userData) {
				var xx = ((f.m_body.m_xf.position.x * SCALE) -  f.m_userData.width).toFixed(1);
				var yy = ((f.m_body.m_xf.position.y * SCALE) - f.m_userData.height).toFixed(1);
				var rr = ((f.m_body.m_sweep.a + PI2) % PI2).toFixed(2);
				if(oldDrawData && oldDrawData[g] && 
				   (xx != oldDrawData[g].x || yy != oldDrawData[g].y || rr != oldDrawData[g].r)) {
					ret.push(xx + '_' + yy + '_' + rr + '_' + g);
				}

				drawData.push({
					x: xx,
					y: yy,
					r: rr,
					w: (f.m_userData.width * 2).toFixed(1),
					h: (f.m_userData.height * 2).toFixed(1)
				});
				g++;
			}
		}
	}
	return ret;
};

function getJointData() {
	var ret = [];
	var jj, aa ,ab;
	for (var y = 0; y < mouseJoints.length; y++) {
		jj = mouseJoints[y];
		aa = jj.GetAnchorA();
		ab = jj.GetAnchorB();
		ret.push((aa.x*SCALE).toFixed(1) + '_' + (aa.y*SCALE).toFixed(1) + '_' + (ab.x*SCALE).toFixed(1) + '_' + (ab.y*SCALE).toFixed(1));
	}
	return ret;
}

function dragBodyAtMouse(ss, socket) {
	var p = new b2Vec2();
	p.x = ss.x/SCALE;
	p.y = ss.y/SCALE;

	var selectedBody = null;

	world.QueryPoint(function(fixture) {
		if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
			selectedBody = fixture.GetBody();
			return false;
		}
		return true;
        }, p);

	if(selectedBody) {
		socket.get('mousejoint'+ss.i, function (err, mouseJoint) {
			if(mouseJoint) {
				mouseJoints.splice(mouseJoints.indexOf(mouseJoint), 1);
				world.DestroyJoint(mouseJoint);
			}
			md.bodyB = selectedBody;
			md.target.Set(ss.x/SCALE, ss.y/SCALE);
			var mJ = world.CreateJoint(md);
			selectedBody.SetAwake(true);

			socket.set('mousejoint'+ss.i, mJ);
			mouseJoints.push(mJ);
		});
	}
	return selectedBody != null;
}

function allBodiesSleeping() {

	for (var b = world.m_bodyList; b; b = b.m_next) {
		if(b.GetType() != b2Body.b2_staticBody && b.IsAwake()) {
			return false;
		}
	}
	return true;
}

//Method for animating
function update(connections) {
	world.Step(
	1 / fps //frame-rate
	, 10 //velocity iterations
	, 10 //position iterations
	);

	var upd = getUpdateData();
	if(upd.length > 0) {
		io.sockets.volatile.emit('u', {u: upd, j: getJointData()});
	}
	
	world.ClearForces();

	if(mouseJoints.length > 0 || !allBodiesSleeping()) {
		setTimeout(function() {update(connections)},1000/fps);
	} else {
		simulating = false;
	}
}

function init(connections) {

	//Create the Box2D World with horisontal and vertical gravity (10 is close enough to 9.8)
	world = new b2World(
	new b2Vec2(0, 10) //gravity
	, true //allow sleep
	);
	
	md = new b2MouseJointDef();
	md.bodyA = world.GetGroundBody();
	md.collideConnected = true;
	md.maxForce = 120.0;

		//Create DOB OBjects
	for(var i = 0; i < 15; i++) {
		createObjects(Math.random()* (w-size),
				 h - Math.random() * (h/3) - size,
				 (Math.random()*size)+15,
				(Math.random()*size/2)+15);
	}

	var wt = 200;
	createBox(0, -wt , w, wt, true);
	createBox(0, h+wt , w, wt, true);
	createBox(-wt,0,wt,h, true);
	createBox(w+wt,0,wt,h, true);

	getUpdateData();
	update(connections)
}

var connections = [];
var mouseJoints = [];

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

io.set('log level', 1);
var pport = process.env.PORT || 80;
server.listen(pport);

io.sockets.on('connection', function (socket) {
	connections.push(socket);
	logUsersToClients();

	socket.emit('d', drawData);	
	
	socket.on('disconnect', function () {

		for(var i = 0; i < 10; i++) {
			socket.get('mousejoint'+i, function (err, mouseJoint) {
				if(mouseJoint) {
					mouseJoints.splice(mouseJoints.indexOf(mouseJoint), 1);
					world.DestroyJoint(mouseJoint);
				}
			});
		}

		connections.splice(connections.indexOf(socket), 1);
		logUsersToClients();
	});

	socket.on('md', function(data) {
		var gotBody = dragBodyAtMouse(data, socket);
		if(!simulating && gotBody) {
			simulating = true;
			setTimeout(function() {update(connections)},1000/fps);
		}
	});

	socket.on('mu', function(data) {
		socket.get('mousejoint'+data.i, function (err, mouseJoint) {
			if(mouseJoint) {
				mouseJoints.splice(mouseJoints.indexOf(mouseJoint), 1);
				world.DestroyJoint(mouseJoint);
				socket.set('mousejoint'+data.i, null);
			}
		});
	});

	socket.on('mm', function(data) {
		socket.get('mousejoint'+data.i, function (err, mouseJoint) {
			if(mouseJoint) {
				mouseJoint.SetTarget(new b2Vec2(data.x/SCALE, data.y/SCALE));
			}
		});
	});
});

function logUsersToClients() {
	if(connections.length == 1) {
		io.sockets.emit('s', 'You are currently the only user.');
	} else {
		io.sockets.emit('s', 'Now there are ' + connections.length + ' users.');
	}
}

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/img/gray_jean.png', function (req, res) {
  res.sendfile(__dirname + '/img/gray_jean.png');
});

app.get('/img/wood.png', function (req, res) {
  res.sendfile(__dirname + '/img/wood.png');
});

app.get('/css/alertify.css', function (req, res) {
  res.sendfile(__dirname + '/css/alertify.css');
});

app.get('/js/alertify.min.js', function (req, res) {
  res.sendfile(__dirname + '/js/alertify.min.js');
});

init(connections);
