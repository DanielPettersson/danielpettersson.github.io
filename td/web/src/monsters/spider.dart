part of towerdefense;

class Spider extends Monster {
  
  Spider(JsObject path) : super('spider', path) {
    setSpeed(1.0);
  }
  
  static create(JsObject path) => new Spider(path);
  
}