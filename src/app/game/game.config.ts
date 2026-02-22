import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameConfig {
  readonly canvasWidth = 800;
  readonly canvasHeight = 600;
  readonly tileWidth = 64;
  readonly tileHeight = 32;
  readonly mapSize = 20;

  readonly worldWidthPx = this.mapSize * this.tileWidth;
  readonly worldHeightPx = this.mapSize * this.tileHeight;
}