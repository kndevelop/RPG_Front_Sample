import { GAME_CONSTANTS } from './constants';

export class IsoMath {

  constructor(
    public tileWidth = GAME_CONSTANTS.TILE_WIDTH,
    public tileHeight = GAME_CONSTANTS.TILE_HEIGHT
  ) { }

  mapToScreen(x: number, y: number) {
    return {
      x: (x - y) * (this.tileWidth / 2),
      y: (x + y) * (this.tileHeight / 2)
    };
  }

  screenToMap(sx: number, sy: number) {
    const mx = (sx / (this.tileWidth / 2) + sy / (this.tileHeight / 2)) / 2;
    const my = (sy / (this.tileHeight / 2) - sx / (this.tileWidth / 2)) / 2;
    return { x: Math.floor(mx), y: Math.floor(my) };
  }

  /** タイルの基準位置（中心の足元）の画面相対座標を取得 */
  getTileBottomCenter(x: number, y: number): { x: number, y: number } {
    const pos = this.mapToScreen(x, y);
    return {
      x: pos.x,
      y: pos.y + this.tileHeight / 2
    };
  }

  /**
   * マップ座標から、カメラとセンター補正を考慮した最終的な画面上での描画位置を計算します。
   * @param x マップタイルX
   * @param y マップタイルY
   * @param centerX 画面中心X
   * @param centerY 画面中心Y
   * @param offset カメラのオフセット
   */
  getScreenPos(x: number, y: number, centerX: number, centerY: number, offset: { x: number, y: number }) {
    const pos = this.mapToScreen(x, y);
    return {
      x: centerX + pos.x - offset.x,
      y: centerY + pos.y - offset.y
    };
  }
}