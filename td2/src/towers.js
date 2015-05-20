TD.Tower = TD.Displayable.extend({
	init: function(parent, textureSrc, pos, bulletName, bulletOffset, shotDelay, range) {
		this._super(parent, textureSrc, pos);
		this.range = range;
		this.shotDelay = shotDelay;
		this.bullets = [];
		this.bulletName = bulletName;
		this.bulletOffset = bulletOffset;
		this.sprite.anchor.x = 0.5;
    	this.sprite.anchor.y = 1.0;
    	this.lastshoottime = 0;
    	TD.towers.push(this);
	},
	tryshoot: function() {

		if (performance.now() - this.lastshoottime > this.shotDelay) {
			var target;
			for (var i in TD.monsters) {
				var dist = distance(this.sprite.position, TD.monsters[i].sprite.position);
				if (dist.d < this.range && TD.monsters[i].dying === false) {
					if (!target || target.tween.ratio < TD.monsters[i].tween.ratio) {
						target = TD.monsters[i];
					}
				}
			}

			if (target) {

				this.sprite.scale.x = 1.1;
			    TweenMax.to(this.sprite.scale, 0.2, {x: 1.0});
			    this.sprite.scale.y = 1.1;
			    TweenMax.to(this.sprite.scale, 0.2, {y: 1.0});

				TD.createBulletInstance(
					this.bulletName, 
					this.parent, 
					{
						x: this.sprite.position.x + this.bulletOffset.x, 
						y: this.sprite.position.y + this.bulletOffset.y
					}, 
					target
				);
			}

			this.lastshoottime = performance.now();
		}

	}
	

});

TD.AxeTower = TD.Tower.extend({
	init: function(parent, pos) {
		this._super(parent, 'img/towers/tower1.png', pos, 'Axe', {x: 10, y: -100}, 1000, 200);
	}
});

TD.BombTower = TD.Tower.extend({
	init: function(parent, pos) {
		this._super(parent, 'img/towers/tower2.png', pos, 'CannonBall', {x: 10, y: -100}, 1500, 150);
	}
});