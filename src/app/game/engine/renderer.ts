import * as PIXI from 'pixi.js';
import { IsoMath } from './iso-math';
import { GameMap, TileType, TILE_CONFIG } from './game-map';
import { Player } from './player';
import { Camera } from './camera';

export class Renderer {

  mapContainer = new PIXI.Container();

  private playerSprite: PIXI.Sprite | null = null;
  private textureRight: PIXI.Texture | null = null;
  private textureLeft: PIXI.Texture | null = null;

  /** タイルテクスチャキャッシュ */
  private tileTextures: Partial<Record<TileType, PIXI.Texture | null>> = {};

  constructor(
    private app: PIXI.Application,
    private iso: IsoMath
  ) {
    app.stage.addChild(this.mapContainer);
    this.loadPlayerTextures();
    this.loadTileTextures();
  }

  /** プレイヤー画像をロードして Sprite を生成 */
  private loadPlayerTextures(): void {
    this.textureRight = PIXI.Texture.from('assets/player/test.png');
    this.textureLeft = PIXI.Texture.from('assets/player/test_reverse.png');

    this.playerSprite = new PIXI.Sprite(this.textureRight);
    this.playerSprite.anchor.set(0.5, 1.0); // 足元を基準点に
    this.playerSprite.width = 50;
    this.playerSprite.height = 100;

    this.app.stage.addChild(this.playerSprite);
  }

  /** タイル用テクスチャをロード（失敗時は null でフォールバックカラー使用） */
  private loadTileTextures(): void {
    const types: TileType[] = ['GRASS', 'WATER', 'WALL', 'ROAD'];
    for (const type of types) {
      const path = TILE_CONFIG[type].texturePath;
      if (!path) {
        this.tileTextures[type] = null;
        continue;
      }
      try {
        const tex = PIXI.Texture.from(path);
        // PIXI はエラーを非同期で発生させるため、初期状態では null に
        // テクスチャが実際に破損していないか確認
        if (tex && tex !== PIXI.Texture.EMPTY) {
          this.tileTextures[type] = tex;
        } else {
          this.tileTextures[type] = null;
        }
      } catch {
        this.tileTextures[type] = null;
      }
    }
  }

  draw(map: GameMap, player: Player, camera: Camera) {

    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.mapContainer.removeChildren();

    const offset = camera.getOffset(player);

    // アイソメトリックはY→X順に描画（奥から手前）
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {

        const tileType = map.getTile(x, y) ?? 'GRASS';
        const config = TILE_CONFIG[tileType];
        const pos = this.iso.mapToScreen(x, y);

        const screenX = centerX + pos.x - offset.x;
        const screenY = centerY + pos.y - offset.y;

        const tex = this.tileTextures[tileType];

        if (tileType === 'WALL') {
          // 壁タイルは立体的に描画（上面＋側面）
          this.drawWallTile(screenX, screenY, config.color, config.wallColor ?? 0x3E2723);
        } else if (tex && tex.valid) {
          // テクスチャが有効な場合はスプライトで描画
          this.drawTexturedTile(screenX, screenY, tex);
        } else {
          // フォールバック：カラー塗りつぶし
          this.drawColorTile(screenX, screenY, config.color, tileType);
        }
      }
    }

    // --- プレイヤースプライト描画 ---
    if (this.playerSprite && this.textureRight && this.textureLeft) {
      const newTexture = player.facing === 'right'
        ? this.textureRight
        : this.textureLeft;
      if (this.playerSprite.texture !== newTexture) {
        this.playerSprite.texture = newTexture;
      }
      this.playerSprite.x = centerX;
      this.playerSprite.y = centerY + 16;
    }
  }

  /** フォールバック：カラー塗りつぶしタイル */
  private drawColorTile(x: number, y: number, color: number, type: TileType): void {
    const tile = new PIXI.Graphics();

    // 水タイルは少し透明に
    const alpha = type === 'WATER' ? 0.85 : 1.0;
    tile.beginFill(color, alpha);
    tile.moveTo(0, 0);
    tile.lineTo(32, 16);
    tile.lineTo(0, 32);
    tile.lineTo(-32, 16);
    tile.closePath();
    tile.endFill();

    // 草・道はタイルの縁を少し暗く
    if (type === 'GRASS' || type === 'ROAD') {
      tile.lineStyle(0.5, 0x00000033, 0.3);
      tile.moveTo(0, 0);
      tile.lineTo(32, 16);
      tile.lineTo(0, 32);
      tile.lineTo(-32, 16);
      tile.closePath();
    }

    tile.x = x;
    tile.y = y;
    this.mapContainer.addChild(tile);
  }

  /** テクスチャスプライトタイル */
  private drawTexturedTile(x: number, y: number, tex: PIXI.Texture): void {
    const sprite = new PIXI.Sprite(tex);
    sprite.anchor.set(0.5, 0);
    sprite.x = x;
    sprite.y = y;
    sprite.width = 64;  // tileWidth
    sprite.height = 32; // tileHeight
    this.mapContainer.addChild(sprite);
  }

  /** 壁タイル（立体：上面＋前面2面） */
  private drawWallTile(x: number, y: number, topColor: number, sideColor: number): void {
    const wallHeight = 20;

    // 前面左
    const sideLeft = new PIXI.Graphics();
    sideLeft.beginFill(sideColor);
    sideLeft.moveTo(-32, 16);
    sideLeft.lineTo(0, 32);
    sideLeft.lineTo(0, 32 + wallHeight);
    sideLeft.lineTo(-32, 16 + wallHeight);
    sideLeft.closePath();
    sideLeft.endFill();
    sideLeft.x = x;
    sideLeft.y = y;
    this.mapContainer.addChild(sideLeft);

    // 前面右
    const sideRight = new PIXI.Graphics();
    const rightColor = this.blendColor(sideColor, 0xFFFFFF, 0.15);
    sideRight.beginFill(rightColor);
    sideRight.moveTo(0, 32);
    sideRight.lineTo(32, 16);
    sideRight.lineTo(32, 16 + wallHeight);
    sideRight.lineTo(0, 32 + wallHeight);
    sideRight.closePath();
    sideRight.endFill();
    sideRight.x = x;
    sideRight.y = y;
    this.mapContainer.addChild(sideRight);

    // 上面（菱形）
    const top = new PIXI.Graphics();
    top.beginFill(topColor);
    top.moveTo(0, 0);
    top.lineTo(32, 16);
    top.lineTo(0, 32);
    top.lineTo(-32, 16);
    top.closePath();
    top.endFill();
    top.x = x;
    top.y = y - wallHeight;
    this.mapContainer.addChild(top);
  }

  /** 2色をブレンドするユーティリティ */
  private blendColor(base: number, blend: number, factor: number): number {
    const r1 = (base >> 16) & 0xFF, g1 = (base >> 8) & 0xFF, b1 = base & 0xFF;
    const r2 = (blend >> 16) & 0xFF, g2 = (blend >> 8) & 0xFF, b2 = blend & 0xFF;
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    return (r << 16) | (g << 8) | b;
  }
}