TD.Monster = TD.Displayable.extend({
  init: function(parent, textureSrc, path, speed, life){
    var _pos = {
      x: path.path[0].x,
      y: path.path[0].y
    }

    this.life = life;
    this.pos = _pos;
    this._super(parent, textureSrc, _pos);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 1.0;
    this.sprite.pivot.x = 0.5;
    this.sprite.pivot.y = 1.0;

    var that = this;
    this.path = path;
    this.speed = speed;
    this.alive = true;
    this.dying = false;

    // Move
    
    this.tween = TweenMax.to(this.pos, path.len / 80, {
      bezier: {'values': path.path},
      ease: 'Linear.easeNone',
      onComplete: function() {
        that.alive = false;
      }
    });
    this.tween.timeScale(speed);

    // Wiggle
    this.sprite.rotation = 0.1;
    var rotateFnc = function() {
      TweenMax.to(that.sprite, (1/that.speed)/3, {
        rotation: -that.sprite.rotation,
        onComplete: function() {
          rotateFnc();
        }
      })
    }
    rotateFnc();

  },
  updatePosition: function() {
    this.sprite.position.x = this.pos.x;
    this.sprite.position.y = this.pos.y;
  },
  hit: function(damage) {
    
    this.life -= damage;

    if (this.life <= 0) {
      this.die();
    } 
    this.sprite.tint = 0xFF0000;
    TweenMax.to(this.sprite, 0.3, {tint: 0xFFFFFF});
    this.sprite.scale.x = 1.4;
    TweenMax.to(this.sprite.scale, 0.4, {x: 1.0});
    this.sprite.scale.y = 1.2;
    TweenMax.to(this.sprite.scale, 0.4, {y: 1.0});
  },
  die: function() {
    this.tween.kill();
    this.dying = true;

    var that = this;
    TweenMax.to(this.sprite, 1, {alpha: 0, onComplete: function() {
      that.alive = false; 
    }});
  }
});

TD.Dragon = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/dragon/small.png', path, 0.71, 150);
  }
});

TD.OctoDragon = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/octodragon/small.png', path, 1.02, 100);
  }
});

TD.Wolf = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/wolf/small.png', path, 1.33, 20);
  }
});

TD.Troll = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/troll/small.png', path, 0.64, 75);
  }
});

TD.Swordman = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/swordman/small.png', path, 0.75, 40);
  }
});

TD.Spider = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/spider/small.png', path, 1.06, 40);
  }
});

TD.Bat = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/bat/small.png', path, 0.87, 10);
  }
});

TD.Bird = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/bird/small.png', path, 0.68, 10);
  }
});

TD.IceTroll = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/icetroll/small.png', path, 0.59, 100);
  }
});

TD.Rat = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/rat/small.png', path, 0.86, 10);
  }
});

TD.Sheep = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/sheep/small.png', path, 0.61, 25);
  }
});

TD.Fireman = TD.Monster.extend({
  init: function(parent, path) {
    this._super(parent, 'img/monsters/fireman/small.png', path, 0.82, 200);
  }
});