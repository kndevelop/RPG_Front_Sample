import * as PIXI from 'pixi.js';
import { IsoMath } from './iso-math';
import { Player } from './player';
import { GameMap } from './game-map';
import { Camera } from './camera';
import { Renderer } from './renderer';
import { InputManager } from './input-manager';
import { AssetLoaderService } from '../services/asset-loader.service';
import { GameEventService } from '../services/game-event.service';

export class GameEngine {

  public player = new Player();
  private map = new GameMap();
  private camera: Camera;
  private renderer: Renderer;
  private input: InputManager;
  private isTransitioning = false;
  constructor(
    private app: PIXI.Application,
    private assetLoader: AssetLoaderService,
    private gameEvent: GameEventService,
    private iso: IsoMath
  ) {
    this.camera = new Camera(this.iso);
    this.renderer = new Renderer(app, this.iso, this.assetLoader);
    this.input = new InputManager(app, this.iso, this.camera, this.player, this.gameEvent);

    this.initMap();
    this.setupSubscriptions();

    app.ticker.add((delta: number) => {
      const deltaSec = delta / 60;

      const prevX = Math.round(this.player.x);
      const prevY = Math.round(this.player.y);

      this.player.update(deltaSec);

      const currX = Math.round(this.player.x);
      const currY = Math.round(this.player.y);

      // 移動完了（目的地の整数座標に到達）した瞬間に判定
      if ((prevX !== currX || prevY !== currY) && currX === this.player.targetX && currY === this.player.targetY) {
        this.checkWarp(currX, currY);
      }

      this.renderer.draw(this.map, this.player, this.camera);
    });
  }

  private initMap() {
    this.changeMap('map_default');
  }

  public changeMap(mapKey: string, startX?: number, startY?: number) {
    const mapData = this.assetLoader.getData(mapKey);
    if (mapData) {
      // 動的サイズの取得（デフォルト20）
      const config = mapData.config || {};
      const width = config.width || 20;
      const height = config.height || 20;
      const objects = mapData.objects || (Array.isArray(mapData) ? mapData : []);
      const warps = mapData.warps || [];

      // マップを新しいサイズでリセット
      this.map = new GameMap(width, height);
      this.map.buildMap(objects, warps);

      // プレイヤー位置をリセット
      const px = startX !== undefined ? startX : 2;
      const py = startY !== undefined ? startY : 2;
      this.player.x = px;
      this.player.y = py;
      this.player.targetX = px;
      this.player.targetY = py;
    }
  }

  private async checkWarp(x: number, y: number) {
    if (this.isTransitioning) return;

    const warp = this.map.warps.find(w => w.x === x && w.y === y);
    if (warp) {
      this.isTransitioning = true;
      console.log(`Warping to ${warp.targetMap} at (${warp.targetX}, ${warp.targetY})`);

      // フェードアウト
      await this.renderer.fadeOut(300);

      // マップ切り替え
      this.changeMap(warp.targetMap, warp.targetX, warp.targetY);

      // フェードイン
      await this.renderer.fadeIn(300);

      this.isTransitioning = false;
    }
  }

  private setupSubscriptions() {
    this.gameEvent.moveRequest$.subscribe(({ x, y }) => {
      const reachable = this.map.findReachablePoint(this.player.x, this.player.y, x, y);
      this.player.targetX = reachable.x;
      this.player.targetY = reachable.y;
    });
  }
}