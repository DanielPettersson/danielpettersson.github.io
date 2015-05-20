part of towerdefense;

class Wolf extends Monster {
  
  Wolf(JsObject path) : super('wolf', path) {
    setSpeed(1.2);
  }
  
  static create(JsObject path) => new Wolf(path);
  
}