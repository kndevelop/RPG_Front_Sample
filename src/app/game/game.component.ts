import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CameraService } from './camera.service';
import { IsoMapService } from './iso-map.service';
import { RenderService } from './render.service';
import { PlayerService } from './player.service';
import { GameConfig } from './game.config';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit {
  @ViewChild('gameCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private lastTime = 0;

  constructor(
    public config: GameConfig,
    private camera: CameraService,
    private isoMap: IsoMapService,
    private render: RenderService,
    private player: PlayerService
  ) {}

  ngAfterViewInit(): void {
    this.render.initializeCanvas(this.canvasRef);
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  private gameLoop(time: number): void {
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(delta);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(delta: number): void {
    this.player.update(delta);
  }

  private draw(): void {
    const playerWorld = this.isoMap.gridToWorld(
      this.player.player.gridX,
      this.player.player.gridY
    );

    this.camera.update(
      playerWorld.x,
      playerWorld.y,
      this.config.canvasWidth,
      this.config.canvasHeight,
      this.config.worldWidthPx,
      this.config.worldHeightPx
    );

    this.render.draw(this.player.player.gridX, this.player.player.gridY);
  }

  onCanvasClick(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const target = this.isoMap.screenToGrid(clickX, clickY, this.camera);

    if (
      target.gridX >= 0 &&
      target.gridY >= 0 &&
      target.gridX < this.config.mapSize &&
      target.gridY < this.config.mapSize
    ) {
      this.player.moveTo(target.gridX, target.gridY);
    }
  }
}