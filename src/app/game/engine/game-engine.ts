import * as PIXI from 'pixi.js';
import { IsoMath } from './iso-math';
import { Player } from './player';
import { GameMap } from './game-map';
import { Camera } from './camera';
import { Renderer } from './renderer';
import { InputManager } from './input-manager';

export class GameEngine {

  private iso = new IsoMath();
  private player = new Player();
  private map = new GameMap();
  private camera = new Camera(this.iso);
  private renderer: Renderer;
  private input: InputManager;

  constructor(private app: PIXI.Application) {

    this.renderer = new Renderer(app, this.iso);
    this.input = new InputManager(app, this.iso, this.camera, this.player);

    this.setupInput();

    app.ticker.add((delta) => {
      const deltaSec = delta / 60;
      this.player.update(deltaSec);
      this.renderer.draw(this.map, this.player, this.camera);
    });
  }

  private setupInput() {
    this.input.onMapClick = (x, y) => {
      if (this.map.isWalkable(x, y)) {
        this.player.targetX = x;
        this.player.targetY = y;
      }
    };
  }
}