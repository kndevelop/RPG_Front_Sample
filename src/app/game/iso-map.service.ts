import { Injectable } from '@angular/core';
import { GameConfig } from './game.config';

export interface GridCoord {
  gridX: number;
  gridY: number;
}

export interface WorldCoord {
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class IsoMapService {
  constructor(private config: GameConfig) {}

  gridToWorld(gridX: number, gridY: number): WorldCoord {
    const { tileWidth, tileHeight, canvasWidth } = this.config;
    return {
      x: (gridX - gridY) * (tileWidth / 2) + canvasWidth / 2,
      y: (gridX + gridY) * (tileHeight / 2)
    };
  }

  screenToGrid(screenX: number, screenY: number, camera: { x: number; y: number }): GridCoord {
    const { tileWidth, tileHeight, canvasWidth } = this.config;
    const worldX = screenX + camera.x - canvasWidth / 2;
    const worldY = screenY + camera.y;

    const gridX = (worldX / (tileWidth / 2) + worldY / (tileHeight / 2)) / 2;
    const gridY = (worldY / (tileHeight / 2) - worldX / (tileWidth / 2)) / 2;

    return {
      gridX: Math.floor(gridX),
      gridY: Math.floor(gridY)
    };
  }
}