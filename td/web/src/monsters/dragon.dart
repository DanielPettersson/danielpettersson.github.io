part of towerdefense;

class Dragon extends Monster {
  
  Dragon(JsObject path) : super('dragon', path) {
    setSpeed(0.7);
  }
  
  static create(JsObject path) => new Dragon(path);
  
}