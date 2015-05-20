part of towerdefense;

class SwordMan extends Monster {
  
  SwordMan(JsObject path) : super('swordman', path) {
    setSpeed(0.8);
  }
  
  static create(JsObject path) => new SwordMan(path);
  
}