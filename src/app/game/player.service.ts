import { Injectable } from '@angular/core';

export interface Player {
  gridX: number;
  gridY: number;
  targetX: number;
  targetY: number;
  speed: number;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  player: Player = {
    gridX: 10,
    gridY: 10,
    targetX: 10,
    targetY: 10,
    speed: 3
  };

  moveTo(targetX: number, targetY: number): void {
    this.player.targetX = targetX;
    this.player.targetY = targetY;
  }

  update(delta: number): void {
    const dx = this.player.targetX - this.player.gridX;
    const dy = this.player.targetY - this.player.gridY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.01) {
      const moveDist = this.player.speed * delta;
      this.player.gridX += (dx / distance) * moveDist;
      this.player.gridY += (dy / distance) * moveDist;
    } else {
      this.player.gridX = this.player.targetX;
      this.player.gridY = this.player.targetY;
    }
  }
}