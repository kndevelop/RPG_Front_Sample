import * as PIXI from 'pixi.js';
import { IsoMath } from './iso-math';
import { Player } from './player';
import { GameMap } from './game-map';
import { Camera } from './camera';
import { Renderer } from './renderer';

export class GameEngine {

  private iso = new IsoMath();
  private player = new Player();
  private map = new GameMap();
  private camera = new Camera(this.iso);
  private renderer: Renderer;

  constructor(private app: PIXI.Application) {

    this.renderer = new Renderer(app, this.iso);

    app.ticker.add((delta) => {
      const deltaSec = delta / 60;
      this.player.update(deltaSec);
      this.renderer.draw(this.map, this.player, this.camera);
    });

    this.setupInput();
  }

  private setupInput() {

    this.app.stage.eventMode = 'static';
    this.app.stage.on('pointerdown', (event: any) => {

      const centerX = this.app.screen.width / 2;
      const centerY = this.app.screen.height / 2;

      const offset = this.camera.getOffset(this.player);

      const worldX = event.global.x - centerX + offset.x;
      const worldY = event.global.y - centerY + offset.y;

      const mapPos = this.iso.screenToMap(worldX, worldY);

      if (this.map.isWalkable(mapPos.x, mapPos.y)) {
        this.player.targetX = mapPos.x;
        this.player.targetY = mapPos.y;
      }
    });
  }
}