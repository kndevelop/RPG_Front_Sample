import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit {

  @ViewChild('gameCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  ctx!: CanvasRenderingContext2D;

  canvasWidth = 800;
  canvasHeight = 600;

  tileWidth = 64;
  tileHeight = 32;
  mapSize = 20;

  worldWidthPx = this.mapSize * this.tileWidth;
  worldHeightPx = this.mapSize * this.tileHeight;

  player = {
  gridX: 10,
  gridY: 10,
  targetX: 10,
  targetY: 10,
  speed: 3 // タイル/秒
};

  camera = {
    x: 0,
    y: 0
  };

lastTime = 0;

ngAfterViewInit(): void {
  const canvas = this.canvasRef.nativeElement;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas not supported');
  this.ctx = context;

  requestAnimationFrame((time) => this.gameLoop(time));
}

  gameLoop(time: number): void {
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(delta);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // ===============================
  // 描画
  // ===============================

  draw(): void {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.updateCamera();

    this.drawMap();
    this.drawPlayer();
  }

  updateCamera(): void {
    const playerWorld = this.gridToWorld(
      this.player.gridX,
      this.player.gridY
    );

    this.camera.x = playerWorld.x - this.canvasWidth / 2;
    this.camera.y = playerWorld.y - this.canvasHeight / 2;

    // clamp
    this.camera.x = Math.max(
      0,
      Math.min(this.camera.x, this.worldWidthPx - this.canvasWidth)
    );

    this.camera.y = Math.max(
      0,
      Math.min(this.camera.y, this.worldHeightPx - this.canvasHeight)
    );
  }

  drawMap(): void {
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        this.drawTile(x, y);
      }
    }
  }

  drawTile(gridX: number, gridY: number): void {
    const world = this.gridToWorld(gridX, gridY);

    const screenX = world.x - this.camera.x;
    const screenY = world.y - this.camera.y;

    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY);
    this.ctx.lineTo(screenX + this.tileWidth / 2, screenY + this.tileHeight / 2);
    this.ctx.lineTo(screenX, screenY + this.tileHeight);
    this.ctx.lineTo(screenX - this.tileWidth / 2, screenY + this.tileHeight / 2);
    this.ctx.closePath();

    this.ctx.fillStyle = '#3CB371';
    this.ctx.fill();
    this.ctx.strokeStyle = '#2E8B57';
    this.ctx.stroke();
  }

  drawPlayer(): void {
    const world = this.gridToWorld(
      this.player.gridX,
      this.player.gridY
    );

    const screenX = world.x - this.camera.x;
    const screenY = world.y - this.camera.y;

    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(
      screenX - 16,
      screenY - 32,
      32,
      48
    );
  }

  // ===============================
  // 座標変換
  // ===============================

  gridToWorld(gridX: number, gridY: number) {
    return {
      x: (gridX - gridY) * (this.tileWidth / 2) + this.canvasWidth / 2,
      y: (gridX + gridY) * (this.tileHeight / 2)
    };
  }

  screenToGrid(screenX: number, screenY: number) {
    const worldX = screenX + this.camera.x - this.canvasWidth / 2;
    const worldY = screenY + this.camera.y;

    const gridX =
      (worldX / (this.tileWidth / 2) +
       worldY / (this.tileHeight / 2)) / 2;

    const gridY =
      (worldY / (this.tileHeight / 2) -
       worldX / (this.tileWidth / 2)) / 2;

    return {
      gridX: Math.floor(gridX),
      gridY: Math.floor(gridY)
    };
  }

  // ===============================
  // クリック移動（瞬間移動）
  // ===============================

  onCanvasClick(event: MouseEvent): void {
  const rect = this.canvasRef.nativeElement.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const target = this.screenToGrid(clickX, clickY);

  if (
    target.gridX >= 0 &&
    target.gridY >= 0 &&
    target.gridX < this.mapSize &&
    target.gridY < this.mapSize
  ) {
    this.player.targetX = target.gridX;
    this.player.targetY = target.gridY;
  }
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