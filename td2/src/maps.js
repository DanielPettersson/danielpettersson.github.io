TD.Map = TD.Displayable.extend({
  init: function(textureSrc, paths){
    this._super(TD.pixiStage, textureSrc);

    var that = this;
    this.paths = paths;

    for (var i in this.paths) {

      var len = 0;
      for (var j = 0; j < this.paths[i].path.length - 1; j++) {
        len += distance(this.paths[i].path[j], this.paths[i].path[j+1]).d;
      }
      this.paths[i].len = len;
    }

    this.sprite.setInteractive(true);
    this.sprite.click = function(data) {
      new TD.BombTower(that.sprite, {x: data.global.x, y: data.global.y});
    };
  },
  zIndex: function() {

    this.sprite.children.sort(function(a,b){
      return a.position.y-b.position.y;
    });
  }
});

TD.mapAdded = function() {
  
  setInterval(function() {
      
      if (Math.random() < 0.08) TD.monsters.push(new TD.Dragon (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Wolf (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Troll (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Swordman (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Spider (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.OctoDragon (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Bat (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Bird (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.IceTroll (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Rat (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Sheep (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      if (Math.random() < 0.08) TD.monsters.push(new TD.Fireman (TD.map.sprite, TD.map.paths[getRandomInt(0, TD.map.paths.length-1)]));
      
  }, 1000);
};

TD.Map1 = TD.Map.extend({
  init: function(){
    this._super('img/maps/1.jpg', [
      {path: [
        {'x': 158, 'y': -50}, {'x': 221, 'y': 172}, {'x': 231, 'y': 351},
        {'x': 155, 'y': 486}, {'x': 280, 'y': 576}, {'x': 425, 'y': 500},
        {'x': 510, 'y': 324}, {'x': 649, 'y': 324}, {'x': 739, 'y': 451},
        {'x': 875, 'y': 614}, {'x': 1050, 'y': 630}
      ]},
      {path: [
        {'x': 212, 'y': -50}, {'x': 270, 'y': 168}, {'x': 263, 'y': 364},
        {'x': 199, 'y': 477}, {'x': 288, 'y': 538}, {'x': 410, 'y': 467},
        {'x': 509, 'y': 285}, {'x': 658, 'y': 290}, {'x': 805, 'y': 300},
        {'x': 1050, 'y': 157}
      ]}
    ]);
    new TD.BombTower(this.sprite, {x: 111, y: 150});
    new TD.BombTower(this.sprite, {x: 310, y: 450});
    new TD.BombTower(this.sprite, {x: 580, y: 400});
  }
});

TD.Map2 = TD.Map.extend({
  init: function(){
    this._super('img/maps/2.jpg', [
      {path: [
        {'x': 515, 'y': -50}, {'x': 495, 'y': 270}, {'x': 320, 'y': 322},
        {'x': 187, 'y': 240}, {'x': 112, 'y': 376}, {'x': 178, 'y': 531},
        {'x': 398, 'y': 606}, {'x': 663, 'y': 558}, {'x': 864, 'y': 626},
        {'x': 897, 'y': 785}
      ]},
      {path: [
        {'x': 546, 'y': -50}, {'x': 545, 'y': 130}, {'x': 663, 'y': 215},
        {'x': 819, 'y': 277}, {'x': 828, 'y': 421}, {'x': 701, 'y': 525},
        {'x': 740, 'y': 576}, {'x': 855, 'y': 652}, {'x': 909, 'y': 785}
      ]}
    ]);
    new TD.BombTower(this.sprite, {x: 660, y: 120});
    new TD.BombTower(this.sprite, {x: 220, y: 400});
    new TD.BombTower(this.sprite, {x: 600, y: 500});
  }
});