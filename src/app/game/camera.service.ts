import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CameraService {
  x = 0;
  y = 0;

  update(
    playerWorldX: number,
    playerWorldY: number,
    canvasWidth: number,
    canvasHeight: number,
    worldWidthPx: number,
    worldHeightPx: number
  ): void {
    this.x = playerWorldX - canvasWidth / 2;
    this.y = playerWorldY - canvasHeight / 2;

    // clamp
    this.x = Math.max(0, Math.min(this.x, worldWidthPx - canvasWidth));
    this.y = Math.max(0, Math.min(this.y, worldHeightPx - canvasHeight));
  }
}