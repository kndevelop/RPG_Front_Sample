import * as PIXI from 'pixi.js';
import { IsoMath } from './iso-math';
import { GameMap, TileType, TILE_CONFIG, LayerType } from './game-map';
import { Player } from './player';
import { Camera } from './camera';
import { GAME_CONSTANTS } from './constants';
import { AssetLoaderService } from '../services/asset-loader.service';

export class Renderer {

  mapContainer = new PIXI.Container();
  private fadeOverlay: PIXI.Graphics;

  private playerSprite: PIXI.Sprite | null = null;

  /** タイルテクスチャキャッシュ */
  private tileTextures: Partial<Record<TileType, PIXI.Texture | null>> = {};

  /** タイルスプライトのプール（再利用用） */
  private spritePool: PIXI.Sprite[] = [];
  /** 現在画面に表示されているスプライトのリスト */
  private activeSprites: PIXI.Sprite[] = [];

  constructor(
    private app: PIXI.Application,
    private iso: IsoMath,
    private assetLoader: AssetLoaderService
  ) {
    app.stage.addChild(this.mapContainer);

    // フェード用オーバーレイの初期化
    this.fadeOverlay = new PIXI.Graphics();
    this.fadeOverlay.beginFill(0x000000);
    this.fadeOverlay.drawRect(0, 0, app.screen.width, app.screen.height);
    this.fadeOverlay.endFill();
    this.fadeOverlay.alpha = 0; // 最初は透明
    this.fadeOverlay.zIndex = 10000;
    app.stage.addChild(this.fadeOverlay);

    this.initPlayer();
    this.initTileTextures();
  }

  /** プレイヤーの初期化 */
  private initPlayer(): void {
    const tex = this.assetLoader.getTexture('player_right');
    if (!tex) return;

    this.playerSprite = new PIXI.Sprite(tex);
    this.playerSprite.anchor.set(GAME_CONSTANTS.PLAYER_ANCHOR_X, GAME_CONSTANTS.PLAYER_ANCHOR_Y);
    this.playerSprite.width = GAME_CONSTANTS.PLAYER_WIDTH;
    this.playerSprite.height = GAME_CONSTANTS.PLAYER_HEIGHT;
    // ここではまだコンテナに追加しない
  }

  /** タイル用テクスチャを準備 */
  private initTileTextures(): void {
    const mapping: Record<TileType, string> = {
      'GRASS': 'tile_grass',
      'WATER': 'tile_water',
      'WALL': 'tile_wall',
      'ROAD': 'tile_road',
      'TREE': 'tile_tree',
      'SAND': 'tile_sand',
      'SNOW': 'tile_snow'
    };

    for (const [type, key] of Object.entries(mapping)) {
      this.tileTextures[type as TileType] = this.assetLoader.getTexture(key);
    }
  }

  /** プールからスプライトを取得、なければ新規作成 */
  private getSpriteFromPool(tex: PIXI.Texture): PIXI.Sprite {
    const sprite = this.spritePool.pop() || new PIXI.Sprite();
    sprite.texture = tex;
    sprite.visible = true;
    sprite.alpha = 1.0;
    sprite.tint = 0xFFFFFF;
    this.activeSprites.push(sprite);
    this.mapContainer.addChild(sprite);
    return sprite;
  }

  /** 全てのスプライトをプールに戻す（非表示にする） */
  private resetSprites() {
    for (const sprite of this.activeSprites) {
      sprite.visible = false;
      this.spritePool.push(sprite);
    }
    this.activeSprites = [];
  }

  draw(map: GameMap, player: Player, camera: Camera) {
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.mapContainer.removeChildren();
    this.resetSprites();

    const offset = camera.getOffset(player);
    const context = { centerX, centerY, offset };

    // 1. 地面レイヤー (WALKABLE) を最背面に描画（これらはソート不要）
    this.renderBasicLayer(map, 'WALKABLE', context);

    // 2. Y-Sorting が必要なエンティティを収集
    const renderItems: any[] = [];

    const layers: LayerType[] = ['IMPASSABLE', 'FOREGROUND'];
    for (const layer of layers) {
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const tileType = map.getTile(layer, x, y);
          if (!tileType) continue;

          const pos = this.iso.mapToScreen(x, y);
          const screenX = centerX + pos.x - offset.x;
          const screenY = centerY + pos.y - offset.y;

          renderItems.push({
            type: 'tile',
            tileType,
            x: screenX,
            y: screenY,
            sortY: screenY + GAME_CONSTANTS.TILE_HEIGHT
          });
        }
      }
    }

    const playerFootY = centerY + GAME_CONSTANTS.PLAYER_Y_OFFSET + (GAME_CONSTANTS.PLAYER_HEIGHT * (1 - GAME_CONSTANTS.PLAYER_ANCHOR_Y));
    renderItems.push({
      type: 'player',
      player,
      x: centerX,
      y: centerY + GAME_CONSTANTS.PLAYER_Y_OFFSET,
      sortY: playerFootY
    });

    renderItems.sort((a, b) => a.sortY - b.sortY);

    for (const item of renderItems) {
      if (item.type === 'tile') {
        this.drawTile(item.tileType, item.x, item.y);
      } else {
        this.renderPlayerSprite(item.player, { centerX: item.x, centerY: item.y - GAME_CONSTANTS.PLAYER_Y_OFFSET });
      }
    }
  }

  private renderPlayerSprite(player: Player, { centerX, centerY }: any) {
    if (!this.playerSprite) return;

    const key = player.facing === 'right' ? 'player_right' : 'player_left';
    const tex = this.assetLoader.getTexture(key);

    if (tex) {
      this.playerSprite.texture = tex;
    }

    this.playerSprite.x = centerX;
    this.playerSprite.y = centerY + GAME_CONSTANTS.PLAYER_Y_OFFSET;

    // スプライトを mapContainer に追加（ソート順反映）
    this.mapContainer.addChild(this.playerSprite);
  }

  private renderBasicLayer(map: GameMap, layer: LayerType, { centerX, centerY, offset }: any) {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tileType = map.getTile(layer, x, y);
        if (!tileType) continue;

        const pos = this.iso.mapToScreen(x, y);
        const screenX = centerX + pos.x - offset.x;
        const screenY = centerY + pos.y - offset.y;

        this.drawTile(tileType, screenX, screenY);
      }
    }
  }

  private drawTile(type: TileType, x: number, y: number) {
    const config = TILE_CONFIG[type];
    const tex = this.tileTextures[type];

    if (type === 'WALL') {
      // 従来の壁描画（Graphics）はそのまま
      this.drawWallTile(x, y, config.color, config.wallColor ?? 0x3E2723);
    } else if (tex && tex.valid) {
      const sprite = this.getSpriteFromPool(tex);

      if (config.isVertical) {
        // 垂直オブジェクト（木など）の描画
        sprite.anchor.set(0.5, 1.0);
        sprite.x = x;
        sprite.y = y + GAME_CONSTANTS.TILE_HEIGHT;
        sprite.width = GAME_CONSTANTS.TILE_WIDTH;
        // アスペクト比を維持して高さを自動調整
        sprite.height = (tex.height / tex.width) * GAME_CONSTANTS.TILE_WIDTH;
      } else {
        // 通常の地面タイル
        sprite.anchor.set(0.5, 0);
        sprite.x = x;
        sprite.y = y;
        sprite.width = GAME_CONSTANTS.TILE_WIDTH;
        sprite.height = GAME_CONSTANTS.TILE_HEIGHT;
      }
    } else {
      this.drawColorTile(x, y, config.color, type);
    }
  }

  private drawColorTile(x: number, y: number, color: number, type: TileType): void {
    const tile = new PIXI.Graphics();
    const alpha = type === 'WATER' ? 0.85 : 1.0;
    const { TILE_HALF_WIDTH: hw, TILE_HALF_HEIGHT: hh } = GAME_CONSTANTS;

    tile.beginFill(color, alpha);
    this.drawIsoDiamond(tile, hw, hh);
    tile.endFill();

    if (type === 'GRASS' || type === 'ROAD') {
      tile.lineStyle(0.5, 0x00000033, 0.3);
      this.drawIsoDiamond(tile, hw, hh);
    }

    tile.x = x;
    tile.y = y;
    this.mapContainer.addChild(tile);
  }

  private drawIsoDiamond(g: PIXI.Graphics, hw: number, hh: number) {
    g.moveTo(0, 0);
    g.lineTo(hw, hh);
    g.lineTo(0, hh * 2);
    g.lineTo(-hw, hh);
    g.closePath();
  }

  private drawWallTile(x: number, y: number, topColor: number, sideColor: number): void {
    const { WALL_HEIGHT: wh, TILE_HALF_WIDTH: hw, TILE_HALF_HEIGHT: hh } = GAME_CONSTANTS;

    const wallContainer = new PIXI.Container();

    // 前面左
    const sideLeft = new PIXI.Graphics();
    sideLeft.beginFill(sideColor);
    sideLeft.moveTo(-hw, hh);
    sideLeft.lineTo(0, hh * 2);
    sideLeft.lineTo(0, hh * 2 + wh);
    sideLeft.lineTo(-hw, hh + wh);
    sideLeft.closePath();
    wallContainer.addChild(sideLeft);

    // 前面右
    const sideRight = new PIXI.Graphics();
    const rightColor = this.blendColor(sideColor, 0xFFFFFF, 0.15);
    sideRight.beginFill(rightColor);
    sideRight.moveTo(0, hh * 2);
    sideRight.lineTo(hw, hh);
    sideRight.lineTo(hw, hh + wh);
    sideRight.lineTo(0, hh * 2 + wh);
    sideRight.closePath();
    wallContainer.addChild(sideRight);

    // 上面
    const top = new PIXI.Graphics();
    top.beginFill(topColor);
    this.drawIsoDiamond(top, hw, hh);
    top.y = -wh;
    wallContainer.addChild(top);

    wallContainer.x = x;
    wallContainer.y = y;
    this.mapContainer.addChild(wallContainer);
  }

  private blendColor(base: number, blend: number, factor: number): number {
    const r1 = (base >> 16) & 0xFF, g1 = (base >> 8) & 0xFF, b1 = base & 0xFF;
    const r2 = (blend >> 16) & 0xFF, g2 = (blend >> 8) & 0xFF, b2 = blend & 0xFF;
    return (Math.round(r1 + (r2 - r1) * factor) << 16) |
      (Math.round(g1 + (g2 - g1) * factor) << 8) |
      Math.round(b1 + (b2 - b1) * factor);
  }

  /** 画面を暗転させる (不透明度 0 -> 1) */
  async fadeOut(durationMs: number = 500): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        this.fadeOverlay.alpha = progress;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  /** 画面を明転させる (不透明度 1 -> 0) */
  async fadeIn(durationMs: number = 500): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        this.fadeOverlay.alpha = 1 - progress;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }
}