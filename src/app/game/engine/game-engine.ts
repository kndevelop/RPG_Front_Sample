import * as PIXI from 'pixi.js';
import { IsoMath } from './iso-math';
import { Player } from './player';
import { GameMap } from './game-map';
import { Camera } from './camera';
import { Renderer } from './renderer';
import { InputManager } from './input-manager';
import { AssetLoaderService } from '../services/asset-loader.service';
import { GameEventService } from '../services/game-event.service';

export class GameEngine {

  private iso = new IsoMath();
  private player = new Player();
  private map = new GameMap();
  private camera = new Camera(this.iso);
  private renderer: Renderer;
  private input: InputManager;

  constructor(
    private app: PIXI.Application,
    private assetLoader: AssetLoaderService,
    private gameEvent: GameEventService
  ) {

    this.renderer = new Renderer(app, this.iso, this.assetLoader);
    this.input = new InputManager(app, this.iso, this.camera, this.player, this.gameEvent);

    this.initMap();
    this.setupSubscriptions();

    app.ticker.add((delta) => {
      const deltaSec = delta / 60;
      this.player.update(deltaSec);
      this.renderer.draw(this.map, this.player, this.camera);
    });
  }

  private initMap() {
    const mapData = this.assetLoader.getData('map_default');
    if (mapData) {
      this.map.buildMap(mapData);
    }
  }

  private setupSubscriptions() {
    this.gameEvent.moveRequest$.subscribe(({ x, y }) => {
      if (this.map.isWalkable(x, y)) {
        this.player.targetX = x;
        this.player.targetY = y;
      }
    });
  }
}