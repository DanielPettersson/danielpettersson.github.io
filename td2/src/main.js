var TD = {
    pixiStage: null,
    renderer: null,
    monsters: [],
    bullets: [],
    towers: [],
    map: null
};

TD.Displayable = Class.extend({
  init: function(parent, textureSrc, pos, scale){
    this.parent = parent;

    if (textureSrc) {
        this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage(textureSrc));
    } else {
        this.sprite = new PIXI.DisplayObjectContainer();
    }
    

    if (pos) {
        this.sprite.position.x = pos.x;
        this.sprite.position.y = pos.y;
    }

    if (scale) {
        this.sprite.scale.x = scale.x;
        this.sprite.scale.y = scale.y;
    }

    parent.addChild(this.sprite);
  }
});



$(function() {
    TD.renderer = new PIXI.autoDetectRenderer(1000, 735);
    document.body.appendChild(TD.renderer.view);
    scaleRenderer();

    $(window).resize(scaleRenderer);
    TD.pixiStage = new PIXI.Stage;
    requestAnimationFrame(animate);

    if (Math.random() < 0.5) {
        TD.map = new TD.Map1();
    } else {
        TD.map = new TD.Map2();
    }
    
    
    TD.mapAdded();

    function animate() {

        if (TD.map !== null) {
            drawMap();
        } 
        
        TD.renderer.render(TD.pixiStage);
        requestAnimationFrame(animate);
    }

    function drawMap() {
        for(var i in TD.monsters) {
            var m = TD.monsters[i];
            if (m.alive === false) {
                m.parent.removeChild(m.sprite);
                TD.monsters.splice(TD.monsters.indexOf(m), 1);    
            } else {
                m.updatePosition();
            }
        }

        for(var i in TD.bullets) {
            var b = TD.bullets[i];
            if (b.alive === false) {
                b.parent.removeChild(b.sprite);
                TD.bullets.splice(TD.bullets.indexOf(b), 1);    
            } else {
                b.updatePosition();
            }
        }

        for(var i in TD.towers) {
            TD.towers[i].tryshoot();
        }

        TD.map.zIndex();
    }

});

function scaleRenderer() {
    TD.renderer.view.style.width = window.innerWidth + "px";
    TD.renderer.view.style.height = window.innerHeight + "px";
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function distance(pos1, pos2) {
    var dx = pos1.x-pos2.x;
    var dy = pos1.y-pos2.y;
    var d = Math.sqrt(dx*dx + dy*dy);

    return {d:d, dy:dy, dx:dx};
}

TD.clearPixiStage = function() {
    for(var i = TD.pixiStage.children.length - 1;  i >= 0; i--) {
        TD.pixiStage.removeChild(TD.pixiStage.children[i]);
    }
}
