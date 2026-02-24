import * as PIXI from 'pixi.js';
import { IsoMath } from './iso-math';
import { GameMap, TileType, TILE_CONFIG, LayerType } from './game-map';
import { Player } from './player';
import { Camera } from './camera';
import { GAME_CONSTANTS, Point } from './constants';

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
    this.textureRight = PIXI.Texture.from('assets/player/player_right.png');
    this.textureLeft = PIXI.Texture.from('assets/player/player_left.png');

    this.playerSprite = new PIXI.Sprite(this.textureRight);
    this.playerSprite.anchor.set(GAME_CONSTANTS.PLAYER_ANCHOR_X, GAME_CONSTANTS.PLAYER_ANCHOR_Y);
    this.playerSprite.width = GAME_CONSTANTS.PLAYER_WIDTH;
    this.playerSprite.height = GAME_CONSTANTS.PLAYER_HEIGHT;

    this.app.stage.addChild(this.playerSprite);
  }

  /** タイル用テクスチャをロード */
  private loadTileTextures(): void {
    const types: TileType[] = ['GRASS', 'WATER', 'WALL', 'ROAD'];
    for (const type of types) {
      const path = TILE_CONFIG[type].texturePath;
      if (!path) {
        this.tileTextures[type] = null;
        continue;
      }
      // PIXI.Texture.from は即座に Texture オブジェクトを返すが、ロードは非同期。
      // 初期状態で代入しておけば、ロード完了後に tex.valid が true になり、
      // 次回以降の draw() でテクスチャが描画されるようになる。
      this.tileTextures[type] = PIXI.Texture.from(path);
    }
  }

  draw(map: GameMap, player: Player, camera: Camera) {
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.mapContainer.removeChildren();
    const offset = camera.getOffset(player);

    const context = { centerX, centerY, offset };

    // レイヤー順に描画: 地面 -> 障害物 -> プレイヤー -> 手前
    this.renderLayer(map, 'WALKABLE', context);
    this.renderLayer(map, 'IMPASSABLE', context);
    this.renderPlayerSprite(player, context);
    this.renderLayer(map, 'FOREGROUND', context);
  }

  private renderPlayerSprite(player: Player, { centerX, centerY }: any) {
    if (!this.playerSprite || !this.textureRight || !this.textureLeft) return;

    this.playerSprite.texture = player.facing === 'right' ? this.textureRight : this.textureLeft;
    this.playerSprite.x = centerX;
    this.playerSprite.y = centerY + GAME_CONSTANTS.PLAYER_Y_OFFSET;
  }

  private renderLayer(map: GameMap, layer: LayerType, { centerX, centerY, offset }: any) {
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
      this.drawWallTile(x, y, config.color, config.wallColor ?? 0x3E2723);
    } else if (tex && tex.valid) {
      this.drawTexturedTile(x, y, tex);
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

  private drawTexturedTile(x: number, y: number, tex: PIXI.Texture): void {
    const sprite = new PIXI.Sprite(tex);
    sprite.anchor.set(0.5, 0);
    sprite.x = x;
    sprite.y = y;
    sprite.width = GAME_CONSTANTS.TILE_WIDTH;
    sprite.height = GAME_CONSTANTS.TILE_HEIGHT;
    this.mapContainer.addChild(sprite);
  }

  private drawWallTile(x: number, y: number, topColor: number, sideColor: number): void {
    const { WALL_HEIGHT: wh, TILE_HALF_WIDTH: hw, TILE_HALF_HEIGHT: hh } = GAME_CONSTANTS;

    // 前面左
    const sideLeft = new PIXI.Graphics();
    sideLeft.beginFill(sideColor);
    sideLeft.moveTo(-hw, hh);
    sideLeft.lineTo(0, hh * 2);
    sideLeft.lineTo(0, hh * 2 + wh);
    sideLeft.lineTo(-hw, hh + wh);
    sideLeft.closePath();
    sideLeft.x = x; sideLeft.y = y;
    this.mapContainer.addChild(sideLeft);

    // 前面右
    const sideRight = new PIXI.Graphics();
    const rightColor = this.blendColor(sideColor, 0xFFFFFF, 0.15);
    sideRight.beginFill(rightColor);
    sideRight.moveTo(0, hh * 2);
    sideRight.lineTo(hw, hh);
    sideRight.lineTo(hw, hh + wh);
    sideRight.lineTo(0, hh * 2 + wh);
    sideRight.closePath();
    sideRight.x = x; sideRight.y = y;
    this.mapContainer.addChild(sideRight);

    // 上面
    const top = new PIXI.Graphics();
    top.beginFill(topColor);
    this.drawIsoDiamond(top, hw, hh);
    top.x = x; top.y = y - wh;
    this.mapContainer.addChild(top);
  }

  private blendColor(base: number, blend: number, factor: number): number {
    const r1 = (base >> 16) & 0xFF, g1 = (base >> 8) & 0xFF, b1 = base & 0xFF;
    const r2 = (blend >> 16) & 0xFF, g2 = (blend >> 8) & 0xFF, b2 = blend & 0xFF;
    return (Math.round(r1 + (r2 - r1) * factor) << 16) |
      (Math.round(g1 + (g2 - g1) * factor) << 8) |
      Math.round(b1 + (b2 - b1) * factor);
  }
}