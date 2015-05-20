part of towerdefense;

class Troll extends Monster {
  
  Troll(JsObject path) : super('troll', path) {
    setSpeed(0.6);
  }
  
  static create(JsObject path) => new Troll(path);
  
}