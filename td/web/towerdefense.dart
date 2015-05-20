library towerdefense;

import 'dart:html';
import 'dart:js';
import 'dart:async';
import 'dart:math';
import 'package:stagexl/stagexl.dart';

part 'src/map.dart';
part 'src/maps/map1.dart';
part 'src/monster.dart';
part 'src/monsters/spider.dart';
part 'src/monsters/wolf.dart';
part 'src/monsters/swordman.dart';
part 'src/monsters/troll.dart';
part 'src/monsters/dragon.dart';

Stage stage;
RenderLoop renderLoop;
Juggler juggler;
ResourceManager resourceManager;

void main() {
  
  // initialize Stage and RenderLoop
  stage = new Stage('stage', querySelector('#stage'));
  renderLoop = new RenderLoop();
  renderLoop.addStage(stage);
  juggler = renderLoop.juggler;

  // initialize ResourceManager
  resourceManager = new ResourceManager()
    ..addBitmapData('spider', 'img/monsters/spider/small.png')
    ..addBitmapData('wolf', 'img/monsters/wolf/small.png')
    ..addBitmapData('swordman', 'img/monsters/swordman/small.png')
    ..addBitmapData('troll', 'img/monsters/troll/small.png')
    ..addBitmapData('dragon', 'img/monsters/dragon/small.png')
    ..addBitmapData('map1', 'img/maps/map1.jpg');

  resourceManager.load()
    .then((_) => stage.addChild(new Map1()))
    .catchError((e) => print(e));
}