import { Injectable, ElementRef } from '@angular/core';
import { CameraService } from './camera.service';
import { IsoMapService } from './iso-map.service';
import { GameConfig } from './game.config';

@Injectable({ providedIn: 'root' })
export class RenderService {
  ctx!: CanvasRenderingContext2D;

  constructor(
    private camera: CameraService,
    private isoMap: IsoMapService,
    private config: GameConfig
  ) {}

  initializeCanvas(canvasRef: ElementRef<HTMLCanvasElement>): void {
    const context = canvasRef.nativeElement.getContext('2d');
    if (!context) throw new Error('Canvas not supported');
    this.ctx = context;
  }

  draw(playerGridX: number, playerGridY: number): void {
    this.ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    this.drawMap();
    this.drawPlayer(playerGridX, playerGridY);
  }

  private drawMap(): void {
    for (let y = 0; y < this.config.mapSize; y++) {
      for (let x = 0; x < this.config.mapSize; x++) {
        this.drawTile(x, y);
      }
    }
  }

  private drawTile(gridX: number, gridY: number): void {
    const world = this.isoMap.gridToWorld(gridX, gridY);
    const screenX = world.x - this.camera.x;
    const screenY = world.y - this.camera.y;

    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY);
    this.ctx.lineTo(screenX + this.config.tileWidth / 2, screenY + this.config.tileHeight / 2);
    this.ctx.lineTo(screenX, screenY + this.config.tileHeight);
    this.ctx.lineTo(screenX - this.config.tileWidth / 2, screenY + this.config.tileHeight / 2);
    this.ctx.closePath();

    this.ctx.fillStyle = '#3CB371';
    this.ctx.fill();
    this.ctx.strokeStyle = '#2E8B57';
    this.ctx.stroke();
  }

  private drawPlayer(gridX: number, gridY: number): void {
    const world = this.isoMap.gridToWorld(gridX, gridY);
    const screenX = world.x - this.camera.x;
    const screenY = world.y - this.camera.y;

    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(screenX - 16, screenY - 32, 32, 48);
  }
}