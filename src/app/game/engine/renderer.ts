import * as PIXI from 'pixi.js';
import { IsoMath } from './iso-math';
import { GameMap } from './game-map';
import { Player } from './player';
import { Camera } from './camera';

export class Renderer {

  mapContainer = new PIXI.Container();
  playerGraphics = new PIXI.Graphics();

  constructor(
    private app: PIXI.Application,
    private iso: IsoMath
  ) {
    app.stage.addChild(this.mapContainer);
    app.stage.addChild(this.playerGraphics);
  }

  draw(map: GameMap, player: Player, camera: Camera) {

    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.mapContainer.removeChildren();

    const offset = camera.getOffset(player);

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {

        const pos = this.iso.mapToScreen(x, y);

        const tile = new PIXI.Graphics();
        tile.beginFill(0x4caf50);
        tile.moveTo(0, 0);
        tile.lineTo(32, 16);
        tile.lineTo(0, 32);
        tile.lineTo(-32, 16);
        tile.closePath();
        tile.endFill();

        tile.x = centerX + pos.x - offset.x;
        tile.y = centerY + pos.y - offset.y;

        this.mapContainer.addChild(tile);
      }
    }

    this.playerGraphics.clear();
    this.playerGraphics.beginFill(0xff0000);
    this.playerGraphics.drawCircle(0, 0, 8);
    this.playerGraphics.endFill();

    this.playerGraphics.x = centerX;
    this.playerGraphics.y = centerY + 16;
  }
}