part of towerdefense;

class Monster extends Bitmap implements Animatable {
  
  JsObject tweenPos;
  JsObject tween;
  
  Monster(String bitmapStr, JsObject path) : 
    super(resourceManager.getBitmapData(bitmapStr)) {
    
    GlowFilter filter = new GlowFilter(Color.Black, 1.0, 10, 10);
    var filterBounds = filter.getBounds();
    filterBounds.inflate(bitmapData.width, bitmapData.height);
    filters = [filter];
    applyCache(filterBounds.left, filterBounds.top, filterBounds.width, filterBounds.height);
    
    tweenPos = new JsObject.jsify({'x': path[0]['x'], 'y': path[0]['y']});
    tween = context['TweenMax'].callMethod('to', [tweenPos, 10, new JsObject.jsify({
      'bezier':{'values': path},
      'ease': "Linear.easeNone",
      'onComplete': () {
        juggler.remove(this);
        parent.removeChild(this);
      }
    })]);
    
    juggler.add(this);
  }
  
  void setSpeed(var newSpeed) { 
    tween.callMethod('timeScale', [newSpeed]); 
  }
  
  bool advanceTime(num time) {
    x = tweenPos['x'] - width/2;
    y = tweenPos['y'] - height/2;
    return true;
  }
  
}