part of towerdefense;

class Map extends DisplayObjectContainer {
  
  List<JsObject> paths = new List();
  List<Function> monsterConstructors = new List();
  Random random = new Random();
  
  Map(final String bitmapStr) {
    addChild(new Bitmap(resourceManager.getBitmapData(bitmapStr)));
    
    monsterConstructors.add(Spider.create);
    monsterConstructors.add(Wolf.create);
    monsterConstructors.add(SwordMan.create);
    monsterConstructors.add(Troll.create);
    monsterConstructors.add(Dragon.create);
    
    new Timer(new Duration(milliseconds: 200 + new Random().nextInt(1000)), () {
      addRandomMonster();
    });
  }
  
  void addRandomMonster() {
    
    Function fnc = monsterConstructors[random.nextInt(monsterConstructors.length)];    
    Monster monster = Function.apply(fnc, [paths[random.nextInt(paths.length)]]);
    addChild(monster);
    new Timer(new Duration(milliseconds: 400 + new Random().nextInt(1500)), () {
      addRandomMonster();
    });
  }
  
}

