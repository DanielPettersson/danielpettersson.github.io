TD.createBulletInstance = function(name, parent, pos, target) {

	var bullet;
	switch (name) {
		case 'CannonBall':
			bullet =  new TD.CannonBall(parent, pos, target);
		case 'Axe':
			bullet =  new TD.Axe(parent, pos, target);

	}

	TD.bullets.push(bullet);
}

TD.Bullet = TD.Displayable.extend({
	init: function(parent, textureSrc, target, pos, speed, damage) {
		this._super(parent, textureSrc, pos);
		this.target = target;
		this.speed = speed;
		this.alive = true;
		this.sprite.anchor.x = 0.5;
    	this.sprite.anchor.y = 0.5;
    	this.damage = damage;
	},
	updatePosition: function() {

		if (TD.monsters.indexOf(this.target) == -1) {
			this.alive = false;
		}

		var targetPos = {};
		targetPos.x = this.target.sprite.position.x;
		targetPos.y = this.target.sprite.position.y - this.target.sprite.height / 2;

		var d = distance(this.sprite.position, targetPos);

		if (d.d < this.speed * 2) {

			this.alive = false;
        	this.target.hit(this.damage);

		} else {

			this.sprite.position.x -= this.speed * (d.dx/d.d);
			this.sprite.position.y -= this.speed * (d.dy/d.d);
		}
	}
});

TD.CannonBall = TD.Bullet.extend({
	init: function(parent, pos, target) {
		this._super(parent, 'img/bullets/cannon_ball.png', target, pos, 7, 20);
	}
});

TD.Axe = TD.Bullet.extend({
	init: function(parent, pos, target) {
		this._super(parent, 'img/bullets/axe.png', target, pos, 5, 10);
	}
});